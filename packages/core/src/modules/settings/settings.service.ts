import {
	Model,
	PROP_METADATA_KEY,
	PropOptions,
	SchemaSetting,
	SettingType,
} from '@magnet/common'
import { Injectable } from '@nestjs/common'
import { Setting } from './schemas/setting.schema'

@Injectable()
export class SettingsService {
	constructor(private readonly settingModel: Model<Setting>) {}

	async getSettings(): Promise<Record<string, Setting[]>> {
		const settings: Setting[] = await this.settingModel.find()
		return settings.reduce(
			(acc: Record<string, Setting[]>, setting: Setting) => {
				acc[setting.group] = acc[setting.group] || []
				acc[setting.group]?.push(setting)
				return acc
			},
			{},
		)
	}

	async getSettingsByGroup(group: string): Promise<Setting[]> {
		return await this.settingModel.findMany({ group })
	}

	async getSettingsByGroupAndKey(
		group: string,
		key: string,
	): Promise<Setting | null> {
		return await this.settingModel.findOne({
			group,
			key,
		})
	}

	async updateSetting(key: string, value: unknown): Promise<Setting | null> {
		return this.settingModel.update({ key }, { value })
	}

	async registerSetting(
		group: string,
		key: string,
		type: SettingType | string,
		value: unknown,
	): Promise<Setting> {
		const existingSetting: Setting | null = await this.settingModel.findOne({
			group,
			key,
		})
		if (existingSetting) {
			if (
				JSON.stringify(existingSetting.value) === JSON.stringify(value) &&
				existingSetting.type === type
			) {
				return existingSetting
			}
			return this.settingModel.update({ group, key }, { value, type })
		}
		return this.settingModel.create({ group, key, type, value })
	}

	async registerSettings(
		group: string,
		settings: SchemaSetting[],
	): Promise<void> {
		const existingSettings: Setting[] = await this.getSettingsByGroup(group)
		const settingsMap: Map<string, Setting> = new Map(
			existingSettings.map((s: Setting) => [s.key, s]),
		)
		const bulkOperations: Promise<Setting>[] = settings.map(
			(setting: SchemaSetting) => {
				const existingSetting: Setting | undefined = settingsMap.get(
					setting.key,
				)
				if (existingSetting) {
					if (
						JSON.stringify(existingSetting.value) !==
							JSON.stringify(setting.value) ||
						existingSetting.type !== setting.type
					) {
						return this.settingModel.update(
							{ group, key: setting.key },
							{ value: setting.value, type: setting.type },
						)
					}
					return Promise.resolve(existingSetting)
				}
				return this.settingModel.create({ group, ...setting })
			},
		)

		await Promise.all(bulkOperations)
	}

	async registerSettingsFromSchema<T>(
		group: string,
		schema: new () => T,
	): Promise<void> {
		const instance: T = new schema()

		const propMetadataArray: Array<{
			propertyKey: string | symbol
			options: PropOptions
		}> = Reflect.getMetadata(PROP_METADATA_KEY, schema.prototype) || []

		const fields: Array<{
			propertyKey: string | symbol
			designType: Function
			type?: string
		}> = propMetadataArray.map((prop) => {
			const designType: Function = Reflect.getMetadata(
				'design:type',
				schema.prototype,
				prop.propertyKey,
			)
			return {
				propertyKey: prop.propertyKey,
				designType,
				type: designType.name,
			}
		})

		const settingsToRegister: SchemaSetting[] = fields.map(
			({ propertyKey, designType, type }) => {
				const key: string = propertyKey.toString()
				let value: unknown = (instance as Record<string, unknown>)[key]
				if (value === undefined) {
					const propData = propMetadataArray.find(
						(p) => p.propertyKey === propertyKey,
					)
					if (propData?.options) {
						value = propData.options.default
					}
				}
				return { key, value, type: type || designType.name }
			},
		)

		await this.registerSettings(group, settingsToRegister)
	}
}
