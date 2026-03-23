// Lim Rui Ting Valencia, A0255150N
import { expect, test } from '@playwright/test';
import { getOrCreateRuntimeUser, login } from './helpers/auth';

test.describe('Access control journeys', () => {
  test('non-admin user cannot access admin users route', async ({ page }) => {
    const userCreds = await getOrCreateRuntimeUser(page);
    await login(page, userCreds);

    await page.goto('/dashboard/admin/users');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('LOGIN FORM')).toBeVisible();
  });

  test('logged-out user cannot access profile route directly', async ({ page }) => {
    await page.goto('/dashboard/user/profile', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('LOGIN FORM')).toBeVisible();
  });
});
