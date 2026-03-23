import { expect, test } from '@playwright/test';
import { getCredentials, getOrCreateRuntimeUser, goToDashboardFromHeader, hasRequiredEnv, login } from './helpers/auth';

const hasCreds = hasRequiredEnv([
  'E2E_ADMIN_EMAIL',
  'E2E_ADMIN_PASSWORD',
]);
const adminCreds = getCredentials('E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD');

test.describe('Admin users directory journey', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this test.');

  test('admin navigates to users page and sees newly registered customer row', async ({ page }) => {
    const userCreds = await getOrCreateRuntimeUser(page);

    await login(page, adminCreds);
    await goToDashboardFromHeader(page);
    await expect(page).toHaveURL(/\/dashboard\/admin$/);

    await page.getByRole('link', { name: 'Users' }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/users$/);

    const customerRow = page.locator('tr', { hasText: userCreds.email }).first();
    await expect(customerRow).toBeVisible();
    await expect(customerRow).toContainText('User');
  });

  test('admin users page handles fetch failure', async ({ page }) => {
    await login(page, adminCreds);
    await goToDashboardFromHeader(page);
    await expect(page).toHaveURL(/\/dashboard\/admin$/);

    await page.route('**/api/v1/auth/users', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Forced users failure' }),
      });
    });

    await page.getByRole('link', { name: 'Users' }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/users$/);
    await expect(page.getByText('No users')).toBeVisible();
  });
});
