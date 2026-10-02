'use server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users, masses, events, notices, readings, sessions } from '@/lib/db/schema';
import { requireAdmin, requireUser } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import {
  massSchema,
  eventSchema,
  noticeSchema,
  memberSchema,
  readingSchema,
  idSchema,
  passwordSchema,
  profileSchema,
} from '@/lib/validation';
import type { Resource } from '@/lib/resources';
import type { FormResult } from '@/components/smart-form';
const messages = {
  missas: [
    'Missa cadastrada com sucesso',
    'Missa atualizada com sucesso',
    'Missa removida com sucesso',
  ],
  membros: [
    'Membro cadastrado com sucesso',
    'Membro atualizado com sucesso',
    'Membro removido com sucesso',
  ],
  eventos: [
    'Evento cadastrado com sucesso',
    'Evento atualizado com sucesso',
    'Evento removido com sucesso',
  ],
  avisos: [
    'Aviso cadastrado com sucesso',
    'Aviso atualizado com sucesso',
    'Aviso removido com sucesso',
  ],
  leituras: [
    'Leitura cadastrada com sucesso',
    'Leitura atualizada com sucesso',
    'Leitura removida com sucesso',
  ],
};
function refresh() {
  revalidatePath('/', 'layout');
}
function failure(error: unknown): FormResult {
  if (error instanceof z.ZodError) return { error: error.issues[0].message };
  const cause = error instanceof Error && 'cause' in error ? error.cause : error;
  if (typeof cause === 'object' && cause && 'code' in cause && cause.code === '23505')
    return {
      error: 'Já existe um registro com este e-mail ou uma leitura deste tipo para esta data.',
    };
  console.error('record_mutation_failed', error instanceof Error ? error.name : 'UnknownError');
  return { error: 'Não foi possível salvar. Tente novamente em instantes.' };
}
export async function saveRecord(
  resource: Resource,
  id: string | undefined,
  input: unknown,
): Promise<FormResult> {
  const actor = await requireAdmin();
  try {
    if (id) idSchema.parse(id);
    const updatedAt = new Date();
    let result: { id: string }[] = [];
    switch (resource) {
      case 'missas': {
        const data = massSchema.parse(input);
        result = id
          ? await db()
              .update(masses)
              .set({ ...data, updatedAt })
              .where(eq(masses.id, id))
              .returning({ id: masses.id })
          : await db().insert(masses).values(data).returning({ id: masses.id });
        break;
      }
      case 'eventos': {
        const data = eventSchema.parse(input);
        result = id
          ? await db()
              .update(events)
              .set({ ...data, updatedAt })
              .where(eq(events.id, id))
              .returning({ id: events.id })
          : await db().insert(events).values(data).returning({ id: events.id });
        break;
      }
      case 'avisos': {
        const data = noticeSchema.parse(input);
        result = id
          ? await db()
              .update(notices)
              .set({ ...data, updatedAt })
              .where(eq(notices.id, id))
              .returning({ id: notices.id })
          : await db().insert(notices).values(data).returning({ id: notices.id });
        break;
      }
      case 'leituras': {
        const data = readingSchema.parse(input);
        result = id
          ? await db()
              .update(readings)
              .set({ ...data, updatedAt })
              .where(eq(readings.id, id))
              .returning({ id: readings.id })
          : await db().insert(readings).values(data).returning({ id: readings.id });
        break;
      }
      case 'membros': {
        const { password, ...data } = memberSchema.parse(input);
        if (!id) {
          passwordSchema.parse(password);
          result = await db()
            .insert(users)
            .values({ ...data, passwordHash: await hashPassword(password) })
            .returning({ id: users.id });
        } else {
          const [existing] = await db()
            .select({ role: users.role, email: users.email })
            .from(users)
            .where(eq(users.id, id));
          if (!existing) return { error: 'Membro não encontrado.' };
          if (existing.role === 'ADMIN' && data.role !== 'ADMIN')
            return {
              error:
                'Administradores não podem ser rebaixados por esta tela. Isso preserva o acesso à gestão.',
            };
          if (actor.id === id && data.role !== actor.role)
            return { error: 'Você não pode alterar o próprio perfil de acesso.' };
          const passwordHash = password ? await hashPassword(password) : undefined;
          await db().transaction(async (tx) => {
            result = await tx
              .update(users)
              .set({ ...data, ...(passwordHash ? { passwordHash } : {}), updatedAt })
              .where(eq(users.id, id))
              .returning({ id: users.id });
            if (passwordHash || data.role !== existing.role || data.email !== existing.email)
              await tx.delete(sessions).where(eq(sessions.userId, id));
          });
        }
        break;
      }
      default:
        return { error: 'Tipo de registro inválido.' };
    }
    if (!result[0]) return { error: 'Registro não encontrado. Atualize a página.' };
    refresh();
    return { message: messages[resource][id ? 1 : 0], url: '/' + resource + '/' + result[0].id };
  } catch (error) {
    return failure(error);
  }
}
export async function deleteRecord(resource: Resource, id: string): Promise<FormResult> {
  await requireAdmin();
  try {
    idSchema.parse(id);
    let result: { id: string }[] = [];
    switch (resource) {
      case 'missas':
        result = await db().delete(masses).where(eq(masses.id, id)).returning({ id: masses.id });
        break;
      case 'eventos':
        result = await db().delete(events).where(eq(events.id, id)).returning({ id: events.id });
        break;
      case 'avisos':
        result = await db().delete(notices).where(eq(notices.id, id)).returning({ id: notices.id });
        break;
      case 'leituras':
        result = await db()
          .delete(readings)
          .where(eq(readings.id, id))
          .returning({ id: readings.id });
        break;
      case 'membros': {
        const [existing] = await db()
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, id));
        if (existing?.role === 'ADMIN')
          return { error: 'Contas administrativas não podem ser excluídas por esta tela.' };
        result = await db().delete(users).where(eq(users.id, id)).returning({ id: users.id });
        break;
      }
      default:
        return { error: 'Tipo de registro inválido.' };
    }
    if (!result[0]) return { error: 'Este registro já foi removido.' };
    refresh();
    return { message: messages[resource][2], url: '/' + resource };
  } catch (error) {
    return failure(error);
  }
}
export async function updateProfile(input: unknown): Promise<FormResult> {
  const user = await requireUser();
  try {
    const data = profileSchema.parse(input);
    await db()
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    refresh();
    return { message: 'Perfil atualizado com sucesso' };
  } catch (error) {
    return failure(error);
  }
}
