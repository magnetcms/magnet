import { PropOptions } from '@magnet-cms/common'
import { Prop as MongooseProp } from '@nestjs/mongoose'
import { SchemaTypes } from 'mongoose'

export const Mixed = SchemaTypes.Mixed

/**
 * Mongoose-specific property options that extend PropOptions with ref
 */
type MongoosePropOptions = PropOptions & {
	ref?: string
}

export function Prop(options?: PropOptions): PropertyDecorator {
	const mongooseOptions: MongoosePropOptions = {
		required: options?.required,
		default: options?.default,
		unique: options?.unique,
		type: options?.type,
	}

	// Only include ref if it's explicitly defined (not undefined)
	if (options?.ref !== undefined) {
		mongooseOptions.ref = options.ref
	}

	return MongooseProp(mongooseOptions)
}
