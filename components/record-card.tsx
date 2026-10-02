import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { formatDate, today } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { RecordRow, Resource } from '@/lib/resources';

function dateParts(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
      .format(date)
      .replace('.', '')
      .toUpperCase(),
    day: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: 'UTC' }).format(date),
    month: new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
      .format(date)
      .replace('.', '')
      .toUpperCase(),
  };
}

function DateMark({ date }: { date: string }) {
  const parts = dateParts(date);
  return (
    <div
      className="flex w-14 shrink-0 flex-col items-center rounded-lg border bg-surface-subtle px-2 py-2 text-center"
      aria-label={formatDate(date)}
    >
      <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">
        {parts.weekday}
      </span>
      <span className="text-xl font-semibold leading-none text-primary">{parts.day}</span>
      <span className="mt-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
        {parts.month}
      </span>
    </div>
  );
}

export function RecordCard({
  row,
  resource,
  canManage = false,
}: {
  row: RecordRow;
  resource: Resource;
  canManage?: boolean;
}) {
  const title = row.title || row.name || row.location;
  const href = '/' + resource + '/' + row.id;
  const past = (resource === 'missas' || resource === 'eventos') && row.date < today();
  const phone = row.phone && !/^0+$/.test(row.phone) ? row.phone : 'Telefone não informado';

  if (resource === 'membros') {
    return (
      <article className="panel interactive-card min-w-0">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-primary">
            {row.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="break-words text-lg font-semibold">
                <Link href={href} className="hover:underline">
                  {row.name}
                </Link>
              </h2>
              <Badge variant={row.role === 'ADMIN' ? 'default' : 'secondary'}>
                {row.role === 'ADMIN' ? 'Administrador' : 'Membro'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {row.community || 'Comunidade não informada'}
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-2 border-t pt-4 text-sm text-muted-foreground">
          <p className="flex min-w-0 items-start gap-2">
            <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="break-all">{row.email}</span>
          </p>
          <p className="flex items-start gap-2">
            <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {phone}
          </p>
          <p className="text-xs">Cadastro: {formatDate(row.createdAt.slice(0, 10))}</p>
        </div>
        <CardActions href={href} canManage={canManage} />
      </article>
    );
  }

  if (resource === 'avisos') {
    return (
      <article className="panel interactive-card min-w-0 border-l-4 border-l-gold">
        <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <CalendarDays aria-hidden className="h-4 w-4" />
          Publicado em {formatDate(row.publishedAt)}
        </p>
        <h2 className="break-words text-lg font-semibold">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {row.content}
        </p>
        <CardActions href={href} canManage={canManage} label="Ler aviso" />
      </article>
    );
  }

  const isMass = resource === 'missas';
  return (
    <article className={cn('panel interactive-card min-w-0', past && 'opacity-70')}>
      <div className="flex items-start gap-4">
        <DateMark date={row.date} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {isMass ? 'Santa Missa' : past ? 'Encerrado' : 'Evento'}
            </Badge>
            <span className="flex items-center gap-1 text-sm font-semibold text-primary">
              <Clock aria-hidden className="h-4 w-4" />
              {row.time.slice(0, 5)}
            </span>
          </div>
          <h2 className="mt-3 break-words text-lg font-semibold leading-snug">
            <Link href={href} className="hover:underline">
              {isMass ? row.location : title}
            </Link>
          </h2>
          <div className="mt-3 space-y-2 break-words text-sm text-muted-foreground">
            {!isMass && (
              <p className="flex gap-2">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                {row.location}
              </p>
            )}
            {row.celebrant && (
              <p className="flex gap-2">
                <UserRound aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                {row.celebrant}
              </p>
            )}
            {row.description && <p className="line-clamp-2 leading-6">{row.description}</p>}
          </div>
        </div>
      </div>
      <CardActions href={href} canManage={canManage} />
    </article>
  );
}

function CardActions({
  href,
  canManage,
  label = 'Ver detalhes',
}: {
  href: string;
  canManage: boolean;
  label?: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-3">
      <Link
        href={href}
        className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-primary"
      >
        {label}
        <ArrowUpRight aria-hidden className="h-4 w-4" />
      </Link>
      {canManage && (
        <Link
          href={href + '/editar'}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <Pencil aria-hidden className="h-4 w-4" />
          Editar
        </Link>
      )}
    </div>
  );
}
