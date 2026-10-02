'use client';
import { SmartForm, type Field, type FormResult } from './smart-form';
import { loginSchema, registerSchema } from '@/lib/validation';
const profileFields: Field[] = [
  { name: 'name', label: 'Nome completo' },
  { name: 'phone', label: 'Telefone com DDD', type: 'tel' },
  { name: 'community', label: 'Comunidade (opcional)' },
];
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  return (
    <SmartForm
      schema={isRegister ? registerSchema : loginSchema}
      defaults={{
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        community: '',
      }}
      fields={[
        ...(isRegister ? profileFields : []),
        { name: 'email', label: 'E-mail', type: 'email' },
        {
          name: 'password',
          label: 'Senha',
          type: 'password',
          hint: isRegister ? 'Use pelo menos 10 caracteres.' : undefined,
        },
        ...(isRegister
          ? [{ name: 'confirmPassword', label: 'Confirmar senha', type: 'password' }]
          : []),
      ]}
      submitLabel={isRegister ? 'Criar minha conta' : 'Entrar'}
      submit={async (values) => {
        const response = await fetch('/api/auth/' + mode, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        const result: FormResult = await response.json();
        return {
          ...result,
          message: isRegister ? 'Bem-vindo à comunidade!' : 'Login realizado com sucesso',
        };
      }}
    />
  );
}
