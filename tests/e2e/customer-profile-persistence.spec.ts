import { expect, test } from '@playwright/test';
import { getOrCreateRuntimeUser, goToDashboardFromHeader, login } from './helpers/auth';

test.describe('Profile update persistence journey', () => {
  test('customer updates profile and sees persisted values in dashboard', async ({ page }) => {
    const userCreds = await getOrCreateRuntimeUser(page);
    const suffix = `${Date.now()}`;
    const newName = `E2E User ${suffix}`;
    const newPhone = `9${suffix.slice(-7)}`;
    const newAddress = `E2E Address ${suffix}`;

    await login(page, userCreds);
    await goToDashboardFromHeader(page);
    await expect(page).toHaveURL(/\/dashboard\/user$/);

    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/\/dashboard\/user\/profile$/);

    await page.getByPlaceholder(/Enter Your Name/i).fill(newName);
    await page.getByPlaceholder(/Enter Your Phone/i).fill(newPhone);
    await page.getByPlaceholder(/Enter Your Address/i).fill(newAddress);
    await page.getByRole('button', { name: 'UPDATE' }).click();

    await expect(page.getByText(/Profile Updated Successfully/i)).toBeVisible();

    await goToDashboardFromHeader(page);
    await expect(page).toHaveURL(/\/dashboard\/user$/);
    await expect(page.getByRole('heading', { name: newName })).toBeVisible();
    await expect(page.getByText(newAddress)).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: newName })).toBeVisible();
    await expect(page.getByText(newAddress)).toBeVisible();
  });

  test('profile update fails validation for short password', async ({ page }) => {
    const userCreds = await getOrCreateRuntimeUser(page);

    await login(page, userCreds);
    await goToDashboardFromHeader(page);
    await expect(page).toHaveURL(/\/dashboard\/user$/);

    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/\/dashboard\/user\/profile$/);

    await page.getByPlaceholder(/Enter Your Password/i).fill('123');
    await page.getByRole('button', { name: 'UPDATE' }).click();

    await expect(page.getByText(/Something went wrong/i)).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/user\/profile$/);
  });

  test('profile update fails on backend error', async ({ page }) => {
    const userCreds = await getOrCreateRuntimeUser(page);

    await login(page, userCreds);
    await goToDashboardFromHeader(page);
    await expect(page).toHaveURL(/\/dashboard\/user$/);

    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/\/dashboard\/user\/profile$/);

    await page.route('**/api/v1/auth/profile', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Forced profile failure' }),
      });
    });

    await page.getByPlaceholder(/Enter Your Name/i).fill(`Broken Update ${Date.now()}`);
    await page.getByRole('button', { name: 'UPDATE' }).click();

    await expect(page.getByText(/Something went wrong/i)).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/user\/profile$/);
  });
});
