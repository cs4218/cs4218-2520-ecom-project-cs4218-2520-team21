// Paing Khant Kyaw, A0257992J
// @ts-check
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ page, request }) => {
  const url = "http://localhost:3000//api/v1/auth/register";
  const req = {
    name: "scene7",
    email: "scene7@gmail.com",
    password: "scene7password",
    phone: "11111111",
    address: "nus",
    answer: "scene7",
    DOB: "10-10-2000",
  };
  const response = await request.post(url, {
    headers: {
      "Content-Type": "application/json",
    },
    data: req,
  });
  console.log(response);
  expect(response.status()).not.toBe(500);
  await page.goto("http://localhost:3000");
});

test("User login, choose product through filter, make payment and check order", async ({ page }) => {
  // Home page when user first open the website
  await page.getByRole("link", { name: "Login" }).click();

  // login page
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("scene7@gmail.com");
  const passwordBox = page.getByRole("textbox", {
    name: "Enter Your Password",
  });
  await passwordBox.click();
  await passwordBox.fill("scene7password");
  await page.getByRole("button", { name: "LOGIN" }).click();

  // Home page
  await expect(page.getByText("login successfully")).toBeVisible();
  // await expect(page.getByText('login successfully')).toBeHidden();

  // Clicks a category
  await page.getByRole("checkbox", { name: "Electronics" }).check();

  // Adds items and check for notification and count updates
  await expect(page.getByTitle("0")).toBeVisible();
  const itemAddedToast = page.getByText("Item Added to cart").last();

  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await expect(page.getByTitle("1")).toBeVisible();
  await expect(itemAddedToast).toBeVisible();
  await expect(itemAddedToast).toBeHidden();

  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await expect(page.getByTitle("2")).toBeVisible();
  await expect(itemAddedToast).toBeVisible();
  await expect(itemAddedToast).toBeHidden();

  await page.getByRole("button", { name: "ADD TO CART" }).nth(1).click();
  await expect(page.getByTitle("3")).toBeVisible();
  await expect(itemAddedToast).toBeVisible();
  await expect(itemAddedToast).toBeHidden();

  // Goes to cart page
  await page.getByRole("link", { name: "Cart" }).click();

  // Check cart page layout
  await expect(
    page.getByRole("heading", { name: "Hello scene7 You Have 3 items" }),
  ).toBeVisible();
  await expect(page.getByText("Cart SummaryTotal | Checkout")).toBeVisible();
  let removeButtonCount = await page
    .getByRole("button", { name: "Remove" })
    .count();
  expect(removeButtonCount).toBe(3);

  // Removes first tiem
  await page.getByRole("button", { name: "Remove" }).first().click();
  removeButtonCount = await page
    .getByRole("button", { name: "Remove" })
    .count();
  expect(removeButtonCount).toBe(2);
  await expect(
    page.getByRole("heading", { name: "Hello scene7 You Have 2 items" }),
  ).toBeVisible();

  // Payment information
  await expect(page.getByText("Edit Choose a way to pay")).toBeVisible();
  await page.getByRole("button", { name: "Paying with Card" }).click();
  await expect(
    page.locator(".braintree-card > .braintree-sheet__header"),
  ).toBeVisible();
  await expect(
    page.locator(".braintree-form__field-group").first(),
  ).toBeVisible();
  await expect(
    page.locator("label").filter({ hasText: "CVV (3 digits)" }),
  ).toBeVisible();
  await expect(
    page.locator("label").filter({ hasText: "Expiration Date (MM/YY)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Choose another way to pay" }),
  ).toBeVisible();

  // fill payment information
  await page
    .locator('iframe[name="braintree-hosted-field-number"]')
    .contentFrame()
    .getByRole("textbox", { name: "Credit Card Number" })
    .fill("4111 1111 1111 1111");

  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .fill("1030");

  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .fill("123");

  await page.getByRole("button", { name: "Make Payment" }).click();
  await expect(
    page.getByRole("button", { name: "Ending in 1111 Visa" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Processing ...." })).toBeVisible();
  await expect(page.getByRole("heading", {name: "All orders"})).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '#' }).last()).toBeVisible();
});
