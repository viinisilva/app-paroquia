import { z } from 'zod';
const required = (max: number) =>
  z
    .string()
    .trim()
    .min(2, 'Informe pelo menos 2 caracteres.')
    .max(max, `Use até ${max} caracteres.`);
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.')
  .refine((v) => {
    const d = new Date(`${v}T12:00:00Z`);
    return (
      !isNaN(d.getTime()) &&
      d.toISOString().slice(0, 10) === v &&
      v >= '1900-01-01' &&
      v <= '2100-12-31'
    );
  }, 'Informe uma data válida.');
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido.');
export const passwordSchema = z
  .string()
  .min(10, 'Use pelo menos 10 caracteres.')
  .max(128, 'Use até 128 caracteres.');
const email = z.string().trim().toLowerCase().email('Informe um e-mail válido.').max(254);
const phone = z
  .string()
  .trim()
  .max(25)
  .refine(
    (v) =>
      /^\+?[\d\s().-]+$/.test(v) &&
      v.replace(/\D/g, '').length >= 10 &&
      v.replace(/\D/g, '').length <= 15,
    'Informe um telefone com DDD.',
  );
export const profileSchema = z.object({
  name: required(120),
  phone,
  community: z.string().trim().max(120),
});
export const memberSchema = profileSchema.extend({
  email,
  role: z.enum(['ADMIN', 'MEMBER']),
  password: z.union([passwordSchema, z.literal('')]),
});
export const registerSchema = profileSchema
  .extend({ email, password: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha.').max(128),
});
export const massSchema = z.object({
  date: dateSchema,
  time: timeSchema,
  location: required(160),
  celebrant: required(120),
  description: z.string().trim().max(5000),
});
export const eventSchema = z.object({
  title: required(160),
  description: z.string().trim().max(5000),
  date: dateSchema,
  time: timeSchema,
  location: required(160),
});
export const noticeSchema = z.object({
  title: required(160),
  content: required(10000),
  publishedAt: dateSchema,
});
export const readingSchema = z.object({
  date: dateSchema,
  title: required(160),
  type: z.enum(['FIRST', 'PSALM', 'SECOND', 'GOSPEL']),
  reference: required(200),
  content: required(30000),
  source: required(500),
});
export const idSchema = z.string().uuid('Registro inválido.');
