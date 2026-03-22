// Ariella Thirza Callista, A0255876L
// Claude was used to help structure tests and generate edge cases

// Guest adds to cart → attempts checkout → redirected to login → logs in → completes purchase

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const BASE_URL = 'http://localhost:3000';

const EXISTING_USER = {
  name: `CS 4218 Test Account`,
  email: `cs4218@test.com`,
  password: 'cs4218@test.com',
  address: `1 Computing Drive`
};
// Guest adds to cart
test.describe('Guest user adds product to cart', () => {
  test('should allow guest to browse homepage without logging in', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    await expect(page.getByTestId('products-list')).toBeVisible();
    await expect(page.getByTestId('product-card').first()).toBeVisible();
  });

  test('should allow guest to add product to cart from homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'ADD TO CART' }).click();

    await expect(page.getByText('Item Added to cart')).toBeVisible();

    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart') || '[]')
    );
    expect(cart.length).toBe(1);
  });

  test('should show correct item count in cart icon after guest adds product', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'ADD TO CART' }).click();

    await expect(page.getByText('Item Added to cart')).toBeVisible();
    await expect(page.locator('sup')).toHaveText('1');
  });
});

// Guest views cart
test.describe('Guest user views cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'ADD TO CART' }).click();
    await expect(page.getByText('Item Added to cart')).toBeVisible();
    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
  });

  test('should show added product in cart page', async ({ page }) => {
    await expect(page.getByText(/You Have 1 items in your cart/)).toBeVisible();
  });

  test('should greet guest user on cart page', async ({ page }) => {
    await expect(page.getByText('Hello Guest')).toBeVisible();
  });

  test('should show please login button instead of payment section', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Please Login to checkout' })
    ).toBeVisible();
  });

  test('should not show Braintree payment section for guest', async ({ page }) => {
    await expect(page.locator('[data-braintree-id="wrapper"]')).not.toBeVisible();
  });
});

// Guest blocked at checkout
test.describe('Guest redirected to login when attempting checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'ADD TO CART' }).click();
    await expect(page.getByText('Item Added to cart')).toBeVisible();
    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
  });

  test('should redirect to login when guest clicks please login to checkout', async ({ page }) => {
    await page.getByRole('button', { name: 'Please Login to checkout' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should preserve cart in localStorage after redirect to login', async ({ page }) => {
    const cartBefore = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart') || '[]')
    );
    expect(cartBefore.length).toBe(1);

    await page.getByRole('button', { name: 'Please Login to checkout' }).click();
    await expect(page).toHaveURL(/\/login/);

    // localStorage persists across navigation
    const cartAfter = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart') || '[]')
    );
    expect(cartAfter.length).toBe(1);
  });
});

// User logs in and completes checkout
test.describe('User logs in after guest redirect and completes purchase', () => {
  let productName: string;

  test.beforeEach(async ({ page }) => {
    // Step 1: add product as guest
    await page.goto(`${BASE_URL}`);
    const firstCard = page.getByTestId('product-card').first();
    productName = (await firstCard.locator('.card-name-price h5').first().textContent())!.trim();

    await firstCard.getByRole('button', { name: 'ADD TO CART' }).click();
    await expect(page.getByText('Item Added to cart')).toBeVisible();

    // Step 2: go to cart and click please login
    await page.getByRole('link', { name: /cart/i }).click();
    await page.getByRole('button', { name: 'Please Login to checkout' }).click();
    await expect(page).toHaveURL(/\/login/);

    // Step 3: log in
    await loginAsUserAfterGuest(page);
  });

  test('should redirect back to cart after login', async ({ page }) => {
    // navigate('/login', { state: '/cart' }) should redirect back to /cart after login
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
  });

  test('should show exactly one item in cart after login', async ({ page }) => {
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await expect(page.getByText(/You Have 1 items in your cart/)).toBeVisible();

    // Verify localStorage has exactly 1 item — not duplicated
    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart') || '[]')
    );
    expect(cart.length).toBe(1);
  });

  test('should show the same product that was added as guest', async ({ page }) => {
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await expect(page.getByText(productName, { exact: true })).toBeVisible();
  });

  test('should complete payment and navigate to orders', async ({ page }) => {
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await fillBraintreeAndPay(page);
    await expect(page).toHaveURL(/\/dashboard\/user\/orders/);
  });

  test('should clear cart after successful payment', async ({ page }) => {
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await fillBraintreeAndPay(page);
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBeNull();
  });
});

// Full flow
test.describe('Full guest checkout flow', () => {
  test('guest adds to cart, redirected to login, logs in, completes purchase', async ({ page }) => {
    await test.step('Guest adds product to cart', async () => {
      await page.goto(`${BASE_URL}`);
      await page.getByTestId('product-card').first()
        .getByRole('button', { name: 'ADD TO CART' }).click();
      await expect(page.getByText('Item Added to cart')).toBeVisible();

      const cart = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('cart') || '[]')
      );
      expect(cart.length).toBe(1);
    });

    await test.step('Guest navigates to cart', async () => {
      await page.getByRole('link', { name: /cart/i }).click();
      await expect(page).toHaveURL(`${BASE_URL}/cart`);
      await expect(page.getByText('Hello Guest')).toBeVisible();
      await expect(page.getByText(/You Have 1 items in your cart/)).toBeVisible();
    });

    await test.step('Guest blocked — redirected to login', async () => {
      await page.getByRole('button', { name: 'Please Login to checkout' }).click();
      await expect(page).toHaveURL(/\/login/);
      // Cart still intact in localStorage
      const cart = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('cart') || '[]')
      );
      expect(cart.length).toBe(1);
    });

    await test.step('User logs in after redirect', async () => {
      await loginAsUserAfterGuest(page);
    });

    await test.step('Cart has only one item', async () => {
      await expect(page.getByText(/You Have 1 items in your cart/)).toBeVisible();
      const cart = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('cart') || '[]')
      );
      expect(cart.length).toBe(1);
    });

    await test.step('Complete payment', async () => {
      await fillBraintreeAndPay(page);
      await expect(page).toHaveURL(/\/dashboard\/user\/orders/);
    });

    await test.step('Order reflected in history', async () => {
      await expect(page.getByText('Payment Completed Successfully')).toBeVisible();
    });
  });
});

// Helpers
async function loginAsUserAfterGuest(page: Page) {
  await expect(page.getByPlaceholder('Enter Your Email ')).toBeVisible();
  await page.getByPlaceholder('Enter Your Email ').fill(EXISTING_USER.email);
  await page.getByPlaceholder('Enter Your Password').fill(EXISTING_USER.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page).toHaveURL(`${BASE_URL}/cart`);
}

async function fillBraintreeAndPay(page: Page) {
  await page.waitForResponse('**/api/v1/product/braintree/token**');
  await expect(page.getByRole('button', { name: 'Paying with Card' }))
    .toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Paying with Card' }).click();

  await page.locator('iframe[name="braintree-hosted-field-number"]')
    .contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill('4111111111111111');

  await page.locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill('0928');

  await page.locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame().getByRole('textbox', { name: 'CVV' }).fill('249');

  await Promise.all([
    page.waitForURL(/\/dashboard\/user\/orders/),
    page.getByRole('button', { name: 'Make Payment' }).click(),
  ]);
}