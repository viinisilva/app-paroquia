import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from './db';
import { authAttempts } from './db/schema';
import { tokenHash } from './password';
export async function allowAuthAttempt(key: string, limit = 10) {
  const expiresAt = new Date(Date.now() + 15 * 60000);
  const [attempt] = await db()
    .insert(authAttempts)
    .values({ key: tokenHash(key), expiresAt })
    .onConflictDoUpdate({
      target: authAttempts.key,
      set: {
        count: sql`case when ${authAttempts.expiresAt} < now() then 1 else ${authAttempts.count} + 1 end`,
        expiresAt: sql`case when ${authAttempts.expiresAt} < now() then ${expiresAt.toISOString()}::timestamptz else ${authAttempts.expiresAt} end`,
      },
    })
    .returning();
  return attempt.count <= limit;
}
