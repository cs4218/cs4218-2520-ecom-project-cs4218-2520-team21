import { expect, test } from '@playwright/test';
import {
  getCredentials,
  getOrCreateRuntimeUser,
  goToDashboardFromHeader,
  hasRequiredEnv,
  login,
  logout,
} from './helpers/auth';

const hasCreds = hasRequiredEnv([
  'E2E_ADMIN_EMAIL',
  'E2E_ADMIN_PASSWORD',
]);
const adminCreds = getCredentials('E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD');

test.describe('Cross-role order status sync journey', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this test.');

  test('admin changes status to Shipped and customer sees it in own orders', async ({ page }) => {
    const userCreds = await getOrCreateRuntimeUser(page);

    await login(page, adminCreds);
    await goToDashboardFromHeader(page);
    await expect(page).toHaveURL(/\/dashboard\/admin$/);

    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/orders$/);

    const targetOrder = page.locator('.border.shadow').first();
    await expect(targetOrder).toBeVisible();

    await targetOrder.locator('.ant-select').first().click();
    await page.locator('.ant-select-item-option-content', { hasText: 'Shipped' }).first().click();

    await expect(page.locator('.border.shadow').first().locator('.ant-select-selection-item')).toHaveText('Shipped');

    await page.reload();
    await expect(page.locator('.border.shadow', { hasText: 'Shipped' }).first()).toBeVisible();

    await logout(page);

    await login(page, userCreds);
    await goToDashboardFromHeader(page);
    await expect(page).toHaveURL(/\/dashboard\/user$/);

    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page).toHaveURL(/\/dashboard\/user\/orders$/);
    await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
  });
});
