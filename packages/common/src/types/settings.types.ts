export type SettingType = 'string' | 'boolean' | 'number' | 'object' | 'array'

/**
 * Settings object type for nested settings
 */
export interface SettingObject {
	[key: string]: SettingValue
}

/**
 * Settings value types - union of all possible setting values
 * This replaces `any` in settings-related code
 */
export type SettingValue =
	| string
	| number
	| boolean
	| string[]
	| number[]
	| SettingObject
	| null

export interface SchemaSetting {
	key: string
	value: SettingValue
	type: SettingType | string
}

export interface SettingsFeatureOptions<T = unknown> {
	group: string
	schema: new () => T
}

/**
 * Settings update payload for a single setting
 */
export interface SettingsUpdatePayload {
	group: string
	key: string
	value: SettingValue
}

/**
 * Settings bulk update payload
 */
export interface SettingsBulkUpdatePayload {
	settings: Array<{
		key: string
		value: SettingValue
	}>
}

/**
 * Settings record type for typed settings groups
 */
export type SettingsRecord = Record<string, SettingValue>
