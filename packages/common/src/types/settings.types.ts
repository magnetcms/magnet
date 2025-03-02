export type SettingType = 'string' | 'boolean' | 'number' | 'object' | 'array'

export interface SchemaSetting {
	key: string
	value: unknown
	type: SettingType | string
}

export interface SettingsFeatureOptions<T = unknown> {
	group: string
	schema: new () => T
}
