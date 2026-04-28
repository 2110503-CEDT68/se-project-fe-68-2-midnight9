import { defineConfig, devices } from '@playwright/test';

const frontendPort = 3100;
const backendPort = 5100;
const localApiUrl = `http://127.0.0.1:${backendPort}/api/v1`;
const e2eRunId = Date.now();

process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? localApiUrl;
process.env.INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? localApiUrl;
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? `http://127.0.0.1:${frontendPort}`;
process.env.E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? `pw-admin-${e2eRunId}@example.com`;
process.env.E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '12345678';
process.env.E2E_USER_EMAIL = process.env.E2E_USER_EMAIL ?? `pw-user-${e2eRunId}@example.com`;
process.env.E2E_USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? '12345678';

export default defineConfig({
  testDir: './public/tests',
  testMatch: /.*\.spec\.ts/,

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: 'on-first-retry',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 300,
        },
      },
    },
  ],

  webServer: [
    {
      command: 'node server.js',
      cwd: '../se-project-be-68-2-midnight9',
      env: {
        ...process.env,
        PORT: String(backendPort),
        PLAYWRIGHT_TEST: '1',
      },
      url: `http://127.0.0.1:${backendPort}`,
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: 'npm run dev',
      env: {
        ...process.env,
        PORT: String(frontendPort),
        NEXT_PUBLIC_API_URL: localApiUrl,
        INTERNAL_API_URL: localApiUrl,
        NEXTAUTH_URL: `http://127.0.0.1:${frontendPort}`,
        E2E_ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL,
        E2E_ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD,
        E2E_USER_EMAIL: process.env.E2E_USER_EMAIL,
        E2E_USER_PASSWORD: process.env.E2E_USER_PASSWORD,
      },
      url: `http://127.0.0.1:${frontendPort}`,
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ],
});