'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { EmptyState } from './page-parts';
import { RecordCard } from './record-card';
import type { Resource, RecordRow } from '@/lib/resources';
export function RecordList({ resource, rows }: { resource: Resource; rows: RecordRow[] }) {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const searchable =
    resource === 'membros'
      ? ['name', 'email', 'phone']
      : ['title', 'location', 'celebrant', 'description', 'content'];
  const filtered = rows.filter(
    (r) =>
      searchable.some((k) =>
        (r[k] || '').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')),
      ) &&
      (!date || r.date === date) &&
      (!location || r.location === location),
  );
  return (
    <>
      <div className="panel mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={resource === 'missas' ? 'xl:col-span-2' : 'sm:col-span-2 xl:col-span-4'}>
          <label htmlFor="search" className="mb-2 block text-sm font-medium">
            {resource === 'membros' ? 'Buscar por nome, e-mail ou telefone' : 'Pesquisar'}
          </label>
          <div className="relative">
            <Search aria-hidden className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="search"
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                resource === 'missas' ? 'Local, celebrante ou descrição…' : 'Digite para pesquisar…'
              }
            />
          </div>
        </div>
        {resource === 'missas' && (
          <>
            <div>
              <label htmlFor="date-filter" className="mb-2 block text-sm font-medium">
                Data
              </label>
              <Input
                id="date-filter"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="location-filter" className="mb-2 block text-sm font-medium">
                Local
              </label>
              <select
                id="location-filter"
                className="field"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Todos os locais</option>
                {[...new Set(rows.map((r) => r.location))].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {filtered.length} registro(s) encontrado(s)
        </p>
        {(query || date || location) && (
          <Button
            variant="ghost"
            onClick={() => {
              setQuery('');
              setDate('');
              setLocation('');
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>
      {filtered.length ? (
        <div className="record-grid">
          {filtered.map((row) => (
            <RecordCard key={row.id} row={row} resource={resource} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            resource === 'missas'
              ? 'Nenhuma missa agendada.'
              : resource === 'membros'
                ? 'Nenhum membro encontrado para esta pesquisa.'
                : resource === 'eventos'
                  ? 'Nenhum evento encontrado.'
                  : 'Nenhum aviso publicado.'
          }
        />
      )}
    </>
  );
}
