import { randomUUID } from 'node:crypto'

export const testData = {
	user: {
		email: () => `test-${randomUUID().slice(0, 8)}@example.com`,
		password: () => 'TestPassword123!',
		name: () => `Test User ${randomUUID().slice(0, 4)}`,
		role: () => 'admin',
		create: (
			overrides?: Partial<{
				email: string
				password: string
				name: string
				role: string
			}>,
		) => ({
			email: overrides?.email ?? `test-${randomUUID().slice(0, 8)}@example.com`,
			password: overrides?.password ?? 'TestPassword123!',
			name: overrides?.name ?? `Test User ${randomUUID().slice(0, 4)}`,
			role: overrides?.role ?? 'admin',
		}),
	},

	cat: {
		create: (
			overrides?: Partial<{ name: string; age: number; breed: string }>,
		) => ({
			name: overrides?.name ?? `TestCat-${randomUUID().slice(0, 8)}`,
			age: overrides?.age ?? Math.floor(Math.random() * 15) + 1,
			breed: overrides?.breed ?? 'Domestic Shorthair',
		}),
	},
}

export function testId(prefix = 'test'): string {
	return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`
}
