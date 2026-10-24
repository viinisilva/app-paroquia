import test from 'node:test';
import assert from 'node:assert/strict';
import {
  massSchema,
  registerSchema,
  profileSchema,
  memberSchema,
  dateSchema,
  accountDeletionSchema,
} from '../lib/validation';
import { hashPassword, verifyPassword, tokenHash } from '../lib/password';
import { isIosDevice, isStandaloneMode } from '../lib/pwa';
import { liturgyHtmlToText, parseCnbbLiturgy } from '../lib/cnbb-liturgy-parser';
import {
  handleNativeBack,
  isAndroidCapacitor,
  NATIVE_HISTORY_INDEX_KEY,
  readNativeHistoryIndex,
  withNativeHistoryIndex,
} from '../lib/native-history';
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

test('exclusão exige senha e confirmação explícita sem aceitar campos de outro usuário', () => {
  assert.equal(
    accountDeletionSchema.safeParse({ password: '', confirmation: 'EXCLUIR' }).success,
    false,
  );
  assert.equal(
    accountDeletionSchema.safeParse({ password: 'senha', confirmation: 'excluir' }).success,
    false,
  );
  const parsed = accountDeletionSchema.parse({
    password: 'senha',
    confirmation: 'EXCLUIR',
    userId: 'outro',
  });
  assert.equal('userId' in parsed, false);
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

test('Liturgia da CNBB é convertida em texto seguro e organizada por data', () => {
  const parsed = parseCnbbLiturgy(
    {
      content: {
        date: '2026-10-24',
        title: '<b>Tempo Comum</b>',
        color: 'verde',
        details:
          '<div>Sábado, 24 de Outubro de 2026</div><div>29ª Semana</div><div>Leituras:</div>',
        leituras: '<div>Leituras:</div><div>Ef 4,7-16</div><div>Lc 13,1-9</div>',
        body: '<h3>Evangelho</h3><p>Texto autorizado &amp; conferido.</p><script>indesejado()</script>',
      },
    },
    '2026-10-24',
    'https://fonte.example/',
  );

  assert.equal(parsed.title, 'Tempo Comum');
  assert.equal(parsed.details, '29ª Semana');
  assert.deepEqual(parsed.references, ['Ef 4,7-16', 'Lc 13,1-9']);
  assert.equal(parsed.body, 'Evangelho\n\nTexto autorizado & conferido.');
  assert.equal(parsed.body.includes('indesejado'), false);
});

test('parser da liturgia rejeita data divergente e remove HTML executável', () => {
  assert.equal(
    liturgyHtmlToText('<p>Leitura &#x31;</p><iframe>conteúdo externo</iframe>'),
    'Leitura 1',
  );
  assert.throws(
    () =>
      parseCnbbLiturgy(
        {
          content: {
            date: '2026-10-25',
            title: 'Tempo Comum',
            color: 'verde',
            details: '',
            leituras: '',
            body: '<p>Texto</p>',
          },
        },
        '2026-10-24',
        'https://fonte.example/',
      ),
    /CNBB_DATE_MISMATCH/,
  );
});

test('instalação PWA reconhece iPhone, iPad moderno e modo standalone', () => {
  assert.equal(
    isIosDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'iPhone', 5),
    true,
  );
  assert.equal(isIosDevice('Mozilla/5.0 (Macintosh)', 'MacIntel', 5), true);
  assert.equal(isIosDevice('Mozilla/5.0 (Linux; Android 15)', 'Linux armv8l', 5), false);
  assert.equal(isStandaloneMode(true, undefined), true);
  assert.equal(isStandaloneMode(false, true), true);
  assert.equal(isStandaloneMode(false, false), false);
});

test('histórico nativo preserva o estado do App Router e normaliza o índice', () => {
  const state = withNativeHistoryIndex({ __NA: true, custom: 'valor' }, 2);

  assert.equal(state.__NA, true);
  assert.equal(state.custom, 'valor');
  assert.equal(state[NATIVE_HISTORY_INDEX_KEY], 2);
  assert.equal(readNativeHistoryIndex(state), 2);
  assert.equal(readNativeHistoryIndex(withNativeHistoryIndex(null, -1)), 0);
  assert.equal(readNativeHistoryIndex({ [NATIVE_HISTORY_INDEX_KEY]: '2' }), 0);
});

test('Back Android volta em rotas internas e minimiza nas raízes lógicas', () => {
  const calls: string[] = [];
  const actions = {
    back: () => calls.push('back'),
    minimize: () => calls.push('minimize'),
  };

  handleNativeBack('/calendario', 3, actions);
  handleNativeBack('/missas', 2, actions);
  handleNativeBack('/dashboard', 1, actions);
  handleNativeBack('/inicio/', 2, actions);
  handleNativeBack('/', 1, actions);

  assert.deepEqual(calls, ['back', 'back', 'minimize', 'minimize', 'minimize']);
});

test('Back Android não sai do app quando uma rota interna não tem histórico', () => {
  const calls: string[] = [];

  handleNativeBack('/eventos', 0, {
    back: () => calls.push('back'),
    minimize: () => calls.push('minimize'),
  });

  assert.deepEqual(calls, ['minimize']);
});

test('listener nativo fica restrito ao Capacitor Android', () => {
  assert.equal(isAndroidCapacitor(true, 'android'), true);
  assert.equal(isAndroidCapacitor(false, 'web'), false);
  assert.equal(isAndroidCapacitor(true, 'ios'), false);
  assert.equal(isAndroidCapacitor(false, 'ios'), false);
});
