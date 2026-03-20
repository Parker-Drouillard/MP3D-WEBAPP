import { error } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'crypto';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { prisma } from '$lib/server/prisma';
import { DOWNLOAD_HMAC_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';
import { validateDownloadToken } from '$lib/server/download-token';

export const GET: RequestHandler = async ({ params, url }) => {
  const { jobId } = params;
  const token = url.searchParams.get('token');

  if (!token) {
    error(403, 'Missing download token');
  }

  const { valid, expired } = validateDownloadToken(token, jobId, DOWNLOAD_HMAC_SECRET);  
  if (!valid) {
    error(403, 'Invalid download token');
  }

  if (expired) {
    error(410, 'Download link has expired');
  }

  // Look up the job
  const job = await prisma.stlJob.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    error(404, 'Job not found');
  }

  if (job.status !== 'complete') {
    error(404, 'File not ready');
  }

  if (job.filesDeleted) {
    error(410, 'File has been deleted');
  }

  // Verify file exists on disk
  try {
    await stat(job.outputPath);
  } catch {
    error(410, 'File no longer available');
  }

  // Stream the file
  const stream = createReadStream(job.outputPath);
  const filename = `${jobId}.stl`;

  return new Response(stream as any, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store'
    }
  });
};