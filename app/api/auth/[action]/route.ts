import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { createSession, deleteSession } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { loginSchema, registerSchema } from '@/lib/validation';
import { allowAuthAttempt } from '@/lib/auth-rate-limit';

export const runtime = 'nodejs';
const failure = (error: string, status: number) => NextResponse.json({ error }, { status });
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const allowedOrigins = new Set([request.nextUrl.origin]);
  if (process.env.APP_URL) allowedOrigins.add(new URL(process.env.APP_URL).origin);
  if (!allowedOrigins.has(request.headers.get('origin') || ''))
    return failure('Origem da solicitação inválida.', 403);
  const { action } = await params;
  try {
    if (action === 'logout') {
      await deleteSession();
      return NextResponse.json({ url: '/' });
    }
    if (!['login', 'register'].includes(action)) return failure('Não encontrado.', 404);
    // Na Vercel, este header é definido pela plataforma. Fora dela, não confiar em IP fornecido pelo cliente.
    const ip = process.env.VERCEL
      ? request.headers.get('x-vercel-forwarded-for') || 'unknown'
      : 'local';
    if (!(await allowAuthAttempt(`ip:${ip}`, 60)))
      return failure('Muitas tentativas. Aguarde 15 minutos.', 429);
    const body: unknown = await request.json();
    if (action === 'register') {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) return failure(parsed.error.issues[0].message, 400);
      const { name, email, phone, community, password } = parsed.data;
      const [user] = await db()
        .insert(users)
        .values({
          name,
          email,
          phone,
          community,
          passwordHash: await hashPassword(password),
          role: 'MEMBER',
        })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });
      if (!user)
        return failure('Não foi possível cadastrar este e-mail. Tente entrar com sua conta.', 409);
      await createSession(user.id);
      return NextResponse.json({ url: '/inicio' }, { status: 201 });
    }
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return failure('Informe e-mail e senha válidos.', 400);
    if (!(await allowAuthAttempt(`email:${parsed.data.email}`)))
      return failure('Muitas tentativas. Aguarde 15 minutos.', 429);
    const [user] = await db()
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);
    // Executa o mesmo KDF para e-mails ausentes, evitando resposta imediata reveladora.
    const dummy = `scrypt:${'0'.repeat(32)}:${'0'.repeat(128)}`;
    const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? dummy);
    if (!user || !valid) return failure('E-mail ou senha incorretos.', 401);
    await createSession(user.id);
    return NextResponse.json({ url: user.role === 'ADMIN' ? '/dashboard' : '/inicio' });
  } catch (error) {
    console.error('auth_failed', error instanceof Error ? error.name : 'UnknownError');
    return failure('Não foi possível conectar ao serviço. Tente novamente em instantes.', 503);
  }
}
