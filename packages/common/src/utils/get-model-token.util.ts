import { Type } from '@nestjs/common'

export function getModelToken(schema: Type): string {
	return `Magnet${schema.name}Model`
}
