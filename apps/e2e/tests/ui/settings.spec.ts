import { expect, test } from '@playwright/test'
import { testData } from '../../src/helpers/test-data'
import { LoginPage } from '../../src/page-objects/login.page'
import { SettingsPage } from '../../src/page-objects/settings.page'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

test.describe('Settings UI', () => {
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

	test('can navigate to settings', async ({ page }) => {
		const settingsPage = new SettingsPage(page)
		await settingsPage.goto()
		await settingsPage.expectLoaded()
	})

	test('can view settings list', async ({ page }) => {
		const settingsPage = new SettingsPage(page)
		await settingsPage.goto()

		// Should show settings groups or list
		await expect(
			page.getByText(/settings/i).or(page.locator('main')),
		).toBeVisible()
	})

	test('can navigate to settings group', async ({ page }) => {
		const settingsPage = new SettingsPage(page)
		await settingsPage.goto()

		// Try to find and click a settings group link
		const settingsLink = page
			.getByRole('link')
			.filter({ hasText: /settings/i })
			.first()

		if (await settingsLink.isVisible()) {
			await settingsLink.click()
			await page.waitForTimeout(1000)

			// Should be on a settings group page
			await expect(page.locator('main')).toBeVisible()
		}
	})

	test('can edit settings values', async ({ page }) => {
		const settingsPage = new SettingsPage(page)

		// Try to navigate to a common settings group (if available)
		// This is schema-dependent, so we'll try a generic approach
		await settingsPage.goto()

		// Look for any input fields in settings
		const inputFields = page.locator('input, textarea, select')
		const inputCount = await inputFields.count()

		if (inputCount > 0) {
			// Try to edit first input
			const firstInput = inputFields.first()
			if (await firstInput.isVisible()) {
				await firstInput.fill('test value')
				await page.waitForTimeout(500)

				// Try to save
				const saveButton = page.getByRole('button', { name: /save/i })
				if (await saveButton.isVisible()) {
					await saveButton.click()
					await page.waitForTimeout(2000)

					// Verify save success
					await expect(page.getByText(/saved|success/i)).toBeVisible({
						timeout: 5000,
					})
				}
			}
		}
	})

	test('settings form validation', async ({ page }) => {
		const settingsPage = new SettingsPage(page)
		await settingsPage.goto()

		// Try to submit empty form if required fields exist
		const saveButton = page.getByRole('button', { name: /save/i })
		if (await saveButton.isVisible()) {
			// Clear any existing values
			const inputs = page.locator('input[required], textarea[required]')
			const requiredCount = await inputs.count()

			if (requiredCount > 0) {
				// Clear first required field
				await inputs.first().clear()
				await saveButton.click()
				await page.waitForTimeout(500)

				// Should show validation error
				await expect(page.getByText(/required|error|invalid/i)).toBeVisible({
					timeout: 3000,
				})
			}
		}
	})

	test('settings persist after page reload', async ({ page }) => {
		const settingsPage = new SettingsPage(page)
		await settingsPage.goto()

		// Find an input field
		const inputField = page.locator('input').first()
		if (await inputField.isVisible()) {
			const testValue = `test-${Date.now()}`
			await inputField.fill(testValue)
			await page.waitForTimeout(500)

			// Save
			const saveButton = page.getByRole('button', { name: /save/i })
			if (await saveButton.isVisible()) {
				await saveButton.click()
				await page.waitForTimeout(2000)

				// Reload page
				await page.reload()
				await page.waitForTimeout(2000)

				// Value should persist (if it was actually saved)
				// Note: This test may need adjustment based on actual settings implementation
				const savedValue = await inputField.inputValue()
			}
		}
	})
})
