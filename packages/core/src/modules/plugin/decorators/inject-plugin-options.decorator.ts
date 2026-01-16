import { Inject } from '@nestjs/common'
import { getPluginOptionsToken } from '../constants'

/**
 * Decorator to inject plugin options using standardized token.
 *
 * @param pluginName - The plugin name (e.g., 'content-builder')
 *
 * @example
 * ```ts
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @InjectPluginOptions('content-builder')
 *     private readonly options: ContentBuilderOptions
 *   ) {}
 * }
 * ```
 */
export function InjectPluginOptions(pluginName: string): ParameterDecorator {
	return Inject(getPluginOptionsToken(pluginName))
}
