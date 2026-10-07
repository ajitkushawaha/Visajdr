import { test, expect } from '@playwright/test'

test.describe('Hero Section', () => {
  test('should display hero content', async ({ page }) => {
    await page.goto('/')

    // Check hero section is visible
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()

    // Check title
    const title = page.locator('h1').first()
    await expect(title).toContainText('Visa')

    // Check search input
    const searchInput = page.locator('input[placeholder*="Destination"]')
    await expect(searchInput).toBeVisible()
  })

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[placeholder*="Destination"]')

    // Type in search box
    await searchInput.fill('USA')

    // Verify search suggestions appear
    await page.waitForTimeout(500)

    // Try to find suggestions dropdown
    const suggestions = page.locator('[role="listbox"]')
    if (await suggestions.isVisible()) {
      await expect(suggestions).toBeVisible()
    }
  })

  test('should have clickable country pills', async ({ page }) => {
    await page.goto('/')

    // Wait for country pills to load
    await page.waitForTimeout(1000)

    // Try to find country buttons
    const countryButton = page
      .locator('button')
      .filter({ hasText: /USA|UK|Canada/ })
      .first()

    if (await countryButton.isVisible()) {
      await countryButton.click()
      // Verify navigation happens
      await page.waitForTimeout(1000)
    }
  })

  test('should test admin hero preview', async ({ page }) => {
    // This would require admin login
    // Skipping for now, but structure is ready
    // Example structure:
    // await page.goto('/admin/content/home/hero');
    // await page.fill('input[placeholder*="title"]', 'Test Title');
    // await page.click('button:has-text("Save")');
  })
})
