import { Pool } from 'pg';
import { verifyPassword } from '../lib/password';
import { buildDemoData, demoIds } from './demo-data';
import { assertPreviewDemoDatabase } from './preview-database-safety';

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  assertPreviewDemoDatabase(databaseUrl);
  const memberEmail = process.env.DEMO_MEMBER_EMAIL ?? '';
  const memberPassword = process.env.DEMO_MEMBER_PASSWORD ?? '';
  const data = buildDemoData(memberEmail);
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const counts = await pool.query<{
      admins: number;
      members: number;
      masses: number;
      events: number;
      notices: number;
      readings: number;
      sessions: number;
      admin_sessions: number;
      member_sessions: number;
      attempts: number;
    }>(`select
      (select count(*)::int from users where role = 'ADMIN') as admins,
      (select count(*)::int from users where role = 'MEMBER') as members,
      (select count(*)::int from masses) as masses,
      (select count(*)::int from events) as events,
      (select count(*)::int from notices) as notices,
      (select count(*)::int from readings) as readings,
      (select count(*)::int from sessions) as sessions,
      (select count(*)::int from sessions s inner join users u on u.id = s.user_id where u.role = 'ADMIN') as admin_sessions,
      (select count(*)::int from sessions s inner join users u on u.id = s.user_id where u.role = 'MEMBER') as member_sessions,
      (select count(*)::int from auth_attempts) as attempts`);
    const demo = await pool.query<{ kind: string; count: number }>(
      `select 'users' as kind, count(*)::int as count from users where id = any($1::uuid[])
       union all select 'masses', count(*)::int from masses where id = any($2::uuid[])
       union all select 'events', count(*)::int from events where id = any($3::uuid[])
       union all select 'notices', count(*)::int from notices where id = any($4::uuid[])
       union all select 'readings', count(*)::int from readings where id = any($5::uuid[])`,
      [demoIds.users, demoIds.masses, demoIds.events, demoIds.notices, demoIds.readings],
    );
    const loginMember = await pool.query<{ password_hash: string; role: string }>(
      'select password_hash, role from users where email = lower($1)',
      [memberEmail],
    );
    const futureMasses = await pool.query<{ count: number }>(
      'select count(*)::int as count from masses where date > $1',
      [data.today],
    );
    const byKind = Object.fromEntries(demo.rows.map((row) => [row.kind, row.count]));
    const passwordOk =
      !!loginMember.rows[0] &&
      (await verifyPassword(memberPassword, loginMember.rows[0].password_hash));

    console.log(`ADMIN_COUNT=${counts.rows[0]?.admins ?? -1}`);
    console.log(`MEMBER_COUNT=${counts.rows[0]?.members ?? -1}`);
    console.log(`MASS_COUNT=${counts.rows[0]?.masses ?? -1}`);
    console.log(`EVENT_COUNT=${counts.rows[0]?.events ?? -1}`);
    console.log(`NOTICE_COUNT=${counts.rows[0]?.notices ?? -1}`);
    console.log(`READING_COUNT=${counts.rows[0]?.readings ?? -1}`);
    console.log(`SESSION_COUNT=${counts.rows[0]?.sessions ?? -1}`);
    console.log(`ADMIN_SESSION_COUNT=${counts.rows[0]?.admin_sessions ?? -1}`);
    console.log(`MEMBER_SESSION_COUNT=${counts.rows[0]?.member_sessions ?? -1}`);
    console.log(`AUTH_ATTEMPT_COUNT=${counts.rows[0]?.attempts ?? -1}`);
    console.log(
      `DEMO_IDS_OK=${
        byKind.users === 5 &&
        byKind.masses === 4 &&
        byKind.events === 3 &&
        byKind.notices === 3 &&
        byKind.readings === 7
      }`,
    );
    console.log(`FUTURE_MASSES_OK=${futureMasses.rows[0]?.count === 4}`);
    console.log(`MEMBER_LOGIN_ROLE_OK=${loginMember.rows[0]?.role === 'MEMBER'}`);
    console.log(
      `MEMBER_PASSWORD_HASHED=${loginMember.rows[0]?.password_hash.startsWith('scrypt:')}`,
    );
    console.log(`MEMBER_PASSWORD_VERIFIES=${passwordOk}`);

    if (
      counts.rows[0]?.admins !== 1 ||
      counts.rows[0]?.members !== 5 ||
      counts.rows[0]?.masses !== 4 ||
      counts.rows[0]?.events !== 3 ||
      counts.rows[0]?.notices !== 3 ||
      counts.rows[0]?.readings !== 7 ||
      byKind.users !== 5 ||
      byKind.masses !== 4 ||
      byKind.events !== 3 ||
      byKind.notices !== 3 ||
      byKind.readings !== 7 ||
      futureMasses.rows[0]?.count !== 4 ||
      loginMember.rows[0]?.role !== 'MEMBER' ||
      !loginMember.rows[0]?.password_hash.startsWith('scrypt:') ||
      !passwordOk
    )
      throw new Error('Dados DEMO incompletos ou inconsistentes.');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falha ao verificar os dados DEMO.');
  process.exitCode = 1;
});
