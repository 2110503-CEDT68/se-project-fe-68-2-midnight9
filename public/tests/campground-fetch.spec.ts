import { test, expect } from '@playwright/test'
import { table } from 'console'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = 'user123@gmail.com'
const ADMIN_PASSWORD = '123456'
const USER_EMAIL = 'user@tester.com'
const USER_PASSWORD = '12345678'

async function login(page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForNavigation()
}

test.describe('Admin Dashboard - Viewing Bookings', () => {
  test('admin can view dashboard with bookings table', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

    await page.goto(`${BASE_URL}/admin/bookings`)

    await expect(page).toHaveTitle(/Campground/)
    
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Admin Dashboard')
    
    await expect(page.getByText(/view, edit, and delete any booking/i)).toBeVisible()

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

    await page.waitForSelector('table tbody tr', { timeout: 5000 })

    const bookingRows = page.locator('table tbody tr')
    const rowCount = await bookingRows.count()
    
    if (rowCount > 0) {
      const firstRow = bookingRows.first()
      
      const deleteButton = firstRow.getByRole('button', { name: /delete/i })
      await expect(deleteButton).toBeVisible()

      const editLink = firstRow.getByRole('link', { name: /edit/i })
      await expect(editLink).toBeVisible()
    }
  })

  test('unauthenticated user is redirected to login when accessing admin dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/bookings`)

    await expect(page).toHaveURL(/\/login/)
    
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('non-admin user is redirected to home when accessing admin dashboard', async ({ page }) => {
    await login(page, USER_EMAIL, USER_PASSWORD)

    await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'networkidle' })

    await expect(page).toHaveURL(`${BASE_URL}/`)

    await expect(page.getByText('Admin Dashboard')).not.toBeVisible()
  })

  test('admin dashboard loads even if no bookings exist', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    await page.goto(`${BASE_URL}/admin/bookings`)

    const heading = page.getByRole('heading', { name: /Admin Dashboard/i })
    const noBookingsMsg = page.getByText(/No bookings found/i)
    const table = page.locator('table')

    const headingVisible = await heading.isVisible()
    const noBookingsVisible = await noBookingsMsg.isVisible()
    const tableVisible = await table.isVisible()

    expect(headingVisible || noBookingsVisible || tableVisible).toBeTruthy()
  })

  test('admin can click Edit button and navigate to edit page', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    await page.goto(`${BASE_URL}/admin/bookings`)

    await page.waitForSelector('table tbody tr', { timeout: 5000 })

    const bookingRows = page.locator('table tbody tr')
    const rowCount = await bookingRows.count()

    if (rowCount > 0) {
      const firstRow = bookingRows.first()
      const editLink = firstRow.getByRole('link', { name: /edit/i })

      const href = await editLink.getAttribute('href')
      expect(href).toMatch(/\/admin\/bookings\/[^/]+\/edit/)

      await editLink.click()
      await page.waitForNavigation()
      await expect(page).toHaveURL(/\/admin\/bookings\/[^/]+\/edit/)
    }
  })
})
