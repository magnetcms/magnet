import type {
	ControllerMetadata as ControllerMetadataBase,
	SchemaMetadata as SchemaMetadataBase,
} from '@magnet/common'
import type { QueryClient } from '@tanstack/react-query'

// Re-export types from @magnet/common
export type SchemaMetadata = SchemaMetadataBase
export type ControllerMetadata = ControllerMetadataBase

// ============================================================================
// Config Types
// ============================================================================

export type RouterType = 'browser' | 'memory' | 'hash'

export interface MagnetConfig {
	/**
	 * Custom API adapter instance
	 * If not provided, a default HTTP adapter will be created
	 */
	apiAdapter?: MagnetApiAdapter

	/**
	 * Base URL for the API (used with default HTTP adapter)
	 * @default 'http://localhost:3000'
	 */
	apiBaseUrl?: string

	/**
	 * Token storage implementation
	 */
	tokenStorage?: TokenStorage

	/**
	 * Base path for the admin UI
	 */
	basePath?: string

	/**
	 * Custom QueryClient instance
	 */
	queryClient?: QueryClient

	/**
	 * Feature flags
	 */
	features?: {
		auth?: boolean
		contentManager?: boolean
		settings?: boolean
	}

	/**
	 * Callback when user is unauthorized
	 */
	onUnauthorized?: () => void

	/**
	 * Callback for handling errors
	 */
	onError?: (error: Error) => void
}

// ============================================================================
// Request/Response Types
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiRequestConfig {
	method?: HttpMethod
	headers?: Record<string, string>
	body?: unknown
	params?: Record<string, string>
}

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginCredentials {
	email: string
	password: string
}

export interface RegisterCredentials extends LoginCredentials {
	name: string
	role: string
}

export interface AuthTokens {
	accessToken: string
	refreshToken?: string
	expiresIn?: number
}

export interface AuthUser {
	id: string
	email: string
	name: string
	role: string
}

export interface AuthStatus {
	authenticated: boolean
	requiresSetup: boolean
	message: string
}

// ============================================================================
// Content Types
// ============================================================================

export type ContentData = Record<string, unknown>

export interface ContentQueryOptions {
	locale?: string
	version?: string
}

export interface VersionInfo {
	versionId: string
	status: string
	createdAt: string
	createdBy?: string
}

export interface VersionDetails extends VersionInfo {
	documentId: string
	collection: string
	data: Record<string, unknown>
	createdBy?: string
	notes?: string
}

// ============================================================================
// Token Storage Interface
// ============================================================================

export interface TokenStorage {
	getAccessToken(): string | null
	setAccessToken(token: string): void
	getRefreshToken(): string | null
	setRefreshToken(token: string): void
	getTokenExpiry(): number | null
	setTokenExpiry(expiry: number): void
	clearAll(): void
}

// ============================================================================
// API Adapter Interface
// ============================================================================

export interface MagnetApiAdapter {
	/**
	 * Generic request method for custom API calls
	 */
	request<T>(url: string, config?: ApiRequestConfig): Promise<T>

	/**
	 * Authentication operations
	 */
	auth: {
		login(credentials: LoginCredentials): Promise<AuthTokens>
		register(credentials: RegisterCredentials): Promise<AuthTokens>
		logout(): Promise<void>
		refresh(refreshToken: string): Promise<AuthTokens>
		getMe(): Promise<AuthUser>
		getStatus(): Promise<AuthStatus>
	}

	/**
	 * Discovery operations for schema/settings/controller metadata
	 */
	discovery: {
		getSchemas(): Promise<string[]>
		getSchema(name: string): Promise<SchemaMetadata>
		getSettings(): Promise<string[]>
		getSetting(name: string): Promise<SchemaMetadata>
		getControllers(): Promise<string[]>
		getController(name: string): Promise<ControllerMetadata>
	}

	/**
	 * Content CRUD operations
	 */
	content: {
		list<T = ContentData>(schema: string): Promise<T[]>
		get<T = ContentData>(
			schema: string,
			id: string,
			options?: ContentQueryOptions,
		): Promise<T>
		create<T = ContentData>(schema: string, data: Partial<T>): Promise<T>
		update<T = ContentData>(
			schema: string,
			id: string,
			data: Partial<T>,
			options?: ContentQueryOptions,
		): Promise<T>
		delete(schema: string, id: string): Promise<void>
	}

	/**
	 * Settings operations
	 */
	settings: {
		getByGroup<T = ContentData>(group: string): Promise<T[]>
		updateByGroup<T = ContentData>(group: string, data: Partial<T>): Promise<T>
	}

	/**
	 * Version history operations
	 */
	history: {
		getVersions(documentId: string, collection: string): Promise<VersionInfo[]>
		getVersion(versionId: string): Promise<VersionDetails>
		publishVersion(versionId: string): Promise<void>
		archiveVersion(versionId: string): Promise<void>
		deleteVersion(versionId: string): Promise<void>
	}
}
