import 'server-only';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
const globalDb = globalThis as unknown as { parishPool?: Pool };
export function db() {
  if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL não configurada. Consulte o README.');
  const pool = (globalDb.parishPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  }));
  return drizzle(pool, { schema });
}
