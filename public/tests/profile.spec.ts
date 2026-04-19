import { test, expect, Page } from '@playwright/test';

const TEST_USER = {
  email: 'user123@gmail.com',
  password: '123456',
};

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  await Promise.all([
    page.waitForURL((url) => {
      const current = url.toString();
      return current === 'http://localhost:3000/' || current === 'http://localhost:3000';
    }),
    page.click('button[type="submit"]'),
  ]);
}

test.describe('Profile Data Fetching & UI Rendering', () => {
  test('TC-01: Successfully fetch and render profile data after authentication', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);

    await page.goto('/profile');

    const nameInput = page.getByLabel(/full name/i);
    const emailInput = page.getByLabel(/email address/i);

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    await expect(nameInput).not.toHaveValue('', { timeout: 15000 });
    await expect(emailInput).toHaveValue(TEST_USER.email);
  });

  test('TC-02: Enforce authentication guard for protected profile route', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('TC-03: Verify visibility and state of administrative action buttons', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);

    await page.goto('/profile');

    const editBtn = page.getByRole('button', { name: /edit profile/i });
    const deleteBtn = page.getByRole('button', { name: /delete account/i });

    await expect(editBtn).toBeVisible();
    await expect(deleteBtn).toBeVisible();

    await expect(editBtn).toBeEnabled();
    await expect(deleteBtn).toBeEnabled();
  });
});