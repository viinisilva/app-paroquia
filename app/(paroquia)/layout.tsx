import { requireUser } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';
export const dynamic = 'force-dynamic';
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppShell user={{ name: user.name, role: user.role }}>{children}</AppShell>;
}
