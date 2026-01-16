export const PLUGIN_METADATA = 'plugin:metadata'
export const PLUGIN_FRONTEND_MANIFEST = 'plugin:frontend:manifest'
export const PLUGIN_MODULE = 'plugin:module'

/**
 * Generate standardized options token for a plugin.
 *
 * @param pluginName - The plugin name (e.g., 'content-builder')
 * @returns Token string (e.g., 'PLUGIN_CONTENT_BUILDER_OPTIONS')
 *
 * @example
 * ```ts
 * getPluginOptionsToken('content-builder') // 'PLUGIN_CONTENT_BUILDER_OPTIONS'
 * ```
 */
export function getPluginOptionsToken(pluginName: string): string {
	const normalized = pluginName.toUpperCase().replace(/-/g, '_')
	return `PLUGIN_${normalized}_OPTIONS`
}
