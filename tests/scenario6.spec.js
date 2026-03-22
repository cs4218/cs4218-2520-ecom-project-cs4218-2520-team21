import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ page}) => {
  await page.goto("http://localhost:3000/");
});


test('user logs in, searches for a product and adds to cart, adds related product to cart, pays and checks if orders register successfully', async ({ page }) => {
    
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill("cs4218@test.com");
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill("cs4218@test.com");
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('searchbox', { name: 'Search' }).click();
  await page.getByRole('searchbox', { name: 'Search' }).fill('laptop');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('button', { name: 'More Details' }).first().click();
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'ADD TO CART' }).first().click();

  await page.getByRole('button', { name: 'More Details' }).nth(1).click();
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'ADD TO CART' }).nth(1).click();
  await page.waitForLoadState('networkidle')
  
  await page.getByRole('link', { name: 'Cart' }).click();

  await page.getByRole('button', { name: 'Paying with Card' }).click();
  await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).click();
  await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill('4111111111111111');
  await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).click();
  await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill('0928');
  await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).click();
  await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).fill('249');
  await page.getByRole('button', { name: 'Make Payment' }).click();

  const lastOrder = page.locator('div.border.shadow').last();
  const quantityCell = lastOrder.locator('table tbody tr td').last();
  await expect(quantityCell).toHaveText('2');
  const productsInLastOrder = lastOrder.locator('.container .row p');
  await expect(productsInLastOrder.first()).toContainText('Laptop');

});