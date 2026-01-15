import { expect, test } from '../../src/fixtures/base.fixture'
import { testData } from '../../src/helpers/test-data'

test.describe('Auth API', () => {
	test('GET /auth/status returns authentication status', async ({
		apiClient,
	}) => {
		const status = await apiClient.getAuthStatus()

		expect(status).toHaveProperty('authenticated')
		expect(typeof status.authenticated).toBe('boolean')
	})

	test('POST /auth/register creates a new user', async ({ apiClient }) => {
		const status = await apiClient.getAuthStatus()
		test.skip(
			status.requiresSetup !== true,
			'Users already exist, registration may be restricted',
		)

		const userData = testData.user.create()
		const response = await apiClient.register(userData)

		expect(response.access_token).toBeDefined()
	})

	test('GET /auth/me returns current user when authenticated', async ({
		apiClient,
	}) => {
		const status = await apiClient.getAuthStatus()
		test.skip(status.requiresSetup === true, 'Setup required first')

		const userData = testData.user.create()
		const auth = await apiClient.register(userData)

		apiClient.setToken(auth.access_token)

		const response = await apiClient.getMe()
		expect(response.ok()).toBeTruthy()

		const user = await response.json()
		expect(user.email).toBe(userData.email)
	})

	test('GET /auth/me returns 401 when not authenticated', async ({
		request,
		apiBaseURL,
	}) => {
		const response = await request.get(`${apiBaseURL}/auth/me`)

		expect(response.status()).toBe(401)
	})
})
