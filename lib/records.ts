import 'server-only';
import { asc, desc, eq, lte, and } from 'drizzle-orm';
import { db } from './db';
import { masses, users, events, notices, readings } from './db/schema';
import { requireAdmin, requireUser } from './auth';
import { today, currentTime } from './dates';
import type { Resource, RecordRow } from './resources';
function serialize(rows: object[]): RecordRow[] {
  return rows.map(
    (row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          value instanceof Date ? value.toISOString() : String(value ?? ''),
        ]),
      ) as RecordRow,
  );
}
export async function getRecords(resource: Resource, id?: string) {
  const user = resource === 'membros' ? await requireAdmin() : await requireUser();
  switch (resource) {
    case 'missas':
      return serialize(
        await db()
          .select()
          .from(masses)
          .where(id ? eq(masses.id, id) : undefined)
          .orderBy(asc(masses.date), asc(masses.time)),
      );
    case 'eventos': {
      const rows = serialize(
        await db()
          .select()
          .from(events)
          .where(id ? eq(events.id, id) : undefined)
          .orderBy(asc(events.date), asc(events.time)),
      );
      return [...rows.filter(isUpcoming), ...rows.filter((r) => !isUpcoming(r)).reverse()];
    }
    case 'avisos':
      return serialize(
        await db()
          .select()
          .from(notices)
          .where(
            and(
              id ? eq(notices.id, id) : undefined,
              user.role === 'ADMIN' ? undefined : lte(notices.publishedAt, today()),
            ),
          )
          .orderBy(desc(notices.publishedAt), desc(notices.createdAt)),
      );
    case 'leituras':
      return serialize(
        await db()
          .select()
          .from(readings)
          .where(id ? eq(readings.id, id) : undefined)
          .orderBy(desc(readings.date)),
      );
    case 'membros':
      return serialize(
        await db()
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
            community: users.community,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .where(id ? eq(users.id, id) : undefined)
          .orderBy(asc(users.name)),
      );
  }
}
export function isUpcoming(row: RecordRow) {
  return row.date > today() || (row.date === today() && row.time >= currentTime());
}
