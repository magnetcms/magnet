import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class DashboardPage {
	readonly page: Page
	readonly sidebar: Locator
	readonly contentManagerLink: Locator
	readonly settingsLink: Locator
	readonly userMenu: Locator
	readonly logoutButton: Locator
	readonly mainContent: Locator

	constructor(page: Page) {
		this.page = page
		this.sidebar = page.locator('[data-testid="sidebar"], aside, nav')
		this.contentManagerLink = page.getByRole('link', {
			name: /content manager/i,
		})
		this.settingsLink = page.getByRole('link', { name: /settings/i })
		this.userMenu = page.getByTestId('user-menu')
		this.logoutButton = page.getByRole('button', { name: /logout|sign out/i })
		this.mainContent = page.locator('main')
	}

	async goto() {
		await this.page.goto('/')
	}

	async expectLoaded() {
		await expect(this.mainContent).toBeVisible()
	}

	async navigateToContentManager() {
		await this.contentManagerLink.click()
		await this.page.waitForURL('**/content-manager**')
	}

	async navigateToSettings() {
		await this.settingsLink.click()
		await this.page.waitForURL('**/settings**')
	}

	async logout() {
		await this.userMenu.click()
		await this.logoutButton.click()
		await this.page.waitForURL('**/auth**')
	}
}
