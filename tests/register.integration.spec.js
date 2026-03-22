// Paing Khant Kyaw, A0257992J
// @ts-check
import { test, expect } from "@playwright/test";
import userModel from "../models/userModel";

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ page, request }) => {
  const url = "http://localhost:3000//api/v1/auth/register";
  const req = {
    name: "registerdUser",
    email: "registeredUser@gmail.com",
    password: "registeredUserPassword",
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

function randomString(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length);
}

test("Register user successfully", async ({ page }) => {
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Enter Your Name" }).fill("newUser");
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill(`newUser${randomString()}@gmail.com`);
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("1234567890");
  await page.getByRole("textbox", { name: "Enter Your Phone" }).fill("dgasdg");
  await page
    .getByRole("textbox", { name: "Enter Your Address" })
    .fill("asgdsg");
  await page.getByPlaceholder("Enter Your DOB").fill("2000-10-10");
  await page
    .getByRole("textbox", { name: "What is Your Favorite sports" })
    .fill("10");
  await page.getByRole("button", { name: "REGISTER" }).click();
  await expect(page.getByText("Register Successfully, please")).toBeVisible();
});

test("Register using existing email", async ({ page }) => {
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Enter Your Name" }).fill("newUser");
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("registeredUser@gmail.com");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("1234567890");
  await page.getByRole("textbox", { name: "Enter Your Phone" }).fill("dgasdg");
  await page
    .getByRole("textbox", { name: "Enter Your Address" })
    .fill("asgdsg");
  await page.getByPlaceholder("Enter Your DOB").fill("2000-10-10");
  await page
    .getByRole("textbox", { name: "What is Your Favorite sports" })
    .fill("10");
  await page.getByRole("button", { name: "REGISTER" }).click();
  await expect(
    page
      .locator("div")
      .filter({ hasText: "Already Register please login" })
      .nth(4),
  ).toBeVisible();
});

test("User Register with missing fields", async ({ page }) => {
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Enter Your Name" }).fill("    ");
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("dfsafa@fsad.dasg");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("sdagdasg");
  await page
    .getByRole("textbox", { name: "Enter Your Phone" })
    .fill("dsagdasg");
  await page
    .getByRole("textbox", { name: "Enter Your Address" })
    .fill("dsagadsg");
  await page.getByPlaceholder("Enter Your DOB").fill("2000-10-10");
  await page
    .getByRole("textbox", { name: "What is Your Favorite sports" })
    .fill("dsagdagads");
  await page.getByRole("button", { name: "REGISTER" }).click();
  await expect(
    page.locator("div").filter({ hasText: "Name is Required" }).nth(4),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Enter Your Name" })
    .fill("    fdasfadsf");
  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("   ");
  await page.getByRole("button", { name: "REGISTER" }).click();
  await page
    .locator("div")
    .filter({ hasText: "Password is Required" })
    .nth(4)
    .click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("   dafds");
  await page.getByRole("textbox", { name: "Enter Your Phone" }).fill("     ");
  await page.getByRole("button", { name: "REGISTER" }).click();
  await page
    .locator("div")
    .filter({ hasText: "Phone no is Required" })
    .nth(4)
    .click();
  await page
    .getByRole("textbox", { name: "Enter Your Phone" })
    .fill("     asfdsaf");
  await page
    .getByRole("textbox", { name: "Enter Your Phone" })
    .fill("     asfdsa");
  await page.getByRole("textbox", { name: "Enter Your Address" }).fill("    ");
  await page.getByRole("button", { name: "REGISTER" }).click();
  await expect(
    page.locator("div").filter({ hasText: "Address is Required" }).nth(4),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Enter Your Address" })
    .fill("    dafdasf");
  await page
    .getByRole("textbox", { name: "What is Your Favorite sports" })
    .fill("    ");
  await page.getByRole("button", { name: "REGISTER" }).click();
  await expect(
    page.locator("div").filter({ hasText: "Answer is Required" }).nth(4),
  ).toBeVisible();
});
