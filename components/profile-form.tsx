'use client';
import { SmartForm } from './smart-form';
import { profileSchema } from '@/lib/validation';
import { updateProfile } from '@/app/actions/records';
export function ProfileForm({
  defaults,
}: {
  defaults: { name: string; phone: string; community: string };
}) {
  return (
    <SmartForm
      schema={profileSchema}
      fields={[
        { name: 'name', label: 'Nome completo' },
        { name: 'phone', label: 'Telefone com DDD', type: 'tel' },
        { name: 'community', label: 'Comunidade (opcional)' },
      ]}
      defaults={defaults}
      submit={updateProfile}
      submitLabel="Salvar perfil"
    />
  );
}
