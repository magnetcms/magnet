import { expect, test } from '@playwright/test'
import { testData } from '../../src/helpers/test-data'
import { DashboardPage } from '../../src/page-objects/dashboard.page'
import { LoginPage } from '../../src/page-objects/login.page'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

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

	test.describe('User Registration Flow', () => {
		test('initial setup shows registration form', async ({ page, request }) => {
			// Check if setup is required
			const statusResponse = await request.get(`${API_BASE_URL}/auth/status`)
			const status = await statusResponse.json()

			if (status.requiresSetup) {
				const loginPage = new LoginPage(page)
				await loginPage.goto()

				// Should show registration/setup form
				await expect(
					page.getByText(/setup|register|create account/i),
				).toBeVisible()
			} else {
				test.skip(true, 'Setup not required, users already exist')
			}
		})

		test('can register first user and redirects to dashboard', async ({
			page,
			request,
		}) => {
			const statusResponse = await request.get(`${API_BASE_URL}/auth/status`)
			const status = await statusResponse.json()

			test.skip(
				!status.requiresSetup,
				'Users already exist, registration may be restricted',
			)

			const userData = testData.user.create()
			const loginPage = new LoginPage(page)

			await loginPage.goto()
			await loginPage.setup(userData.email, userData.password)

			// Should redirect to dashboard
			await page.waitForURL(/^\/$|\/dashboard|\/content-manager/, {
				timeout: 10000,
			})

			// Verify we're on dashboard
			const dashboard = new DashboardPage(page)
			await dashboard.expectLoaded()
		})

		test('registration form validation', async ({ page }) => {
			const loginPage = new LoginPage(page)
			await loginPage.goto()

			// Try to submit empty form
			const submitButton = page.getByRole('button', {
				name: /sign in|create account|submit|login/i,
			})
			await submitButton.click()

			// Should show validation errors (if implemented)
			// This test may need adjustment based on actual form validation
			await page.waitForTimeout(500)
		})
	})

	test.describe('Login Flow', () => {
		test('can login with valid credentials', async ({ page, request }) => {
			const userData = testData.user.create()

			// Ensure user exists
			const statusResponse = await request.get(`${API_BASE_URL}/auth/status`)
			const status = await statusResponse.json()

			if (status.requiresSetup) {
				await request.post(`${API_BASE_URL}/auth/register`, {
					data: userData,
				})
			} else {
				// Try to register, ignore if fails (user might exist)
				await request
					.post(`${API_BASE_URL}/auth/register`, {
						data: userData,
					})
					.catch(() => {})
			}

			const loginPage = new LoginPage(page)
			await loginPage.goto()
			await loginPage.login(userData.email, userData.password)

			// Should redirect to dashboard
			await page.waitForURL(/^\/$|\/dashboard|\/content-manager/, {
				timeout: 10000,
			})

			const dashboard = new DashboardPage(page)
			await dashboard.expectLoaded()
		})

		test('shows error for invalid credentials', async ({ page }) => {
			const loginPage = new LoginPage(page)

			await loginPage.goto()
			await loginPage.login('invalid@example.com', 'wrongpassword')

			await loginPage.expectError()
		})
	})

	test.describe('Logout Flow', () => {
		test('logout button is visible when authenticated', async ({
			page,
			request,
		}) => {
			const userData = testData.user.create()

			// Ensure user exists and login
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
			await page.waitForURL(/^\/$|\/dashboard|\/content-manager/, {
				timeout: 10000,
			})

			const dashboard = new DashboardPage(page)
			// Logout button should be accessible via user menu
			await expect(dashboard.userMenuButton).toBeVisible()
		})

		test('logout clears session and redirects to login', async ({
			page,
			request,
		}) => {
			const userData = testData.user.create()

			// Ensure user exists and login
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
			await page.waitForURL(/^\/$|\/dashboard|\/content-manager/, {
				timeout: 10000,
			})

			const dashboard = new DashboardPage(page)
			await dashboard.logout()

			// Should redirect to login
			await page.waitForURL(/auth/, { timeout: 5000 })
			await loginPage.expectLoginForm()
		})

		test('cannot access protected routes after logout', async ({
			page,
			request,
		}) => {
			const userData = testData.user.create()

			// Ensure user exists and login
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
			await page.waitForURL(/^\/$|\/dashboard|\/content-manager/, {
				timeout: 10000,
			})

			// Logout
			const dashboard = new DashboardPage(page)
			await dashboard.logout()

			// Try to access protected route
			await page.goto('content-manager')
			// Should redirect to login
			await page.waitForURL(/auth/, { timeout: 5000 })
		})
	})

	test.describe('Session Management', () => {
		test('token persists across page reloads', async ({ page, request }) => {
			const userData = testData.user.create()

			// Ensure user exists and login
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
			await page.waitForURL(/^\/$|\/dashboard|\/content-manager/, {
				timeout: 10000,
			})

			// Reload page
			await page.reload()

			// Should still be authenticated
			await expect(page).not.toHaveURL(/auth/)
			const dashboard = new DashboardPage(page)
			await dashboard.expectLoaded()
		})

		test('auto-redirects when unauthenticated', async ({ page }) => {
			// Try to access protected route without authentication
			await page.goto('content-manager')

			// Should redirect to login
			await page.waitForURL(/auth/, { timeout: 5000 })
		})
	})
})
