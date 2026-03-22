// Xenos Fiorenzo Anong, A0257672U
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.use({
  baseURL: "http://localhost:3000/",
});

export const randomEmail = () =>
  `testscenario1-${(Math.random() + 1).toString(36).substring(7)}@example.com`;

test("user registers, user logs in, user adds product to cart, user checks cart, user updates address", async ({
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

  // add product to cart
  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await expect(page.getByText("Item Added to Cart")).toBeVisible();

  // go to cart
  await page.getByRole("link", { name: "Cart" }).click();
  await page.waitForURL("/cart");

  // update address
  await page.getByRole("button", { name: "Update Address" }).click();

  const addressField = page.getByPlaceholder("Enter Your Address");
  await expect(addressField).toHaveValue(USER_INFO.address);
  await addressField.fill("321 College Avenue South");
  await page.getByRole("button", { name: "UPDATE" }).click();
  await expect(page.getByText("Profile Updated Successfully")).toBeVisible();
});
