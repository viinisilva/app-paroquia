import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
export default async function LegacyMass() {
  await requireAdmin();
  redirect('/missas/nova');
}
