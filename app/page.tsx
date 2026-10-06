import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { AuthForm } from '@/components/auth-form';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ sessao?: string; conta?: string }>;
}) {
  const user = await getUser();
  if (user) redirect(user.role === 'ADMIN' ? '/dashboard' : '/inicio');
  const { sessao, conta } = await searchParams;
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Image
          src="/images/logo.png"
          alt="Brasão da Paróquia São Roque"
          width={160}
          height={160}
          priority
          sizes="(max-width: 1023px) 88px, 160px"
          className="h-20 w-20 rounded-lg bg-white object-contain p-1 sm:h-[5.5rem] sm:w-[5.5rem] lg:h-40 lg:w-40"
        />
        <p className="eyebrow !mb-0">Fé • Comunidade • Serviço</p>
        <h1 className="whitespace-nowrap lg:whitespace-normal">
          Paróquia <span className="lg:block">São Roque</span>
        </h1>
        <p className="hidden lg:block">
          Um lugar de encontro.
          <br />
          Uma comunidade que caminha unida.
        </p>
        <span className="hidden text-sm opacity-70 lg:inline">
          Nossa vida paroquial, mais próxima de você.
        </span>
      </section>
      <section className="auth-panel">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-2">Seja bem-vindo</p>
          <h2 className="mb-2 text-2xl sm:text-3xl">Que bom ter você aqui.</h2>
          <p className="mb-5 text-sm text-muted-foreground sm:mb-8 sm:text-base">
            Entre para acompanhar a vida da nossa comunidade.
          </p>
          {sessao && (
            <p role="status" className="mb-5 rounded-lg bg-accent p-3 text-sm">
              Sua sessão expirou ou não está disponível. Entre novamente.
            </p>
          )}
          {conta === 'excluida' && (
            <p role="status" className="mb-5 rounded-lg bg-accent p-3 text-sm">
              Sua conta foi excluída.
            </p>
          )}
          <AuthForm mode="login" />
          <p className="mt-5 text-sm sm:mt-6">
            Ainda não faz parte?{' '}
            <Link className="text-link" href="/cadastro">
              Cadastre-se
            </Link>
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <Link className="text-link" href="/privacidade">
              Privacidade
            </Link>
            <Link className="text-link" href="/excluir-conta">
              Exclusão de conta
            </Link>
          </p>
          <p className="mt-6 text-xs text-muted-foreground sm:mt-8 lg:mt-10">
            Paróquia São Roque • Fé, comunidade e serviço
          </p>
        </div>
      </section>
    </main>
  );
}
