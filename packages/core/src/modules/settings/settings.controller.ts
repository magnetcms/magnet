import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
	constructor(private readonly settingsService: SettingsService) {}

	@Get(':group')
	async getSettings(@Param('group') group: string) {
		return this.settingsService.getSettingsByGroup(group)
	}

	@Put(':key')
	async updateSetting(@Param('key') key: string, @Body('value') value: any) {
		return this.settingsService.updateSetting(key, value)
	}
}
