import test from 'node:test';
import assert from 'node:assert/strict';
import {
  massSchema,
  registerSchema,
  profileSchema,
  memberSchema,
  dateSchema,
} from '../lib/validation';
import { hashPassword, verifyPassword, tokenHash } from '../lib/password';
test('validação de data real e horário', () => {
  assert.equal(dateSchema.safeParse('2026-02-30').success, false);
  assert.equal(dateSchema.safeParse('2028-02-29').success, true);
  assert.equal(
    massSchema.safeParse({
      date: '2026-10-01',
      time: '24:99',
      location: 'Matriz',
      celebrant: 'Padre',
      description: '',
    }).success,
    false,
  );
});
test('cadastro normaliza e-mail e rejeita senha fraca e confirmação divergente', () => {
  const base = {
    name: 'Maria Silva',
    email: '  MARIA@example.org ',
    phone: '11999998888',
    community: 'Matriz',
    password: 'SenhaForte!123',
    confirmPassword: 'SenhaForte!123',
    role: 'ADMIN',
  };
  const parsed = registerSchema.parse(base);
  assert.equal(parsed.email, 'maria@example.org');
  assert.equal('role' in parsed, false);
  assert.equal(registerSchema.safeParse({ ...base, password: '123' }).success, false);
  assert.equal(registerSchema.safeParse({ ...base, confirmPassword: 'diferente' }).success, false);
});
test('perfil ignora campos privilegiados e rejeita telefone inválido', () => {
  const parsed = profileSchema.parse({
    name: 'Maria Silva',
    phone: '11999998888',
    community: 'Matriz',
    role: 'ADMIN',
    id: 'outro',
    passwordHash: 'plaintext',
  });
  assert.equal('role' in parsed, false);
  assert.equal('passwordHash' in parsed, false);
  assert.equal(profileSchema.safeParse({ ...parsed, phone: 'abc1234567890' }).success, false);
  assert.equal(
    memberSchema.safeParse({ ...parsed, email: 'x@example.org', role: 'SUPERADMIN', password: '' })
      .success,
    false,
  );
});
test('scrypt usa salt aleatório e verifica somente a senha correta', async () => {
  const first = await hashPassword('SenhaCorreta!123');
  const second = await hashPassword('SenhaCorreta!123');
  assert.notEqual(first, second);
  assert.equal(first.includes('SenhaCorreta'), false);
  assert.equal(await verifyPassword('SenhaCorreta!123', first), true);
  assert.equal(await verifyPassword('SenhaErrada!123', first), false);
  assert.equal(await verifyPassword('qualquer', 'invalido'), false);
  assert.equal(tokenHash('token').length, 64);
});
