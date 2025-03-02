import { Module } from '@nestjs/common'
import { SettingsModule } from '~/modules/settings'
import { Internationalization } from './setting/internationalization.setting'

@Module({
	imports: [SettingsModule.forFeature(Internationalization)],
})
export class InternationalizationModule {}
