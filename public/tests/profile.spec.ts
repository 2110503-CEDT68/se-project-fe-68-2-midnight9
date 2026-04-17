import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER = {
  email: 'user123@gmail.com',
  password: '123456',
  expectedName: 'User123'
};

async function login(page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  
  await Promise.all([
    page.waitForURL(`${BASE_URL}`), 
    page.click('button[type="submit"]')
  ]);
}

/**
 * Suite: Profile Module Technical Validation
 * Validates the End-to-End lifecycle: Authentication -> Data Fetching -> UI Rendering.
 */
test.describe('Profile Data Fetching & UI Rendering', () => {

  test('TC-01: Successfully fetch and render profile data after authentication', async ({ page }) => {
    // Step 1: Authentication Phase
    await login(page, TEST_USER.email, TEST_USER.password)

    // Step 2: Navigation & Data Fetching
    await page.goto(`${BASE_URL}/profile`);

    // Step 3: Verify Data Integrity in UI Rendering
    const nameDisplay = page.locator('label:has-text("Full name") + div');
    const emailDisplay = page.locator('label:has-text("Email") + div');

    // Assert that the default '—' placeholder is replaced by actual API data
    await expect(nameDisplay).not.toHaveText('—', { timeout: 15000 });
    await expect(nameDisplay).toContainText(TEST_USER.expectedName);
    await expect(emailDisplay).toContainText(TEST_USER.email);
  });


  test('TC-02: Enforce authentication guard for protected profile route', async ({ page }) => {
    // Step 1: Ensure clean state (no session cookies)
    await page.context().clearCookies();
    
    // Step 2: Attempt to access protected route
    await page.goto(`${BASE_URL}/profile`);

    // Step 3: Assert UI behavior and redirection for unauthenticated users
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verify visibility of the login portal heading
    const loginHeading = page.getByRole('heading', { name: /Welcome back|Login/i });
    await expect(loginHeading).toBeVisible();
  });


  test('TC-03: Verify visibility and state of administrative action buttons', async ({ page }) => {
    // Step 1: Re-authenticate for UI check
    await login(page, TEST_USER.email, TEST_USER.password)

    // Step 2: Navigation & Data Fetching
    await page.goto(`${BASE_URL}/profile`);

    // Step 3: Verify visibility and state of action buttons
    const editBtn = page.getByRole('button', { name: 'Edit' });
    const deleteBtn = page.getByRole('button', { name: 'Delete' });

    // Assert visibility and Tailwind CSS class integrity
    await expect(editBtn).toBeVisible();
    await expect(editBtn).toHaveClass(/bg-slate-800/); 

    await expect(deleteBtn).toBeVisible();
    await expect(deleteBtn).toHaveClass(/text-red-600/);
  });

});