import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");
});


test('admin adds a new category and product, product successfully shown under category', async ({ page }) => {
 
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Create Category' }).click();
  await page.getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('textbox', { name: 'Enter new category' }).fill('Shoes');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('link', { name: 'Create Product' }).click();
await page.locator('.ant-select-selector').nth(0).click();

  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');

  const option = dropdown.locator('.ant-select-item-option-content', { hasText: /^Shoes$/ });

  await option.waitFor({ state: 'visible', timeout: 5000 });

  await option.click();
  
  await page.locator('input[type="file"]').setInputFiles('tests/assets/adidas.png');
  await page.getByRole('textbox', { name: 'write a name' }).click();
  await page.getByRole('textbox', { name: 'write a name' }).fill('Adidas Shoes');
  await page.getByRole('textbox', { name: 'write a description' }).click();
  await page.getByRole('textbox', { name: 'write a description' }).fill('This is a pair of shoes');
  await page.getByPlaceholder('write a Price').click();
  await page.getByPlaceholder('write a Price').fill('100');
  await page.getByPlaceholder('write a quantity').click();
  await page.getByPlaceholder('write a quantity').fill('10');
  await page.locator('.ant-select-selector').nth(1).click();
  const dropdown_shipping = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
 
  const option_shipping = dropdown_shipping.locator('.ant-select-item-option-content', { hasText: /^Yes$/ });

  await option_shipping.waitFor({ state: 'visible', timeout: 5000 });
  
  await option_shipping.click();
  await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'Categories' }).click();
  await page.getByRole('link', { name: 'Shoes', exact: true}).click();
  await expect(page.getByText('Adidas Shoes$')).toBeVisible();
});