import { Module, forwardRef } from '@nestjs/common'
import { InternationalizationModule } from '~/modules/database/modules/internationalization/internationalization.module'
import { HistoryModule } from '~/modules/history/history.module'
import { DocumentService } from './document.service'

@Module({
	imports: [
		forwardRef(() => InternationalizationModule),
		forwardRef(() => HistoryModule),
	],
	providers: [DocumentService],
	exports: [DocumentService],
})
export class DocumentModule {}
