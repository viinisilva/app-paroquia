import type { Metadata } from 'next';
import Link from 'next/link';
import { privacyContact } from '@/lib/privacy';

export const metadata: Metadata = { title: 'Excluir conta | Paróquia São Roque' };

export default function AccountDeletionPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-5 py-8 sm:py-12">
      <Link href="/" className="text-link">
        ← Voltar ao aplicativo
      </Link>
      <header className="space-y-2">
        <p className="eyebrow">Paróquia São Roque</p>
        <h1 className="text-3xl sm:text-4xl">Exclusão de conta</h1>
      </header>
      <section className="panel space-y-4 text-sm leading-7 sm:text-base">
        <h2 className="text-xl">Se você consegue entrar</h2>
        <p>
          Acesse{' '}
          <Link href="/perfil" className="text-link">
            Meu perfil
          </Link>
          , escolha “Excluir minha conta” e confirme com sua senha atual. A exclusão do cadastro e
          das sessões é permanente.
        </p>
        <h2 className="text-xl">Se você não consegue entrar</h2>
        <p>
          Envie uma solicitação para{' '}
          <a
            className="text-link break-all"
            href={`mailto:${privacyContact.email}?subject=Solicita%C3%A7%C3%A3o%20de%20exclus%C3%A3o%20de%20conta`}
          >
            {privacyContact.email}
          </a>
          . Informe somente o e-mail da conta e que deseja a exclusão. Não envie sua senha. O
          responsável verificará a titularidade antes de atender ao pedido.
        </p>
        <h2 className="text-xl">O que acontece com os dados</h2>
        <p>
          O cadastro (nome, e-mail, telefone, comunidade e hash da senha) e as sessões vinculadas
          são removidos. Missas, eventos, avisos e leituras não estão vinculados ao autor no banco e
          permanecem como conteúdo da paróquia.
        </p>
        <p>
          Registros de segurança agregados por IP, logs dos prestadores e cópias de segurança podem
          permanecer pelo prazo aplicável. Os prazos exatos ainda dependem de confirmação do
          responsável pelo projeto; consulte a{' '}
          <Link href="/privacidade" className="text-link">
            Política de Privacidade
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
