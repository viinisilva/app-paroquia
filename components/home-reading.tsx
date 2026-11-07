import { getCnbbLiturgy } from '@/lib/cnbb-liturgy';
import type { RecordRow } from '@/lib/resources';
// Prioriza a leitura publicada pela paróquia; sem ela, mostra só as referências da CNBB.
export async function HomeReading({ reading, date }: { reading?: RecordRow; date: string }) {
  if (reading)
    return (
      <>
        <p className="font-medium">{reading.reference}</p>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
          {reading.content}
        </p>
      </>
    );
  const liturgy = await getCnbbLiturgy(date);
  if (!liturgy)
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        As leituras de hoje ainda não foram publicadas. Consulte as datas disponíveis.
      </p>
    );
  return (
    <>
      <p className="font-medium">{liturgy.title}</p>
      {liturgy.references.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Referências das leituras do dia">
          {liturgy.references.map((reference) => (
            <li
              key={reference}
              className="rounded-full border border-primary/15 px-3 py-1 text-sm text-primary"
            >
              {reference}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Fonte: Liturgia Diária da CNBB.</p>
    </>
  );
}
export function HomeReadingFallback() {
  return (
    <div role="status" aria-label="Carregando leitura do dia" className="space-y-2">
      <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
      <div className="h-4 w-full animate-pulse rounded bg-secondary" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-secondary" />
    </div>
  );
}
