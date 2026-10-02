import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getRecords } from '@/lib/records';
import { today, readingLabels, formatDate } from '@/lib/dates';
import { dateSchema } from '@/lib/validation';
import { PageHeader, EmptyState } from '@/components/page-parts';
import { Button } from '@/components/ui/button';
export default async function ReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
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
      <div className="panel mb-5 sm:mb-6">
        <form className="grid items-end gap-3 sm:grid-cols-[minmax(0,16rem)_auto_auto]">
          <div className="min-w-0">
            <label htmlFor="reading-date" className="mb-2 block text-sm font-medium">
              Data da leitura
            </label>
            <input
              id="reading-date"
              name="date"
              className="field"
              type="date"
              lang="pt-BR"
              defaultValue={date}
              key={date}
              required
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Consultar
          </Button>
          <Link
            href="/leituras"
            className="text-link inline-flex min-h-11 items-center justify-center text-sm sm:justify-start"
          >
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
      {rows.length ? (
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
          {rows.map((row) => (
            <article className="rounded-xl border bg-card px-4 py-5 sm:px-8 sm:py-8" key={row.id}>
              <p className="eyebrow mb-2">
                {readingLabels[row.type as keyof typeof readingLabels]}
              </p>
              <h2 className="text-xl sm:text-2xl">{row.title}</h2>
              <p className="my-3 font-medium text-primary">{row.reference}</p>
              <p className="max-w-prose whitespace-pre-wrap break-words text-[1.03rem] leading-8">
                {row.content}
              </p>
              <p className="mt-5 break-words text-xs text-muted-foreground sm:mt-6">
                Fonte: {row.source}
              </p>
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
          description="Consulte outra data ou volte mais tarde."
          compact
        />
      )}
    </>
  );
}
