// Ariella Thirza Callista, A0255876L
// login -> filter by category -> filter by price -> combined filters -> view product detail -> add to cart -> checkout

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const BASE_URL = 'http://localhost:3000';

const USER = {
  name: `Scenario 2 Test`,
  email: `sc2test@gmail.com`,
  password: 'sc2test',
};

const FILTER = {
  category: 'Electronics',
  priceTestId: 'price-$0 to 19',   // matches data-testid={`price-${p.name}`} in HomePage
  priceMax: 19,
};

// Login
test.describe('Login', () => {
  test('should allow user to log in with valid credentials', async ({ page }) => {
    await loginAsUser(page);
    await page.getByText('All Products').waitFor({ state: 'visible' });
    await expect(page).toHaveURL(`${BASE_URL}`);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('Enter Your Email').fill(USER.email);
    await page.getByPlaceholder('Enter Your Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expect(page.getByText('Invalid Password')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('should remain on login page if fields are empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

// Filter by Category

test.describe('Filter by category', () => {
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
    const initialCount = await page.getByTestId('product-card').count();
    await applyCategoryFilter(page, FILTER.category);

    const cards = page.getByTestId('product-card');
    // Wait until count changes (new filtered list rendered)
    await page.waitForFunction(
      (prev) => document.querySelectorAll('[data-testid="product-card"]').length !== prev,
      initialCount
    );

    // Since category is not rendered on the home page, we check for correct category via product details page
    // Click into the first product and verify category shown on PDP
    await cards.first().getByRole('button', { name: 'More Details' }).click();
    await expect(page.getByText(`Category : ${FILTER.category}`)).toBeVisible();
  });

  test('should uncheck category and restore results', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();

    await applyCategoryFilter(page, FILTER.category);
    const afterFilter = await page.getByTestId('product-card').count();
    expect(afterFilter).toBeLessThanOrEqual(before);

    // Uncheck the same category
    await page.getByRole('checkbox', { name: FILTER.category }).uncheck();
    
    // Wait until the number of visible product cards equals the initial count
    await page.waitForFunction(
      (count) => document.querySelectorAll('[data-testid="product-card"]').length === count,
      before
    );

    const afterUncheck = await page.getByTestId('product-card').count();
    expect(afterUncheck).toEqual(before);

  });

  test('should reset to all products when RESET FILTERS is clicked', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();

    await applyCategoryFilter(page, FILTER.category);

    // RESET FILTERS triggers window.location.reload()
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'RESET FILTERS' }).click(),
    ]);

    await checkHomePageLoaded(page);
    const after = await page.getByTestId('product-card').count();
    expect(after).toBeGreaterThanOrEqual(before);
  });
});

// Helpers
async function loginAsUser(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder('Enter Your Email').fill(USER.email);
  await page.getByPlaceholder('Enter Your Password').fill(USER.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
}

async function applyCategoryFilter(page: Page, categoryName: string) {
  await page.getByRole('checkbox', { name: categoryName }).check();

  await Promise.all([
    page.waitForResponse('**/api/v1/product/product-filters**'),
    page.getByTestId('product-card').first().waitFor({ state: 'visible' }),
  ]);
}

async function checkHomePageLoaded(page: Page) {
  await expect(page).toHaveURL(`${BASE_URL}`);
  await expect(page.getByTestId('products-list')).toBeVisible();
  await expect(page.getByTestId('product-card').first()).toBeVisible();
}