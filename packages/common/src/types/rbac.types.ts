// ============================================================================
// RBAC (Role-Based Access Control) Types
// ============================================================================

/**
 * Permission scopes define the actions that can be performed
 */
export const PermissionScopes = [
	'create',
	'read',
	'update',
	'delete',
	'publish',
] as const
export type PermissionScope = (typeof PermissionScopes)[number]

/**
 * Permission levels define the granularity of permissions
 */
export const PermissionLevels = ['global', 'schema', 'field', 'record'] as const
export type PermissionLevel = (typeof PermissionLevels)[number]

// ============================================================================
// Permission Condition Types (for record-level permissions)
// ============================================================================

/**
 * Operators for permission conditions
 */
export const ConditionOperators = ['equals', 'in', 'contains'] as const
export type ConditionOperator = (typeof ConditionOperators)[number]

/**
 * Condition for record-level permissions
 * Used to restrict access based on record field values
 *
 * @example
 * // Only allow access to records created by the current user
 * { field: 'createdBy', operator: 'equals', value: '$currentUser' }
 */
export interface PermissionCondition {
	/** Field to check on the record */
	field: string
	/** Comparison operator */
	operator: ConditionOperator
	/** Value to compare against. '$currentUser' is resolved to the current user's ID at runtime */
	value: string | '$currentUser'
}

// ============================================================================
// Permission Resource Types
// ============================================================================

/**
 * Resource definition for a permission
 * Defines what the permission applies to at different levels
 */
export interface PermissionResource {
	/** The level of granularity for this permission */
	type: PermissionLevel
	/** Target identifier - schema name for schema-level, field path for field-level */
	target?: string
	/** Specific fields for field-level permissions */
	fields?: string[]
	/** Conditions for record-level permissions */
	conditions?: PermissionCondition[]
}

// ============================================================================
// Permission Entity Types
// ============================================================================

/**
 * Permission entity stored in the database
 */
export interface Permission {
	/** Unique identifier */
	id: string
	/** Unique name identifier (e.g., "content:cats:create", "admin:users:read") */
	name: string
	/** Human-readable display name */
	displayName: string
	/** Detailed description of what this permission grants */
	description?: string
	/** The action scope this permission grants */
	scope: PermissionScope
	/** Resource definition for this permission */
	resource: PermissionResource
	/** Whether this is a built-in system permission that cannot be deleted */
	isSystem: boolean
	/** Timestamp when the permission was created */
	createdAt?: Date
	/** Timestamp when the permission was last updated */
	updatedAt?: Date
}

/**
 * Data required to create a new permission
 */
export interface CreatePermissionData {
	name: string
	displayName: string
	description?: string
	scope: PermissionScope
	resource: PermissionResource
	isSystem?: boolean
}

/**
 * Data for updating a permission
 */
export interface UpdatePermissionData {
	displayName?: string
	description?: string
	scope?: PermissionScope
	resource?: PermissionResource
}

// ============================================================================
// Role Entity Types
// ============================================================================

/**
 * Role entity stored in the database
 */
export interface Role {
	/** Unique identifier */
	id: string
	/** Unique name identifier (e.g., "super-admin", "editor") */
	name: string
	/** Human-readable display name */
	displayName: string
	/** Description of the role */
	description?: string
	/** Array of permission IDs assigned to this role (many-to-many) */
	permissions: string[]
	/** Array of role IDs this role inherits from (for role hierarchy) */
	inheritsFrom?: string[]
	/** Whether this is a built-in system role that cannot be deleted */
	isSystem: boolean
	/** Priority for role hierarchy (higher = more authority) */
	priority: number
	/** Timestamp when the role was created */
	createdAt?: Date
	/** Timestamp when the role was last updated */
	updatedAt?: Date
}

/**
 * Data required to create a new role
 */
export interface CreateRoleData {
	name: string
	displayName: string
	description?: string
	permissions?: string[]
	inheritsFrom?: string[]
	isSystem?: boolean
	priority?: number
}

/**
 * Data for updating a role
 */
export interface UpdateRoleData {
	displayName?: string
	description?: string
	permissions?: string[]
	inheritsFrom?: string[]
	priority?: number
}

// ============================================================================
// Resolved Permissions Types (Runtime)
// ============================================================================

/**
 * Field-level permission settings
 */
export interface FieldPermission {
	/** Whether the field is visible to the user */
	visible: boolean
	/** Whether the field is read-only for the user */
	readonly: boolean
}

/**
 * Record-level permission with its condition
 */
export interface RecordPermission {
	/** The action scope for this record permission */
	scope: PermissionScope
	/** The condition that must be satisfied */
	condition: PermissionCondition
}

/**
 * Resolved permissions for a user at runtime
 * This is the flattened, pre-computed permission structure used for authorization checks
 */
export interface ResolvedPermissions {
	/** Global permissions that apply to all resources */
	global: PermissionScope[]
	/** Schema-level permissions mapped by schema name */
	schemas: Record<string, PermissionScope[]>
	/** Field-level permissions mapped by schema name, then field name */
	fields: Record<string, Record<string, FieldPermission>>
	/** Record-level permissions mapped by schema name */
	records: Record<string, RecordPermission[]>
	/** All role IDs the user has (including inherited) */
	roleIds: string[]
	/** All role names the user has (including inherited) */
	roleNames: string[]
}

// ============================================================================
// Permission Check Context
// ============================================================================

/**
 * Context for permission checks
 * Provides additional data for evaluating record-level permissions
 */
export interface PermissionContext {
	/** The record being accessed (for record-level checks) */
	record?: Record<string, unknown>
	/** Additional context data */
	[key: string]: unknown
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a string is a valid permission scope
 */
export function isValidPermissionScope(
	scope: string,
): scope is PermissionScope {
	return PermissionScopes.includes(scope as PermissionScope)
}

/**
 * Type guard to check if a string is a valid permission level
 */
export function isValidPermissionLevel(
	level: string,
): level is PermissionLevel {
	return PermissionLevels.includes(level as PermissionLevel)
}

/**
 * Type guard to check if a string is a valid condition operator
 */
export function isValidConditionOperator(
	operator: string,
): operator is ConditionOperator {
	return ConditionOperators.includes(operator as ConditionOperator)
}

/**
 * Type guard to check if an object is a valid Permission
 */
export function isPermission(value: unknown): value is Permission {
	if (typeof value !== 'object' || value === null) {
		return false
	}
	const obj = value as Record<string, unknown>
	return (
		typeof obj.id === 'string' &&
		typeof obj.name === 'string' &&
		typeof obj.displayName === 'string' &&
		typeof obj.scope === 'string' &&
		isValidPermissionScope(obj.scope) &&
		typeof obj.resource === 'object' &&
		obj.resource !== null &&
		typeof obj.isSystem === 'boolean'
	)
}

/**
 * Type guard to check if an object is a valid Role
 */
export function isRole(value: unknown): value is Role {
	if (typeof value !== 'object' || value === null) {
		return false
	}
	const obj = value as Record<string, unknown>
	return (
		typeof obj.id === 'string' &&
		typeof obj.name === 'string' &&
		typeof obj.displayName === 'string' &&
		Array.isArray(obj.permissions) &&
		typeof obj.isSystem === 'boolean' &&
		typeof obj.priority === 'number'
	)
}

/**
 * Type guard to check if an object is a valid PermissionCondition
 */
export function isPermissionCondition(
	value: unknown,
): value is PermissionCondition {
	if (typeof value !== 'object' || value === null) {
		return false
	}
	const obj = value as Record<string, unknown>
	return (
		typeof obj.field === 'string' &&
		typeof obj.operator === 'string' &&
		isValidConditionOperator(obj.operator) &&
		typeof obj.value === 'string'
	)
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Default role names for the system
 */
export const DefaultRoleNames = {
	SUPER_ADMIN: 'super-admin',
	ADMIN: 'admin',
	EDITOR: 'editor',
	AUTHOR: 'author',
	VIEWER: 'viewer',
} as const

export type DefaultRoleName =
	(typeof DefaultRoleNames)[keyof typeof DefaultRoleNames]

/**
 * Permission name pattern helpers
 */
export const PermissionNamePatterns = {
	/** Global permission pattern */
	global: (scope: PermissionScope): string => `global:${scope}`,
	/** Schema permission pattern */
	schema: (schema: string, scope: PermissionScope): string =>
		`content:${schema}:${scope}`,
	/** Admin permission pattern */
	admin: (resource: string, scope: PermissionScope): string =>
		`admin:${resource}:${scope}`,
} as const

/**
 * Parse a permission name into its components
 */
export function parsePermissionName(name: string): {
	category: string
	target: string
	scope: string
} | null {
	const parts = name.split(':')
	if (parts.length !== 3) {
		return null
	}
	const [category, target, scope] = parts
	if (!category || !target || !scope) {
		return null
	}
	return { category, target, scope }
}
