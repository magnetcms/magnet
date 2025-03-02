import { Module, forwardRef } from '@nestjs/common'
import { DatabaseModule } from '~/modules/database'
import { SettingsModule } from '~/modules/settings'
import { History } from './schemas/history.schema'
import { Versioning } from './setting/history.setting'

@Module({
	imports: [
		forwardRef(() => DatabaseModule.forFeature(History)),
		SettingsModule.forFeature(Versioning),
	],
})
export class HistoryModule {}
