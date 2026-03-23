// Ariella Thirza Callista, A0255876L
// Claude was used to help structure tests and generate edge cases

// login -> filter by category -> filter by price -> combined filters -> view product detail -> add to cart -> checkout

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

const FILTER = {
  category: 'Clothing',
  priceTestId: 'price-$0 to 19',
  priceMin: 0,
  priceMax: 19
};

// Filter by Category 

test.describe('Filter by category', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await checkHomePageLoaded(page);
  });

  test('should update results when category checkbox is checked', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();
    await applyCategoryFilter(page, FILTER.category);
    const after = await page.getByTestId('product-card').count();
    expect(after).toBeLessThanOrEqual(before);
  });

  test('should show only products matching the selected category', async ({ page }) => {
    await applyCategoryFilter(page, FILTER.category);

    const cards = page.getByTestId('product-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);

    // Navigate to PDP and wait for product data to fully load
    await Promise.all([
      page.waitForResponse('**/api/v1/product/get-product/**'),
      cards.first().getByRole('button', { name: 'More Details' }).click(),
    ]);

    await expect(
      page.getByRole('heading', { level: 6 }).filter({ hasText: /Category\s*:\s*\w+/ })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { level: 6 }).filter({ hasText: 'Category' })
    ).toContainText(FILTER.category);
  });

  test('should uncheck category and restore results', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();

    await applyCategoryFilter(page, FILTER.category);
    const afterFilter = await page.getByTestId('product-card').count();
    expect(afterFilter).toBeLessThanOrEqual(before);

    await Promise.all([
      page.waitForResponse('**/api/v1/product/product-filters**'),
      page.getByRole('checkbox', { name: FILTER.category }).uncheck(),
    ]);

    await expect(page.getByTestId('product-card')).toHaveCount(before);
  });

  test('should reset to all products when RESET FILTERS is clicked', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();
    await applyCategoryFilter(page, FILTER.category);

    await Promise.all([
      page.waitForURL(`${BASE_URL}/`),
      page.getByRole('button', { name: 'RESET FILTERS' }).click(),
    ]);

    await checkHomePageLoaded(page);
    const after = await page.getByTestId('product-card').count();
    expect(after).toEqual(before);
  });
});

// Filter by Price

test.describe('Filter by price', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await checkHomePageLoaded(page);
  });

  test('should update results when a price range radio is selected', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();
    await applyPriceFilter(page, FILTER.priceTestId);
    const after = await page.getByTestId('product-card').count();
    expect(after).toBeLessThanOrEqual(before);
  });

  test('should show only products within the selected price range', async ({ page }) => {
    await applyPriceFilter(page, FILTER.priceTestId);

    const cards = page.getByTestId('product-card');
    await expect(cards.first()).toBeVisible();

    const priceHeadings = await cards
      .getByRole('heading', { level: 5 })
      .filter({ hasText: '$' })
      .allTextContents();

    expect(priceHeadings.length).toBeGreaterThan(0);
    priceHeadings.forEach(priceText => {
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      expect(price).toBeGreaterThanOrEqual(FILTER.priceMin);
      expect(price).toBeLessThanOrEqual(FILTER.priceMax);
    });
  });

  test('should reset to all products when RESET FILTERS is clicked', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();
    await applyPriceFilter(page, FILTER.priceTestId);

    await Promise.all([
      page.waitForURL(`${BASE_URL}/`),
      page.getByRole('button', { name: 'RESET FILTERS' }).click(),
    ]);

    await checkHomePageLoaded(page);
    const after = await page.getByTestId('product-card').count();
    expect(after).toEqual(before);
  });
});

// Combined Filters

test.describe('Combined category and price filters', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await checkHomePageLoaded(page);
  });

  test('should narrow results further when both filters are applied', async ({ page }) => {
    await applyCategoryFilter(page, FILTER.category);
    const afterCategory = await page.getByTestId('product-card').count();

    await applyPriceFilter(page, FILTER.priceTestId);
    const afterBoth = await page.getByTestId('product-card').count();

    expect(afterBoth).toBeLessThanOrEqual(afterCategory);
  });

  test('should show products satisfying both category and price constraints', async ({ page }) => {
    await applyCategoryFilter(page, FILTER.category);
    await applyPriceFilter(page, FILTER.priceTestId);

    const cards = page.getByTestId('product-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);

    const priceTexts = await cards
      .getByRole('heading', { level: 5 })
      .filter({ hasText: '$' })
      .allTextContents();

    expect(priceTexts.length).toBeGreaterThan(0);
    priceTexts.forEach(priceText => {
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      expect(price).toBeGreaterThanOrEqual(FILTER.priceMin);
      expect(price).toBeLessThanOrEqual(FILTER.priceMax);
    });

    // Wait for product API response before navigating to PDP
    await Promise.all([
      page.waitForResponse('**/api/v1/product/get-product/**'),
      cards.first().getByRole('button', { name: 'More Details' }).click(),
    ]);

    // Wait for category value to be populated — not just the label
    await expect(
      page.getByRole('heading', { level: 6 }).filter({ hasText: /Category\s*:\s*\w+/ })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { level: 6 }).filter({ hasText: 'Category' })
    ).toContainText(FILTER.category);
  });

  test('should reset to all products when RESET FILTERS is clicked', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();

    await applyCategoryFilter(page, FILTER.category);
    await applyPriceFilter(page, FILTER.priceTestId);

    await Promise.all([
      page.waitForURL(`${BASE_URL}/`),
      page.getByRole('button', { name: 'RESET FILTERS' }).click(),
    ]);

    await checkHomePageLoaded(page);
    const after = await page.getByTestId('product-card').count();
    expect(after).toEqual(before);
  });
});

// Full E2E Flow

test.describe('Full purchase flow with filters', () => {
  test.describe.configure({ mode: 'serial' });

  test('should complete end-to-end from login to order history', async ({ page }) => {
    await test.step('Login', async () => {
      await loginAsUser(page);
      await expect(page).toHaveURL(`${BASE_URL}`);
      await expect(page.getByTestId('products-list')).toBeVisible();
    });

    await test.step('Filter by category', async () => {
      await applyCategoryFilter(page, FILTER.category);
      await expect(page.getByTestId('product-card').first()).toBeVisible();
    });

    await test.step('Filter by price', async () => {
      await applyPriceFilter(page, FILTER.priceTestId);
      await expect(page.getByTestId('product-card').first()).toBeVisible();
    });

    await test.step('View product detail', async () => {
      // wait for product API response so product data is fully loaded
      // before ADD TO CART is clicked — prevents incomplete {} being stored
      // in localStorage which causes server crash on payment
      await Promise.all([
        page.waitForResponse('**/api/v1/product/get-product/**'),
        page.getByTestId('product-card').first()
          .getByRole('button', { name: 'More Details' }).click(),
      ]);

      await expect(page).toHaveURL(/\/product\//);
      await expect(page.getByText('Product Details')).toBeVisible();

      await expect(
        page.getByRole('heading', { level: 6 }).filter({ hasText: /Price\s*:\s*\$/ })
      ).toBeVisible();

      await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeEnabled();
    });

    await test.step('Add to cart', async () => {
      await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
      await expect(page.getByText('Item Added to cart')).toBeVisible();

      // Verify cart contains a complete product object — not an empty {}
      // Incomplete objects cause server ValidationError on payment
      const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
      expect(cart.length).toBe(1);
      expect(cart[0]._id).toBeDefined();
      expect(cart[0].name).toBeDefined();
      expect(cart[0].price).toBeDefined();
    });

    await test.step('Navigate to cart', async () => {
      await page.getByRole('link', { name: /cart/i }).click();
      await expect(page).toHaveURL(`${BASE_URL}/cart`);
      await expect(page.getByText('Cart Summary')).toBeVisible();
      await expect(page.getByText(/You Have 1 items in your cart/)).toBeVisible();
    });

    await test.step('Make successful payment', async () => {
      await fillBraintreeAndPay(page);
      await expect(page.getByText('Payment Completed Successfully')).toBeVisible();
    });
  });
});

// Helpers

async function loginAsUser(page: Page, credentials = EXISTING_USER) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder('Enter Your Email').fill(credentials.email);
  await page.getByPlaceholder('Enter Your Password').fill(credentials.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page).toHaveURL(`${BASE_URL}`);
}

async function applyCategoryFilter(page: Page, categoryName: string) {
  await Promise.all([
    page.waitForResponse('**/api/v1/product/product-filters**'),
    page.getByRole('checkbox', { name: categoryName }).check(),
  ]);
}

async function checkHomePageLoaded(page: Page) {
  await expect(page).toHaveURL(`${BASE_URL}`);
  await expect(page.getByTestId('products-list')).toBeVisible();
  await expect(page.getByTestId('product-card').first()).toBeVisible();
}

async function applyPriceFilter(page: Page, priceTestId: string) {
  await Promise.all([
    page.waitForResponse('**/api/v1/product/product-filters**'),
    page.getByTestId(priceTestId).click(),
  ]);
}

async function fillBraintreeAndPay(page: Page) {
  await page.waitForResponse('**/api/v1/product/braintree/token**');
  await expect(page.getByRole('button', { name: 'Paying with Card' }))
    .toBeVisible({ timeout: 30000 });

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