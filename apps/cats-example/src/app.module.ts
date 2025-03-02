import { MagnetModule } from '@magnet/core'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CatsModule } from './modules/cats/cats.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		MagnetModule.forRoot(),
		CatsModule,
	],
})
export class AppModule {}
