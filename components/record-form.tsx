'use client';
import { SmartForm } from './smart-form';
import { resources, type Resource, type RecordRow } from '@/lib/resources';
import { saveRecord } from '@/app/actions/records';
export function RecordForm({ resource, row }: { resource: Resource; row?: RecordRow }) {
  const config = resources[resource];
  const defaults = Object.fromEntries(
    config.fields.map((f) => [
      f.name,
      row?.[f.name]?.slice(0, f.type === 'time' ? 5 : undefined) ??
        (f.name === 'role' ? 'MEMBER' : f.name === 'type' ? 'FIRST' : ''),
    ]),
  );
  return (
    <SmartForm
      schema={config.schema}
      fields={config.fields}
      defaults={defaults}
      submit={(values) => saveRecord(resource, row?.id, values)}
      submitLabel={row ? 'Salvar alterações' : config.createLabel}
      cancelHref={'/' + resource}
    />
  );
}
