'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="panel mx-auto my-12 max-w-xl">
      <h1 className="mb-3 text-2xl">Não foi possível carregar</h1>
      <p className="mb-5 text-muted-foreground">
        O serviço está temporariamente indisponível. Tente novamente em instantes.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
