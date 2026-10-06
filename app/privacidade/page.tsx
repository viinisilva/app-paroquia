import type { Metadata } from 'next';
import Link from 'next/link';
import { privacyContact } from '@/lib/privacy';

export const metadata: Metadata = { title: 'Política de Privacidade | Paróquia São Roque' };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-5 py-8 sm:py-12">
      <Link href="/" className="text-link">
        ← Voltar ao aplicativo
      </Link>
      <header className="space-y-2">
        <p className="eyebrow">Paróquia São Roque</p>
        <h1 className="text-3xl sm:text-4xl">Política de Privacidade</h1>
        <p className="text-muted-foreground">Como os dados são usados no aplicativo.</p>
      </header>
      <section className="panel space-y-4 text-sm leading-7 sm:text-base">
        <h2 className="text-xl">Dados e finalidade</h2>
        <p>
          No cadastro, recebemos nome, e-mail, telefone, comunidade e senha. A senha é armazenada
          como hash, não em texto puro. Esses dados permitem criar a conta, autenticar o acesso,
          identificar membros para a administração e manter o perfil. O e-mail também é usado no
          login.
        </p>
        <p>
          A aplicação mantém sessões de acesso por cookie seguro e registros técnicos de tentativas
          de autenticação para limitar abusos. A administração cadastra missas, eventos, avisos e
          leituras para consulta pela comunidade; esses registros não identificam automaticamente o
          autor no banco.
        </p>
        <h2 className="text-xl">Armazenamento e segurança</h2>
        <p>
          A aplicação é hospedada na Vercel e usa PostgreSQL hospedado na Neon. A conexão com o
          aplicativo usa HTTPS. O cookie de sessão é HttpOnly e a senha é protegida com scrypt. O
          acesso administrativo exige uma conta com permissão específica. Esses prestadores
          processam dados necessários para disponibilizar o serviço.
        </p>
        <h2 className="text-xl">Retenção e exclusão</h2>
        <p>
          Você pode atualizar seus dados no perfil e excluir sua própria conta ali. A exclusão
          remove o cadastro e invalida as sessões associadas. Registros técnicos agregados por IP,
          logs de infraestrutura e cópias de segurança podem ter prazos próprios e não são removidos
          imediatamente pelo botão de exclusão.
        </p>
        <p>
          <strong>Confirmação pendente antes da publicação:</strong> o responsável pelo projeto deve
          definir os prazos de retenção de logs e backups e confirmar a identificação formal da
          entidade responsável pelo tratamento dos dados.
        </p>
        <h2 className="text-xl">Seus pedidos</h2>
        <p>
          Para solicitar acesso, correção ou exclusão, use o perfil ou escreva para{' '}
          <a className="text-link break-all" href={`mailto:${privacyContact.email}`}>
            {privacyContact.email}
          </a>
          . Se não conseguir entrar, veja também{' '}
          <Link href="/excluir-conta" className="text-link">
            como solicitar a exclusão
          </Link>
          . O contato informado para este aplicativo é {privacyContact.name}.
        </p>
      </section>
    </main>
  );
}
