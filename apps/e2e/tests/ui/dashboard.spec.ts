import { expect, test } from '@playwright/test'
import { testData } from '../../src/helpers/test-data'
import { DashboardPage } from '../../src/page-objects/dashboard.page'
import { LoginPage } from '../../src/page-objects/login.page'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

test.describe('Dashboard UI', () => {
	test.beforeEach(async ({ page, request }) => {
		const userData = testData.user.create()

		const statusResponse = await request.get(`${API_BASE_URL}/auth/status`)
		const status = await statusResponse.json()

		if (status.requiresSetup) {
			await request.post(`${API_BASE_URL}/auth/register`, {
				data: userData,
			})
		} else {
			await request
				.post(`${API_BASE_URL}/auth/register`, {
					data: userData,
				})
				.catch(() => {})
		}

		const loginPage = new LoginPage(page)
		await loginPage.goto()
		await loginPage.login(userData.email, userData.password)

		await page.waitForURL(/^\/$|\/dashboard|\/content-manager/)
	})

	test('dashboard loads successfully', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()
		await dashboard.expectLoaded()
	})

	test('can navigate to content manager', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()
		await dashboard.navigateToContentManager()

		await expect(page).toHaveURL(/content-manager/)
	})

	test('can navigate to settings', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()
		await dashboard.navigateToSettings()

		await expect(page).toHaveURL(/settings/)
	})

	test('can navigate to media library', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()
		await dashboard.navigateToMedia()

		await expect(page).toHaveURL(/media/)
	})

	test('can navigate to account page', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()
		await dashboard.navigateToAccount()

		await expect(page).toHaveURL(/account/)
	})

	test('can navigate back to home', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()

		// Navigate away first
		await dashboard.navigateToContentManager()
		await expect(page).toHaveURL(/content-manager/)

		// Navigate back to home
		await dashboard.navigateToHome()
		await expect(page).toHaveURL(/^\/$|\/dashboard/)
	})

	test('sidebar navigation is visible', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()

		await expect(dashboard.sidebar).toBeVisible()
	})

	test('user menu is visible when authenticated', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()

		await dashboard.expectUserMenuVisible()
	})

	test('can access all main sections from sidebar', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()

		// Get all sidebar items
		const sidebarItems = await dashboard.getSidebarItems()

		// Should have at least some navigation items
		expect(sidebarItems.length).toBeGreaterThan(0)

		// Verify we can navigate to content manager
		await dashboard.navigateToContentManager()
		await expect(page).toHaveURL(/content-manager/)

		// Navigate back
		await dashboard.goto()

		// Verify we can navigate to media
		await dashboard.navigateToMedia()
		await expect(page).toHaveURL(/media/)
	})

	test('dashboard shows statistics or overview', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()

		// Dashboard should show some content (stats, recent items, etc.)
		await expect(dashboard.mainContent).toBeVisible()

		// May have cards, stats, or other dashboard elements
		const hasContent =
			(await page.getByRole('heading').count()) > 0 ||
			(await page.locator('[data-testid="stat"], .card, .grid').count()) > 0

		expect(hasContent).toBe(true)
	})

	test('dashboard is accessible after page reload', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.goto()
		await dashboard.expectLoaded()

		// Reload page
		await page.reload()
		await page.waitForTimeout(1000)

		// Should still be on dashboard and loaded
		await expect(page).toHaveURL(/^\/$|\/dashboard/)
		await dashboard.expectLoaded()
	})
})
