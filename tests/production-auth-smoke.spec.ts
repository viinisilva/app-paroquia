import { test, expect, type Page } from '@playwright/test';

// Erros de hidratação (ex.: React #418) chegam como console.error, não como pageerror.
function watchErrors(page: Page, label: string, errors: string[]) {
  page.on('pageerror', (error) => errors.push(`${label} pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${label} console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 500) errors.push(`${label} ${response.status()} ${response.url()}`);
  });
}

test('login ADMIN, sessão persistente e logout sem alterar dados de negócio', async ({ page }) => {
  const errors: string[] = [];
  watchErrors(page, 'principal', errors);

  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(process.env.SEED_ADMIN_EMAIL!);
  await page.getByLabel('Senha', { exact: true }).fill(process.env.SEED_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Visão Geral', exact: true })).toBeVisible();

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

  // Aba aberta com a sessão ativa, que continua aberta depois do logout.
  const oldTab = await page.context().newPage();
  watchErrors(oldTab, 'aba antiga', errors);
  await oldTab.goto('/dashboard');
  await expect(oldTab.getByRole('heading', { name: 'Visão Geral', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/sessao=expirada/);

  await oldTab.getByRole('link', { name: 'Missas', exact: true }).first().click();
  await expect(oldTab).toHaveURL(/sessao=expirada/);
  await oldTab.reload();
  await expect(oldTab.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();

  const newTab = await page.context().newPage();
  watchErrors(newTab, 'aba nova', errors);
  await newTab.goto('/');
  await expect(newTab.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();

  expect(errors).toEqual([]);
});
