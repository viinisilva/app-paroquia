import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { z } from 'zod';
import { users, masses, events, notices, readings } from '../lib/db/schema';
import { hashPassword } from '../lib/password';
import { passwordSchema } from '../lib/validation';
import { buildDemoData } from './demo-data';
import { assertPreviewDemoDatabase } from './preview-database-safety';

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  assertPreviewDemoDatabase(databaseUrl);
  const memberEmail = z.string().email().parse(process.env.DEMO_MEMBER_EMAIL).toLowerCase();
  const memberPassword = passwordSchema.parse(process.env.DEMO_MEMBER_PASSWORD);
  const data = buildDemoData(memberEmail);
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const database = drizzle(pool);

  try {
    const identity = await pool.query<{ database_name: string; database_role: string }>(
      'select current_database() as database_name, current_user as database_role',
    );
    if (
      identity.rows[0]?.database_name !== 'neondb' ||
      identity.rows[0]?.database_role !== 'neondb_owner'
    )
      throw new Error('Identidade inesperada do banco Preview.');

    const admins = await pool.query<{ count: number }>(
      "select count(*)::int as count from users where role = 'ADMIN'",
    );
    if (admins.rows[0]?.count !== 1)
      throw new Error('O Preview deve conter exatamente o ADMIN existente antes do seed DEMO.');

    const passwordHash = await hashPassword(memberPassword);
    const now = new Date();
    await database.transaction(async (tx) => {
      for (const member of data.members) {
        const createdAt = new Date(now.getTime() - member.daysAgo * 86400000);
        await tx
          .insert(users)
          .values({
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            community: member.community,
            role: 'MEMBER',
            passwordHash,
            createdAt,
            updatedAt: createdAt,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: {
              name: member.name,
              phone: member.phone,
              community: member.community,
              role: 'MEMBER',
              passwordHash,
              updatedAt: now,
            },
          });
      }

      for (const mass of data.masses)
        await tx
          .insert(masses)
          .values(mass)
          .onConflictDoUpdate({
            target: masses.id,
            set: { ...mass, updatedAt: now },
          });
      for (const event of data.events)
        await tx
          .insert(events)
          .values(event)
          .onConflictDoUpdate({
            target: events.id,
            set: { ...event, updatedAt: now },
          });
      for (const notice of data.notices)
        await tx
          .insert(notices)
          .values(notice)
          .onConflictDoUpdate({
            target: notices.id,
            set: { ...notice, updatedAt: now },
          });
      for (const reading of data.readings)
        await tx
          .insert(readings)
          .values(reading)
          .onConflictDoUpdate({
            target: readings.id,
            set: { ...reading, updatedAt: now },
          });
    });

    console.log('DEMO_SEED_OK=true');
    console.log(`DEMO_MEMBERS=${data.members.length}`);
    console.log(`DEMO_MASSES=${data.masses.length}`);
    console.log(`DEMO_EVENTS=${data.events.length}`);
    console.log(`DEMO_NOTICES=${data.notices.length}`);
    console.log(`DEMO_READINGS=${data.readings.length}`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falha ao popular o Preview.');
  process.exitCode = 1;
});
