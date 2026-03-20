import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createTestUser() {
  return prisma.user.create({
    data: {
      email: `test-${crypto.randomUUID()}@example.com`,
      name: 'Test User'
    }
  });
}

async function createTestLicense(userId: string, monthlyUsage: number, limit: number) {
  const usageResetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // future
  return prisma.license.create({
    data: {
      userId,
      status: 'active',
      monthlyUsage,
      usageResetAt
    }
  });
}

/**
 * Simulates what the upload route transaction does:
 * increment the counter and throw if the limit is exceeded.
 * Returns 'ok' or 'limit_exceeded'.
 */
async function simulateUploadTransaction(
  licenseId: string,
  limit: number
): Promise<'ok' | 'limit_exceeded'> {
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.license.update({
        where: { id: licenseId },
        data: { monthlyUsage: { increment: 1 } }
      });

      if (updated.monthlyUsage > limit) {
        throw new Error('LIMIT_EXCEEDED');
      }
    });
    return 'ok';
  } catch (e) {
    if (e instanceof Error && e.message === 'LIMIT_EXCEEDED') {
      return 'limit_exceeded';
    }
    throw e;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('fair use upload transaction', () => {
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('allows a request when usage is below the limit', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, 0, 10);

    const result = await simulateUploadTransaction(license.id, 10);
    expect(result).toBe('ok');

    const updated = await prisma.license.findUnique({ where: { id: license.id } });
    expect(updated!.monthlyUsage).toBe(1);
  });

  it('allows a request that brings usage to exactly the limit', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, 9, 10); // one below limit

    const result = await simulateUploadTransaction(license.id, 10);
    expect(result).toBe('ok');

    const updated = await prisma.license.findUnique({ where: { id: license.id } });
    expect(updated!.monthlyUsage).toBe(10);
  });

  it('blocks a request that would push usage over the limit', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, 10, 10); // already at limit

    const result = await simulateUploadTransaction(license.id, 10);
    expect(result).toBe('limit_exceeded');

    // Usage must not have changed — transaction was rolled back
    const updated = await prisma.license.findUnique({ where: { id: license.id } });
    expect(updated!.monthlyUsage).toBe(10);
  });

  it('rolls back the counter when the limit is exceeded mid-transaction', async () => {
    const user = await createTestUser();
    const license = await createTestLicense(user.id, 10, 10);

    await simulateUploadTransaction(license.id, 10);

    // Confirm usage is still 10, not 11
    const updated = await prisma.license.findUnique({ where: { id: license.id } });
    expect(updated!.monthlyUsage).toBe(10);
  });

  it('only allows one request when two race past the pre-transaction check simultaneously', async () => {
    const user = await createTestUser();
    // Set usage to 9 with limit 10 — both requests pass the pre-check (9 < 10)
    // but only one should succeed inside the transaction
    const license = await createTestLicense(user.id, 9, 10);

    const [resultA, resultB] = await Promise.all([
      simulateUploadTransaction(license.id, 10),
      simulateUploadTransaction(license.id, 10)
    ]);

    const results = [resultA, resultB];
    expect(results.filter((r) => r === 'ok').length).toBe(1);
    expect(results.filter((r) => r === 'limit_exceeded').length).toBe(1);

    // Final usage must be exactly 10 — not 11
    const updated = await prisma.license.findUnique({ where: { id: license.id } });
    expect(updated!.monthlyUsage).toBe(10);
  });
});