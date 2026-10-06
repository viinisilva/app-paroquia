import { requireUser } from '@/lib/auth';
import { PageHeader } from '@/components/page-parts';
import { ProfileForm } from '@/components/profile-form';
import { AccountDeletion } from '@/components/account-deletion';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Church, Mail, Phone } from 'lucide-react';
export default async function Profile() {
  const user = await requireUser();
  return (
    <>
      <PageHeader
        title="Meu perfil"
        description="Mantenha seus dados atualizados para estar perto da comunidade."
      />
      <div className="max-w-3xl space-y-5">
        <section className="panel">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold">{user.name}</h2>
              <Badge variant="secondary" className="mt-2">
                {user.role === 'ADMIN' ? 'Administrador' : 'Membro'}
              </Badge>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Mail aria-hidden className="h-5 w-5 shrink-0 text-primary" />
                E-mail
              </dt>
              <dd className="break-all pl-8 text-sm">{user.email}</dd>
            </div>
            <div className="min-w-0">
              <dt className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Phone aria-hidden className="h-5 w-5 shrink-0 text-primary" />
                Telefone
              </dt>
              <dd className="pl-8 text-sm">
                {user.phone && !/^0+$/.test(user.phone) ? user.phone : 'Telefone não informado'}
              </dd>
            </div>
            <div className="min-w-0 sm:col-span-2">
              <dt className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Church aria-hidden className="h-5 w-5 shrink-0 text-primary" />
                Comunidade
              </dt>
              <dd className="pl-8 text-sm">{user.community || 'Comunidade não informada'}</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <div className="mb-5 border-b pb-4">
            <h2 className="text-xl">Editar perfil</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              O perfil de acesso é definido pela administração e não pode ser alterado aqui.
            </p>
          </div>
          <ProfileForm
            defaults={{
              name: user.name,
              phone: /^0+$/.test(user.phone) ? '' : user.phone,
              community: user.community,
            }}
          />
        </section>
        <section className="panel space-y-3">
          <h2 className="text-xl">Privacidade e conta</h2>
          <p className="text-sm text-muted-foreground">
            Consulte como seus dados são usados ou exclua sua conta quando não quiser mais
            participar.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacidade" className="text-link min-h-11 content-center">
              Política de Privacidade
            </Link>
            <AccountDeletion />
          </div>
          {user.role === 'ADMIN' && (
            <p className="text-sm text-muted-foreground">
              A última conta administrativa precisa indicar um sucessor antes de ser excluída.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
