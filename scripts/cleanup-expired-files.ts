// scripts/cleanup-expired-files.ts
// Run via cron: node --import tsx/esm scripts/cleanup-expired-files.ts
// Or: npx tsx scripts/cleanup-expired-files.ts
//
// PM2 cron_restart mode will handle scheduling.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';

// Worker runs outside SvelteKit, so use process.env directly
const DATABASE_URL = process.env.DATABASE_URL;
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/var/stlapp/uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? '/var/stlapp/outputs';

if (!DATABASE_URL) {
  console.error('[cleanup] DATABASE_URL is not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`[cleanup] Starting at ${new Date().toISOString()}`);

  // Find all expired jobs that still have files on disk.
  // Process in batches of 100 to avoid memory issues if there are many.
  let totalDeleted = 0;
  let cursor: string | undefined = undefined;

  while (true) {
    const jobs = await prisma.stlJob.findMany({
      where: {
        expiresAt: { lt: new Date() },
        filesDeleted: false,
      },
      take: 100,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, inputDir: true, outputPath: true },
    });

    if (jobs.length === 0) break;
    cursor = jobs[jobs.length - 1].id;

    for (const job of jobs) {
      try {
        await deleteJobFiles(job.inputDir, job.outputPath);

        await prisma.stlJob.update({
          where: { id: job.id },
          data: { filesDeleted: true },
        });

        totalDeleted++;
        console.log(`[cleanup] Deleted files for job ${job.id}`);
      } catch (err) {
        // Log but don't abort — move on to next job
        console.error(`[cleanup] Failed for job ${job.id}:`, err);
      }
    }
  }

  console.log(`[cleanup] Done. Deleted files for ${totalDeleted} job(s).`);
}

async function deleteJobFiles(inputDir: string, outputPath: string) {
  // Safety check: never delete paths outside the expected directories.
  // This guards against corrupt DB data.
  const safeUploadDir = path.resolve(UPLOAD_DIR);
  const safeOutputDir = path.resolve(OUTPUT_DIR);
  const resolvedInput = path.resolve(inputDir);
  const resolvedOutput = path.resolve(outputPath);

  if (!resolvedInput.startsWith(safeUploadDir)) {
    throw new Error(`inputDir ${inputDir} is outside UPLOAD_DIR — refusing to delete`);
  }
  if (!resolvedOutput.startsWith(safeOutputDir)) {
    throw new Error(`outputPath ${outputPath} is outside OUTPUT_DIR — refusing to delete`);
  }

  // Delete upload directory (contains the user's photos)
  // rm({ recursive: true, force: true }) won't throw if the dir is missing
  await fs.rm(resolvedInput, { recursive: true, force: true });

  // Delete output STL file (force: true = no error if already gone)
  await fs.rm(resolvedOutput, { force: true });
}

main()
  .catch((err) => {
    console.error('[cleanup] Unhandled error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });