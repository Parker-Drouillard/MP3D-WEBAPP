import { describe, it, expect, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createOrderTransaction } from '$lib/server/order';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
});

const UPLOAD_DIR = '/tmp/mp3d-test-uploads';
const FAIR_USE_LIMIT = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createTestUser() {
  return prisma.user.create({
    data: {
      email: `test-${crypto.randomUUID()}@example.com`,
      name: 'Test User'
    }
  });
}

async function createTestLicense(userId: string, monthlyUsage: number) {
  return prisma.license.create({
    data: {
      userId,
      status: 'active',
      monthlyUsage,
      usageResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // future
    }
  });
}

afterAll(async () => {
  await prisma.$disconnect();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('createOrderTransaction', () => {
  it('creates an order and stl_job in the database', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, 0);

    const result = await createOrderTransaction(prisma, {
      userId: user.id,
      licenseId: license.id,
      monthlyUsage: license.monthlyUsage,
      usageResetAt: license.usageResetAt,
      itemSlug: 'test-item',
      deliveryMethod: 'download',
      uploadDir: UPLOAD_DIR,
      fairUseLimit: FAIR_USE_LIMIT
    });

    expect(result.orderId).toBeTruthy();
    expect(result.jobId).toBeTruthy();
    expect(result.inputDir).toContain(result.jobId);

    // Verify order exists in DB
    const order = await prisma.order.findUnique({ where: { id: result.orderId } });
    expect(order).not.toBeNull();
    expect(order!.status).toBe('pending');
    expect(order!.deliveryMethod).toBe('download');
    expect(order!.itemSlug).toBe('test-item');

    // Verify stl_job exists in DB
    const job = await prisma.stlJob.findUnique({ where: { id: result.jobId } });
    expect(job).not.toBeNull();
    expect(job!.status).toBe('queued');
    expect(job!.orderId).toBe(result.orderId);
  });

  it('increments the monthly usage counter', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, 3);

    await createOrderTransaction(prisma, {
      userId: user.id,
      licenseId: license.id,
      monthlyUsage: license.monthlyUsage,
      usageResetAt: license.usageResetAt,
      itemSlug: 'test-item',
      deliveryMethod: 'download',
      uploadDir: UPLOAD_DIR,
      fairUseLimit: FAIR_USE_LIMIT
    });

    const updated = await prisma.license.findUnique({ where: { id: license.id } });
    expect(updated!.monthlyUsage).toBe(4);
  });

  it('throws LIMIT_EXCEEDED when usage is at the limit', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, FAIR_USE_LIMIT);

    await expect(
      createOrderTransaction(prisma, {
        userId: user.id,
        licenseId: license.id,
        monthlyUsage: license.monthlyUsage,
        usageResetAt: license.usageResetAt,
        itemSlug: 'test-item',
        deliveryMethod: 'download',
        uploadDir: UPLOAD_DIR,
        fairUseLimit: FAIR_USE_LIMIT
      })
    ).rejects.toThrow('LIMIT_EXCEEDED');
  });

  it('does not create an order when LIMIT_EXCEEDED is thrown', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, FAIR_USE_LIMIT);

    const ordersBefore = await prisma.order.count({ where: { userId: user.id } });

    try {
      await createOrderTransaction(prisma, {
        userId: user.id,
        licenseId: license.id,
        monthlyUsage: license.monthlyUsage,
        usageResetAt: license.usageResetAt,
        itemSlug: 'test-item',
        deliveryMethod: 'download',
        uploadDir: UPLOAD_DIR,
        fairUseLimit: FAIR_USE_LIMIT
      });
    } catch {
      // expected
    }

    const ordersAfter = await prisma.order.count({ where: { userId: user.id } });
    expect(ordersAfter).toBe(ordersBefore);
  });

  it('resets the usage counter when the anniversary has passed', async () => {
    const user = await createTestUser();

    // Create a license with a reset date in the past
    const license = await prisma.license.create({
      data: {
        userId: user.id,
        status: 'active',
        monthlyUsage: 8,
        usageResetAt: new Date(Date.now() - 1000) // 1 second in the past
      }
    });

    await createOrderTransaction(prisma, {
      userId: user.id,
      licenseId: license.id,
      monthlyUsage: license.monthlyUsage,
      usageResetAt: license.usageResetAt,
      itemSlug: 'test-item',
      deliveryMethod: 'email',
      uploadDir: UPLOAD_DIR,
      fairUseLimit: FAIR_USE_LIMIT
    });

    const updated = await prisma.license.findUnique({ where: { id: license.id } });
    // Counter should reset to 1 (this request), not increment to 9
    expect(updated!.monthlyUsage).toBe(1);
    // Reset date should be pushed forward
    expect(updated!.usageResetAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('stl_job and order are linked via orderId', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, 0);

    const result = await createOrderTransaction(prisma, {
      userId: user.id,
      licenseId: license.id,
      monthlyUsage: license.monthlyUsage,
      usageResetAt: license.usageResetAt,
      itemSlug: 'test-item',
      deliveryMethod: 'download',
      uploadDir: UPLOAD_DIR,
      fairUseLimit: FAIR_USE_LIMIT
    });

    const job = await prisma.stlJob.findUnique({ where: { id: result.jobId } });
    expect(job!.orderId).toBe(result.orderId);
  });
});