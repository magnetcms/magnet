// IMPORTANT: Set database adapter FIRST, before any schema imports
import { setDatabaseAdapter } from '@magnet-cms/common'
setDatabaseAdapter('drizzle')

import { MagnetModule } from '@magnet-cms/core'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CatsModule } from './modules/cats/cats.module'
import { OwnersModule } from './modules/owners/owners.module'
import { PostsModule } from './modules/posts/posts.module'

/**
 * Example application using Magnet CMS with Neon PostgreSQL.
 *
 * This demonstrates:
 * - Drizzle ORM adapter with Neon serverless driver
 * - Schema definition using @Schema and @Prop decorators
 * - Content types with i18n and versioning support
 *
 * To run this example:
 * 1. Create a Neon database at https://neon.tech
 * 2. Copy .env.example to .env and add your DATABASE_URL
 * 3. Run: bun run dev
 */
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		MagnetModule.forRoot({
			db: {
				connectionString: process.env.DATABASE_URL || '',
				dialect: 'postgresql',
				driver: 'neon',
				debug: process.env.NODE_ENV === 'development',
			},
			jwt: {
				secret: process.env.JWT_SECRET || 'development-secret-key',
			},
		}),
		CatsModule,
		OwnersModule,
		PostsModule,
	],
})
export class AppModule {}
