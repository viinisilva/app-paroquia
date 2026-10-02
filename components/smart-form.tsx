'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
export type Field = {
  name: string;
  label: string;
  type?: string;
  hint?: string;
  options?: { value: string; label: string }[];
};
export type FormResult = { error?: string; url?: string; message?: string };
export function SmartForm({
  schema,
  fields,
  defaults,
  submit,
  submitLabel = 'Salvar',
  cancelHref,
}: {
  schema: z.ZodType<Record<string, string>>;
  fields: Field[];
  defaults: Record<string, string>;
  submit: (values: Record<string, string>) => Promise<FormResult>;
  submitLabel?: string;
  cancelHref?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  useEffect(() => setHydrated(true), []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>({ resolver: zodResolver(schema), defaultValues: defaults });
  return (
    <form
      noValidate
      className="space-y-4 sm:space-y-5"
      onSubmit={handleSubmit(async (values) => {
        setError('');
        try {
          const result = await submit(values);
          if (result.error) {
            setError(result.error);
            toast.error(result.error);
            return;
          }
          toast.success(result.message || 'Dados salvos com sucesso');
          if (result.url) router.push(result.url);
          router.refresh();
        } catch {
          setError('Não foi possível salvar. Verifique sua conexão e tente novamente.');
        }
      })}
    >
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-red-50 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {fields.map((field) => (
        <div key={field.name} className="space-y-1.5 sm:space-y-2">
          <label className="block text-sm font-medium" htmlFor={field.name}>
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <Textarea
              id={field.name}
              rows={5}
              {...register(field.name)}
              aria-invalid={!!errors[field.name]}
              aria-describedby={field.name + '-help'}
            />
          ) : field.options ? (
            <select
              id={field.name}
              className="field"
              {...register(field.name)}
              aria-invalid={!!errors[field.name]}
              aria-describedby={field.name + '-help'}
            >
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : field.type === 'password' ? (
            <div className="relative">
              <Input
                id={field.name}
                type={visiblePasswords[field.name] ? 'text' : 'password'}
                className="pr-12"
                autoComplete={
                  field.name === 'confirmPassword' || submitLabel !== 'Entrar'
                    ? 'new-password'
                    : 'current-password'
                }
                {...register(field.name)}
                aria-invalid={!!errors[field.name]}
                aria-describedby={field.name + '-help'}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center rounded-r-md text-muted-foreground hover:text-primary"
                aria-label={`${visiblePasswords[field.name] ? 'Ocultar' : 'Mostrar'} ${field.label.toLocaleLowerCase('pt-BR')}`}
                aria-pressed={visiblePasswords[field.name] || false}
                onClick={() =>
                  setVisiblePasswords((current) => ({
                    ...current,
                    [field.name]: !current[field.name],
                  }))
                }
              >
                {visiblePasswords[field.name] ? (
                  <EyeOff aria-hidden className="h-5 w-5" />
                ) : (
                  <Eye aria-hidden className="h-5 w-5" />
                )}
              </button>
            </div>
          ) : (
            <Input
              id={field.name}
              type={field.type || 'text'}
              lang={field.type === 'date' ? 'pt-BR' : undefined}
              inputMode={
                field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : undefined
              }
              autoComplete={
                field.name === 'email'
                  ? 'email'
                  : field.name === 'phone'
                    ? 'tel'
                    : field.name === 'name'
                      ? 'name'
                      : undefined
              }
              {...register(field.name)}
              aria-invalid={!!errors[field.name]}
              aria-describedby={field.name + '-help'}
            />
          )}
          <div id={field.name + '-help'}>
            {errors[field.name] ? (
              <p role="alert" className="text-sm text-destructive">
                {errors[field.name]?.message}
              </p>
            ) : field.hint ? (
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            ) : null}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-1 gap-3 border-t pt-4 sm:flex sm:flex-wrap sm:pt-5">
        <Button type="submit" disabled={!hydrated || isSubmitting} className="w-full sm:w-auto">
          {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
          {!hydrated ? 'Preparando…' : isSubmitting ? 'Aguarde…' : submitLabel}
        </Button>
        {cancelHref && (
          <Button variant="outline" asChild>
            <Link href={cancelHref}>Cancelar</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
