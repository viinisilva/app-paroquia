import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
loadEnvConfig(process.cwd());
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL.');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const sessions = await pool.query('delete from sessions where expires_at < now()');
    const attempts = await pool.query('delete from auth_attempts where expires_at < now()');
    console.log(
      'Sessões expiradas removidas:',
      sessions.rowCount,
      'Limites expirados removidos:',
      attempts.rowCount,
    );
  } finally {
    await pool.end();
  }
}
main().catch(() => {
  console.error('Não foi possível executar a manutenção. Confira a conexão.');
  process.exitCode = 1;
});
