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
})
