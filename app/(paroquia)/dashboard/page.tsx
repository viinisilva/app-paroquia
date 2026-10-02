import Link from 'next/link';
import { Users, Church, CalendarHeart, Bell, Plus, ArrowRight } from 'lucide-react';
import { count, and, gte, gt, eq, or, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, masses, events, notices } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';
import { getRecords, isUpcoming } from '@/lib/records';
import { today, currentTime } from '@/lib/dates';
import { PageHeader, EmptyState } from '@/components/page-parts';
import { RecordCard } from '@/components/record-card';
export default async function Dashboard() {
  const user = await requireAdmin();
  const database = db();
  const [members, massCount, eventCount, noticeCount, massRows, eventRows] = await Promise.all([
    database.select({ value: count() }).from(users),
    database
      .select({ value: count() })
      .from(masses)
      .where(
        or(
          gt(masses.date, today()),
          and(eq(masses.date, today()), gte(masses.time, currentTime())),
        ),
      ),
    database.select({ value: count() }).from(events),
    database.select({ value: count() }).from(notices).where(lte(notices.publishedAt, today())),
    getRecords('missas'),
    getRecords('eventos'),
  ]);
  const upcoming = massRows.filter(isUpcoming).slice(0, 3);
  const upcomingEvents = eventRows.filter(isUpcoming).slice(0, 3);
  const stats = [
    { label: 'Membros cadastrados', value: members[0].value, icon: Users, href: '/membros' },
    { label: 'Próximas missas', value: massCount[0].value, icon: Church, href: '/missas' },
    {
      label: 'Eventos cadastrados',
      value: eventCount[0].value,
      icon: CalendarHeart,
      href: '/eventos',
    },
    { label: 'Avisos publicados', value: noticeCount[0].value, icon: Bell, href: '/avisos' },
  ];
  return (
    <>
      <PageHeader
        title="Visão Geral"
        description={`Olá, ${user.name.split(' ')[0]}. Organize a agenda e mantenha todos por perto.`}
      />
      <section
        className="mb-6 grid grid-cols-2 gap-3 sm:mb-7 lg:grid-cols-4"
        aria-label="Resumo da paróquia"
      >
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            href={href}
            key={href}
            className="panel interactive-card group min-h-32 sm:min-h-36"
          >
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <Icon aria-hidden className="h-5 w-5 text-primary" />
              <ArrowRight
                aria-hidden
                className="h-4 w-4 text-muted-foreground group-hover:text-primary"
              />
            </div>
            <p className="text-[1.7rem] font-semibold leading-none tabular-nums sm:text-4xl">
              {value}
            </p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm">
              {label}
            </p>
          </Link>
        ))}
      </section>
      <section className="mb-7 rounded-xl border bg-accent/40 p-3.5 sm:mb-9 sm:p-5">
        <h2 className="mb-2 text-base sm:mb-3 sm:text-lg">Ações rápidas</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
          {[
            ['Nova missa', '/missas/nova'],
            ['Novo membro', '/membros/novo'],
            ['Novo evento', '/eventos/novo'],
            ['Novo aviso', '/avisos/novo'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-background sm:min-h-12 sm:gap-3 sm:px-4 sm:py-3"
            >
              <Plus aria-hidden className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </section>
      <div className="grid items-start gap-7 sm:gap-9 2xl:grid-cols-2">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl">Próximas missas</h2>
            <Link className="text-link text-sm" href="/missas">
              Ver todas
            </Link>
          </div>
          {upcoming.length ? (
            <div className="space-y-4">
              {upcoming.map((row) => (
                <RecordCard key={row.id} resource="missas" row={row} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma missa agendada"
              description="Comece cadastrando a próxima celebração da paróquia."
              icon={Church}
              compact
            />
          )}
        </section>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl">Próximos acontecimentos</h2>
            <Link className="text-link text-sm" href="/eventos">
              Ver agenda
            </Link>
          </div>
          {upcomingEvents.length ? (
            <div className="space-y-4">
              {upcomingEvents.map((row) => (
                <RecordCard key={row.id} resource="eventos" row={row} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum evento programado"
              description="Adicione encontros e atividades da comunidade."
              icon={CalendarHeart}
              compact
            />
          )}
        </section>
      </div>
    </>
  );
}
