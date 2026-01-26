import { DynamicModule, Type } from '@nestjs/common'
import type { Model } from '../model'
import { MagnetModuleOptions } from './config.types'

export type MongooseConfig = {
	uri: string
}

/**
 * Drizzle ORM configuration for SQL databases.
 * Supports PostgreSQL, MySQL, and SQLite through Drizzle ORM.
 */
export type DrizzleConfig = {
	/** Database connection string */
	connectionString: string
	/** SQL dialect to use */
	dialect: 'postgresql' | 'mysql' | 'sqlite'
	/** Database driver to use (auto-detected if not specified) */
	driver?: 'pg' | 'neon' | 'mysql2' | 'better-sqlite3'
	/** Enable debug logging */
	debug?: boolean
}

export type DBConfig = MongooseConfig | DrizzleConfig

/**
 * Database model instance type - the native model from the adapter
 * This could be a Mongoose Model, Drizzle table, or other adapter-specific type
 */
export type DatabaseModelInstance = unknown

/**
 * Model class constructor returned by adapter.model()
 */
export type ModelClass<T> = new () => Model<T>

export abstract class DatabaseAdapter {
	abstract connect(options: MagnetModuleOptions): DynamicModule
	abstract forFeature(schemas: Type | Type[]): DynamicModule
	/**
	 * Create a Model class for the given native model instance
	 * @param modelInstance - The native model instance from the database driver
	 * @returns A Model class constructor that can be instantiated
	 */
	abstract model<T>(modelInstance: DatabaseModelInstance): ModelClass<T>
	abstract token(schema: string): string
}
