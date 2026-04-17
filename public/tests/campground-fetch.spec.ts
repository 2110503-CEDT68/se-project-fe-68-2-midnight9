import { test, expect } from '@playwright/test'
import { table } from 'console'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = 'user123@gmail.com'
const ADMIN_PASSWORD = '123456'
const USER_EMAIL = 'user@tester.com'
const USER_PASSWORD = '12345678'

/**
 * Login helper function
 */
async function login(page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForNavigation()
}

test.describe('Admin Dashboard - Viewing Bookings', () => {
  test('admin can view dashboard with bookings table', async ({ page }) => {
    // Login as admin
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

    // Navigate to admin dashboard
    await page.goto(`${BASE_URL}/admin/bookings`)

    // Verify page loaded
    await expect(page).toHaveTitle(/Campground/)
    
    // Check for admin dashboard heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Admin Dashboard')
    
    // Check for description text
    await expect(page.getByText(/view, edit, and delete any booking/i)).toBeVisible()

    // Verify table is present with headers
    await expect(page.getByRole('table').getByText('Booking ID')).toBeVisible()
    await expect(page.getByRole('table').getByText('User Email')).toBeVisible()
    await expect(page.getByRole('table').getByText('Campground')).toBeVisible()
    await expect(page.getByRole('table').getByText('Check-In')).toBeVisible()
    await expect(page.getByRole('table').getByText('Nights')).toBeVisible()
    await expect(page.getByRole('table').getByText('Actions')).toBeVisible()
  })

  test('admin can see booking rows with delete and edit buttons', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    await page.goto(`${BASE_URL}/admin/bookings`)

    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 })

    // Check that at least one booking row exists
    const bookingRows = page.locator('table tbody tr')
    const rowCount = await bookingRows.count()
    
    if (rowCount > 0) {
      // Get first row and verify it has Delete and Edit buttons
      const firstRow = bookingRows.first()
      
      // Verify Delete button exists in first row
      const deleteButton = firstRow.getByRole('button', { name: /delete/i })
      await expect(deleteButton).toBeVisible()

      // Verify Edit link exists in first row
      const editLink = firstRow.getByRole('link', { name: /edit/i })
      await expect(editLink).toBeVisible()
    }
  })

  // test('admin can see toast message when deleting is in progress', async ({ page }) => {
  //   await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
  //   await page.goto(`${BASE_URL}/admin/bookings`)

  //   // Wait for table to load
  //   await page.waitForSelector('table tbody tr', { timeout: 5000 })

  //   const bookingRows = page.locator('table tbody tr')
  //   const rowCount = await bookingRows.count()

  //   if (rowCount > 0) {
  //     const firstRow = bookingRows.first()
  //     const deleteButton = firstRow.getByRole('button', { name: /delete/i })

  //     // Click delete button (this should trigger a confirmation dialog or toast)
  //     await deleteButton.click()

  //     // If a confirmation modal appears, we should see it
  //     // The exact behavior depends on your implementation
  //     // This is a placeholder for modal/confirmation handling
  //     await page.waitForTimeout(500)
  //   }
  // })

  test('unauthenticated user is redirected to login when accessing admin dashboard', async ({ page }) => {
    // Try to access admin page without login
    await page.goto(`${BASE_URL}/admin/bookings`)

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/)
    
    // Verify login form is visible
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('non-admin user is redirected to home when accessing admin dashboard', async ({ page }) => {
    // Login as regular user
    await login(page, USER_EMAIL, USER_PASSWORD)

    // Try to access admin dashboard
    await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'networkidle' })

    // Should be redirected to home page
    await expect(page).toHaveURL(`${BASE_URL}/`)

    // Verify not seeing admin dashboard content
    await expect(page.getByText('Admin Dashboard')).not.toBeVisible()
  })

  // test('admin dashboard table is responsive on mobile', async ({ page }) => {
  //   // Use mobile viewport
  //   await page.setViewportSize({ width: 375, height: 667 })

  //   await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
  //   await page.goto(`${BASE_URL}/admin/bookings`)

  //   // Table should still be visible and scrollable
  //   const table = page.locator('table')
  //   await expect(table).toBeVisible()

  //   // Check that overflow-x-auto class is present on container
  //   const tableContainer = page.locator('.overflow-x-auto')
  //   await expect(tableContainer).toBeVisible()
  // })

  test('admin dashboard loads even if no bookings exist', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    await page.goto(`${BASE_URL}/admin/bookings`)

    // Page should load with either table or "no bookings" message
    const heading = page.getByRole('heading', { name: /Admin Dashboard/i })
    const noBookingsMsg = page.getByText(/No bookings found/i)
    const table = page.locator('table')

    // At least one of these should be visible
    const headingVisible = await heading.isVisible()
    const noBookingsVisible = await noBookingsMsg.isVisible()
    const tableVisible = await table.isVisible()

    expect(headingVisible || noBookingsVisible || tableVisible).toBeTruthy()
  })

  test('admin can click Edit button and navigate to edit page', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    await page.goto(`${BASE_URL}/admin/bookings`)

    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 })

    const bookingRows = page.locator('table tbody tr')
    const rowCount = await bookingRows.count()

    if (rowCount > 0) {
      const firstRow = bookingRows.first()
      const editLink = firstRow.getByRole('link', { name: /edit/i })

      // Get the href to verify it's navigating to edit page
      const href = await editLink.getAttribute('href')
      expect(href).toMatch(/\/admin\/bookings\/[^/]+\/edit/)

      // Optionally click and verify navigation
      await editLink.click()
      await page.waitForNavigation()
      await expect(page).toHaveURL(/\/admin\/bookings\/[^/]+\/edit/)
    }
  })
})
