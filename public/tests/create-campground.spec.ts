import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = 'user123@gmail.com';
const ADMIN_PASSWORD = '123456';
const USER_EMAIL = 'user@tester.com';
const USER_PASSWORD = '12345678';

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  await Promise.all([
    page.waitForURL((url) => {
      const current = url.toString();
      return current === 'http://localhost:3000/' || current === 'http://localhost:3000';
    }),
    page.getByRole('button', { name: /login/i }).click(),
  ]);
}

async function fillCreateCampgroundForm(page: Page, name: string) {
  await page.getByLabel(/campground name/i).fill(name);
  await page.getByLabel(/picture url/i).fill('https://test.com/camp.jpg');
  await page.getByLabel(/^address$/i).fill('99 Automated Test Street');
  await page.getByLabel(/district/i).fill('Pathum Wan');
  await page.getByLabel(/province/i).fill('Bangkok');
  await page.getByLabel(/region/i).fill('Central');
  await page.getByLabel(/postal code/i).fill('10330');
  await page.getByLabel(/phone number/i).fill('0812345678');
}

test.describe('Campground Creation and Error Handling', () => {
  test('TC-01: unauthenticated user is redirected to login when accessing create campground page', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/admin/campgrounds/create');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('TC-02: non-admin user is redirected away from create campground page', async ({ page }) => {
    await login(page, USER_EMAIL, USER_PASSWORD);

    await page.goto('/admin/campgrounds/create');

    await expect(page).toHaveURL(/\/campgrounds/);
  });

  test('TC-03: admin can access create campground page and see form fields', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/admin/campgrounds/create');

    await expect(page).toHaveURL(/\/admin\/campgrounds\/create/);

    await expect(page.getByLabel(/campground name/i)).toBeVisible();
    await expect(page.getByLabel(/picture url/i)).toBeVisible();
    await expect(page.getByLabel(/^address$/i)).toBeVisible();
    await expect(page.getByLabel(/district/i)).toBeVisible();
    await expect(page.getByLabel(/province/i)).toBeVisible();
    await expect(page.getByLabel(/region/i)).toBeVisible();
    await expect(page.getByLabel(/postal code/i)).toBeVisible();
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^create$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /cancel/i })).toBeVisible();
  });

  test('TC-04: client-side validation appears when submitting empty form', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/admin/campgrounds/create');

    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page.getByText(/please fill in all fields/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/campgrounds\/create/);
  });

  test('TC-05: submission is blocked when phone number is clearly invalid', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/admin/campgrounds/create');

    await page.getByLabel(/campground name/i).fill('Playwright Invalid Phone Camp');
    await page.getByLabel(/picture url/i).fill('https://test.com/camp.jpg');
    await page.getByLabel(/^address$/i).fill('123 Test Road');
    await page.getByLabel(/district/i).fill('Test District');
    await page.getByLabel(/province/i).fill('Bangkok');
    await page.getByLabel(/region/i).fill('Central');
    await page.getByLabel(/postal code/i).fill('10100');
    await page.getByLabel(/phone number/i).fill('abcde');

    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(
      page.getByText(/please enter a valid thai phone number/i)
    ).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/campgrounds\/create/);
  });

  test('TC-06: admin can create campground successfully', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/admin/campgrounds/create');

    await page.route('**/api/v1/campgrounds', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'playwright-created-id',
            name: 'Playwright Campground',
          },
        }),
      });
    });

    const uniqueName = `Playwright Campground ${Date.now()}`;
    await fillCreateCampgroundForm(page, uniqueName);

    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page.getByText(/campground created successfully/i)).toBeVisible();
  });

  test('TC-07: backend error message is shown when server creation fails', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/admin/campgrounds/create');

    await page.route('**/api/v1/campgrounds', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal Server Error',
        }),
      });
    });

    await fillCreateCampgroundForm(page, 'Fail Test Campground');

    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(
      page.getByText(/internal server error|failed to create campground|failed|error/i)
    ).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/campgrounds\/create/);
  });
});