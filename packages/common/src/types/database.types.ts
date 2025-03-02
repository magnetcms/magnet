import { DynamicModule, Type } from '@nestjs/common'
import { MagnetModuleOptions } from './config.types'

export type MongooseConfig = {
	uri: string
}

export type TypeORMConfig = {
	type:
		| 'mysql'
		| 'postgres'
		| 'sqlite'
		| 'mariadb'
		| 'mssql'
		| 'oracle'
		| 'mongodb'
	host: string
	port: number
	username: string
	password: string
	database: string
}

export type DBConfig = MongooseConfig | TypeORMConfig

export abstract class DatabaseAdapter {
	abstract connect(options: MagnetModuleOptions): DynamicModule
	abstract forFeature(schemas: Type | Type[]): DynamicModule
	abstract model<T>(modelInstance: any): any
	abstract token(schema: string): string
}
