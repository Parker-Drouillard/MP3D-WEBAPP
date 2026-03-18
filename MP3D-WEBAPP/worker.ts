import 'dotenv/config';
import PgBoss from 'pg-boss';
import { spawn } from 'child_process';
import { createHmac } from 'crypto';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// --- Environment validation ---
const required = [
  'DATABASE_URL',
  'STL_BINARY_PATH',
  'OUTPUT_DIR',
  'DOWNLOAD_HMAC_SECRET',
  'STL_JOB_TIMEOUT_SECONDS'
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const DATABASE_URL = process.env.DATABASE_URL!;
const STL_BINARY_PATH = process.env.STL_BINARY_PATH!;
const OUTPUT_DIR = process.env.OUTPUT_DIR!;
const DOWNLOAD_HMAC_SECRET = process.env.DOWNLOAD_HMAC_SECRET!;
const JOB_TIMEOUT = parseInt(process.env.STL_JOB_TIMEOUT_SECONDS!, 10);

// --- Prisma client ---
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// --- HMAC token generation ---
function generateDownloadToken(jobId: string, expiresAt: Date): string {
  const expiry = expiresAt.getTime().toString();
  const payload = `${jobId}:${expiry}`;
  const sig = createHmac('sha256', DOWNLOAD_HMAC_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

// --- STL job processor ---
async function processStlJob(job: {
  jobId: string;
  orderId: string;
  itemSlug: string;
  inputDir: string;
  outputPath: string;
}): Promise<void> {
  const { jobId, orderId, itemSlug, inputDir } = job;
  const outputPath = join(OUTPUT_DIR, `${jobId}.stl`);

  console.log(`[worker] Processing job ${jobId} for order ${orderId}`);

  // Mark job as processing
  await prisma.stlJob.update({
    where: { id: jobId },
    data: {
      status: 'processing',
      startedAt: new Date(),
      outputPath
    }
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'processing' }
  });

  // Spawn the C binary
  await new Promise<void>((resolve, reject) => {
    const args = [
      '--item', itemSlug,
      '--input', inputDir,
      '--output', outputPath
    ];

    console.log(`[worker] Spawning: ${STL_BINARY_PATH} ${args.join(' ')}`);

    const child = spawn(STL_BINARY_PATH, args, {
      timeout: JOB_TIMEOUT * 1000
    });

    let stderr = '';

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Binary exited with code ${code}. stderr: ${stderr}`));
      }
    });

    child.on('error', (err: Error) => {
      reject(err);
    });
  });

  // Success — generate download token and mark complete
  const stlJob = await prisma.stlJob.findUnique({ where: { id: jobId } });
  if (!stlJob) throw new Error(`Job ${jobId} not found after processing`);

  const token = generateDownloadToken(jobId, stlJob.expiresAt);

  await prisma.stlJob.update({
    where: { id: jobId },
    data: {
      status: 'complete',
      completedAt: new Date(),
      outputPath
    }
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'complete',
      downloadToken: token
    }
  });

  console.log(`[worker] Job ${jobId} complete`);
}

// --- Main ---
async function main() {
  console.log('[worker] Starting...');

  const boss = new PgBoss(DATABASE_URL);

  boss.on('error', (err) => {
    console.error('[worker] pg-boss error:', err);
  });

  await boss.start();
  console.log('[worker] pg-boss started');

  // Ensure queue exists before registering worker
  await boss.createQueue('stl-generation');

  await boss.work<{
    jobId: string;
    orderId: string;
    itemSlug: string;
    inputDir: string;
    outputPath: string;
  }>(
    'stl-generation',
    { teamSize: 1, teamConcurrency: 1 },
    async (jobs) => {
      const job = Array.isArray(jobs) ? jobs[0] : jobs;
      const { jobId, orderId, itemSlug, inputDir, outputPath } = job.data;

      try {
        await processStlJob({ jobId, orderId, itemSlug, inputDir, outputPath });
      } catch (err) {
        console.error(`[worker] Job ${jobId} failed:`, err);

        await prisma.stlJob.update({
          where: { id: jobId },
          data: {
            status: 'failed',
            error: err instanceof Error ? err.message : String(err),
            completedAt: new Date()
          }
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'failed' }
        });

        // Re-throw so pg-boss marks the job as failed
        throw err;
      }
    }
  );

  console.log('[worker] Listening for stl-generation jobs...');
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});