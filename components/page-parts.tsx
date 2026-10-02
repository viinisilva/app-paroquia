import Link from 'next/link';
import { Church, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function PageHeader({
  title,
  description,
  action,
  href,
}: {
  title: string;
  description?: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">Paróquia São Roque</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && href && (
        <Button asChild>
          <Link href={href}>
            <Plus aria-hidden />
            {action}
          </Link>
        </Button>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description = 'Novas informações aparecerão aqui assim que forem cadastradas.',
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-5 py-12 text-center">
      <Church aria-hidden className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
      <h2 className="text-lg">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
export function LoadingState() {
  return (
    <div role="status" className="panel flex items-center gap-3">
      <Loader2 aria-hidden className="h-5 w-5 animate-spin" />
      Carregando informações…
    </div>
  );
}
