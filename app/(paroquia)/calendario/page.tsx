import { getRecords } from '@/lib/records';
import { today } from '@/lib/dates';
import { ParishCalendar, type CalendarItem } from '@/components/parish-calendar';
import { PageHeader } from '@/components/page-parts';
export default async function CalendarPage() {
  const [masses, events] = await Promise.all([getRecords('missas'), getRecords('eventos')]);
  const items: CalendarItem[] = [
    ...masses.map((r) => ({
      id: r.id,
      date: r.date,
      time: r.time,
      title: 'Santa Missa • ' + r.celebrant,
      location: r.location,
      kind: 'missas' as const,
    })),
    ...events.map((r) => ({
      id: r.id,
      date: r.date,
      time: r.time,
      title: r.title,
      location: r.location,
      kind: 'eventos' as const,
    })),
  ];
  return (
    <>
      <PageHeader
        title="Calendário paroquial"
        description="Missas e encontros. Encontre seu próximo momento em comunidade."
      />
      <ParishCalendar items={items} initialDate={today()} />
    </>
  );
}
