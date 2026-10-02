const REMOTE_CONFIRMATION = 'CREATE_AND_REMOVE_TEST_RECORDS';

export function assertSafeTestDatabase(databaseURL: string) {
  const url = new URL(databaseURL);
  if (['127.0.0.1', 'localhost'].includes(url.hostname)) return;

  const confirmed = process.env.ALLOW_NEON_SMOKE_TESTS === REMOTE_CONFIRMATION;
  const isNeonPooler = url.hostname.endsWith('.neon.tech') && url.hostname.includes('pooler');
  if (confirmed && isNeonPooler) return;

  throw new Error(
    'Testes com escrita são permitidos apenas no banco local ou em Neon com confirmação explícita.',
  );
}
