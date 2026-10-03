const CONFIRMATION = 'CREATE_OR_UPDATE_DEMO_DATA';

export function assertPreviewDemoDatabase(databaseUrl: string) {
  if (process.env.VERCEL_ENV === 'production')
    throw new Error('Seed DEMO bloqueado no ambiente Production da Vercel.');
  if (process.env.DEMO_SEED_TARGET !== 'preview')
    throw new Error('Defina DEMO_SEED_TARGET=preview para confirmar o ambiente.');
  if (process.env.ALLOW_PREVIEW_DEMO_SEED !== CONFIRMATION)
    throw new Error('Confirmação explícita do seed DEMO ausente.');

  const expectedHost = process.env.PREVIEW_DATABASE_HOST?.trim().toLowerCase();
  if (!expectedHost) throw new Error('PREVIEW_DATABASE_HOST não configurado.');

  const url = new URL(databaseUrl);
  const safeStructure =
    ['postgres:', 'postgresql:'].includes(url.protocol) &&
    url.hostname.endsWith('.neon.tech') &&
    url.hostname.includes('pooler') &&
    url.pathname === '/neondb' &&
    url.searchParams.get('sslmode') === 'verify-full';

  if (!safeStructure)
    throw new Error('DATABASE_URL não corresponde ao Neon pooled seguro esperado.');
  if (url.hostname.toLowerCase() !== expectedHost)
    throw new Error('DATABASE_URL não corresponde ao endpoint Preview confirmado.');
}
