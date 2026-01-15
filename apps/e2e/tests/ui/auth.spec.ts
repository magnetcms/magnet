import { test } from '@playwright/test'
import { LoginPage } from '../../src/page-objects/login.page'

test.describe('Authentication UI', () => {
	test('displays login form', async ({ page }) => {
		const loginPage = new LoginPage(page)

		await loginPage.goto()
		await loginPage.expectLoginForm()
	})

	test('shows error for invalid credentials', async ({ page }) => {
		const loginPage = new LoginPage(page)

		await loginPage.goto()
		await loginPage.login('invalid@example.com', 'wrongpassword')

		await loginPage.expectError()
	})
})
