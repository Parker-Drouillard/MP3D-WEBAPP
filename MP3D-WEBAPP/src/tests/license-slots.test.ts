import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Helpers ───────────────────────────────────────────────────────────────────

async function resetSlots(total: number, sold: number) {
  await pool.query(
    `UPDATE license_slots SET "totalSlots" = $1, "soldCount" = $2 WHERE id = 1`,
    [total, sold]
  );
}

async function readSlotsForUpdate(
  client: pg.PoolClient
): Promise<{ soldCount: number; totalSlots: number }> {
  const res = await client.query<{ soldCount: number; totalSlots: number }>(
    `SELECT "soldCount", "totalSlots" FROM license_slots WHERE id = 1 FOR UPDATE`
  );
  return res.rows[0];
}

async function incrementSoldCount(client: pg.PoolClient): Promise<void> {
  await client.query(
    `UPDATE license_slots SET "soldCount" = "soldCount" + 1 WHERE id = 1`
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('license_slots FOR UPDATE', () => {
  beforeAll(async () => {
    const res = await pool.query('SELECT id FROM license_slots WHERE id = 1');
    if (res.rowCount === 0) {
      throw new Error('license_slots row not found — did the seed run?');
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await resetSlots(5300, 0);
  });

  it('reads the correct initial values after seed', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const row = await readSlotsForUpdate(client);
      await client.query('ROLLBACK');
      expect(row.totalSlots).toBe(5300);
      expect(row.soldCount).toBe(0);
    } finally {
      client.release();
    }
  });

  it('increments soldCount after a committed transaction', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await readSlotsForUpdate(client);
      await incrementSoldCount(client);
      await client.query('COMMIT');
    } finally {
      client.release();
    }

    const check = await pool.query<{ soldCount: number }>(
      `SELECT "soldCount" FROM license_slots WHERE id = 1`
    );
    expect(check.rows[0].soldCount).toBe(1);
  });

  it('does not increment soldCount when the transaction is rolled back', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await readSlotsForUpdate(client);
      await incrementSoldCount(client);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }

    const check = await pool.query<{ soldCount: number }>(
      `SELECT "soldCount" FROM license_slots WHERE id = 1`
    );
    expect(check.rows[0].soldCount).toBe(0);
  });

  it('detects a sold out state when soldCount equals totalSlots', async () => {
    await resetSlots(5300, 5300);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const row = await readSlotsForUpdate(client);
      await client.query('ROLLBACK');
      expect(row.soldCount).toBeGreaterThanOrEqual(row.totalSlots);
    } finally {
      client.release();
    }
  });

  it('only sells one slot when two transactions race for the last one', async () => {
    await resetSlots(5300, 5299); // one slot remaining

    async function tryBuy(): Promise<'sold' | 'soldout'> {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const row = await readSlotsForUpdate(client); // blocks if locked

        if (row.soldCount >= row.totalSlots) {
          await client.query('ROLLBACK');
          return 'soldout';
        }

        // Small delay so both transactions overlap in time
        await new Promise((r) => setTimeout(r, 10));

        await incrementSoldCount(client);
        await client.query('COMMIT');
        return 'sold';
      } catch {
        await client.query('ROLLBACK').catch(() => {});
        return 'soldout';
      } finally {
        client.release();
      }
    }

    const [resultA, resultB] = await Promise.all([tryBuy(), tryBuy()]);

    // Exactly one should succeed
    const results = [resultA, resultB];
    expect(results.filter((r) => r === 'sold').length).toBe(1);
    expect(results.filter((r) => r === 'soldout').length).toBe(1);

    // Final soldCount must equal totalSlots — not exceed it
    const final = await pool.query<{ soldCount: number; totalSlots: number }>(
      `SELECT "soldCount", "totalSlots" FROM license_slots WHERE id = 1`
    );
    expect(final.rows[0].soldCount).toBe(final.rows[0].totalSlots);
  });
});