import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = 'user123@gmail.com';
const ADMIN_PASSWORD = '123456';
const USER_EMAIL = 'user@tester.com';
const USER_PASSWORD = '12345678';

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

test.describe('Admin Dashboard - Viewing Bookings', () => {
  test('admin can view dashboard with bookings table', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/admin/bookings');

    await expect(page).toHaveTitle(/Campground/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Admin Dashboard');
    await expect(page.getByText(/view, edit, and delete any booking/i)).toBeVisible();

    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    await expect(table.getByText('Booking ID')).toBeVisible();
    await expect(table.getByText('User Email')).toBeVisible();
    await expect(table.getByText('Campground')).toBeVisible();
    await expect(table.getByText('Check-In')).toBeVisible();
    await expect(table.getByText('Nights')).toBeVisible();
    await expect(table.getByText('Actions')).toBeVisible();
  });

  test('admin can see booking rows with delete and edit buttons', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/bookings');

    const table = page.locator('table');
    await expect(table).toBeVisible();

    const bookingRows = page.locator('table tbody tr');
    const rowCount = await bookingRows.count();

    if (rowCount > 0) {
      const firstRow = bookingRows.first();

      const deleteButton = firstRow.getByRole('button', { name: /delete/i });
      await expect(deleteButton).toBeVisible();

      const editLink = firstRow.getByRole('link', { name: /edit/i });
      await expect(editLink).toBeVisible();
    } else {
      await expect(page.getByText(/No bookings found/i)).toBeVisible();
    }
  });

  test('unauthenticated user is redirected to login when accessing admin dashboard', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/admin/bookings');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('non-admin user is redirected to home when accessing admin dashboard', async ({ page }) => {
    await login(page, USER_EMAIL, USER_PASSWORD);

    await page.goto('/admin/bookings');

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /Admin Dashboard/i })).toHaveCount(0);
  });

  test('admin dashboard loads even if no bookings exist', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/bookings');

    const heading = page.getByRole('heading', { name: /Admin Dashboard/i });
    await expect(heading).toBeVisible();

    const noBookingsMsg = page.getByText(/No bookings found/i);
    const table = page.locator('table');

    const hasNoBookingsMsg = await noBookingsMsg.isVisible().catch(() => false);
    const hasTable = await table.isVisible().catch(() => false);

    expect(hasNoBookingsMsg || hasTable).toBeTruthy();
  });

  test('admin can click Edit button and navigate to edit page', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/bookings');

    const table = page.locator('table');
    await expect(table).toBeVisible();

    const bookingRows = page.locator('table tbody tr');
    const rowCount = await bookingRows.count();

    if (rowCount > 0) {
      const firstRow = bookingRows.first();
      const editLink = firstRow.getByRole('link', { name: /edit/i });

      await expect(editLink).toBeVisible();

      const href = await editLink.getAttribute('href');
      expect(href).toMatch(/\/admin\/bookings\/[^/]+\/edit/);

      await Promise.all([
        page.waitForURL(/\/admin\/bookings\/[^/]+\/edit/),
        editLink.click(),
      ]);

      await expect(page).toHaveURL(/\/admin\/bookings\/[^/]+\/edit/);
    } else {
      await expect(page.getByText(/No bookings found/i)).toBeVisible();
    }
  });
});