import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin, requireUser } from '@/lib/auth';
import { getRecords } from '@/lib/records';
import { resources, type Resource } from '@/lib/resources';
import { idSchema } from '@/lib/validation';
import { formatDate, readingLabels } from '@/lib/dates';
import { PageHeader } from './page-parts';
import { RecordList } from './record-list';
import { RecordForm } from './record-form';
import { ConfirmDialog } from './confirm-dialog';
import { Button } from './ui/button';
export async function ResourceListPage({ resource }: { resource: Resource }) {
  const user = resource === 'membros' ? await requireAdmin() : await requireUser();
  const config = resources[resource];
  const rows = await getRecords(resource);
  return (
    <>
      <PageHeader
        title={config.title}
        description={
          resource === 'missas'
            ? 'Encontre os horários e locais para celebrar em comunidade.'
            : resource === 'membros'
              ? 'Cuide de quem faz parte da nossa comunidade.'
              : resource === 'eventos'
                ? 'Encontros que fortalecem a nossa vida em comunidade.'
                : 'Acompanhe as notícias e orientações da paróquia.'
        }
        action={user.role === 'ADMIN' ? config.createLabel : undefined}
        href={'/' + resource + '/' + (resource === 'missas' ? 'nova' : 'novo')}
      />
      <RecordList resource={resource} rows={rows} />
    </>
  );
}
export async function ResourceFormPage({ resource, id }: { resource: Resource; id?: string }) {
  await requireAdmin();
  if (id && !idSchema.safeParse(id).success) notFound();
  const row = id ? (await getRecords(resource, id))[0] : undefined;
  if (id && !row) notFound();
  return (
    <>
      <PageHeader
        title={
          id
            ? 'Editar ' + resources[resource].singular.toLowerCase()
            : resources[resource].createLabel
        }
        description="Preencha os dados abaixo. Confira as informações antes de salvar."
      />
      <div className="panel max-w-2xl">
        <RecordForm resource={resource} row={row} />
      </div>
    </>
  );
}
export async function ResourceDetailPage({ resource, id }: { resource: Resource; id: string }) {
  const user = resource === 'membros' ? await requireAdmin() : await requireUser();
  if (!idSchema.safeParse(id).success) notFound();
  const row = (await getRecords(resource, id))[0];
  if (!row) notFound();
  const config = resources[resource];
  const title = row.title || row.name || 'Santa Missa';
  return (
    <>
      <Link className="text-link mb-6 inline-block" href={'/' + resource}>
        ← {config.title}
      </Link>
      <PageHeader title={title} />
      <article className="panel max-w-3xl">
        <dl className="grid gap-6 sm:grid-cols-2">
          {config.fields
            .filter((f) => f.name !== 'password')
            .map((f) => (
              <div
                key={f.name}
                className={f.type === 'textarea' ? 'min-w-0 sm:col-span-2' : 'min-w-0'}
              >
                <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="whitespace-pre-wrap break-words">
                  {f.type === 'date'
                    ? formatDate(row[f.name])
                    : f.type === 'time'
                      ? row[f.name].slice(0, 5)
                      : f.name === 'role'
                        ? row.role === 'ADMIN'
                          ? 'Administrador'
                          : 'Membro'
                        : f.name === 'type'
                          ? readingLabels[row.type as keyof typeof readingLabels]
                          : row[f.name] || 'Não informado'}
                </dd>
              </div>
            ))}
        </dl>
        {row.createdAt && (
          <p className="mt-6 text-xs text-muted-foreground">
            Cadastrado em {formatDate(row.createdAt.slice(0, 10))}
          </p>
        )}
        {user.role === 'ADMIN' && (
          <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
            <Button asChild>
              <Link href={'/' + resource + '/' + id + '/editar'}>Editar</Link>
            </Button>
            <ConfirmDialog resource={resource} id={id} title={title} />
          </div>
        )}
      </article>
    </>
  );
}
