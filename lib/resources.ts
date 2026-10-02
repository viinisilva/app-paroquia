import { massSchema, memberSchema, eventSchema, noticeSchema, readingSchema } from './validation';
import { readingLabels } from './dates';
import type { Field } from '@/components/smart-form';
export type Resource = 'missas' | 'membros' | 'eventos' | 'avisos' | 'leituras';
type Config = {
  title: string;
  singular: string;
  createLabel: string;
  schema:
    | typeof massSchema
    | typeof memberSchema
    | typeof eventSchema
    | typeof noticeSchema
    | typeof readingSchema;
  fields: Field[];
};
const dateField: Field = { name: 'date', label: 'Data', type: 'date' };
const timeField: Field = { name: 'time', label: 'Horário', type: 'time' };
const locationField: Field = { name: 'location', label: 'Local' };
const descriptionField: Field = {
  name: 'description',
  label: 'Descrição (opcional)',
  type: 'textarea',
};
export const resources: Record<Resource, Config> = {
  missas: {
    title: 'Missas',
    singular: 'Missa',
    createLabel: 'Nova missa',
    schema: massSchema,
    fields: [
      dateField,
      timeField,
      locationField,
      { name: 'celebrant', label: 'Celebrante' },
      descriptionField,
    ],
  },
  membros: {
    title: 'Membros',
    singular: 'Membro',
    createLabel: 'Novo membro',
    schema: memberSchema,
    fields: [
      { name: 'name', label: 'Nome completo' },
      { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'phone', label: 'Telefone com DDD', type: 'tel' },
      { name: 'community', label: 'Comunidade (opcional)' },
      {
        name: 'role',
        label: 'Perfil',
        options: [
          { value: 'MEMBER', label: 'Membro' },
          { value: 'ADMIN', label: 'Administrador' },
        ],
      },
      {
        name: 'password',
        label: 'Senha',
        type: 'password',
        hint: 'No cadastro: pelo menos 10 caracteres. Na edição: deixe vazio para manter a senha.',
      },
    ],
  },
  eventos: {
    title: 'Eventos',
    singular: 'Evento',
    createLabel: 'Novo evento',
    schema: eventSchema,
    fields: [
      { name: 'title', label: 'Título' },
      dateField,
      timeField,
      locationField,
      descriptionField,
    ],
  },
  avisos: {
    title: 'Avisos',
    singular: 'Aviso',
    createLabel: 'Novo aviso',
    schema: noticeSchema,
    fields: [
      { name: 'title', label: 'Título' },
      { name: 'content', label: 'Conteúdo', type: 'textarea' },
      {
        name: 'publishedAt',
        label: 'Data de publicação',
        type: 'date',
        hint: 'Uma data futura agenda a publicação.',
      },
    ],
  },
  leituras: {
    title: 'Leituras',
    singular: 'Leitura',
    createLabel: 'Nova leitura',
    schema: readingSchema,
    fields: [
      dateField,
      { name: 'title', label: 'Título da celebração' },
      {
        name: 'type',
        label: 'Tipo',
        options: Object.entries(readingLabels).map(([value, label]) => ({ value, label })),
      },
      { name: 'reference', label: 'Referência bíblica' },
      { name: 'content', label: 'Texto autorizado', type: 'textarea' },
      {
        name: 'source',
        label: 'Fonte / referência editorial',
        hint: 'Informe a fonte confiável e confira a autorização de uso antes de publicar.',
      },
    ],
  },
};
export type RecordRow = Record<string, string> & { id: string };
