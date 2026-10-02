import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Pool } from 'pg';
import { mkdir } from 'node:fs/promises';
import { today } from '../lib/dates';
import { assertSafeTestDatabase } from './database-safety';
const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
test('cadastro pela interface, avisos agendados, leituras e acessibilidade', async ({
  page,
  browser,
}) => {
  const dbURL = process.env.DATABASE_URL!;
  assertSafeTestDatabase(dbURL);
  const pool = new Pool({ connectionString: dbURL, max: 1 });
  const suffix = Date.now();
  const email = 'ui-' + suffix + '@example.test';
  const readingDate = new Date(Date.UTC(2099, 0, 1 + (suffix % 730))).toISOString().slice(0, 10);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/cadastro');
  await page.getByLabel('Nome completo').fill('Maria de Teste');
  await page.getByLabel('Telefone com DDD').fill('11999998888');
  await page.getByLabel('Comunidade (opcional)').fill('Matriz');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('SenhaSegura!12345');
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Diferente!123');
  await page.getByRole('button', { name: 'Criar minha conta' }).click();
  await expect(page.getByText('As senhas não coincidem.')).toBeVisible();
  await page.getByLabel('Confirmar senha', { exact: true }).fill('SenhaSegura!12345');
  await page.getByRole('button', { name: 'Criar minha conta' }).click();
  await expect(page).toHaveURL('/inicio');
  const adminContext = await browser.newContext({ locale: 'pt-BR' });
  const admin = await adminContext.newPage();
  const login = await adminContext.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
  });
  expect(login.status()).toBe(200);
  await admin.goto('/avisos/novo');
  await admin.getByLabel('Título', { exact: true }).fill('Aviso agendado ' + suffix);
  await admin.getByLabel('Conteúdo', { exact: true }).fill('Conteúdo restrito até a publicação.');
  await admin.getByLabel('Data de publicação').fill('2099-10-15');
  await admin.getByRole('button', { name: 'Novo aviso', exact: true }).click();
  await expect(admin).toHaveURL(/\/avisos\/[a-f0-9-]{36}$/);
  const noticeURL = admin.url();
  await page.goto(noticeURL);
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await admin.getByRole('link', { name: 'Editar', exact: true }).click();
  await admin.getByLabel('Data de publicação').fill(today());
  await admin.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(admin).toHaveURL(noticeURL);
  await page.goto('/inicio');
  await expect(page.getByRole('heading', { name: 'Aviso agendado ' + suffix })).toBeVisible();
  await admin.goto('/leituras/novo');
  await admin.getByLabel('Data', { exact: true }).fill(readingDate);
  await admin.getByLabel('Título da celebração').fill('Fixture de leitura ' + suffix);
  await admin.getByLabel('Tipo', { exact: true }).selectOption('GOSPEL');
  await admin.getByLabel('Referência bíblica').fill('Referência de teste — não litúrgica');
  await admin
    .getByLabel('Texto autorizado')
    .fill('Texto técnico de teste. Não representa conteúdo litúrgico.');
  await admin
    .getByLabel('Fonte / referência editorial')
    .fill('Fixture automatizada, sem uso religioso.');
  await admin.getByRole('button', { name: 'Nova leitura', exact: true }).click();
  await expect(admin).toHaveURL(/\/leituras\/[a-f0-9-]{36}$/);
  const readingURL = admin.url();
  await page.goto('/leituras?date=' + readingDate);
  await expect(page.getByText('Evangelho', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fixture de leitura ' + suffix })).toBeVisible();
  await mkdir('artifacts/final', { recursive: true });
  await page.screenshot({ path: 'artifacts/final/leituras-populadas-mobile.png', fullPage: true });
  for (const route of ['/inicio', '/calendario', '/perfil', '/leituras?date=' + readingDate]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      route,
    ).toEqual([]);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 812, height: 375 });
  await page.goto('/calendario');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await admin.setViewportSize({ width: 1440, height: 1000 });
  await admin.goto('/dashboard');
  await admin.getByRole('button', { name: 'Recolher menu' }).click();
  await expect(admin.getByRole('button', { name: 'Expandir menu' })).toBeVisible();
  await admin.getByRole('button', { name: 'Expandir menu' }).click();
  const results = await new AxeBuilder({ page: admin })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  const adminRecord = (
    await pool.query('select id from users where email=$1', [process.env.SEED_ADMIN_EMAIL])
  ).rows[0];
  await admin.goto('/membros/' + adminRecord.id);
  await admin.getByRole('button', { name: 'Excluir', exact: true }).click();
  await admin.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(
    admin.getByText('Contas administrativas não podem ser excluídas por esta tela.'),
  ).toBeVisible();
  await admin.getByRole('button', { name: 'Cancelar', exact: true }).click();
  for (const url of [noticeURL, readingURL]) {
    await admin.goto(url);
    await admin.getByRole('button', { name: 'Excluir', exact: true }).click();
    await admin.getByRole('button', { name: 'Confirmar exclusão' }).click();
    await expect(admin).not.toHaveURL(url);
  }
  await pool.query('delete from users where email=$1', [email]);
  const adminLogout = await adminContext.request.post('/api/auth/logout', { headers: { origin } });
  expect(adminLogout.status()).toBe(200);
  await pool.end();
  await adminContext.close();
});
