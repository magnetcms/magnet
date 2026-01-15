import { expect, test } from '@playwright/test'
import { testData } from '../../src/helpers/test-data'
import { ContentManagerPage } from '../../src/page-objects/content-manager.page'
import { LoginPage } from '../../src/page-objects/login.page'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

test.describe('Content Manager UI', () => {
	test.beforeEach(async ({ page, request }) => {
		const userData = testData.user.create()

		await request
			.post(`${API_BASE_URL}/auth/register`, {
				data: userData,
			})
			.catch(() => {})

		const loginPage = new LoginPage(page)
		await loginPage.goto()
		await loginPage.login(userData.email, userData.password)
		await page.waitForURL(/^\/$|\/dashboard|\/content-manager/)
	})

	test('displays schema list', async ({ page }) => {
		const contentManager = new ContentManagerPage(page)
		await contentManager.goto()

		await expect(page.getByText(/cat/i)).toBeVisible({ timeout: 10000 })
	})

	test('can navigate to schema items', async ({ page }) => {
		const contentManager = new ContentManagerPage(page)
		await contentManager.goto()

		await page.getByRole('link', { name: /cat/i }).click()

		await expect(page).toHaveURL(/content-manager\/.*cat/i)
	})

	test('can view item list for a schema', async ({ page }) => {
		const contentManager = new ContentManagerPage(page)
		await contentManager.gotoSchema('cats')

		await expect(
			page.getByRole('table').or(page.getByText(/no items|empty|create/i)),
		).toBeVisible()
	})
})
