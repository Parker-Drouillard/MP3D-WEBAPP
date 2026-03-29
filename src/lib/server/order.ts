import { randomUUID } from 'crypto';
import { join } from 'path';
import type { PrismaClient } from '@prisma/client';
import { isLimitExceeded, needsReset, nextResetDate } from '$lib/server/fair-use';

export interface CreateOrderParams {
  userId: string;
  licenseId: string;
  monthlyUsage: number;
  usageResetAt: Date;
  itemSlug: string;
  deliveryMethod: 'download' | 'email' | 'both';
  uploadDir: string;
  fairUseLimit: number;
}

export interface CreateOrderResult {
  orderId: string;
  jobId: string;
  inputDir: string;
}

export async function createOrderTransaction(
  prisma: PrismaClient,
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const {
    userId,
    licenseId,
    monthlyUsage,
    usageResetAt,
    itemSlug,
    deliveryMethod,
    uploadDir,
    fairUseLimit
  } = params;

  const jobId = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const inputDir = join(uploadDir, jobId);
  const now = new Date();
  const reset = needsReset(now, usageResetAt);
  const nextResetAt = reset ? nextResetDate(now, usageResetAt) : usageResetAt;

  const result = await prisma.$transaction(async (tx) => {
    const updatedLicense = await tx.license.update({
      where: { id: licenseId },
      data: reset
        ? { monthlyUsage: 1, usageResetAt: nextResetAt }
        : { monthlyUsage: { increment: 1 } }
    });

    if (isLimitExceeded(updatedLicense.monthlyUsage, fairUseLimit)) {
      throw new Error('LIMIT_EXCEEDED');
    }

    const order = await tx.order.create({
      data: {
        userId,
        itemSlug,
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

    return { orderId: order.id };
  });

  return {
    orderId: result.orderId,
    jobId,
    inputDir
  };
}