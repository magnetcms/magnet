import { expect, test } from '../../src/fixtures/base.fixture'

test.describe('Health API', () => {
	test('GET /health returns OK status', async ({ apiClient }) => {
		const response = await apiClient.getHealth()

		expect(response.ok()).toBeTruthy()
		expect(response.status()).toBe(200)

		const body = await response.json()
		expect(body.status).toBe('ok')
	})
})
