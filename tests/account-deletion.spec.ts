import { test, expect } from '@playwright/test';
import { Pool } from 'pg';
import AxeBuilder from '@axe-core/playwright';
import { hashPassword } from '../lib/password';
import { assertSafeTestDatabase } from './database-safety';

test.use({ trace: 'off', screenshot: 'off' });

const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const dbURL = process.env.DATABASE_URL || '';
const suffix = Date.now();
const email = `exclusao-${suffix}@example.test`;
const otherEmail = `intacto-${suffix}@example.test`;
const password = 'SenhaDeTeste!12345';

test.beforeAll(() => assertSafeTestDatabase(dbURL));

test('páginas públicas de privacidade e exclusão são acessíveis no celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/privacidade', '/excluir-conta']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(result.violations).toEqual([]);
  }
});

test('exclusão exige sessão, origem e confirmação; remove só a própria conta e todas as sessões', async ({
  browser,
  request,
}) => {
  const pool = new Pool({ connectionString: dbURL, max: 1 });
  const first = await browser.newContext();
  const second = await browser.newContext();
  const other = await browser.newContext();
  try {
    const anonymous = await request.post(`${origin}/api/account/delete`, {
      headers: { origin },
      data: { password, confirmation: 'EXCLUIR' },
    });
    expect(anonymous.status()).toBe(401);

    for (const [context, currentEmail] of [
      [first, email],
      [other, otherEmail],
    ] as const) {
      const response = await context.request.post(`${origin}/api/auth/register`, {
        headers: { origin },
        data: {
          name: 'Pessoa de Teste',
          email: currentEmail,
          phone: '11999998888',
          community: 'Matriz',
          password,
          confirmPassword: password,
        },
      });
      expect(response.status()).toBe(201);
    }
    const secondLogin = await second.request.post(`${origin}/api/auth/login`, {
      headers: { origin },
      data: { email, password },
    });
    expect(secondLogin.status()).toBe(200);
    const before = await pool.query<{ id: string }>('select id from users where email = $1', [
      email,
    ]);
    const deletedUserId = before.rows[0].id;
    expect(
      (await pool.query('select 1 from sessions where user_id = $1', [deletedUserId])).rowCount,
    ).toBe(2);

    expect(
      (
        await first.request.post(`${origin}/api/account/delete`, {
          headers: { origin: 'https://invalid.example' },
          data: { password, confirmation: 'EXCLUIR' },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await first.request.post(`${origin}/api/account/delete`, {
          headers: { origin },
          data: { password, confirmation: 'não' },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await first.request.post(`${origin}/api/account/delete`, {
          headers: { origin },
          data: { password: 'SenhaErrada!123', confirmation: 'EXCLUIR' },
        })
      ).status(),
    ).toBe(401);

    const profile = await first.newPage();
    await profile.goto(`${origin}/perfil`);
    await profile.getByRole('button', { name: 'Excluir minha conta' }).click();
    await expect(
      profile.getByRole('heading', { name: 'Excluir sua conta permanentemente?' }),
    ).toBeVisible();
    await profile.getByLabel('Senha atual').fill(password);
    await profile.getByLabel('Digite EXCLUIR').fill('EXCLUIR');
    await profile.getByRole('button', { name: 'Excluir minha conta' }).last().click();
    await expect(profile).toHaveURL(/conta=excluida/);
    await expect(profile.getByText('Sua conta foi excluída.')).toBeVisible();

    const rows = await pool.query('select email from users where email = any($1::text[])', [
      [email, otherEmail],
    ]);
    expect(rows.rows.map((row: { email: string }) => row.email)).toEqual([otherEmail]);
    expect(
      (await pool.query('select 1 from sessions where user_id = $1', [deletedUserId])).rowCount,
    ).toBe(0);
    expect((await second.request.get(`${origin}/perfil`, { maxRedirects: 0 })).status()).toBe(307);
    const removedLogin = await request.post(`${origin}/api/auth/login`, {
      headers: { origin },
      data: { email, password },
    });
    expect(removedLogin.status()).toBe(401);
    expect((await other.request.get(`${origin}/perfil`, { maxRedirects: 0 })).status()).toBe(200);
  } finally {
    await first.close();
    await second.close();
    await other.close();
    await pool.query('delete from users where email = any($1::text[])', [[email, otherEmail]]);
    await pool.end();
  }
});

test('último ADMIN não é removido', async ({ browser }) => {
  const pool = new Pool({ connectionString: dbURL, max: 1 });
  const admin = await browser.newContext();
  const adminEmail = `admin-exclusao-${suffix}@example.test`;
  try {
    const existing = await pool.query("select 1 from users where role = 'ADMIN'");
    expect(existing.rowCount).toBe(0);
    await pool.query(
      "insert into users (name, email, phone, password_hash, community, role) values ($1, $2, $3, $4, $5, 'ADMIN')",
      ['Admin local', adminEmail, '11999998888', await hashPassword(password), 'Matriz'],
    );
    expect(
      (
        await admin.request.post(`${origin}/api/auth/login`, {
          headers: { origin },
          data: { email: adminEmail, password },
        })
      ).status(),
    ).toBe(200);
    const deletion = await admin.request.post(`${origin}/api/account/delete`, {
      headers: { origin },
      data: { password, confirmation: 'EXCLUIR' },
    });
    expect(deletion.status()).toBe(409);
    expect((await pool.query('select 1 from users where email = $1', [adminEmail])).rowCount).toBe(
      1,
    );
  } finally {
    await admin.close();
    await pool.query('delete from users where email = $1', [adminEmail]);
    await pool.end();
  }
});
