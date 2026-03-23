import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const webServer = process.env.PW_SKIP_WEBSERVER
  ? undefined
  : [
      {
        command: 'npm run server',
        url: 'http://localhost:6060',
        timeout: 120_000,
        reuseExistingServer: true,
      },
      {
        command: 'npm run client',
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: true,
      },
    ];

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer,
});
