import { Type } from '@nestjs/common'

/**
 * Get model injection token for any adapter
 * @param schema Schema class or schema name
 * @returns Injection token string
 */
export function getModelToken(schema: Type | string): string {
	const name = typeof schema === 'string' ? schema : schema.name
	return `MAGNET_MODEL_${name.toUpperCase()}`
}

/**
 * Get adapter injection token
 * @returns Injection token for the database adapter
 */
export function getAdapterToken(): string {
	return 'MAGNET_DATABASE_ADAPTER'
}
