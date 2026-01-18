export type DatabaseAdapter = 'mongoose' | 'drizzle-neon' | 'drizzle-supabase'

export type Plugin = 'content-builder' | 'seo'

export type StorageAdapter = 'local' | 's3' | 'r2' | 'supabase' | 'none'

export type PackageManager = 'npm' | 'bun' | 'pnpm' | 'yarn'

export interface ProjectConfig {
	projectName: string
	projectPath: string
	database: DatabaseAdapter
	plugins: Plugin[]
	storage: StorageAdapter
	packageManager: PackageManager
	includeExample: boolean
}

export interface GeneratedFile {
	path: string
	content: string
}
