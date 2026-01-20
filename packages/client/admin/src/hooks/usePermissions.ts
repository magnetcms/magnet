import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import type {
	FieldPermission,
	PermissionScope,
	ResolvedPermissions,
} from '~/core/adapters/types'
import { useAdapter } from '~/core/provider/MagnetProvider'
import { useAuth } from './useAuth'

// Query Keys
export const PERMISSIONS_KEY = ['rbac', 'permissions', 'me']
export const ROLES_KEY = ['rbac', 'roles']
export const ALL_PERMISSIONS_KEY = ['rbac', 'permissions', 'all']

/**
 * Hook for accessing and checking user permissions
 *
 * @example
 * const { hasPermission, hasSchemaPermission } = usePermissions()
 *
 * // Check if user can create content in the 'posts' schema
 * if (hasSchemaPermission('posts', 'create')) {
 *   // Show create button
 * }
 *
 * // Check global permission
 * if (hasPermission('create', 'global')) {
 *   // User has global create permission
 * }
 */
export function usePermissions() {
	const adapter = useAdapter()
	const { user, isAuthenticated } = useAuth()
	const queryClient = useQueryClient()

	// Fetch resolved permissions for the current user
	const {
		data: permissions,
		isLoading,
		error,
		refetch,
	} = useQuery<ResolvedPermissions>({
		queryKey: PERMISSIONS_KEY,
		queryFn: () => adapter.rbac.getMyPermissions(),
		enabled: isAuthenticated,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
	})

	/**
	 * Check if user has a global permission
	 */
	const hasGlobalPermission = useCallback(
		(scope: PermissionScope): boolean => {
			if (!permissions) return false
			return permissions.global.includes(scope)
		},
		[permissions],
	)

	/**
	 * Check if user has a specific permission on a resource
	 */
	const hasPermission = useCallback(
		(scope: PermissionScope, resource?: string): boolean => {
			if (!permissions) return false

			// Check global permissions first
			if (permissions.global.includes(scope)) {
				return true
			}

			// If no resource specified, only check global
			if (!resource || resource === 'global') {
				return false
			}

			// Check schema-level permissions
			return permissions.schemas[resource]?.includes(scope) ?? false
		},
		[permissions],
	)

	/**
	 * Check if user has permission for a specific schema and scope
	 */
	const hasSchemaPermission = useCallback(
		(schema: string, scope: PermissionScope): boolean => {
			if (!permissions) return false

			// Global permissions grant access to all schemas
			if (permissions.global.includes(scope)) {
				return true
			}

			// Check wildcard schema permission
			if (permissions.schemas['*']?.includes(scope)) {
				return true
			}

			// Check specific schema permission
			return permissions.schemas[schema]?.includes(scope) ?? false
		},
		[permissions],
	)

	/**
	 * Get field permissions for a specific schema
	 */
	const getFieldPermissions = useCallback(
		(schema: string): Record<string, FieldPermission> => {
			if (!permissions) return {}
			return permissions.fields[schema] ?? {}
		},
		[permissions],
	)

	/**
	 * Check if a field is visible for the user
	 */
	const isFieldVisible = useCallback(
		(schema: string, field: string): boolean => {
			if (!permissions) return true // Default to visible
			const fieldPerms = permissions.fields[schema]?.[field]
			return fieldPerms?.visible ?? true
		},
		[permissions],
	)

	/**
	 * Check if a field is readonly for the user
	 */
	const isFieldReadonly = useCallback(
		(schema: string, field: string): boolean => {
			if (!permissions) return false // Default to editable
			const fieldPerms = permissions.fields[schema]?.[field]
			return fieldPerms?.readonly ?? false
		},
		[permissions],
	)

	/**
	 * Check if user can access a navigation item
	 * Navigation items typically require 'read' permission
	 */
	const canAccessNavItem = useCallback(
		(resource: string): boolean => {
			return hasPermission('read', resource)
		},
		[hasPermission],
	)

	/**
	 * Check if user has any of the specified roles
	 */
	const hasRole = useCallback(
		(roleNames: string | string[]): boolean => {
			if (!permissions) return false
			const names = Array.isArray(roleNames) ? roleNames : [roleNames]
			return names.some((name) => permissions.roleNames.includes(name))
		},
		[permissions],
	)

	/**
	 * Check if user is a super admin
	 */
	const isSuperAdmin = useMemo(() => {
		if (!permissions) return false
		return permissions.roleNames.includes('super-admin')
	}, [permissions])

	/**
	 * Check if user is an admin (including super admin)
	 */
	const isAdmin = useMemo(() => {
		if (!permissions) return false
		return (
			permissions.roleNames.includes('super-admin') ||
			permissions.roleNames.includes('admin')
		)
	}, [permissions])

	/**
	 * Refresh permissions from the server
	 */
	const refresh = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY })
		return refetch()
	}, [queryClient, refetch])

	/**
	 * Get all schemas the user can access
	 */
	const accessibleSchemas = useMemo(() => {
		if (!permissions) return []

		// If user has global read, they can access everything
		if (permissions.global.includes('read')) {
			return ['*'] // Indicates all schemas
		}

		// If user has wildcard schema read
		if (permissions.schemas['*']?.includes('read')) {
			return ['*']
		}

		// Return specific schemas user can read
		return Object.entries(permissions.schemas)
			.filter(([, scopes]) => scopes.includes('read'))
			.map(([schema]) => schema)
	}, [permissions])

	return {
		/** Resolved permissions object */
		permissions,
		/** Whether permissions are loading */
		isLoading,
		/** Error if permissions failed to load */
		error,
		/** Current user's role IDs */
		roleIds: permissions?.roleIds ?? user?.roles ?? [],
		/** Current user's role names */
		roleNames: permissions?.roleNames ?? [],

		// Permission checks
		hasPermission,
		hasSchemaPermission,
		hasGlobalPermission,
		canAccessNavItem,
		hasRole,
		isSuperAdmin,
		isAdmin,

		// Field permissions
		getFieldPermissions,
		isFieldVisible,
		isFieldReadonly,

		// Schema access
		accessibleSchemas,

		// Actions
		refresh,
	}
}

/**
 * Hook for checking if user can perform an action
 * Useful for conditional rendering in components
 *
 * @example
 * const canCreate = useCanPerform('create', 'posts')
 * return canCreate ? <CreateButton /> : null
 */
export function useCanPerform(
	scope: PermissionScope,
	resource?: string,
): boolean {
	const { hasPermission, isLoading } = usePermissions()

	if (isLoading) return false
	return hasPermission(scope, resource)
}

/**
 * Hook for getting permissions for a specific schema
 *
 * @example
 * const { canCreate, canRead, canUpdate, canDelete, canPublish } = useSchemaPermissions('posts')
 */
export function useSchemaPermissions(schema: string) {
	const { hasSchemaPermission, isLoading } = usePermissions()

	return {
		isLoading,
		canCreate: hasSchemaPermission(schema, 'create'),
		canRead: hasSchemaPermission(schema, 'read'),
		canUpdate: hasSchemaPermission(schema, 'update'),
		canDelete: hasSchemaPermission(schema, 'delete'),
		canPublish: hasSchemaPermission(schema, 'publish'),
	}
}
