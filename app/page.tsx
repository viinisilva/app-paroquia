import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { AuthForm } from '@/components/auth-form';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ sessao?: string }>;
}) {
  const user = await getUser();
  if (user) redirect(user.role === 'ADMIN' ? '/dashboard' : '/inicio');
  const { sessao } = await searchParams;
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Image
          src="/images/logo.png"
          alt="Brasão da Paróquia São Roque"
          width={160}
          height={160}
          priority
        />
        <p className="eyebrow">Fé • Comunidade • Serviço</p>
        <h1>
          Paróquia
          <br />
          São Roque
        </h1>
        <p>
          Um lugar de encontro.
          <br />
          Uma comunidade que caminha unida.
        </p>
        <span className="text-sm opacity-70">Nossa vida paroquial, mais próxima de você.</span>
      </section>
      <section className="auth-panel">
        <div className="w-full max-w-md">
          <p className="eyebrow">Seja bem-vindo</p>
          <h2 className="mb-2 text-3xl">Que bom ter você aqui.</h2>
          <p className="mb-8 text-muted-foreground">
            Entre para acompanhar a vida da nossa comunidade.
          </p>
          {sessao && (
            <p role="status" className="mb-5 rounded-lg bg-accent p-3 text-sm">
              Sua sessão expirou ou não está disponível. Entre novamente.
            </p>
          )}
          <AuthForm mode="login" />
          <p className="mt-6 text-sm">
            Ainda não faz parte?{' '}
            <Link className="text-link" href="/cadastro">
              Cadastre-se
            </Link>
          </p>
          <p className="mt-10 text-xs text-muted-foreground">
            Projeto universitário de extensão • Paróquia São Roque
          </p>
        </div>
      </section>
    </main>
  );
}
