import PgBoss from 'pg-boss';
import { DATABASE_URL } from '$env/static/private';

let bossInstance: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (bossInstance) return bossInstance;

  bossInstance = new PgBoss(DATABASE_URL);

  bossInstance.on('error', (err) => {
    console.error('[pg-boss] error:', err);
  });

  await bossInstance.start();
  return bossInstance;
}