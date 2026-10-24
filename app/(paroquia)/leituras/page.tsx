import Link from 'next/link';
import { BookOpen, ExternalLink } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { getRecords } from '@/lib/records';
import { today, readingLabels, formatDate } from '@/lib/dates';
import { dateSchema } from '@/lib/validation';
import { getCnbbLiturgy } from '@/lib/cnbb-liturgy';
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
  const [all, officialLiturgy] = await Promise.all([getRecords('leituras'), getCnbbLiturgy(date)]);
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
        description="Acompanhe automaticamente a liturgia e as leituras de cada dia."
        action={user.role === 'ADMIN' ? 'Adicionar leitura' : undefined}
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
            <span className="text-sm text-muted-foreground">
              Conteúdo complementar disponível em:
            </span>
            {[...new Set(all.map((r) => r.date))].slice(0, 12).map((d) => (
              <Link key={d} href={'/leituras?date=' + d} className="text-link text-sm">
                {formatDate(d)}
              </Link>
            ))}
          </div>
        )}
      </div>

      {officialLiturgy ? (
        <article
          aria-labelledby="official-liturgy-title"
          className="mx-auto max-w-4xl overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgba(54,39,29,0.05)]"
        >
          <header className="border-b bg-secondary/45 px-4 py-5 sm:px-8 sm:py-7">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow !mb-0 inline-flex items-center gap-2">
                <BookOpen aria-hidden className="h-4 w-4" />
                Liturgia diária • CNBB
              </p>
              <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                Cor litúrgica: {officialLiturgy.color}
              </span>
            </div>
            <h2 id="official-liturgy-title" className="text-xl sm:text-2xl">
              {officialLiturgy.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{formatDate(officialLiturgy.date)}</p>
            {officialLiturgy.details && (
              <p className="mt-3 max-w-prose whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {officialLiturgy.details}
              </p>
            )}
            {officialLiturgy.references.length > 0 && (
              <div
                className="mt-4 flex flex-wrap gap-2"
                aria-label="Referências das leituras do dia"
              >
                {officialLiturgy.references.map((reference) => (
                  <span
                    key={reference}
                    className="rounded-full border border-primary/15 bg-card px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    {reference}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="px-4 py-5 sm:px-8 sm:py-8">
            <h3 className="mb-4 text-lg font-semibold text-primary">Leituras do dia</h3>
            <div className="max-w-prose whitespace-pre-line break-words text-base leading-8 sm:text-[1.03rem]">
              {officialLiturgy.body}
            </div>
            <p className="mt-7 border-t pt-4 text-xs leading-5 text-muted-foreground">
              Fonte: Conferência Nacional dos Bispos do Brasil (CNBB).{' '}
              <a
                href={officialLiturgy.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-link inline-flex min-h-11 items-center gap-1"
              >
                Consultar fonte oficial
                <ExternalLink aria-hidden className="h-3.5 w-3.5" />
              </a>
            </p>
          </div>
        </article>
      ) : (
        <div
          role="status"
          className="mx-auto mb-5 max-w-4xl rounded-xl border border-amber-700/20 bg-accent/55 px-4 py-3 text-sm leading-6 text-accent-foreground"
        >
          A Liturgia Diária da CNBB está temporariamente indisponível. Se houver conteúdo
          complementar publicado pela paróquia, ele aparece abaixo.
        </div>
      )}

      {rows.length ? (
        <section aria-labelledby="parish-readings-title" className="mx-auto mt-7 max-w-4xl sm:mt-9">
          <h2 id="parish-readings-title" className="section-title">
            {officialLiturgy
              ? 'Conteúdo complementar da paróquia'
              : 'Leituras publicadas pela paróquia'}
          </h2>
          <div className="space-y-4 sm:space-y-5">
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
                  <Link
                    href={'/leituras/' + row.id}
                    className="text-link mt-4 inline-block text-sm"
                  >
                    Gerenciar leitura
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : officialLiturgy ? null : (
        <EmptyState
          title="Leituras indisponíveis para esta data."
          description="Consulte outra data ou tente novamente mais tarde."
          compact
        />
      )}
    </>
  );
}
