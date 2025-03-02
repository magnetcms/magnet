import { Type } from '@nestjs/common'

export type ResolverOptions = {
	schema: Type
}

export type ResolverInput = (() => Type) | ResolverOptions

export type ResolveOptions = {
	type: Type | [Type]
	isArray?: boolean
	description?: string
}

export type ResolveInput = (() => Type | [Type]) | ResolveOptions

export type PropOptions = {
	type?: Type | [Type]
	description?: string
	required?: boolean
	unique?: boolean
	default?: any
	nullable?: boolean
	intl?: boolean
	hidden?: boolean
	readonly?: boolean
}

export type BaseSchemaOptions = {
	timestamps?: boolean
}
