import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { authAttempts, users } from '@/lib/db/schema';
import { getUser, SESSION_COOKIE } from '@/lib/auth';
import { allowAuthAttempt } from '@/lib/auth-rate-limit';
import { tokenHash, verifyPassword } from '@/lib/password';
import { accountDeletionSchema } from '@/lib/validation';

export const runtime = 'nodejs';

const failure = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
  const allowedOrigins = new Set([request.nextUrl.origin]);
  if (process.env.APP_URL) allowedOrigins.add(new URL(process.env.APP_URL).origin);
  if (!allowedOrigins.has(request.headers.get('origin') || ''))
    return failure('Origem da solicitação inválida.', 403);

  const actor = await getUser();
  if (!actor) return failure('Entre na sua conta para continuar.', 401);

  const body: unknown = await request.json().catch(() => null);
  const parsed = accountDeletionSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error.issues[0].message, 400);

  try {
    if (!(await allowAuthAttempt(`delete:${actor.id}`, 5)))
      return failure('Muitas tentativas. Aguarde 15 minutos.', 429);

    const [account] = await db()
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, actor.id))
      .limit(1);
    if (!account || !(await verifyPassword(parsed.data.password, account.passwordHash)))
      return failure('Senha incorreta.', 401);

    const result = await db().transaction(async (tx) => {
      if (account.role === 'ADMIN') {
        // Bloqueia exclusões concorrentes que poderiam deixar a paróquia sem administrador.
        const admins = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.role, 'ADMIN'))
          .for('update');
        if (admins.length <= 1) return 'last-admin' as const;
      }

      const [deleted] = await tx
        .delete(users)
        .where(and(eq(users.id, actor.id), eq(users.passwordHash, account.passwordHash)))
        .returning({ id: users.id });
      if (!deleted) return 'changed' as const;

      // Sessões vinculadas são removidas pelo FK ON DELETE CASCADE.
      await tx
        .delete(authAttempts)
        .where(
          inArray(authAttempts.key, [
            tokenHash(`email:${account.email.toLowerCase()}`),
            tokenHash(`delete:${account.id}`),
          ]),
        );
      return 'deleted' as const;
    });

    if (result === 'last-admin')
      return failure(
        'A última conta administrativa precisa indicar um sucessor antes da exclusão.',
        409,
      );
    if (result === 'changed')
      return failure('Sua conta foi alterada. Atualize a página e tente novamente.', 409);

    // O CASCADE já invalidou todas as sessões; basta remover o cookie deste navegador.
    (await cookies()).delete(SESSION_COOKIE);
    return NextResponse.json({ url: '/?conta=excluida' });
  } catch (error) {
    console.error('account_deletion_failed', error instanceof Error ? error.name : 'UnknownError');
    return failure('Não foi possível excluir a conta. Tente novamente em instantes.', 503);
  }
}
