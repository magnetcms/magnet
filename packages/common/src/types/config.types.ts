import { Type } from '@nestjs/common'
import { DBConfig } from './database.types'

export interface InternationalizationOptions {
	locales: string[]
	defaultLocale: string
}

export class MagnetModuleOptions {
	db: DBConfig
	jwt: {
		secret: string
	}
	internationalization?: InternationalizationOptions

	constructor({ db, jwt, internationalization }: MagnetModuleOptions) {
		this.db = db
		this.jwt = jwt
		this.internationalization = internationalization
	}
}

export type MagnetModuleOptionsAsync = {
	useFactory: (
		...args: any[]
	) => Promise<MagnetModuleOptions> | MagnetModuleOptions
	inject?: Type[]
	imports?: Type[]
}
