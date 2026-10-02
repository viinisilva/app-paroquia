import { test, expect } from '@playwright/test';

test('login ADMIN, sessão persistente e logout sem alterar dados de negócio', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 500) errors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(process.env.SEED_ADMIN_EMAIL!);
  await page.getByLabel('Senha', { exact: true }).fill(process.env.SEED_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Olá, Administrador' })).toBeVisible();

  const session = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'paroquia_session',
  );
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe('Lax');
  expect(session?.value).toMatch(/^[a-f0-9]{64}$/);
  expect(
    await page.evaluate(() => Object.keys(localStorage).filter((key) => /churchApp/.test(key))),
  ).toEqual([]);

  await page.reload();
  await expect(page).toHaveURL('/dashboard');
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/sessao=expirada/);
  expect(errors).toEqual([]);
});
