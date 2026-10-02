'use client';
import { useState } from 'react';
import Link from 'next/link';
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Church, CalendarHeart } from 'lucide-react';
import { Button } from './ui/button';
import { EmptyState } from './page-parts';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dates';
export type CalendarItem = {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  kind: 'missas' | 'eventos';
};
export function ParishCalendar({
  items,
  initialDate,
}: {
  items: CalendarItem[];
  initialDate: string;
}) {
  const [selected, setSelected] = useState(initialDate);
  const [month, setMonth] = useState(initialDate.slice(0, 7));
  const first = startOfMonth(new Date(month + '-01T12:00:00'));
  const days = eachDayOfInterval({ start: first, end: endOfMonth(first) });
  const dayItems = items
    .filter((i) => i.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));
  function changeMonth(delta: number) {
    const value = format(addMonths(first, delta), 'yyyy-MM');
    setMonth(value);
    setSelected(value + '-01');
  }
  function selectMonth(value: string) {
    if (/^\d{4}-\d{2}$/.test(value)) {
      setMonth(value);
      setSelected(value + '-01');
    }
  }
  return (
    <div className="grid items-start gap-6 2xl:grid-cols-[1.35fr_1fr]">
      <section className="panel min-w-0 !p-3 sm:!p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg capitalize">{format(first, 'MMMM yyyy', { locale: ptBR })}</h2>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mês anterior"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(initialDate);
                setMonth(initialDate.slice(0, 7));
              }}
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Próximo mês"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <label className="mb-2 block text-xs text-muted-foreground" htmlFor="calendar-month">
          Ir para o mês
        </label>
        <input
          id="calendar-month"
          className="field mb-5 max-w-56"
          type="month"
          value={month}
          min="1900-01"
          max="2100-12"
          onInput={(event) => selectMonth(event.currentTarget.value)}
          onChange={(event) => selectMonth(event.currentTarget.value)}
        />
        <div className="grid grid-cols-7 gap-0.5 text-center sm:gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div className="py-2 text-xs font-medium text-muted-foreground" key={d}>
              {d}
            </div>
          ))}
          {Array.from({ length: getDay(first) }, (_, i) => (
            <div key={'empty' + i} />
          ))}
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const entries = items.filter((i) => i.date === key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected === key}
                aria-label={formatDate(key) + ', ' + entries.length + ' atividade(s)'}
                onClick={() => setSelected(key)}
                className={cn(
                  'flex min-h-12 min-w-0 flex-col items-center justify-center rounded-lg border border-transparent py-1.5 text-sm hover:bg-accent sm:min-h-16 xl:min-h-20',
                  selected === key
                    ? 'bg-primary text-primary-foreground shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsl(var(--ring))] hover:bg-primary/90'
                    : key === initialDate
                      ? 'border-primary'
                      : '',
                )}
              >
                <span>{format(day, 'd')}</span>
                <span className="mt-1 flex h-2 gap-1">
                  {entries.some((e) => e.kind === 'missas') && (
                    <span
                      aria-hidden
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        selected === key ? 'bg-amber-200' : 'bg-primary',
                      )}
                    />
                  )}
                  {entries.some((e) => e.kind === 'eventos') && (
                    <span
                      aria-hidden
                      className={cn(
                        'h-1.5 w-1.5 rounded-sm',
                        selected === key ? 'bg-teal-200' : 'bg-teal-700',
                      )}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-5 border-t pt-4 text-xs" aria-label="Legenda">
          <span className="flex items-center gap-2">
            <Church aria-hidden className="h-4 w-4 text-primary" />
            Missas
          </span>
          <span className="flex items-center gap-2">
            <CalendarHeart aria-hidden className="h-4 w-4 text-teal-700" />
            Eventos
          </span>
        </div>
      </section>
      <section aria-live="polite">
        <h2 className="section-title">{formatDate(selected)}</h2>
        {dayItems.length ? (
          <div className="space-y-3">
            {dayItems.map((item) => (
              <Link
                className="panel block"
                key={item.kind + item.id}
                href={'/' + item.kind + '/' + item.id}
              >
                <span
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide',
                    item.kind === 'missas' ? 'text-primary' : 'text-teal-700',
                  )}
                >
                  {item.kind === 'missas' ? 'Missa' : 'Evento'} • {item.time.slice(0, 5)}
                </span>
                <h3 className="my-2 break-words font-semibold">{item.title}</h3>
                <p className="break-words text-sm text-muted-foreground">{item.location}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Um dia sem atividades agendadas."
            description="Selecione outra data para consultar a agenda."
          />
        )}
      </section>
    </div>
  );
}
