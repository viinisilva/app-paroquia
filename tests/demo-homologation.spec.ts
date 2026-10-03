import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { Pool } from 'pg';
import { tokenHash } from '../lib/password';
import { addDays, buildDemoData, demoIds } from '../scripts/demo-data';
import { assertSafeTestDatabase } from './database-safety';

test.setTimeout(480000);

const databaseUrl = process.env.DATABASE_URL || '';
const memberEmail = process.env.DEMO_MEMBER_EMAIL || '';
const memberPassword = process.env.DEMO_MEMBER_PASSWORD || '';
const suffix = Date.now().toString();
const temporary = {
  massLocation: `Capela de homologação ${suffix}`,
  eventTitle: `Encontro de homologação ${suffix}`,
  updatedEventTitle: `Encontro de homologação atualizado ${suffix}`,
  noticeTitle: `Comunicado de homologação ${suffix}`,
};

test.beforeAll(() => assertSafeTestDatabase(databaseUrl));
test.skip(!memberEmail || !memberPassword, 'Credencial MEMBER DEMO não configurada.');

async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/(dashboard|inicio)$/);
}

async function logout(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click();
  await expect(page).toHaveURL('/');
}

async function fill(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await page.getByLabel(label, { exact: true }).fill(value);
}

async function waitForPage(page: Page) {
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByText('Carregando informações...')).toHaveCount(0);
}

async function selectCalendarDate(page: Page, date: string) {
  const label = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
  await page.getByLabel('Ir para o mês').fill(date.slice(0, 7));
  await page.getByRole('button', { name: `${label}, 2 atividade(s)` }).click();
  await expect(page.getByText('Missa • 07:30', { exact: true })).toBeVisible();
  await expect(page.getByText('Evento • 16:00', { exact: true })).toBeVisible();
}

async function removeRecord(page: Page, url: string) {
  await page.goto(url);
  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(page).not.toHaveURL(url);
}

async function expectNoHorizontalOverflow(page: Page, routes: string[]) {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      route,
    ).toBe(true);
  }
}

async function clearDemoEmailLimits(pool: Pool) {
  const keys = [
    tokenHash(`email:${process.env.SEED_ADMIN_EMAIL!.toLowerCase()}`),
    tokenHash(`email:${memberEmail.toLowerCase()}`),
  ];
  await pool.query('delete from auth_attempts where key = any($1::varchar[])', [keys]);
}

test('homologação completa com dados DEMO persistentes', async ({ browser }) => {
  const data = buildDemoData(memberEmail);
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const adminContext = await browser.newContext({ locale: 'pt-BR' });
  const memberContext = await browser.newContext({ locale: 'pt-BR' });
  const admin = await adminContext.newPage();
  const member = await memberContext.newPage();
  let massUrl = '';
  let eventUrl = '';
  let noticeUrl = '';

  try {
    await clearDemoEmailLimits(pool);
    await mkdir('artifacts/demo', { recursive: true });
    await admin.setViewportSize({ width: 390, height: 844 });
    await admin.goto('/');
    await admin.screenshot({ path: 'artifacts/demo/login-mobile.png', fullPage: true });

    await admin.setViewportSize({ width: 1440, height: 900 });
    await login(admin, process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
    const stats = admin.locator('section[aria-label="Resumo da paróquia"] .tabular-nums');
    await expect(stats).toHaveText(['6', '4', '3', '3']);
    await expect(admin.getByText('Igreja Matriz', { exact: true }).first()).toBeVisible();

    await admin.goto('/missas');
    await admin.getByLabel('Pesquisar', { exact: true }).fill('Comunidade São José');
    await expect(admin.locator('article')).toHaveCount(1);
    await admin.getByLabel('Data', { exact: true }).fill(data.masses[1].date);
    await admin.getByLabel('Local', { exact: true }).selectOption('Comunidade São José');
    await expect(admin.locator('article')).toHaveCount(1);

    await admin.goto('/membros');
    const memberSearch = admin.getByLabel('Buscar por nome, e-mail ou telefone', { exact: true });
    await memberSearch.fill('Beatriz Ferreira');
    await expect(admin.getByRole('heading', { name: 'Beatriz Ferreira' })).toBeVisible();
    await memberSearch.fill('beatriz.ferreira.demo@example.com');
    await expect(admin.locator('article')).toHaveCount(1);
    await admin.goto(`/membros/${demoIds.users[4]}/editar`);
    await admin.getByLabel('Comunidade (opcional)').fill('Pastoral da Acolhida');
    await admin.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(admin.getByText('Pastoral da Acolhida', { exact: true })).toBeVisible();
    await admin.reload();
    await expect(admin.getByText('Pastoral da Acolhida', { exact: true })).toBeVisible();

    const temporaryDate = addDays(data.today, 5);
    await admin.goto('/missas/nova');
    await fill(admin, {
      Data: temporaryDate,
      Horário: '17:45',
      Local: temporary.massLocation,
      Celebrante: 'Pe. responsável pela homologação',
      'Descrição (opcional)': 'Registro temporário criado para validar o fluxo completo.',
    });
    await admin.getByRole('button', { name: 'Nova missa', exact: true }).click();
    await expect(admin).toHaveURL(/\/missas\/[a-f0-9-]{36}$/);
    massUrl = admin.url();

    await admin.goto('/eventos/novo');
    await fill(admin, {
      Título: temporary.eventTitle,
      Data: temporaryDate,
      Horário: '20:00',
      Local: 'Salão Paroquial',
      'Descrição (opcional)': 'Registro temporário do fluxo ADMIN para MEMBER.',
    });
    await admin.getByRole('button', { name: 'Novo evento', exact: true }).click();
    await expect(admin).toHaveURL(/\/eventos\/[a-f0-9-]{36}$/);
    eventUrl = admin.url();

    await admin.goto('/avisos/novo');
    await fill(admin, {
      Título: temporary.noticeTitle,
      Conteúdo: 'Comunicado temporário criado para a homologação do fluxo entre perfis.',
      'Data de publicação': data.today,
    });
    await admin.getByRole('button', { name: 'Novo aviso', exact: true }).click();
    await expect(admin).toHaveURL(/\/avisos\/[a-f0-9-]{36}$/);
    noticeUrl = admin.url();
    await logout(admin);

    await login(member, memberEmail, memberPassword);
    await expect(member).toHaveURL('/inicio');
    await member.goto(massUrl);
    await expect(member.getByText(temporary.massLocation, { exact: true })).toBeVisible();
    await expect(member.getByRole('link', { name: 'Editar', exact: true })).toHaveCount(0);
    await member.goto(eventUrl);
    await expect(member.getByRole('heading', { name: temporary.eventTitle })).toBeVisible();
    await member.goto('/avisos');
    await expect(member.getByRole('heading', { name: temporary.noticeTitle })).toBeVisible();
    for (const path of [
      '/dashboard',
      '/membros',
      '/missas/nova',
      '/eventos/novo',
      '/avisos/novo',
      '/leituras/novo',
      `${massUrl}/editar`,
    ]) {
      await member.goto(path);
      await expect(member).toHaveURL(/\/inicio\?acesso=negado/);
    }
    await logout(member);

    await login(admin, process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
    await admin.goto(`${eventUrl}/editar`);
    await admin.getByLabel('Título', { exact: true }).fill(temporary.updatedEventTitle);
    await admin.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(admin.getByRole('heading', { name: temporary.updatedEventTitle })).toBeVisible();

    const originalReading = data.readings[0];
    const updatedReading = `${originalReading.content} Revisão persistida durante a homologação.`;
    await admin.goto(`/leituras/${originalReading.id}/editar`);
    await admin.getByLabel('Texto autorizado').fill(updatedReading);
    await admin.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(admin.getByText(updatedReading, { exact: true })).toBeVisible();
    await logout(admin);

    await login(member, memberEmail, memberPassword);
    await member.goto(eventUrl);
    await expect(member.getByRole('heading', { name: temporary.updatedEventTitle })).toBeVisible();
    await member.goto(`/leituras?date=${data.today}`);
    await expect(member.getByText(updatedReading, { exact: true })).toBeVisible();
    await member.reload();
    await expect(member.getByText(updatedReading, { exact: true })).toBeVisible();
    await logout(member);

    await login(admin, process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
    await removeRecord(admin, massUrl);
    await removeRecord(admin, eventUrl);
    await removeRecord(admin, noticeUrl);
    await admin.goto(`/leituras/${originalReading.id}/editar`);
    await admin.getByLabel('Texto autorizado').fill(originalReading.content);
    await admin.getByRole('button', { name: 'Salvar alterações' }).click();
    await admin.goto(`/membros/${demoIds.users[4]}/editar`);
    await admin.getByLabel('Comunidade (opcional)').fill(data.members[4].community);
    await admin.getByRole('button', { name: 'Salvar alterações' }).click();
    await logout(admin);

    await login(member, memberEmail, memberPassword);
    await member.goto('/missas');
    await member.getByLabel('Pesquisar', { exact: true }).fill(suffix);
    await expect(member.locator('article')).toHaveCount(0);
    await member.goto('/eventos');
    await member.getByLabel('Pesquisar', { exact: true }).fill(suffix);
    await expect(member.locator('article')).toHaveCount(0);
    await member.goto('/avisos');
    await member.getByLabel('Pesquisar', { exact: true }).fill(suffix);
    await expect(member.locator('article')).toHaveCount(0);

    for (const viewport of [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
    ]) {
      await member.setViewportSize(viewport);
      await expectNoHorizontalOverflow(member, [
        '/inicio',
        '/missas',
        '/calendario',
        `/leituras?date=${data.today}`,
        '/eventos',
        '/avisos',
        '/perfil',
      ]);
    }

    await member.setViewportSize({ width: 390, height: 844 });
    await member.goto('/inicio');
    await waitForPage(member);
    await member.screenshot({ path: 'artifacts/demo/home-member-mobile.png' });
    await member.goto('/perfil');
    await waitForPage(member);
    await member.screenshot({ path: 'artifacts/demo/perfil-member-mobile.png' });
    await member.goto(`/leituras?date=${addDays(data.today, 30)}`);
    await expect(member.getByText('Leituras ainda não publicadas para esta data.')).toBeVisible();
    await member.goto(`/leituras?date=${data.today}`);
    await expect(member.getByText(originalReading.content, { exact: true })).toBeVisible();

    const memberAxe = await new AxeBuilder({ page: member }).analyze();
    expect(memberAxe.violations).toEqual([]);
    await member.setViewportSize({ width: 1440, height: 900 });
    await member.goto('/inicio');
    await waitForPage(member);
    await member.screenshot({ path: 'artifacts/demo/home-member-desktop.png', fullPage: true });
    await logout(member);

    await login(admin, process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
    for (const viewport of [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
    ]) {
      await admin.setViewportSize(viewport);
      await expectNoHorizontalOverflow(admin, [
        '/dashboard',
        '/missas',
        '/calendario',
        '/membros',
        '/eventos',
        '/avisos',
        `/leituras?date=${data.today}`,
        '/configuracoes',
      ]);
    }

    await admin.setViewportSize({ width: 390, height: 844 });
    for (const [route, name] of [
      ['/dashboard', 'visao-geral-admin-mobile.png'],
      ['/missas', 'missas-mobile.png'],
      ['/calendario', 'calendario-mobile.png'],
      ['/membros', 'membros-mobile.png'],
      ['/eventos', 'eventos-mobile.png'],
      ['/avisos', 'avisos-mobile.png'],
      [`/leituras?date=${data.today}`, 'leituras-mobile.png'],
    ]) {
      await admin.goto(route);
      await waitForPage(admin);
      if (route === '/calendario') await selectCalendarDate(admin, data.masses[0].date);
      if (route === '/membros') {
        await admin
          .getByLabel('Buscar por nome, e-mail ou telefone', { exact: true })
          .fill('.demo@example.com');
        await expect(admin.locator('article')).toHaveCount(5);
      }
      await admin.screenshot({ path: `artifacts/demo/${name}`, fullPage: true });
    }
    await admin.goto('/dashboard');
    await waitForPage(admin);
    const adminAxe = await new AxeBuilder({ page: admin }).analyze();
    expect(adminAxe.violations).toEqual([]);

    await admin.setViewportSize({ width: 1440, height: 900 });
    await admin.goto('/dashboard');
    await waitForPage(admin);
    await admin.screenshot({
      path: 'artifacts/demo/visao-geral-admin-desktop.png',
      fullPage: true,
    });
    await admin.goto('/calendario');
    await waitForPage(admin);
    await selectCalendarDate(admin, data.masses[0].date);
    await admin.screenshot({ path: 'artifacts/demo/calendario-desktop.png', fullPage: true });
    await logout(admin);

    const finalCounts = await pool.query<{
      users: number;
      masses: number;
      events: number;
      notices: number;
      readings: number;
    }>(`select
      (select count(*)::int from users) as users,
      (select count(*)::int from masses) as masses,
      (select count(*)::int from events) as events,
      (select count(*)::int from notices) as notices,
      (select count(*)::int from readings) as readings`);
    expect(finalCounts.rows[0]).toEqual({
      users: 6,
      masses: 4,
      events: 3,
      notices: 3,
      readings: 7,
    });
  } finally {
    await pool.query('delete from masses where location = $1', [temporary.massLocation]);
    await pool.query('delete from events where title in ($1, $2)', [
      temporary.eventTitle,
      temporary.updatedEventTitle,
    ]);
    await pool.query('delete from notices where title = $1', [temporary.noticeTitle]);
    await pool.query('update readings set content = $1 where id = $2', [
      data.readings[0].content,
      data.readings[0].id,
    ]);
    await pool.query('update users set community = $1 where id = $2', [
      data.members[4].community,
      data.members[4].id,
    ]);
    await clearDemoEmailLimits(pool);
    await pool.end();
    await adminContext.close();
    await memberContext.close();
  }
});
