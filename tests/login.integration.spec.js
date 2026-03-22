// Paing Khant Kyaw, A0257992J
// @ts-check
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ page, request }) => {
  await page.goto("http://localhost:3000");
});

test("User log in with valid credentials", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("login@login.com");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("1234567890");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page.getByText("login successfully")).toBeVisible();
});

test('User login with unregisterd email', async ({ page }) => {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('login@loginwrong.com');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.locator('div').filter({ hasText: 'Email is not registered' }).nth(4).click();
  await page.getByText('Email is not registered').click();
  await expect(page.getByText('Email is not registered')).toBeVisible();
});

test('User login with wrong password', async ({ page }) => {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('login@login.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('1234567890123');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.locator('div').filter({ hasText: 'Invalid Password' }).nth(4)).toBeVisible();
});

