import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { PageHeader } from '@/components/page-parts';
import { BookOpen, CalendarDays, UserRound, Users } from 'lucide-react';
export default async function Settings() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Informações e acessos da administração paroquial."
      />
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <section className="panel">
          <UserRound aria-hidden className="mb-3 h-6 w-6 text-primary sm:mb-4" />
          <h2 className="section-title !mb-1.5 sm:!mb-2">Minha conta</h2>
          <p className="mb-2 text-sm leading-6 text-muted-foreground sm:mb-4">
            Atualize nome, telefone e comunidade no seu perfil.
          </p>
          <Link className="text-link inline-flex min-h-11 items-center" href="/perfil">
            Editar meu perfil
          </Link>
        </section>
        <section className="panel">
          <Users aria-hidden className="mb-3 h-6 w-6 text-primary sm:mb-4" />
          <h2 className="section-title !mb-1.5 sm:!mb-2">Acesso da equipe</h2>
          <p className="mb-2 text-sm leading-6 text-muted-foreground sm:mb-4">
            Membros consultam as atividades. Administradores gerenciam conteúdo e cadastros.
          </p>
          <Link className="text-link inline-flex min-h-11 items-center" href="/membros">
            Gerenciar membros
          </Link>
        </section>
        <section className="panel">
          <CalendarDays aria-hidden className="mb-3 h-6 w-6 text-primary sm:mb-4" />
          <h2 className="section-title !mb-1.5 sm:!mb-2">Agenda paroquial</h2>
          <p className="text-sm">Fuso horário: América/São Paulo.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Datas e horários das celebrações são apresentados no horário da paróquia.
          </p>
        </section>
        <section className="panel">
          <BookOpen aria-hidden className="mb-3 h-6 w-6 text-primary sm:mb-4" />
          <h2 className="section-title !mb-1.5 sm:!mb-2">Conteúdo das leituras</h2>
          <p className="mb-2 text-sm leading-6 text-muted-foreground sm:mb-4">
            Publique somente textos conferidos em uma fonte confiável e com autorização de uso.
          </p>
          <Link className="text-link inline-flex min-h-11 items-center" href="/leituras">
            Gerenciar leituras
          </Link>
        </section>
      </div>
    </>
  );
}
