import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Helpers ───────────────────────────────────────────────────────────────────

async function resetTranche(id: number, soldCount: number, capacity: number) {
	await pool.query(
		`UPDATE tranches SET "soldCount" = $1, capacity = $2 WHERE id = $3`,
		[soldCount, capacity, id]
	);
}

async function readTrancheForUpdate(
	client: pg.PoolClient,
	id: number
): Promise<{ soldCount: number; capacity: number }> {
	const res = await client.query<{ soldCount: number; capacity: number }>(
		`SELECT "soldCount", capacity FROM tranches WHERE id = $1 FOR UPDATE`,
		[id]
	);
	return res.rows[0];
}

async function incrementSoldCount(client: pg.PoolClient, id: number): Promise<void> {
	await client.query(
		`UPDATE tranches SET "soldCount" = "soldCount" + 1 WHERE id = $1`,
		[id]
	);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('tranches FOR UPDATE', () => {
	let firstTrancheId: number;

	beforeAll(async () => {
		const res = await pool.query<{ id: number }>(
			`SELECT id FROM tranches ORDER BY "order" ASC LIMIT 1`
		);
		if (res.rowCount === 0) {
			throw new Error('No tranches found — did the seed run?');
		}
		firstTrancheId = res.rows[0].id;
	});

	afterAll(async () => {
		await pool.end();
	});

	beforeEach(async () => {
		await resetTranche(firstTrancheId, 0, 100);
	});

	it('reads the correct initial values after seed', async () => {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			const row = await readTrancheForUpdate(client, firstTrancheId);
			await client.query('ROLLBACK');
			expect(row.capacity).toBe(100);
			expect(row.soldCount).toBe(0);
		} finally {
			client.release();
		}
	});

	it('increments soldCount after a committed transaction', async () => {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			await readTrancheForUpdate(client, firstTrancheId);
			await incrementSoldCount(client, firstTrancheId);
			await client.query('COMMIT');
		} finally {
			client.release();
		}

		const check = await pool.query<{ soldCount: number }>(
			`SELECT "soldCount" FROM tranches WHERE id = $1`,
			[firstTrancheId]
		);
		expect(check.rows[0].soldCount).toBe(1);
	});

	it('does not increment soldCount when the transaction is rolled back', async () => {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			await readTrancheForUpdate(client, firstTrancheId);
			await incrementSoldCount(client, firstTrancheId);
			await client.query('ROLLBACK');
		} finally {
			client.release();
		}

		const check = await pool.query<{ soldCount: number }>(
			`SELECT "soldCount" FROM tranches WHERE id = $1`,
			[firstTrancheId]
		);
		expect(check.rows[0].soldCount).toBe(0);
	});

	it('detects a sold out state when soldCount equals capacity', async () => {
		await resetTranche(firstTrancheId, 100, 100);

		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			const row = await readTrancheForUpdate(client, firstTrancheId);
			await client.query('ROLLBACK');
			expect(row.soldCount).toBeGreaterThanOrEqual(row.capacity);
		} finally {
			client.release();
		}
	});

	it('only sells one slot when two transactions race for the last one', async () => {
		await resetTranche(firstTrancheId, 99, 100); // one slot remaining

		async function tryBuy(): Promise<'sold' | 'soldout'> {
			const client = await pool.connect();
			try {
				await client.query('BEGIN');
				const row = await readTrancheForUpdate(client, firstTrancheId);

				if (row.soldCount >= row.capacity) {
					await client.query('ROLLBACK');
					return 'soldout';
				}

				// Small delay so both transactions overlap in time
				await new Promise((r) => setTimeout(r, 10));

				await incrementSoldCount(client, firstTrancheId);
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

		const results = [resultA, resultB];
		expect(results.filter((r) => r === 'sold').length).toBe(1);
		expect(results.filter((r) => r === 'soldout').length).toBe(1);

		const final = await pool.query<{ soldCount: number; capacity: number }>(
			`SELECT "soldCount", capacity FROM tranches WHERE id = $1`,
			[firstTrancheId]
		);
		expect(final.rows[0].soldCount).toBe(final.rows[0].capacity);
	});
});