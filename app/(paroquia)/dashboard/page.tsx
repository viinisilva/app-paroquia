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
  const [members, massCount, eventCount, noticeCount, rows] = await Promise.all([
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
  ]);
  const upcoming = rows.filter(isUpcoming).slice(0, 3);
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
        title={'Olá, ' + user.name.split(' ')[0]}
        description="Um olhar sobre a comunidade. Organize a agenda e mantenha todos por perto."
      />
      <section
        className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo da paróquia"
      >
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link href={href} key={href} className="panel group">
            <div className="mb-5 flex items-center justify-between">
              <Icon aria-hidden className="h-5 w-5 text-primary" />
              <ArrowRight
                aria-hidden
                className="h-4 w-4 text-muted-foreground group-hover:text-primary"
              />
            </div>
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </Link>
        ))}
      </section>
      <section className="mb-10 rounded-xl border bg-accent/50 p-5">
        <h2 className="mb-4 text-lg">Ações rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Nova missa', '/missas/nova'],
            ['Novo membro', '/membros/novo'],
            ['Novo evento', '/eventos/novo'],
            ['Novo aviso', '/avisos/novo'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-12 items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-background"
            >
              <Plus aria-hidden className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl">Próximas missas</h2>
          <Link className="text-link text-sm" href="/missas">
            Ver todas
          </Link>
        </div>
        {upcoming.length ? (
          <div className="record-grid">
            {upcoming.map((row) => (
              <RecordCard key={row.id} resource="missas" row={row} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhuma missa agendada." />
        )}
      </section>
    </>
  );
}
