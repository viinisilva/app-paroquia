import { test, expect, type Page, type Request } from '@playwright/test';
import { Pool } from 'pg';
import { mkdir } from 'node:fs/promises';
import { assertSafeTestDatabase } from './database-safety';

test.setTimeout(360000);

const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const dbURL = process.env.DATABASE_URL || '';
test.beforeAll(() => {
  assertSafeTestDatabase(dbURL);
});
const suffix = Date.now().toString();
const memberEmail = 'membro-' + suffix + '@example.test';
const memberPassword = 'TesteSeguro!12345';
async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/(dashboard|inicio)$/);
}
async function fill(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await page.getByLabel(label, { exact: true }).fill(value);
}
async function waitForPage(page: Page) {
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByText('Carregando informações...')).toHaveCount(0);
}
test('fluxos ADMIN e MEMBER, persistência, autorização, PWA e responsividade', async ({
  browser,
  page,
}) => {
  const pool = new Pool({ connectionString: dbURL, max: 1 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await mkdir('artifacts/final', { recursive: true });
  await page.goto('/missas');
  await expect(page).toHaveURL(/sessao=expirada/);
  await page.goto('/');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'artifacts/final/login-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/final/login-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
  await login(page, process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
  const dashboardStats = page.locator('section[aria-label="Resumo da paróquia"] .tabular-nums');
  await expect(dashboardStats).toHaveCount(4);
  const dashboardCounts = await dashboardStats.allTextContents();
  await page.screenshot({ path: 'artifacts/final/dashboard-admin-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Nova missa', exact: true }).click();
  await fill(page, {
    Data: '2099-10-15',
    Horário: '07:00',
    Local: 'Matriz teste ' + suffix,
    Celebrante: 'Celebrante teste',
    'Descrição (opcional)': 'Registro de aceitação.',
  });
  const mutationPromise = page.waitForRequest(
    (req) => req.method() === 'POST' && !!req.headers()['next-action'],
  );
  await page.getByRole('button', { name: 'Nova missa', exact: true }).click();
  const captured: Request = await mutationPromise;
  await expect(page).toHaveURL(/\/missas\/[a-f0-9-]{36}$/);
  const massURL = page.url();
  const massId = massURL.split('/').pop()!;
  await expect(page.getByText('Missa cadastrada com sucesso')).toBeVisible();
  await page.reload();
  await expect(page.locator('dd').filter({ hasText: 'Matriz teste ' + suffix })).toBeVisible();
  await page.getByRole('link', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Celebrante', { exact: true }).fill('Celebrante atualizado');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.locator('dd').filter({ hasText: 'Celebrante atualizado' })).toBeVisible();
  await page.goto('/missas');
  await page.getByLabel('Pesquisar', { exact: true }).fill(suffix);
  await expect(page.locator('article')).toHaveCount(1);
  await page.getByLabel('Data', { exact: true }).fill('2099-10-15');
  await page.getByLabel('Local', { exact: true }).selectOption('Matriz teste ' + suffix);
  await expect(page.locator('article')).toHaveCount(1);
  await page.goto('/dashboard');
  await expect(dashboardStats.nth(1)).toHaveText(String(Number(dashboardCounts[1]) + 1));
  await page.goto('/membros/novo');
  await fill(page, {
    'Nome completo': 'Membro teste ' + suffix,
    'E-mail': memberEmail,
    'Telefone com DDD': '11999998888',
    'Comunidade (opcional)': 'Comunidade teste',
    Senha: memberPassword,
  });
  await page.getByRole('button', { name: 'Novo membro', exact: true }).click();
  await expect(page).toHaveURL(/\/membros\/[a-f0-9-]{36}$/);
  const memberURL = page.url();
  await page.getByRole('link', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Nome completo').fill('Membro atualizado ' + suffix);
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(
    page.getByRole('heading', { name: 'Membro atualizado ' + suffix, exact: true }),
  ).toBeVisible();
  await page.goto('/membros');
  await page.getByLabel('Buscar por nome, e-mail ou telefone').fill(memberEmail);
  await expect(page.locator('article')).toHaveCount(1);
  await page.goto('/dashboard');
  await expect(
    page.locator('section[aria-label="Resumo da paróquia"] .tabular-nums').first(),
  ).toHaveText(String(Number(dashboardCounts[0]) + 1));
  await page.goto('/eventos/novo');
  await fill(page, {
    Título: 'Evento teste ' + suffix,
    Data: '2099-10-15',
    Horário: '19:00',
    Local: 'Salão teste',
    'Descrição (opcional)': 'Encontro fictício.',
  });
  await page.getByRole('button', { name: 'Novo evento', exact: true }).click();
  await expect(page).toHaveURL(/\/eventos\/[a-f0-9-]{36}$/);
  const eventURL = page.url();
  await page.goto('/calendario');
  const monthPicker = page.getByLabel('Ir para o mês');
  await monthPicker.fill('2099-10');
  await expect(page.getByRole('heading', { name: 'outubro 2099' })).toBeVisible();
  await page.getByRole('button', { name: /15 de outubro de 2099/ }).click();
  await expect(page.getByRole('heading', { name: 'Evento teste ' + suffix })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'artifacts/final/calendario-desktop.png', fullPage: true });
  await page.goto('/avisos/novo');
  await fill(page, {
    Título: 'Aviso teste ' + suffix,
    Conteúdo: 'Aviso público fictício para teste.',
    'Data de publicação': '2020-01-01',
  });
  await page.getByRole('button', { name: 'Novo aviso', exact: true }).click();
  await expect(page).toHaveURL(/\/avisos\/[a-f0-9-]{36}$/);
  const noticeURL = page.url();
  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await login(memberPage, memberEmail, memberPassword);
  await expect(memberPage).toHaveURL('/inicio');
  await expect(memberPage.getByRole('heading', { name: 'Aviso teste ' + suffix })).toBeVisible();
  await memberPage.goto('/avisos');
  await expect(memberPage.getByRole('heading', { name: 'Aviso teste ' + suffix })).toBeVisible();
  // O mesmo banco é acessado por um contexto independente do navegador.
  await memberPage.goto(eventURL);
  await expect(memberPage.getByRole('heading', { name: 'Evento teste ' + suffix })).toBeVisible();
  await expect(memberPage.getByRole('link', { name: 'Editar', exact: true })).toHaveCount(0);
  for (const path of [
    '/missas/nova',
    '/membros',
    '/membros/novo',
    '/eventos/novo',
    '/avisos/novo',
    '/leituras/novo',
    '/configuracoes',
    massURL + '/editar',
  ]) {
    await memberPage.goto(path);
    await expect(memberPage).toHaveURL(/\/inicio\?acesso=negado/);
  }
  // Reenvia uma Server Action administrativa autêntica com o cookie de MEMBER.
  const before = await pool.query('select count(*)::int as n from masses');
  await memberContext.request.post(captured.url(), {
    headers: {
      origin,
      'next-action': captured.headers()['next-action'],
      'content-type': captured.headers()['content-type'],
    },
    data: captured.postData()!,
    maxRedirects: 0,
  });
  const after = await pool.query('select count(*)::int as n from masses');
  expect(after.rows[0].n).toBe(before.rows[0].n);
  const csrf = await memberContext.request.post('/api/auth/logout', {
    headers: { origin: 'https://malicious.example' },
  });
  expect(csrf.status()).toBe(403);
  await memberPage.goto('/perfil');
  await memberPage.getByLabel('Nome completo').fill('Perfil atualizado ' + suffix);
  await memberPage.getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(memberPage.getByText('Perfil atualizado com sucesso')).toBeVisible();
  await memberPage.reload();
  await expect(memberPage.getByLabel('Nome completo')).toHaveValue('Perfil atualizado ' + suffix);
  expect(
    await memberPage.evaluate(() => Object.keys(localStorage).filter((k) => /churchApp/.test(k))),
  ).toEqual([]);
  const viewports = [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];
  for (const viewport of viewports) {
    await memberPage.setViewportSize(viewport);
    for (const route of [
      '/inicio',
      '/missas',
      '/calendario',
      '/leituras',
      '/eventos',
      '/avisos',
      '/perfil',
    ]) {
      await memberPage.goto(route);
      await expect(memberPage.locator('h1')).toBeVisible();
      expect(
        await memberPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        route + ' @ ' + viewport.width,
      ).toBe(true);
    }
    await page.setViewportSize(viewport);
    for (const route of [
      '/dashboard',
      '/membros',
      '/missas/nova',
      '/eventos/novo',
      '/avisos/novo',
      '/leituras/novo',
    ]) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        route + ' @ ' + viewport.width,
      ).toBe(true);
    }
  }
  await memberPage.setViewportSize({ width: 390, height: 844 });
  await memberPage.goto('/inicio');
  await waitForPage(memberPage);
  await memberPage.screenshot({ path: 'artifacts/final/home-member-mobile.png', fullPage: true });
  await expect(memberPage.getByRole('navigation', { name: 'Navegação móvel' })).toBeVisible();
  await memberPage.goto('/missas');
  await waitForPage(memberPage);
  await memberPage.screenshot({ path: 'artifacts/final/missas-member-mobile.png', fullPage: true });
  await memberPage.getByRole('link', { name: 'Agenda', exact: true }).click();
  await expect(memberPage).toHaveURL('/calendario');
  await waitForPage(memberPage);
  await memberPage.screenshot({ path: 'artifacts/final/calendario-mobile.png', fullPage: true });
  await memberPage.getByRole('link', { name: 'Leituras', exact: true }).click();
  await expect(memberPage).toHaveURL('/leituras');
  await waitForPage(memberPage);
  await memberPage.screenshot({ path: 'artifacts/final/leituras-mobile.png', fullPage: true });
  await memberPage.getByRole('button', { name: 'Mais opções' }).click();
  await expect(memberPage.getByRole('dialog')).toBeVisible();
  await memberPage.getByRole('dialog').getByRole('link', { name: 'Eventos', exact: true }).click();
  await expect(memberPage).toHaveURL('/eventos');
  await expect(memberPage.getByRole('dialog')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard');
  await waitForPage(page);
  await page.screenshot({ path: 'artifacts/final/dashboard-admin-mobile.png', fullPage: true });
  await page.goto('/missas');
  await waitForPage(page);
  await page.screenshot({ path: 'artifacts/final/missas-admin-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dashboard');
  await waitForPage(page);
  await page.screenshot({ path: 'artifacts/final/dashboard-admin-desktop.png', fullPage: true });
  const cookies = await memberContext.cookies();
  const session = cookies.find((c) => c.name === 'paroquia_session')!;
  expect(session.httpOnly).toBe(true);
  expect(session.sameSite).toBe('Lax');
  await memberPage.getByRole('button', { name: 'Mais opções' }).click();
  await memberPage.getByRole('dialog').getByRole('button', { name: 'Sair da conta' }).click();
  await expect(memberPage).toHaveURL('/');
  await memberPage.goto('/perfil');
  await expect(memberPage).toHaveURL(/sessao=expirada/);
  const registration = await memberContext.request.post('/api/auth/register', {
    headers: { origin },
    data: {
      name: 'Cadastro público ' + suffix,
      email: 'registro-' + suffix + '@example.test',
      phone: '11988887777',
      community: 'Matriz',
      password: memberPassword,
      confirmPassword: memberPassword,
      role: 'ADMIN',
    },
  });
  expect(registration.status()).toBe(201);
  const registered = await pool.query('select role,password_hash from users where email=$1', [
    'registro-' + suffix + '@example.test',
  ]);
  expect(registered.rows[0].role).toBe('MEMBER');
  expect(registered.rows[0].password_hash).toMatch(/^scrypt:/);
  await memberPage.goto('/inicio');
  await expect(memberPage).toHaveURL('/inicio');
  await pool.query(
    "update sessions set expires_at=now()-interval '1 day' where user_id=(select id from users where email=$1)",
    ['registro-' + suffix + '@example.test'],
  );
  await memberPage.reload();
  await expect(memberPage).toHaveURL(/sessao=expirada/);
  await page.goto(massURL);
  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(page).toHaveURL('/missas');
  expect((await pool.query('select id from masses where id=$1', [massId])).rows).toHaveLength(0);
  for (const url of [eventURL, noticeURL, memberURL]) {
    await page.goto(url);
    await page.getByRole('button', { name: 'Excluir', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
    await expect(page).not.toHaveURL(url);
  }
  await pool.query('delete from users where email=$1', ['registro-' + suffix + '@example.test']);
  await page.goto('/dashboard');
  await expect(
    page.locator('section[aria-label="Resumo da paróquia"] .tabular-nums').first(),
  ).toHaveText(dashboardCounts[0]);
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    return (
      await Promise.all(
        keys.map(async (k) =>
          (await (await caches.open(k)).keys()).map((r) => new URL(r.url).pathname),
        ),
      )
    ).flat();
  });
  expect(cached).not.toContain('/dashboard');
  expect(cached).not.toContain('/inicio');
  expect(cached).toContain('/offline.html');
  await page.context().setOffline(true);
  await page.goto('/missas');
  await expect(page.getByRole('heading', { name: 'Estamos aguardando sua conexão' })).toBeVisible();
  await page.context().setOffline(false);
  expect(errors).toEqual([]);
  const adminLogout = await page.request.post('/api/auth/logout', { headers: { origin } });
  expect(adminLogout.status()).toBe(200);
  await pool.end();
  await memberContext.close();
});
