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

  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://127.0.0.1:${frontendPort}`,
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    /* Show browser during test (set to true if you want to run invisible) */
    headless: true,
    viewport: { width: 1280, height: 720 },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 1000,
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
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
