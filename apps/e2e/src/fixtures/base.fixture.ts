import { test as base } from '@playwright/test'
import { ApiClient } from '../helpers/api-client'

export const test = base.extend<{
	apiClient: ApiClient
	apiBaseURL: string
	uiBaseURL: string
}>({
	apiBaseURL: async (_, use) => {
		await use(process.env.API_BASE_URL || 'http://localhost:3000')
	},

	uiBaseURL: async (_, use) => {
		await use(process.env.UI_BASE_URL || 'http://localhost:3001')
	},

	apiClient: async ({ request, apiBaseURL }, use) => {
		const client = new ApiClient(request, apiBaseURL)
		await use(client)
	},
})

export { expect } from '@playwright/test'
