import { Type } from '@nestjs/common'
import { DBConfig } from './database.types'

export interface InternationalizationOptions {
	locales: string[]
	defaultLocale: string
}

export interface PlaygroundOptions {
	/**
	 * Path to the directory where module folders will be created
	 * @example './src/modules'
	 */
	modulesPath?: string
	/**
	 * @deprecated Use modulesPath instead
	 * Path to the directory where schema files will be saved
	 */
	schemasPath?: string
}

export class MagnetModuleOptions {
	db: DBConfig
	jwt: {
		secret: string
	}
	internationalization?: InternationalizationOptions
	playground?: PlaygroundOptions

	constructor({
		db,
		jwt,
		internationalization,
		playground,
	}: MagnetModuleOptions) {
		this.db = db
		this.jwt = jwt
		this.internationalization = internationalization
		this.playground = playground
	}
}

export type MagnetModuleOptionsAsync = {
	useFactory: (
		...args: any[]
	) => Promise<MagnetModuleOptions> | MagnetModuleOptions
	inject?: Type[]
	imports?: Type[]
}
