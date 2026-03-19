import { error } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'crypto';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { prisma } from '$lib/server/prisma';
import { DOWNLOAD_HMAC_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

function validateDownloadToken(
  token: string,
  jobId: string
): { valid: boolean; expired: boolean } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');

    if (parts.length !== 3) return { valid: false, expired: false };

    const [tokenJobId, expiry, sig] = parts;

    // Verify job ID matches
    if (tokenJobId !== jobId) return { valid: false, expired: false };

    // Verify signature
    const payload = `${tokenJobId}:${expiry}`;
    const expected = createHmac('sha256', DOWNLOAD_HMAC_SECRET)
      .update(payload)
      .digest('hex');

    const sigValid = timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expected)
    );

    if (!sigValid) return { valid: false, expired: false };

    // Check expiry
    const expiryMs = parseInt(expiry, 10);
    const expired = Date.now() > expiryMs;

    return { valid: true, expired };
  } catch {
    return { valid: false, expired: false };
  }
}

export const GET: RequestHandler = async ({ params, url }) => {
  const { jobId } = params;
  const token = url.searchParams.get('token');

  if (!token) {
    error(403, 'Missing download token');
  }

  const { valid, expired } = validateDownloadToken(token, jobId);

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