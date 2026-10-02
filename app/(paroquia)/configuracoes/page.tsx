import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { PageHeader } from '@/components/page-parts';
export default async function Settings() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Informações e acessos da administração paroquial."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <section className="panel">
          <h2 className="section-title">Minha conta</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Atualize nome, telefone e comunidade no seu perfil.
          </p>
          <Link className="text-link" href="/perfil">
            Editar meu perfil
          </Link>
        </section>
        <section className="panel">
          <h2 className="section-title">Acesso da equipe</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Membros consultam as atividades. Administradores gerenciam conteúdo e cadastros.
          </p>
          <Link className="text-link" href="/membros">
            Gerenciar membros
          </Link>
        </section>
        <section className="panel">
          <h2 className="section-title">Agenda paroquial</h2>
          <p className="text-sm">Fuso horário: América/São Paulo.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Datas e horários das celebrações são apresentados no horário da paróquia.
          </p>
        </section>
        <section className="panel">
          <h2 className="section-title">Conteúdo das leituras</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Publique somente textos conferidos em uma fonte confiável e com autorização de uso.
          </p>
          <Link className="text-link" href="/leituras">
            Gerenciar leituras
          </Link>
        </section>
      </div>
    </>
  );
}
