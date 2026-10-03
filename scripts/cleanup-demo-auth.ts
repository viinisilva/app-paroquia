import { Pool } from 'pg';
import { tokenHash } from '../lib/password';
import { demoIds } from './demo-data';
import { assertPreviewDemoDatabase } from './preview-database-safety';

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  const memberEmail = process.env.DEMO_MEMBER_EMAIL?.trim().toLowerCase() ?? '';
  assertPreviewDemoDatabase(databaseUrl);
  if (!memberEmail) throw new Error('DEMO_MEMBER_EMAIL não configurado.');

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    await pool.query('begin');
    const sessions = await pool.query('delete from sessions where user_id = any($1::uuid[])', [
      demoIds.users,
    ]);
    const attempts = await pool.query('delete from auth_attempts where key = $1', [
      tokenHash(`login:${memberEmail}`),
    ]);
    await pool.query('commit');

    console.log(`DEMO_MEMBER_SESSIONS_REMOVED=${sessions.rowCount ?? 0}`);
    console.log(`DEMO_MEMBER_LIMITS_REMOVED=${attempts.rowCount ?? 0}`);
  } catch (error) {
    await pool.query('rollback');
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falha ao limpar autenticação DEMO.');
  process.exitCode = 1;
});
