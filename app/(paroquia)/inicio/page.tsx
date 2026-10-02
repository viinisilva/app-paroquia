import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Church, CalendarDays, BookOpen, CalendarHeart, Bell, ArrowRight } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { getRecords, isUpcoming } from '@/lib/records';
import { today, formatDate } from '@/lib/dates';
import { PageHeader, EmptyState } from '@/components/page-parts';
import { RecordCard } from '@/components/record-card';
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ acesso?: string }>;
}) {
  const user = await requireUser();
  if (user.role === 'ADMIN') redirect('/dashboard');
  const [masses, events, notices, readings] = await Promise.all([
    getRecords('missas'),
    getRecords('eventos'),
    getRecords('avisos'),
    getRecords('leituras'),
  ]);
  const nextMass = masses.find(isUpcoming);
  const nextEvents = events.filter(isUpcoming).slice(0, 2);
  const reading =
    readings.find((r) => r.date === today() && r.type === 'GOSPEL') ||
    readings.find((r) => r.date === today());
  const { acesso } = await searchParams;
  return (
    <>
      {acesso && (
        <p role="alert" className="mb-6 rounded-lg border bg-accent p-4 text-sm">
          Esta ação é exclusiva da administração. Você pode consultar as atividades abaixo.
        </p>
      )}
      <PageHeader
        title={'Olá, ' + user.name.split(' ')[0]}
        description="Que bom caminhar juntos. Veja o que acontece na nossa comunidade."
      />
      <div className="mb-7 grid gap-3 sm:mb-9 sm:gap-4 lg:grid-cols-5">
        <section className="relative overflow-hidden rounded-xl bg-primary p-4 text-primary-foreground sm:p-7 lg:col-span-3">
          <div className="mb-4 flex items-center gap-3 sm:mb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Church aria-hidden className="h-6 w-6 text-amber-200" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
              Próxima missa
            </p>
          </div>
          <h2 className="mb-3 text-[1.35rem] sm:mb-4 sm:text-3xl">
            {nextMass ? 'Vamos celebrar juntos' : 'A comunidade nos reúne'}
          </h2>
          {nextMass ? (
            <>
              <p className="text-lg font-semibold">
                {formatDate(nextMass.date)} • {nextMass.time.slice(0, 5)}
              </p>
              <p className="mt-2 break-words">{nextMass.location}</p>
              <p className="text-sm text-primary-foreground/75">{nextMass.celebrant}</p>
              <Link
                className="mt-4 inline-flex min-h-11 items-center gap-2 font-medium underline underline-offset-4 sm:mt-5"
                href={'/missas/' + nextMass.id}
              >
                Ver celebração
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <p className="max-w-md text-primary-foreground/80">
              Nenhuma missa agendada no momento. Acompanhe as próximas atualizações.
            </p>
          )}
        </section>
        <section className="panel lg:col-span-2">
          <div className="mb-3 flex items-center gap-3 sm:mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <BookOpen aria-hidden className="h-5 w-5 text-primary" />
            </span>
            <p className="eyebrow !mb-0">Palavra do dia</p>
          </div>
          <h2 className="mb-2.5 text-xl sm:mb-3">Leitura em destaque</h2>
          {reading ? (
            <>
              <p className="font-medium">{reading.reference}</p>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                {reading.content}
              </p>
            </>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              As leituras de hoje ainda não foram publicadas. Consulte as datas disponíveis.
            </p>
          )}
          <Link
            href="/leituras"
            className="text-link mt-4 inline-flex min-h-11 items-center sm:mt-5"
          >
            Abrir leituras
          </Link>
        </section>
      </div>
      <div className="grid gap-7 sm:gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="section-title !mb-0">Próximos eventos</h2>
            <Link href="/eventos" className="text-link text-sm">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {nextEvents.length ? (
              nextEvents.map((row) => <RecordCard key={row.id} resource="eventos" row={row} />)
            ) : (
              <EmptyState
                title="Nenhum evento programado"
                description="Novos encontros aparecerão aqui quando forem publicados."
                icon={CalendarHeart}
                compact
              />
            )}
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="section-title !mb-0">Avisos recentes</h2>
            <Link href="/avisos" className="text-link text-sm">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {notices.length ? (
              notices
                .slice(0, 2)
                .map((row) => <RecordCard key={row.id} resource="avisos" row={row} />)
            ) : (
              <EmptyState
                title="Nenhum aviso publicado"
                description="As novidades da comunidade aparecerão aqui."
                icon={Bell}
                compact
              />
            )}
          </div>
        </section>
      </div>
      <nav
        aria-label="Atalhos da comunidade"
        className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 sm:grid-cols-3 lg:grid-cols-5"
      >
        {[
          { href: '/missas', label: 'Missas', icon: Church },
          { href: '/calendario', label: 'Agenda', icon: CalendarDays },
          { href: '/leituras', label: 'Leituras', icon: BookOpen },
          { href: '/eventos', label: 'Eventos', icon: CalendarHeart },
          { href: '/avisos', label: 'Avisos', icon: Bell },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="interactive-card flex min-h-14 items-center gap-3 rounded-xl border bg-card p-3 text-sm font-medium sm:min-h-16 sm:p-4"
          >
            <Icon aria-hidden className="h-5 w-5 text-primary" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
