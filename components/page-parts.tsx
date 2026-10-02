import Link from 'next/link';
import { Church, Loader2, Plus, type LucideIcon } from 'lucide-react';
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
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-8 sm:gap-4">
      <div>
        <p className="eyebrow mb-1.5 sm:mb-2">Paróquia São Roque</p>
        <h1 className="text-[clamp(1.4rem,6vw,1.75rem)] font-semibold leading-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-2">
            {description}
          </p>
        )}
      </div>
      {action && href && (
        <Button asChild className="w-full sm:w-auto">
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
  action,
  href,
  icon: Icon = Church,
  compact = false,
}: {
  title: string;
  description?: string;
  action?: string;
  href?: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed bg-card px-4 text-center sm:px-5 ${compact ? 'py-6 sm:py-7' : 'py-7 sm:py-9'}`}
    >
      <Icon aria-hidden className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
      <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && href && (
        <Button asChild className="mt-5">
          <Link href={href}>
            <Plus aria-hidden />
            {action}
          </Link>
        </Button>
      )}
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
