import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="panel mx-auto my-16 max-w-lg">
      <h1 className="mb-4 text-2xl">Página não encontrada</h1>
      <p className="mb-6">O registro pode ter sido removido ou o endereço está incorreto.</p>
      <Link className="text-link" href="/inicio">
        Ir para o início
      </Link>
    </main>
  );
}
