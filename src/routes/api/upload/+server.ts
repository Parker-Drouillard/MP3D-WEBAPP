import { json, error } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '$lib/server/prisma';
import { getItem } from '$lib/catalog';
import { UPLOAD_DIR, FAIR_USE_MONTHLY_LIMIT } from '$env/static/private';
import type { RequestHandler } from './$types';
import sharp from 'sharp';
import { getBoss } from '$lib/server/boss';
import { OUTPUT_DIR } from '$env/static/private';
import { validateAndNormalizeImage } from '$lib/server/image-validation';
import { createOrderTransaction } from '$lib/server/order';
import { needsReset } from '$lib/server/fair-use';

export const config = {
  bodyParser: {
    sizeLimit: '255mb' // 5 files × 50MB + 5MB headroom
  }
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file

export const POST: RequestHandler = async ({ request, locals }) => {
  // 1. Auth check — never trust client-supplied identity
  if (!locals.user) {
    error(401, 'Unauthorized');
  }

  if (!locals.license) {
    error(403, 'No active license');
  }

  // 2. Fair use check
  const limit = parseInt(FAIR_USE_MONTHLY_LIMIT, 10);
  const now = new Date();
  const resetAt = new Date(locals.license.usageResetAt);

  const reset = needsReset(now, resetAt);

  if (!reset && locals.license.monthlyUsage >= limit) {
    error(429, 'Monthly generation limit reached');
  }

  // 3. Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    error(400, 'Invalid form data');
  }

  const slug = formData.get('slug');
  const photoFiles = formData.getAll('photos');

  // 4. Validate slug
  if (typeof slug !== 'string') {
    error(400, 'Missing slug');
  }

  const item = getItem(slug);
  if (!item) {
    error(400, 'Invalid item');
  }

  // 6. Validate photo count
  const files = photoFiles.filter((f): f is File => f instanceof File);

  if (files.length < item.minPhotos) {
    error(400, `Minimum ${item.minPhotos} photos required`);
  }

  if (files.length > item.maxPhotos) {
    error(400, `Maximum ${item.maxPhotos} photos allowed`);
  }

  // 7. Validate each file — magic bytes, size, type, convert HEIC if needed
  const validatedFiles: { buffer: Buffer; ext: string }[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      error(400, `File "${file.name}" exceeds 20MB limit`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await validateAndNormalizeImage(buffer);

    if (!result) {
      error(400, `File "${file.name}" is not a valid JPEG, PNG, or HEIC`);
    }

    validatedFiles.push(result);
  }

  // 8. Create order + stl_job in a transaction, increment fair use counter
  let orderId: string;
  let jobId: string;
  let inputDir: string;

  try {
    const result = await createOrderTransaction(prisma, {
      userId: locals.user.id,
      licenseId: locals.license.id,
      monthlyUsage: locals.license.monthlyUsage,
      usageResetAt: new Date(locals.license.usageResetAt),
      itemSlug: slug,
      deliveryMethod: 'both',
      uploadDir: UPLOAD_DIR,
      fairUseLimit: limit
    });

    orderId = result.orderId;
    jobId = result.jobId;
    inputDir = result.inputDir;
  } catch (e) {
    if (e instanceof Error && e.message === 'LIMIT_EXCEEDED') {
      error(429, 'Monthly generation limit reached');
    }
    console.error('Transaction failed:', e);
    error(500, 'Failed to create order');
  }

  // 9. Write files to disk — UUID filenames only, never user-supplied names
  try {
    await mkdir(inputDir, { recursive: true });

    await Promise.all(
      validatedFiles.map(({ buffer, ext }, i) => {
        const filename = `${randomUUID()}.${ext}`;
        return writeFile(join(inputDir, filename), buffer);
      })
    );
  } catch (e) {
    console.error('File write failed:', e);
    // Clean up the order if file write fails
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'failed' }
    });
    error(500, 'Failed to save uploaded files');
  }

// 10. Enqueue the STL generation job
  try {
    const boss = await getBoss();
    const jobId2 = await boss.send('stl-generation', {
      jobId,
      orderId,
      itemSlug: slug,
      inputDir,
      outputPath: join(OUTPUT_DIR, `${jobId}.stl`)
    });
    console.log('[upload] Job enqueued with pg-boss id:', jobId2);
  } catch (e) {
    console.error('Failed to enqueue job:', e);
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'failed' }
    });
    error(500, 'Failed to queue generation job');
  }

  return json({ orderId }, { status: 201 });
};