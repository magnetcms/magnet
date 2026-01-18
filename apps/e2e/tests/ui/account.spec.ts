import { expect, test } from '@playwright/test'
import { testData } from '../../src/helpers/test-data'
import { AccountPage } from '../../src/page-objects/account.page'
import { DashboardPage } from '../../src/page-objects/dashboard.page'
import { LoginPage } from '../../src/page-objects/login.page'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

test.describe('Account Page UI', () => {
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

	test('can navigate to account page', async ({ page }) => {
		const dashboard = new DashboardPage(page)
		await dashboard.navigateToAccount()

		const accountPage = new AccountPage(page)
		await accountPage.expectLoaded()
	})

	test('displays user profile information', async ({ page }) => {
		const accountPage = new AccountPage(page)
		await accountPage.goto()

		// Should show avatar, name, email
		await expect(accountPage.avatar).toBeVisible({ timeout: 5000 })
		await expect(accountPage.nameInput).toBeVisible()
		await expect(accountPage.emailInput).toBeVisible()
	})

	test('can view profile tab', async ({ page }) => {
		const accountPage = new AccountPage(page)
		await accountPage.goto()

		await accountPage.switchToProfileTab()
		await expect(accountPage.nameInput).toBeVisible()
		await expect(accountPage.emailInput).toBeVisible()
	})

	test('can view security tab', async ({ page }) => {
		const accountPage = new AccountPage(page)
		await accountPage.goto()

		await accountPage.switchToSecurityTab()
		await expect(accountPage.currentPasswordInput).toBeVisible()
		await expect(accountPage.newPasswordInput).toBeVisible()
		await expect(accountPage.confirmPasswordInput).toBeVisible()
	})

	test('can update profile information', async ({ page }) => {
		const accountPage = new AccountPage(page)
		await accountPage.goto()

		const newName = `Updated Name ${Date.now()}`
		await accountPage.updateProfile({ name: newName })

		// Wait for update to complete
		await page.waitForTimeout(2000)

		// Verify update (either success message or updated value)
		await expect(
			page
				.getByText(/profile updated|saved successfully/i)
				.or(page.getByText(newName)),
		).toBeVisible({ timeout: 5000 })
	})

	test('can change password', async ({ page }) => {
		const accountPage = new AccountPage(page)
		await accountPage.goto()

		// Get current password from test data
		const currentPassword = testData.user.create().password
		const newPassword = `NewPassword${Date.now()}!`

		await accountPage.changePassword({
			currentPassword,
			newPassword,
			confirmPassword: newPassword,
		})

		// Wait for password change to complete
		await page.waitForTimeout(2000)

		// Verify password change success
		await expect(
			page.getByText(/password changed|saved successfully/i),
		).toBeVisible({ timeout: 5000 })
	})

	test('password change requires matching confirmation', async ({ page }) => {
		const accountPage = new AccountPage(page)
		await accountPage.goto()

		await accountPage.switchToSecurityTab()

		const currentPassword = testData.user.create().password
		await accountPage.currentPasswordInput.fill(currentPassword)
		await accountPage.newPasswordInput.fill('NewPassword123!')
		await accountPage.confirmPasswordInput.fill('DifferentPassword123!')

		await accountPage.changePasswordButton.click()
		await page.waitForTimeout(1000)

		// Should show error for mismatched passwords
		await expect(page.getByText(/do not match|mismatch|error/i)).toBeVisible({
			timeout: 3000,
		})
	})

	test('can logout after password change and login with new password', async ({
		page,
		request,
	}) => {
		const userData = testData.user.create()
		const accountPage = new AccountPage(page)
		const dashboard = new DashboardPage(page)

		// Change password
		await accountPage.goto()
		const newPassword = `NewPassword${Date.now()}!`

		await accountPage.changePassword({
			currentPassword: userData.password,
			newPassword,
			confirmPassword: newPassword,
		})

		await page.waitForTimeout(2000)

		// Logout
		await dashboard.goto()
		await dashboard.logout()

		// Login with new password
		const loginPage = new LoginPage(page)
		await loginPage.login(userData.email, newPassword)

		// Should successfully login
		await page.waitForURL(/^\/$|\/dashboard|\/content-manager/, {
			timeout: 10000,
		})
		await dashboard.expectLoaded()
	})

	test('profile form shows validation errors', async ({ page }) => {
		const accountPage = new AccountPage(page)
		await accountPage.goto()

		await accountPage.switchToProfileTab()

		// Clear required fields if they exist
		const emailInput = accountPage.emailInput
		if (await emailInput.isVisible()) {
			await emailInput.clear()
			await emailInput.fill('invalid-email')

			await accountPage.saveProfileButton.click()
			await page.waitForTimeout(500)

			// Should show validation error
			await expect(page.getByText(/invalid|error|validation/i)).toBeVisible({
				timeout: 3000,
			})
		}
	})

	test('account page persists after navigation', async ({ page }) => {
		const accountPage = new AccountPage(page)
		await accountPage.goto()

		// Navigate away
		const dashboard = new DashboardPage(page)
		await dashboard.goto()

		// Navigate back
		await dashboard.navigateToAccount()

		// Should still be on account page
		await accountPage.expectLoaded()
	})
})
