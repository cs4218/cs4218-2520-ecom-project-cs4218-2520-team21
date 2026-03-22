// Paing Khant Kyaw, A0257992J
// @ts-check
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({page, request}) => {
  const url = "http://localhost:3000//api/v1/auth/register";
  const req = {
    name: "scene9",
    email: "scene9@gmail.com",
    password: "scene9password",
    phone: "11111111",
    address: "nus",
    answer: "scene9",
    DOB: "10-10-2000"
  };
  const response = await request.post(url, {
    headers: {
      "Content-Type": "application/json",
    },
    data: req
  })
  console.log(response)
  expect(response.status()).not.toBe(500)
  await page.goto("http://localhost:3000");
});

test("User login and delete profile", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("scene9@gmail.com");
  await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("scene9password");

  await Promise.all([
    page.getByRole("button", { name: "LOGIN" }).click(),
    page.waitForURL("http://localhost:3000"),
  ]);

  await page.getByRole("button", { name: "scene9" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Profile" }).click();
  await page.getByRole("button", { name: "Delete Account" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("scene9@gmail.com");
  await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("scene9password");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page.getByText("Email is not registered")).toBeVisible();
});
