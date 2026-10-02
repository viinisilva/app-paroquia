import Link from 'next/link';
import Image from 'next/image';
import { AuthForm } from '@/components/auth-form';
export default function Cadastro() {
  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <Link href="/" className="text-link">
        ← Voltar para entrar
      </Link>
      <Image
        src="/images/logo.png"
        alt="Brasão da Paróquia São Roque"
        width={88}
        height={88}
        className="mx-auto my-6"
      />
      <div className="panel">
        <p className="eyebrow">Faça parte</p>
        <h1 className="mb-2 text-2xl">Nossa comunidade espera você</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Crie sua conta para consultar a agenda e os avisos da paróquia.
        </p>
        <AuthForm mode="register" />
        <p className="mt-5 text-xs text-muted-foreground">
          Seu nome, telefone e comunidade ficam disponíveis à administração paroquial.
        </p>
      </div>
    </main>
  );
}
