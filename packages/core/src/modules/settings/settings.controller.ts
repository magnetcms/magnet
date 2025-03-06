import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Put,
} from '@nestjs/common'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
	constructor(private readonly settingsService: SettingsService) {}

	@Get()
	async getAllSettings() {
		return this.settingsService.getSettings()
	}

	@Get(':group')
	async getSettings(@Param('group') group: string) {
		return this.settingsService.getSettingsByGroup(group)
	}

	@Get(':group/:key')
	async getSetting(@Param('group') group: string, @Param('key') key: string) {
		const setting = await this.settingsService.getSettingsByGroupAndKey(
			group,
			key,
		)
		if (!setting) {
			throw new HttpException(
				`Setting with key "${key}" in group "${group}" not found`,
				HttpStatus.NOT_FOUND,
			)
		}
		return setting
	}

	@Put(':key')
	async updateSetting(@Param('key') key: string, @Body('value') value: any) {
		try {
			return await this.settingsService.updateSetting(key, value)
		} catch (error: unknown) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to update setting',
				HttpStatus.BAD_REQUEST,
			)
		}
	}
}
