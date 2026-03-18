import { json, error } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '$lib/server/prisma';
import { getItem } from '$lib/catalog';
import { UPLOAD_DIR, FAIR_USE_MONTHLY_LIMIT } from '$env/static/private';
import type { RequestHandler } from './$types';
import sharp from 'sharp';


const MAGIC_BYTES = {
  jpeg: { bytes: [0xff, 0xd8, 0xff], offset: 0 },
  png: { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
  heic: { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB per file


async function validateAndNormalizeImage(
  buffer: Buffer
): Promise<{ buffer: Buffer; ext: string } | null> {
  // Check JPEG
  const isJpeg = MAGIC_BYTES.jpeg.bytes.every(
    (byte, i) => buffer[i + MAGIC_BYTES.jpeg.offset] === byte
  );
  if (isJpeg) return { buffer, ext: 'jpg' };

  // Check PNG
  const isPng = MAGIC_BYTES.png.bytes.every(
    (byte, i) => buffer[i + MAGIC_BYTES.png.offset] === byte
  );
  if (isPng) return { buffer, ext: 'png' };

  // Check HEIC (ftyp box at offset 4)
  const isHeic =
    buffer.length > 8 &&
    MAGIC_BYTES.heic.bytes.every(
      (byte, i) => buffer[i + MAGIC_BYTES.heic.offset] === byte
    );

  if (isHeic) {
    try {
      const converted = await sharp(buffer).jpeg({ quality: 92 }).toBuffer();
      return { buffer: converted, ext: 'jpg' };
    } catch {
      return null;
    }
  }

  return null;
}


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

  // If reset date has passed, we need to reset the counter first
  const needsReset = now >= resetAt;

  if (!needsReset && locals.license.monthlyUsage >= limit) {
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
  const deliveryMethod = formData.get('deliveryMethod');
  const photoFiles = formData.getAll('photos');

  // 4. Validate slug
  if (typeof slug !== 'string') {
    error(400, 'Missing slug');
  }

  const item = getItem(slug);
  if (!item) {
    error(400, 'Invalid item');
  }

  // 5. Validate delivery method
  if (deliveryMethod !== 'download' && deliveryMethod !== 'email') {
    error(400, 'Invalid delivery method');
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
  const jobId = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const inputDir = join(UPLOAD_DIR, jobId);

  // Calculate next reset date (monthly anniversary)
  const nextResetAt = needsReset
    ? new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        resetAt.getDate(),
        resetAt.getHours(),
        resetAt.getMinutes(),
        resetAt.getSeconds()
      )
    : resetAt;

  let orderId: string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Reset counter if anniversary has passed
      const updatedLicense = await tx.license.update({
        where: { id: locals.license!.id },
        data: needsReset
          ? { monthlyUsage: 1, usageResetAt: nextResetAt }
          : { monthlyUsage: { increment: 1 } }
      });

      // Double-check limit inside transaction
      if (updatedLicense.monthlyUsage > limit) {
        throw new Error('LIMIT_EXCEEDED');
      }

      const order = await tx.order.create({
        data: {
          userId: locals.user!.id,
          itemSlug: slug,
          status: 'pending',
          deliveryMethod
        }
      });

      await tx.stlJob.create({
        data: {
          id: jobId,
          orderId: order.id,
          inputDir,
          outputPath: '',
          status: 'queued',
          expiresAt
        }
      });

      return { order };
    });

    orderId = result.order.id;
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

  // 10. Update stl_job with the confirmed input dir and queue it
  await prisma.stlJob.update({
    where: { id: jobId },
    data: { status: 'queued' }
  });

  return json({ orderId }, { status: 201 });
};