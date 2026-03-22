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
  priceTestId: 'price-$0 to 19',   // matches data-testid={`price-${p.name}`} in HomePage
  priceMin: 0,
  priceMax: 19
};

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
    await applyCategoryFilter(page, FILTER.category);

    const cards = page.getByTestId('product-card');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Check only first product — navigate to PDP and verify category
    await Promise.all([
      page.waitForResponse('**/api/v1/product/get-product/**'),
      cards.first().getByRole('button', { name: 'More Details' }).click(),
    ]);

    await expect(
      page.getByRole('heading', { level: 6 }).filter({ hasText: 'Category' })
    ).toContainText(FILTER.category);
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
    expect(after).toEqual(before);
  });
});

// Filter by Price
test.describe('Filter by price', () => {
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

    const priceHeadings = await page
      .getByTestId('product-card')
      .getByRole('heading', { level: 5 })
      .filter({ hasText: '$' })
      .allTextContents();

    console.log('All prices found:', priceHeadings);
    expect(priceHeadings.length).toBeGreaterThan(0);

    priceHeadings.forEach(priceText => {
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      console.log('Parsed price:', price);
      expect(price).toBeGreaterThanOrEqual(FILTER.priceMin);
      expect(price).toBeLessThanOrEqual(FILTER.priceMax);
    });
  });

  test('should reset to all products when RESET FILTERS is clicked', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();

    await applyPriceFilter(page, FILTER.priceTestId);

    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'RESET FILTERS' }).click(),
    ]);

    await checkHomePageLoaded(page);
    const after = await page.getByTestId('product-card').count();
    expect(after).toEqual(before);
  });
});

// Combined Filters 
test.describe('Combined category and price filters', () => {
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
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const priceTexts = await cards
      .getByRole('heading', { level: 5 })
      .filter({ hasText: '$' })
      .allTextContents();

    console.log('Prices after combined filter:', priceTexts);
    expect(priceTexts.length).toBeGreaterThan(0);

    priceTexts.forEach(priceText => {
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      expect(price).toBeGreaterThanOrEqual(FILTER.priceMin);
      expect(price).toBeLessThanOrEqual(FILTER.priceMax);
    });

    // Check category on only first product via PDP
    await Promise.all([
      page.waitForResponse('**/api/v1/product/get-product/**'),
      cards.first().getByRole('button', { name: 'More Details' }).click(),
    ]);

    await expect(
      page.getByRole('heading', { level: 6 }).filter({ hasText: 'Category' })
    ).toContainText(FILTER.category);
  });

  test('should reset to all products when RESET FILTERS is clicked', async ({ page }) => {
    const before = await page.getByTestId('product-card').count();

    await applyCategoryFilter(page, FILTER.category);
    await applyPriceFilter(page, FILTER.priceTestId);

    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'RESET FILTERS' }).click(),
    ]);

    await checkHomePageLoaded(page);
    const after = await page.getByTestId('product-card').count();
    expect(after).toEqual(before);
  });
});

// Product Detail Page
test.describe('Product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await checkHomePageLoaded(page);
    await applyCategoryFilter(page, FILTER.category);
    await applyPriceFilter(page, FILTER.priceTestId);
    await expect(page.getByTestId('product-card').first()).toBeVisible();
  });

  test('should navigate to PDP when More Details is clicked', async ({ page }) => {
    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'More Details' }).click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByText('Product Details')).toBeVisible();
  });

  test('should display correct product name on PDP', async ({ page }) => {
    // Grab name from card title before navigating
    const productName = await page.getByTestId('product-card').first()
      .locator('.card-title').first().textContent();

    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'More Details' }).click();

    await expect(page.getByText(`Name : ${productName!.trim()}`)).toBeVisible();
  });

  test('should display price, category, description and add to cart on PDP', async ({ page }) => {
    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'More Details' }).click();

    await expect(page.getByText(/Price :/)).toBeVisible();
    await expect(page.getByText(/Category :/)).toBeVisible();
    await expect(page.getByText(/Description :/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeEnabled();
  });

  test('should display product price within the selected price range', async ({ page }) => {
    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'More Details' }).click();
      await expect(
      page.getByRole('heading', { level: 6 }).filter({ hasText: /Price\s*:\s*\$/ })
    ).toBeVisible();

    const priceText = await page.getByRole('heading', { level: 6 })
      .filter({ hasText: 'Price' })
      .textContent();
    console.log('Raw price text:', priceText); // "Price :$4.99"
    const price = parseFloat(priceText!.replace(/[^0-9.]/g, ''));

    expect(price).toBeGreaterThanOrEqual(FILTER.priceMin);
    expect(price).toBeLessThanOrEqual(FILTER.priceMax);
  });

  test('should display correct category matching the applied filter', async ({ page }) => {
    await page.getByTestId('product-card').first()
      .getByRole('button', { name: 'More Details' }).click();

    await expect(page.getByText(`Category : ${FILTER.category}`)).toBeVisible();
  });
});

// Cart
test.describe('Add to cart', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await checkHomePageLoaded(page);
    await applyCategoryFilter(page, FILTER.category);
    await applyPriceFilter(page, FILTER.priceTestId);

    // Wait for both the navigation and the product API response together
    await Promise.all([
      page.waitForResponse('**/api/v1/product/get-product/**'),
      page.getByTestId('product-card').first()
        .getByRole('button', { name: 'More Details' }).click(),
    ]); 
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();
  });

  test('should show success toast when product is added to cart', async ({ page }) => {
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();

    await expect(page.getByText('Item Added to cart')).toBeVisible();
  });

  test('should add product to localStorage cart', async ({ page }) => {
    const productName = await page.locator('h6').filter({ hasText: 'Name' }).textContent();
    const name = productName!.replace('Name : ', '').trim();

    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();

    // Cart is stored in localStorage — verify directly
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    expect(cart.length).toBeGreaterThan(0);
    expect(cart.some((item: any) => item.name === name)).toBe(true);
  });

  test('should show product in cart page after adding', async ({ page }) => {
    const productName = await page.locator('h6').filter({ hasText: 'Name' }).textContent();
    const name = productName!.replace('Name : ', '').trim();

    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
    await expect(page.getByText('Item Added to cart')).toBeVisible(); // wait for toast confirmation

    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/cart`);

    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });

  test('should show correct item count in cart header', async ({ page }) => {
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page.getByText(/You Have 1 items in your cart/)).toBeVisible();
  });

  test('should display correct total price in cart summary', async ({ page }) => {
    // Grab price from PDP before adding
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();

    await page.getByRole('link', { name: /cart/i }).click();

    const priceText = await page.locator('p').filter({ hasText: 'Price' }).textContent();
    const price = parseFloat(priceText!.replace(/[^0-9.]/g, ''));

    const totalText = await page.locator('h4').filter({ hasText: 'Total' }).textContent();
    const total = parseFloat(totalText!.replace(/[^0-9.]/g, ''));
    expect(total).toBeCloseTo(price, 2);
  });

  test('should remove product from cart when Remove is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();

    await page.getByRole('link', { name: /cart/i }).click();

    await page.getByRole('button', { name: 'Remove' }).first().click();

    await expect(page.getByText('Your Cart Is Empty')).toBeVisible();

    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    expect(cart.length).toBe(0);
  });
});

// Checkout
test.describe('Checkout', () => {
  let productName: string;

  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await checkHomePageLoaded(page);
    await applyCategoryFilter(page, FILTER.category);
    await applyPriceFilter(page, FILTER.priceTestId);

    // Grab name from card before navigating
    const firstCard = page.getByTestId('product-card').first();
    productName = (await firstCard.locator('.card-title').first().textContent())!.trim();

    await Promise.all([
      page.waitForResponse('**/api/v1/product/get-product/**'),
      page.getByTestId('product-card').first()
        .getByRole('button', { name: 'More Details' }).click(),
    ]); 
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page.getByText(productName, {exact: true })).toBeVisible();
  });

  test('should redirect to orders page after successful payment', async ({ page }) => {
    await fillBraintreeAndPay(page);
    await expect(page).toHaveURL(/\/dashboard\/user\/orders/);
  });

  test('should reflect purchased product in order history', async ({ page }) => {
    const cartItem = page.locator('.card.flex-row').first();
    const productName = (await cartItem.locator('p').first().textContent())!.trim();
    await fillBraintreeAndPay(page);
    await expect(page.getByText('Payment Completed Successfully')).toBeVisible();
    // Fresh user has exactly 1 order — no ambiguity
    await expect(page.locator('table')).toHaveCount(1);
    await expect(page.getByText(productName, { exact: true })).toBeVisible();
  });

  test('should clear cart after successful payment', async ({ page }) => {
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await fillBraintreeAndPay(page);
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBeNull();
  });
});


// Full e2e flow
test.describe('Full purchase flow with filters', () => {
  test('should complete end-to-end from login to order history', async ({ page }) => {
    await test.step('Login', async () => {
      await registerAndLogin(page);
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
      await page.getByTestId('product-card').first()
        .getByRole('button', { name: 'More Details' }).click();
      await expect(page).toHaveURL(/\/product\//);
      await expect(page.getByText('Product Details')).toBeVisible();
      await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeEnabled();
    });

    await test.step('Add to cart', async () => {
      await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
      await expect(page.getByText('Item Added to cart')).toBeVisible();

      const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
      expect(cart.length).toBe(1);
    });

    await test.step('Navigate to cart', async () => {
      await page.goto(`${BASE_URL}/cart`);
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
async function registerAndLogin(page: Page) {
  const NEW_USER = {
    name: `Scenario2 User ${Date.now()}`,
    email: `scenario2+${Date.now()}@example.com`,
    password: 'sc2test',
    address: `computing drive`
  };
  await page.goto(`${BASE_URL}/register`);
  await page.getByPlaceholder('Enter Your Name').fill(NEW_USER.name);
  await page.getByPlaceholder('Enter Your Email').fill(NEW_USER.email);
  await page.getByPlaceholder('Enter Your Password').fill(NEW_USER.password);
  await page.getByPlaceholder('Enter Your Phone').fill('12345678');
  await page.getByPlaceholder('Enter Your Address').fill(NEW_USER.address);
  await page.locator('input[type="date"]').fill('2000-01-01');
  await page.getByPlaceholder('What is Your Favorite sports').fill('Tennis');
  await page.getByRole('button', { name: 'REGISTER' }).click();

  // Wait for redirect to login AND for the login form to be ready
  await expect(page).toHaveURL(`${BASE_URL}/login`);
  await expect(page.getByPlaceholder('Enter Your Email ')).toBeVisible();
  await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();

  // Now safe to fill login form
  await page.getByPlaceholder('Enter Your Email ').fill(NEW_USER.email);
  await page.getByPlaceholder('Enter Your Password').fill(NEW_USER.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page).toHaveURL(`${BASE_URL}`);
}

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
  // Radio buttons use data-testid="price-$0 to 19" etc. — click the label inside
  await Promise.all([
    page.waitForResponse('**/api/v1/product/product-filters**'),
    page.getByTestId(priceTestId).click(),
  ]);
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