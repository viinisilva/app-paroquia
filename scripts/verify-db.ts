import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
import { verifyPassword } from '../lib/password';

loadEnvConfig(process.cwd());

const expectedTables = [
  'auth_attempts',
  'events',
  'masses',
  'notices',
  'readings',
  'sessions',
  'users',
] as const;

const expectedEnums = {
  reading_type: ['FIRST', 'PSALM', 'SECOND', 'GOSPEL'],
  role: ['ADMIN', 'MEMBER'],
} as const;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada.');

  const url = new URL(process.env.DATABASE_URL);
  const structure = {
    postgres: ['postgres:', 'postgresql:'].includes(url.protocol),
    neon: url.hostname.endsWith('.neon.tech'),
    pooled: url.hostname.includes('pooler'),
    ssl: url.searchParams.get('sslmode') === 'verify-full',
  };

  if (Object.values(structure).includes(false))
    throw new Error('DATABASE_URL não possui a estrutura segura esperada para Neon pooled.');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    const client = await pool.connect();
    const encrypted =
      (client as unknown as { connection?: { stream?: { encrypted?: boolean } } }).connection
        ?.stream?.encrypted === true;
    client.release();

    const identity = await pool.query<{
      database_ok: boolean;
      role_ok: boolean;
    }>(
      `select current_database() = 'neondb' as database_ok,
              current_user = 'neondb_owner' as role_ok`,
    );

    const tables = await pool.query<{ table_name: string }>(
      `select table_name
         from information_schema.tables
        where table_schema = 'public'
        order by table_name`,
    );
    const tableNames = new Set(tables.rows.map((row) => row.table_name));

    const enums = await pool.query<{ enum_name: string; enum_value: string }>(
      `select type.typname as enum_name, value.enumlabel as enum_value
         from pg_type type
         join pg_enum value on value.enumtypid = type.oid
         join pg_namespace namespace on namespace.oid = type.typnamespace
        where namespace.nspname = 'public'
        order by type.typname, value.enumsortorder`,
    );

    const enumValues = new Map<string, string[]>();
    for (const row of enums.rows)
      enumValues.set(row.enum_name, [...(enumValues.get(row.enum_name) ?? []), row.enum_value]);

    const missingTables = expectedTables.filter((table) => !tableNames.has(table));
    const enumsOk = Object.entries(expectedEnums).every(
      ([name, values]) => JSON.stringify(enumValues.get(name)) === JSON.stringify(values),
    );

    console.log(`DATABASE_NAME_OK=${identity.rows[0]?.database_ok === true}`);
    console.log(`DATABASE_ROLE_OK=${identity.rows[0]?.role_ok === true}`);
    console.log(`DATABASE_SSL_OK=${encrypted}`);
    console.log(`TABLES_OK=${missingTables.length === 0}`);
    console.log(`ENUMS_OK=${enumsOk}`);

    if (missingTables.length > 0 || !enumsOk)
      throw new Error('Schema incompleto. Execute a migration antes de continuar.');

    const counts = await pool.query<{
      users_count: number;
      sessions_count: number;
      business_records_count: number;
    }>(
      `select (select count(*)::int from users) as users_count,
              (select count(*)::int from sessions) as sessions_count,
              ((select count(*) from masses) +
               (select count(*) from events) +
               (select count(*) from notices) +
               (select count(*) from readings))::int as business_records_count`,
    );
    console.log(`USERS_COUNT=${counts.rows[0]?.users_count ?? -1}`);
    console.log(`SESSIONS_COUNT=${counts.rows[0]?.sessions_count ?? -1}`);
    console.log(`BUSINESS_RECORDS_COUNT=${counts.rows[0]?.business_records_count ?? -1}`);

    if (process.env.SEED_ADMIN_EMAIL) {
      const admin = await pool.query<{ role: string; password_hash: string }>(
        'select role, password_hash from users where email = lower($1)',
        [process.env.SEED_ADMIN_EMAIL],
      );
      const row = admin.rows[0];
      const hashOk = !!row?.password_hash.startsWith('scrypt:');
      const passwordOk =
        !!row &&
        !!process.env.SEED_ADMIN_PASSWORD &&
        (await verifyPassword(process.env.SEED_ADMIN_PASSWORD, row.password_hash));

      console.log(`ADMIN_COUNT_OK=${admin.rowCount === 1}`);
      console.log(`ADMIN_ROLE_OK=${row?.role === 'ADMIN'}`);
      console.log(`ADMIN_PASSWORD_HASHED=${hashOk}`);
      console.log(`ADMIN_PASSWORD_VERIFIES=${passwordOk}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falha ao verificar o banco.');
  process.exitCode = 1;
});
