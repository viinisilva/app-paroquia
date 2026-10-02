import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { db } from './db';
import { sessions, users, type PublicUser } from './db/schema';
import { tokenHash } from './password';

export const SESSION_COOKIE = 'paroquia_session';
export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 7 * 86400000);
  await db()
    .insert(sessions)
    .values({ tokenHash: tokenHash(token), userId, expiresAt: expires });
  const jar = await cookies();
  const oldToken = jar.get(SESSION_COOKIE)?.value;
  if (oldToken)
    await db()
      .delete(sessions)
      .where(eq(sessions.tokenHash, tokenHash(oldToken)));
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:
      !!process.env.VERCEL ||
      (process.env.APP_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production'),
    sameSite: 'lax',
    path: '/',
    expires,
  });
}
export const getUser = cache(async (): Promise<PublicUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const [row] = await db()
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
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/?sessao=expirada');
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/inicio?acesso=negado');
  return user;
}
export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token)
    await db()
      .delete(sessions)
      .where(eq(sessions.tokenHash, tokenHash(token)));
  jar.delete(SESSION_COOKIE);
}
