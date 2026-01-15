import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ContentManagerPage {
	readonly page: Page
	readonly schemaList: Locator
	readonly itemList: Locator
	readonly createButton: Locator
	readonly searchInput: Locator
	readonly table: Locator

	constructor(page: Page) {
		this.page = page
		this.schemaList = page.getByTestId('schema-list')
		this.itemList = page.getByTestId('item-list')
		this.createButton = page.getByRole('button', { name: /create|add|new/i })
		this.searchInput = page.getByPlaceholder(/search/i)
		this.table = page.getByRole('table')
	}

	async goto() {
		await this.page.goto('/content-manager')
	}

	async gotoSchema(schemaName: string) {
		await this.page.goto(`/content-manager/${schemaName}`)
	}

	async gotoItem(schemaName: string, itemId: string) {
		await this.page.goto(`/content-manager/${schemaName}/${itemId}`)
	}

	async selectSchema(schemaName: string) {
		await this.page
			.getByRole('link', { name: new RegExp(schemaName, 'i') })
			.click()
	}

	async expectSchemaListVisible() {
		await expect(this.schemaList).toBeVisible()
	}

	async expectItemListVisible() {
		await expect(this.table).toBeVisible()
	}

	async createNewItem() {
		await this.createButton.click()
	}

	async searchItems(query: string) {
		await this.searchInput.fill(query)
		await this.page.waitForTimeout(300)
	}
}
