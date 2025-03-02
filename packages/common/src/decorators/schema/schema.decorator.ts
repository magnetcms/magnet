import { SCHEMA_METADATA_KEY } from '~/constants'
import { detectDatabaseAdapter } from '~/utils'

export function Schema(): ClassDecorator {
	return (target) => {
		const adapter = detectDatabaseAdapter()

		Reflect.defineMetadata(SCHEMA_METADATA_KEY, true, target)

		const { Schema } = require(`@magnet/adapter-${adapter}`)
		return Schema()(target)
	}
}
