import Link from 'next/link';
import { CalendarDays, Clock, MapPin, UserRound, ArrowUpRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatDate } from '@/lib/dates';
import type { RecordRow, Resource } from '@/lib/resources';
export function RecordCard({ row, resource }: { row: RecordRow; resource: Resource }) {
  const title = row.title || row.name || row.location;
  return (
    <article className="panel min-w-0 transition-shadow hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <Badge variant="secondary">
          {resource === 'missas'
            ? 'Santa Missa'
            : resource === 'membros'
              ? row.role === 'ADMIN'
                ? 'Administrador'
                : 'Membro'
              : resource === 'eventos'
                ? 'Encontro da comunidade'
                : 'Aviso paroquial'}
        </Badge>
        {row.date && <span className="text-xs text-muted-foreground">{formatDate(row.date)}</span>}
      </div>
      <h2 className="mb-4 break-words text-lg font-semibold">
        <Link href={'/' + resource + '/' + row.id} className="hover:underline">
          {title}
        </Link>
      </h2>
      <div className="space-y-2 break-words text-sm text-muted-foreground">
        {row.time && (
          <p className="flex gap-2">
            <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {row.time.slice(0, 5)}
          </p>
        )}
        {resource === 'eventos' && (
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
        {row.email && (
          <>
            <p>{row.email}</p>
            <p>{row.phone}</p>
            <Badge variant="outline">{row.community || 'Comunidade não informada'}</Badge>
            <p className="text-xs">Cadastro: {formatDate(row.createdAt.slice(0, 10))}</p>
          </>
        )}
        {row.publishedAt && (
          <>
            <p className="flex gap-2">
              <CalendarDays aria-hidden className="h-4 w-4" />
              {formatDate(row.publishedAt)}
            </p>
            <p className="line-clamp-3 whitespace-pre-wrap">{row.content}</p>
          </>
        )}
      </div>
      <Link
        href={'/' + resource + '/' + row.id}
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
      >
        Ver detalhes
        <ArrowUpRight aria-hidden className="h-4 w-4" />
      </Link>
    </article>
  );
}
