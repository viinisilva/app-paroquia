import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getRecords } from '@/lib/records';
import { today, readingLabels, formatDate } from '@/lib/dates';
import { dateSchema } from '@/lib/validation';
import { legacyReadings } from '@/data/legacy-readings';
import { PageHeader, EmptyState } from '@/components/page-parts';
import { Button } from '@/components/ui/button';
export default async function ReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; demo?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const date = dateSchema.safeParse(query.date).success ? query.date! : today();
  const all = await getRecords('leituras');
  const rows = all
    .filter((r) => r.date === date)
    .sort(
      (a, b) =>
        Object.keys(readingLabels).indexOf(a.type) - Object.keys(readingLabels).indexOf(b.type),
    );
  return (
    <>
      <PageHeader
        title="A Palavra no nosso dia"
        description="Um tempo para ler, refletir e fortalecer a fé."
        action={user.role === 'ADMIN' ? 'Nova leitura' : undefined}
        href="/leituras/novo"
      />
      <div className="panel mb-6">
        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="reading-date" className="mb-2 block text-sm font-medium">
              Data da leitura
            </label>
            <input
              id="reading-date"
              name="date"
              className="field"
              type="date"
              defaultValue={date}
              key={date}
              required
            />
          </div>
          <Button type="submit">Consultar</Button>
          <Link href="/leituras" className="text-link inline-flex min-h-11 items-center text-sm">
            Hoje
          </Link>
        </form>
        {all.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Datas disponíveis:</span>
            {[...new Set(all.map((r) => r.date))].slice(0, 12).map((d) => (
              <Link key={d} href={'/leituras?date=' + d} className="text-link text-sm">
                {formatDate(d)}
              </Link>
            ))}
          </div>
        )}
      </div>
      {query.demo === '1' ? (
        <>
          <div className="mb-6 rounded-xl border bg-accent p-5">
            <h2 className="mb-2 text-lg">Arquivo demonstrativo de 2025</h2>
            <p className="text-sm">
              Conteúdo preservado do protótipo original, sem fonte editorial validada. As datas e
              celebrações não representam o calendário litúrgico atual. Este arquivo serve apenas
              para demonstração de leitura.
            </p>
            <Link href="/leituras" className="text-link mt-3 inline-block text-sm">
              Voltar às leituras publicadas
            </Link>
          </div>
          {legacyReadings.map((group) => (
            <section key={group.data} className="mb-8">
              <h2 className="mb-4 text-lg">
                {group.titulo} • registro original {group.data}
              </h2>
              {group.leituras.map((reading) => (
                <article className="panel mb-4" key={reading.nome}>
                  <p className="eyebrow">Demonstração • {reading.nome}</p>
                  <h3 className="mb-4 font-semibold">{reading.referencia}</h3>
                  <p className="max-w-prose leading-8">{reading.texto}</p>
                </article>
              ))}
            </section>
          ))}
        </>
      ) : rows.length ? (
        <div className="space-y-5">
          {rows.map((row) => (
            <article className="panel" key={row.id}>
              <p className="eyebrow">{readingLabels[row.type as keyof typeof readingLabels]}</p>
              <h2 className="text-xl">{row.title}</h2>
              <p className="my-3 font-medium text-primary">{row.reference}</p>
              <p className="max-w-prose whitespace-pre-wrap break-words leading-8">{row.content}</p>
              <p className="mt-6 break-words text-xs text-muted-foreground">Fonte: {row.source}</p>
              {user.role === 'ADMIN' && (
                <Link href={'/leituras/' + row.id} className="text-link mt-4 inline-block text-sm">
                  Gerenciar leitura
                </Link>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Leituras ainda não publicadas para esta data."
          description="A administração publicará os textos após conferir uma fonte litúrgica confiável."
        />
      )}
      {query.demo !== '1' && (
        <p className="mt-8 text-sm text-muted-foreground">
          Para conhecer o formato:{' '}
          <Link className="text-link" href="/leituras?demo=1">
            abrir arquivo demonstrativo do protótipo
          </Link>
          .
        </p>
      )}
    </>
  );
}
