// Lim Rui Ting Valencia, A0255150N
import { expect, Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type Credentials = {
  email: string;
  password: string;
};

const GENERATED_USER_FILE = path.join(process.cwd(), 'tests/e2e/.runtime-user.json');

export function hasRequiredEnv(names: string[]): boolean {
  return names.every((name) => Boolean(process.env[name]));
}

export function getCredentials(emailEnv: string, passwordEnv: string): Credentials {
  const email = process.env[emailEnv] || '';
  const password = process.env[passwordEnv] || '';
  return { email, password };
}

async function tryLogin(page: Page, creds: Credentials): Promise<boolean> {
  await page.goto('/login');
  await page.getByPlaceholder(/Enter Your Email/i).fill(creds.email);
  await page.getByPlaceholder(/Enter Your Password/i).fill(creds.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  const landedOnHome = await page
    .waitForURL(/\/$/, { timeout: 10_000 })
    .then(() => true)
    .catch(() => false);

  return landedOnHome;
}

function isRuntimeUserEmail(email: string): boolean {
  return email.startsWith('e2e.user.') && email.endsWith('@example.com');
}

export async function login(page: Page, creds: Credentials): Promise<void> {
  const loggedIn = await tryLogin(page, creds);
  if (loggedIn) {
    return;
  }

  // Runtime users are persisted to a local file and can become stale after DB resets.
  if (isRuntimeUserEmail(creds.email)) {
    const freshCreds = await registerNewRuntimeUser(page);
    const retried = await tryLogin(page, freshCreds);
    if (retried) {
      return;
    }
  }

  throw new Error(`Login failed for ${creds.email}. Current URL: ${page.url()}`);
}

export async function registerNewRuntimeUser(page: Page): Promise<Credentials> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const creds: Credentials = {
    email: `e2e.user.${suffix}@example.com`,
    password: `cs4218${suffix.slice(-4)}`,
  };

  await page.goto('/register');
  await page.getByPlaceholder(/Enter Your Name/i).fill(`E2E User ${suffix}`);
  await page.getByPlaceholder(/Enter Your Email/i).fill(creds.email);
  await page.getByPlaceholder(/Enter Your Password/i).fill(creds.password);
  await page.getByPlaceholder(/Enter Your Phone/i).fill(`9${suffix.slice(-7)}`);
  await page.getByPlaceholder(/Enter Your Address/i).fill(`E2E Address ${suffix}`);
  await page.locator('input#exampleInputDOB1').fill('2000-01-01');
  await page.getByPlaceholder(/What is Your Favorite sports/i).fill('football');
  await page.getByRole('button', { name: 'REGISTER' }).click();

  const loginUrlMatched = await page
    .waitForURL(/\/login$/, { timeout: 12_000 })
    .then(() => true)
    .catch(() => false);

  if (!loginUrlMatched) {
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    if (bodyText.includes('already register please login')) {
      await page.goto('/login');
    } else {
      throw new Error('Runtime user registration did not redirect to /login. Check backend availability and registration validation.');
    }
  }

  await fs.writeFile(GENERATED_USER_FILE, JSON.stringify(creds), 'utf-8');

  return creds;
}

export async function getOrCreateRuntimeUser(page: Page): Promise<Credentials> {
  try {
    const data = await fs.readFile(GENERATED_USER_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Credentials;
    if (parsed.email && parsed.password) {
      return parsed;
    }
  } catch (error) {
    // No generated user yet for this run; create one.
  }

  return registerNewRuntimeUser(page);
}

export async function openAccountDropdown(page: Page): Promise<void> {
  const accountDropdown = page.locator('a.nav-link.dropdown-toggle').last();
  await expect(accountDropdown).toBeVisible();
  await accountDropdown.click();
}

export async function goToDashboardFromHeader(page: Page): Promise<void> {
  await openAccountDropdown(page);
  await page.getByRole('link', { name: 'Dashboard' }).click();
}

export async function logout(page: Page): Promise<void> {
  await openAccountDropdown(page);
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
}
