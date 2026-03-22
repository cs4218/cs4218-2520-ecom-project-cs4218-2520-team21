// Xenos Fiorenzo Anong, A0257672U
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.use({
  baseURL: "http://localhost:3000/",
});

export const randomEmail = () =>
  `testscenario5-${(Math.random() + 1).toString(36).substring(7)}@example.com`;

test("user registers, user logs in, user adds product to cart, user pays, user checks order", async ({
  page,
}) => {
  await page.goto("/");

  // dummy info
  const USER_INFO = {
    name: "LiNUS",
    email: randomEmail(),
    password: "Passw0rd1234",
    phonenumber: "1234",
    address: "123 College Avenue North",
    dob: "2000-01-23",
    favsport: "pickleball",
  };
  const CARD_INFO = {
    number: "4242 4242 4242 4242",
    exp: "1234",
    cvv: "123",
  };

  // register
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByPlaceholder("Enter Your Name").fill(USER_INFO.name);
  await page.getByPlaceholder("Enter Your Email").fill(USER_INFO.email);
  await page.getByPlaceholder("Enter Your Password").fill(USER_INFO.password);
  await page.getByPlaceholder("Enter Your Phone").fill(USER_INFO.phonenumber);
  await page.getByPlaceholder("Enter Your Address").fill(USER_INFO.address);
  await page.getByPlaceholder("Enter Your DOB").fill(USER_INFO.dob);
  await page.getByPlaceholder("What is Your Favorite sports").fill(USER_INFO.favsport);
  await page.getByRole("button", { name: "REGISTER" }).click();
  await expect(page.getByText("Register Successfully, please login")).toBeVisible();
  await page.waitForURL("/login");

  // login
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Enter Your Email").fill(USER_INFO.email);
  await page.getByPlaceholder("Enter Your Password").fill(USER_INFO.password);
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.waitForURL("/");

  // add products to cart

  await page.getByRole("button", { name: "ADD TO CART" }).first().click({ clickCount: 2 });
  await expect(page.getByText("Item Added to Cart")).toHaveCount(2);

  // go to cart
  await page.getByRole("link", { name: "Cart" }).click();
  await page.waitForURL("/cart");

  // payment
  await page.getByRole("button", { name: "Paying with Card" }).click();
  await page
    .locator('iframe[name="braintree-hosted-field-number"]')
    .contentFrame()
    .getByRole("textbox", { name: "Credit Card Number" })
    .fill(CARD_INFO.number);
  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .fill(CARD_INFO.exp);
  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .fill(CARD_INFO.cvv);
  await page.getByRole("button", { name: "Make Payment" }).click();
  await expect(page.getByRole("button", { name: "Ending in 4242 Visa" })).toBeVisible();

  // check order
  await page.waitForURL("/dashboard/user/orders");
  await expect(page.getByText("Payment Completed Successfully ")).toBeVisible();
  const recentOrder = page.locator("table.table").filter({ hasText: "Quantity" }).last();
  await expect(recentOrder).toContainText("Not Process");
  await expect(recentOrder).toContainText("a few seconds ago");
  const qtyCell = recentOrder.locator("tbody tr td").last();
  await expect(qtyCell).toContainText("2");
});
