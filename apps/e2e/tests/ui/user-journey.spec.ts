import { test } from '@playwright/test'
import { testData } from '../../src/helpers/test-data'
import { AccountPage } from '../../src/page-objects/account.page'
import { ContentManagerPage } from '../../src/page-objects/content-manager.page'
import { DashboardPage } from '../../src/page-objects/dashboard.page'
import { LoginPage } from '../../src/page-objects/login.page'
import { MediaPage } from '../../src/page-objects/media.page'
import { SettingsPage } from '../../src/page-objects/settings.page'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

test.describe('Complete User Journey', () => {
	test('full user journey from setup to logout', async ({ page, request }) => {
		const userData = testData.user.create()

		// Phase 1: Setup
		const statusResponse = await request.get(`${API_BASE_URL}/auth/status`)
		const status = await statusResponse.json()

		if (status.requiresSetup) {
			const loginPage = new LoginPage(page)
			await loginPage.goto()
			await loginPage.setup(userData.email, userData.password)

			// Should redirect to dashboard (handles /admin or / base URLs)
			await page.waitForURL(/\/admin\/?$|\/dashboard|\/content-manager/, {
				timeout: 10000,
			})
		} else {
			// User already exists, register new one
			await request
				.post(`${API_BASE_URL}/auth/register`, {
					data: userData,
				})
				.catch(() => {})

			const loginPage = new LoginPage(page)
			await loginPage.goto()
			await loginPage.login(userData.email, userData.password)
			await page.waitForURL(/\/admin\/?$|\/dashboard|\/content-manager/, {
				timeout: 10000,
			})
		}

		const dashboard = new DashboardPage(page)
		await dashboard.expectLoaded()

		// Phase 2: Authentication (logout and login)
		await dashboard.logout()
		await page.waitForURL(/auth/, { timeout: 5000 })

		const loginPage = new LoginPage(page)
		await loginPage.login(userData.email, userData.password)
		await page.waitForURL(/\/admin\/?$|\/dashboard|\/content-manager/, {
			timeout: 10000,
		})
		await dashboard.expectLoaded()

		// Phase 3: Content Management
		const contentManager = new ContentManagerPage(page)
		await contentManager.goto()

		// Wait for schemas to load
		await page.waitForTimeout(1000)

		// Try to find a schema (cats is common in examples)
		const schemaLinks = page.getByRole('link', { name: /cat|post|article/i })
		const schemaCount = await schemaLinks.count()

		if (schemaCount > 0) {
			// Click first available schema
			await schemaLinks.first().click()
			await page.waitForTimeout(1000)

			// Try to create a new item
			const createButton = page.getByRole('button', {
				name: /create|add|new/i,
			})
			if (await createButton.isVisible()) {
				await createButton.click()
				await page.waitForTimeout(1000)

				// Fill form if visible (this is schema-dependent)
				const titleInput = page.getByLabel(/title|name/i).first()
				if (await titleInput.isVisible()) {
					await titleInput.fill(`Test Item ${Date.now()}`)
					await page.waitForTimeout(500)

					// Save if save button is visible
					const saveButton = page.getByRole('button', { name: /save/i })
					if (await saveButton.isVisible()) {
						await saveButton.click()
						await page.waitForTimeout(2000)
					}
				}
			}
		}

		// Phase 4: Media Management
		await dashboard.goto()
		await dashboard.navigateToMedia()

		const mediaPage = new MediaPage(page)
		await mediaPage.expectLoaded()

		// Phase 5: Settings
		await dashboard.goto()
		await dashboard.navigateToSettings()

		const settingsPage = new SettingsPage(page)
		await settingsPage.expectLoaded()

		// Phase 6: Account Management
		await dashboard.goto()
		await dashboard.navigateToAccount()

		const accountPage = new AccountPage(page)
		await accountPage.expectLoaded()

		// Update profile
		const newName = `Updated ${userData.name}`
		await accountPage.updateProfile({ name: newName })
		await accountPage.expectProfileUpdated()

		// Phase 7: Final Logout
		await dashboard.goto()
		await dashboard.logout()

		// Verify cannot access dashboard (should redirect to auth)
		await page.goto('/admin')
		await page.waitForURL(/auth/, { timeout: 5000 })
		await loginPage.expectLoginForm()
	})
})
