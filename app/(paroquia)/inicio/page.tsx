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
      <div className="mb-8 grid gap-5 lg:grid-cols-5">
        <section className="relative overflow-hidden rounded-xl bg-primary p-7 text-primary-foreground lg:col-span-3">
          <Church aria-hidden className="mb-6 h-8 w-8 text-amber-200" />
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-amber-100">
            Nossa próxima celebração
          </p>
          <h2 className="mb-4 text-3xl">
            {nextMass ? 'Vamos celebrar juntos' : 'A comunidade nos reúne'}
          </h2>
          {nextMass ? (
            <>
              <p className="text-lg">
                {formatDate(nextMass.date)} • {nextMass.time.slice(0, 5)}
              </p>
              <p className="mt-2 break-words">{nextMass.location}</p>
              <p className="text-sm opacity-80">{nextMass.celebrant}</p>
              <Link
                className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium underline underline-offset-4"
                href={'/missas/' + nextMass.id}
              >
                Ver celebração
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <p>Nenhuma missa agendada no momento. Acompanhe as próximas atualizações.</p>
          )}
        </section>
        <section className="panel lg:col-span-2">
          <BookOpen aria-hidden className="mb-5 h-7 w-7 text-primary" />
          <p className="eyebrow">Palavra que ilumina</p>
          <h2 className="mb-3 text-xl">Leitura em destaque</h2>
          {reading ? (
            <>
              <p className="font-medium">{reading.reference}</p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{reading.content}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              As leituras de hoje ainda não foram publicadas. Consulte as datas disponíveis.
            </p>
          )}
          <Link href="/leituras" className="text-link mt-6 inline-flex min-h-11 items-center">
            Acompanhar as leituras
          </Link>
        </section>
      </div>
      <nav
        aria-label="Atalhos da comunidade"
        className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {[
          { href: '/missas', label: 'Missas', icon: Church },
          { href: '/calendario', label: 'Calendário', icon: CalendarDays },
          { href: '/leituras', label: 'Leituras', icon: BookOpen },
          { href: '/eventos', label: 'Eventos', icon: CalendarHeart },
          { href: '/avisos', label: 'Avisos', icon: Bell },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium hover:bg-accent"
          >
            <Icon aria-hidden className="h-5 w-5 text-primary" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <h2 className="section-title">Próximos eventos</h2>
          <div className="space-y-4">
            {nextEvents.length ? (
              nextEvents.map((row) => <RecordCard key={row.id} resource="eventos" row={row} />)
            ) : (
              <EmptyState title="Nenhum evento encontrado." />
            )}
          </div>
        </section>
        <section>
          <h2 className="section-title">Avisos da comunidade</h2>
          <div className="space-y-4">
            {notices.length ? (
              notices
                .slice(0, 2)
                .map((row) => <RecordCard key={row.id} resource="avisos" row={row} />)
            ) : (
              <EmptyState title="Nenhum aviso publicado." />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
