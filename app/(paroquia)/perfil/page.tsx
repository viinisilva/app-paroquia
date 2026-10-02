import { requireUser } from '@/lib/auth';
import { PageHeader } from '@/components/page-parts';
import { ProfileForm } from '@/components/profile-form';
import { Badge } from '@/components/ui/badge';
export default async function Profile() {
  const user = await requireUser();
  return (
    <>
      <PageHeader
        title="Meu perfil"
        description="Mantenha seus dados atualizados para estar perto da comunidade."
      />
      <div className="panel max-w-2xl">
        <div className="mb-6 border-b pb-5">
          <Badge variant="secondary">{user.role === 'ADMIN' ? 'Administrador' : 'Membro'}</Badge>
          <p className="mt-3 break-words font-medium">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Para alterar o e-mail de acesso, procure a administração.
          </p>
        </div>
        <ProfileForm defaults={{ name: user.name, phone: user.phone, community: user.community }} />
      </div>
    </>
  );
}
