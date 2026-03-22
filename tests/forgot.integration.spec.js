// Paing Khant Kyaw, A0257992J
// @ts-check
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ page, request }) => {
  await page.goto("http://localhost:3000");
});

test('User tries to change password and navigated to not found page', async ({ page }) => {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Forgot Password' }).click();
  await expect(page.getByText('404Oops ! Page Not FoundGo')).toBeVisible();
});