import { execSync } from 'child_process';
import pg from 'pg';

const { Client } = pg;

const TEST_DB = 'mp3d_test';
const BASE_URL = process.env.DATABASE_BASE_URL;

if (!BASE_URL) {
  throw new Error('DATABASE_BASE_URL must be set to run integration tests');
}

export const TEST_DATABASE_URL = `${BASE_URL}/${TEST_DB}`;

export async function setup() {
  // Connect to the default postgres database as superuser
  const client = new Client({ connectionString: `${BASE_URL}/postgres` });
  await client.connect();

  // Drop if exists from a previous failed run, then recreate clean
  await client.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await client.query(`CREATE DATABASE ${TEST_DB} WITH OWNER stlapp`);
  await client.end();

  // Run migrations against the fresh database
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
  });

  // Seed the license_slots row
  execSync('npx prisma db seed', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
  });

  // Make the test database URL available to all test files
  process.env.DATABASE_URL = TEST_DATABASE_URL;

  console.log('✓ Test database ready');
}

export async function teardown() {
  const client = new Client({ connectionString: `${BASE_URL}/postgres` });
  await client.connect();

  // Terminate any lingering connections before dropping
  await client.query(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '${TEST_DB}'
    AND pid <> pg_backend_pid()
  `);

  await client.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await client.end();

  console.log('✓ Test database dropped');
}