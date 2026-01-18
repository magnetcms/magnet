import type { AuthResponse } from '../helpers/api-client'
import { ApiClient } from '../helpers/api-client'
import { testData } from '../helpers/test-data'
import { test as base } from './base.fixture'

interface AuthenticatedFixtures {
	authenticatedApiClient: ApiClient
	testUser: { email: string; password: string; token: string }
}

export const test = base.extend<AuthenticatedFixtures>({
	testUser: async ({ apiClient }, use) => {
		const userData = testData.user.create()
		const status = await apiClient.getAuthStatus()

		let authResponse: AuthResponse
		if (status.requiresSetup) {
			authResponse = await apiClient.register(userData)
		} else {
			try {
				authResponse = await apiClient.register(userData)
			} catch {
				authResponse = await apiClient.login(userData.email, userData.password)
			}
		}

		await use({
			email: userData.email,
			password: userData.password,
			token: authResponse.access_token,
		})
	},

	authenticatedApiClient: async ({ request, apiBaseURL, testUser }, use) => {
		const client = new ApiClient(request, apiBaseURL)
		client.setToken(testUser.token)
		await use(client)
	},
})

// Additional fixtures for different user scenarios
export interface FreshUserFixtures {
	freshUser: { email: string; password: string; token: string }
	freshApiClient: ApiClient
}

export const testWithFreshUser = base.extend<FreshUserFixtures>({
	freshUser: async ({ apiClient }, use) => {
		const userData = testData.user.create()
		const authResponse = await apiClient.register(userData)

		await use({
			email: userData.email,
			password: userData.password,
			token: authResponse.access_token,
		})
	},

	freshApiClient: async ({ request, apiBaseURL, freshUser }, use) => {
		const client = new ApiClient(request, apiBaseURL)
		client.setToken(freshUser.token)
		await use(client)
	},
})

export interface AdminUserFixtures {
	adminUser: { email: string; password: string; token: string }
	adminApiClient: ApiClient
}

export const testWithAdmin = base.extend<AdminUserFixtures>({
	adminUser: async ({ apiClient }, use) => {
		const userData = testData.user.create({ role: 'admin' })

		const status = await apiClient.getAuthStatus()
		let authResponse: AuthResponse

		if (status.requiresSetup) {
			authResponse = await apiClient.register(userData)
		} else {
			try {
				authResponse = await apiClient.register(userData)
			} catch {
				authResponse = await apiClient.login(userData.email, userData.password)
			}
		}

		await use({
			email: userData.email,
			password: userData.password,
			token: authResponse.access_token,
		})
	},

	adminApiClient: async ({ request, apiBaseURL, adminUser }, use) => {
		const client = new ApiClient(request, apiBaseURL)
		client.setToken(adminUser.token)
		await use(client)
	},
})

export { expect } from '@playwright/test'
