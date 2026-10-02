import { loadEnvConfig } from '@next/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, masses, events, notices } from '../lib/db/schema';
import { hashPassword } from '../lib/password';
import { passwordSchema } from '../lib/validation';
import { z } from 'zod';
loadEnvConfig(process.cwd());
async function main() {
  const email = z.string().email().parse(process.env.SEED_ADMIN_EMAIL).toLowerCase();
  const password = passwordSchema.parse(process.env.SEED_ADMIN_PASSWORD);
  if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL.');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  try {
    const inserted = await db
      .insert(users)
      .values({
        name: process.env.SEED_ADMIN_NAME || 'Administrador',
        email,
        phone: '00000000000',
        community: 'Igreja Matriz',
        role: 'ADMIN',
        passwordHash: await hashPassword(password),
      })
      .onConflictDoNothing()
      .returning({ id: users.id });
    console.log(
      inserted.length
        ? 'Administrador criado. Atualize o telefone no perfil.'
        : 'E-mail já existe; senha e perfil não foram alterados.',
    );
    if (process.env.SEED_DEMO === 'true') {
      const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      await db
        .insert(masses)
        .values({
          id: '10000000-0000-4000-8000-000000000001',
          date,
          time: '07:00',
          location: 'Igreja Matriz — demonstração',
          celebrant: 'Celebrante de demonstração',
          description: 'Registro fictício para apresentação acadêmica.',
        })
        .onConflictDoNothing();
      await db
        .insert(events)
        .values({
          id: '10000000-0000-4000-8000-000000000002',
          title: 'Encontro da comunidade — demonstração',
          date,
          time: '19:00',
          location: 'Salão paroquial — demonstração',
          description: 'Registro fictício para apresentação acadêmica.',
        })
        .onConflictDoNothing();
      await db
        .insert(notices)
        .values({
          id: '10000000-0000-4000-8000-000000000003',
          title: 'Bem-vindos — demonstração',
          content: 'Este é um aviso fictício para demonstrar a comunicação com a comunidade.',
          publishedAt: new Date().toISOString().slice(0, 10),
        })
        .onConflictDoNothing();
      console.log('Agenda demonstrativa inserida. Nenhuma leitura litúrgica foi inventada.');
    }
  } finally {
    await pool.end();
  }
}
main().catch(() => {
  console.error(
    'Seed falhou. Confira banco, e-mail e senha de pelo menos 10 caracteres no ambiente.',
  );
  process.exitCode = 1;
});
