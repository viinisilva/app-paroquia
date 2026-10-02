'use client';

import { useState } from 'react';
import { Bell, CalendarHeart, Church, Search, SlidersHorizontal, Users } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from './ui/sheet';
import { EmptyState } from './page-parts';
import { RecordCard } from './record-card';
import type { Resource, RecordRow } from '@/lib/resources';

const emptyCopy = {
  missas: {
    title: 'Nenhuma missa agendada',
    description: 'Comece cadastrando a próxima celebração da paróquia.',
    action: 'Cadastrar missa',
    icon: Church,
  },
  membros: {
    title: 'Nenhum membro encontrado',
    description: 'Cadastre quem participa da comunidade paroquial.',
    action: 'Cadastrar membro',
    icon: Users,
  },
  eventos: {
    title: 'Nenhum evento programado',
    description: 'Adicione encontros e atividades da comunidade.',
    action: 'Criar evento',
    icon: CalendarHeart,
  },
  avisos: {
    title: 'Nenhum aviso publicado',
    description: 'Compartilhe uma orientação ou novidade com a comunidade.',
    action: 'Publicar aviso',
    icon: Bell,
  },
  leituras: {
    title: 'Nenhuma leitura publicada',
    description: 'As leituras publicadas aparecerão aqui.',
    action: 'Nova leitura',
    icon: Church,
  },
} satisfies Record<
  Resource,
  { title: string; description: string; action: string; icon: typeof Church }
>;

export function RecordList({
  resource,
  rows,
  canManage = false,
}: {
  resource: Resource;
  rows: RecordRow[];
  canManage?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchable =
    resource === 'membros'
      ? ['name', 'email', 'phone']
      : ['title', 'location', 'celebrant', 'description', 'content'];
  const filtered = rows.filter(
    (row) =>
      searchable.some((key) =>
        (row[key] || '').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')),
      ) &&
      (!date || row.date === date) &&
      (!location || row.location === location),
  );
  const activeFilters = Number(Boolean(date)) + Number(Boolean(location));
  const locations = [...new Set(rows.map((row) => row.location).filter(Boolean))];
  const createHref = '/' + resource + '/' + (resource === 'missas' ? 'nova' : 'novo');
  const empty = emptyCopy[resource];

  function clearFilters() {
    setQuery('');
    setDate('');
    setLocation('');
  }

  return (
    <>
      <div className="panel mb-5">
        <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-4">
          <div className={resource === 'missas' ? 'xl:col-span-2' : 'xl:col-span-4'}>
            <label htmlFor="search" className="mb-2 block text-sm font-medium">
              {resource === 'membros' ? 'Buscar por nome, e-mail ou telefone' : 'Pesquisar'}
            </label>
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="search"
                className="pl-10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  resource === 'missas'
                    ? 'Local, celebrante ou descrição…'
                    : 'Digite para pesquisar…'
                }
              />
            </div>
          </div>
          {resource === 'missas' && (
            <>
              <div className="hidden xl:block">
                <label htmlFor="date-filter" className="mb-2 block text-sm font-medium">
                  Data
                </label>
                <Input
                  id="date-filter"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
              <div className="hidden xl:block">
                <label htmlFor="location-filter" className="mb-2 block text-sm font-medium">
                  Local
                </label>
                <select
                  id="location-filter"
                  className="field"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                >
                  <option value="">Todos os locais</option>
                  {locations.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:w-auto xl:hidden">
                    <SlidersHorizontal aria-hidden />
                    Filtros
                    {activeFilters > 0 && <Badge className="ml-1">{activeFilters}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="max-h-[85dvh] overflow-y-auto rounded-t-2xl pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
                >
                  <SheetTitle>Filtrar missas</SheetTitle>
                  <SheetDescription>Refine por data e local.</SheetDescription>
                  <div className="mt-5 grid gap-5">
                    <div>
                      <label
                        htmlFor="date-filter-mobile"
                        className="mb-2 block text-sm font-medium"
                      >
                        Data da missa
                      </label>
                      <Input
                        id="date-filter-mobile"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="location-filter-mobile"
                        className="mb-2 block text-sm font-medium"
                      >
                        Local da missa
                      </label>
                      <select
                        id="location-filter-mobile"
                        className="field"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                      >
                        <option value="">Todos os locais</option>
                        {locations.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t pt-4">
                      <Button type="button" variant="outline" onClick={clearFilters}>
                        Limpar
                      </Button>
                      <Button type="button" onClick={() => setFiltersOpen(false)}>
                        Ver resultados
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
      <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </p>
        {(query || activeFilters > 0) && (
          <Button variant="ghost" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
      {filtered.length ? (
        <div className="record-grid">
          {filtered.map((row) => (
            <RecordCard key={row.id} row={row} resource={resource} canManage={canManage} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={query || activeFilters ? 'Nenhum resultado encontrado' : empty.title}
          description={
            query || activeFilters
              ? 'Revise a pesquisa ou limpe os filtros para ver todos os registros.'
              : empty.description
          }
          icon={empty.icon}
          action={!query && !activeFilters && canManage ? empty.action : undefined}
          href={createHref}
          compact
        />
      )}
    </>
  );
}
