import type { PermissionScope } from '@magnet-cms/common'
import { type CustomDecorator, SetMetadata } from '@nestjs/common'
import type { Request } from 'express'

/**
 * Metadata key for RequirePermission decorator
 */
export const REQUIRE_PERMISSION_KEY = 'require_permission'

/**
 * Options for the RequirePermission decorator
 */
export interface RequirePermissionOptions {
	/**
	 * Permission scope(s) required for this endpoint
	 * Can be a single scope or an array (user must have ANY of the scopes)
	 */
	scope: PermissionScope | PermissionScope[]

	/**
	 * Resource identifier for the permission check
	 * Can be a static string or a function that extracts the resource from the request
	 *
	 * @example
	 * // Static resource
	 * resource: 'users'
	 *
	 * @example
	 * // Dynamic resource from request params
	 * resource: (req) => req.params.schema
	 */
	resource?: string | ((req: Request) => string)

	/**
	 * Whether to check record-level ownership
	 * When true, the guard will verify the user owns the record being accessed
	 */
	checkOwnership?: boolean

	/**
	 * Field on the record that contains the owner's user ID
	 * Default: 'createdBy'
	 */
	ownerField?: string
}

/**
 * Metadata stored by the RequirePermission decorator
 */
export interface RequirePermissionMetadata {
	scopes: PermissionScope[]
	resource?: string | ((req: Request) => string)
	checkOwnership: boolean
	ownerField: string
}

/**
 * Decorator to require specific permissions on a controller method
 *
 * @param options - Permission requirements for this endpoint
 * @returns Method decorator
 *
 * @example
 * // Require 'read' permission on 'users' resource
 * @RequirePermission({ scope: 'read', resource: 'users' })
 * async listUsers() { ... }
 *
 * @example
 * // Require 'create' permission on dynamic schema from route params
 * @RequirePermission({ scope: 'create', resource: (req) => req.params.schema })
 * async create(@Param('schema') schema: string) { ... }
 *
 * @example
 * // Require 'update' permission with ownership check
 * @RequirePermission({
 *   scope: 'update',
 *   resource: (req) => req.params.schema,
 *   checkOwnership: true,
 *   ownerField: 'createdBy'
 * })
 * async update(@Param('schema') schema: string) { ... }
 *
 * @example
 * // Require any of multiple permissions
 * @RequirePermission({ scope: ['update', 'delete'], resource: 'posts' })
 * async modifyPost() { ... }
 */
export function RequirePermission(
	options: RequirePermissionOptions,
): CustomDecorator<typeof REQUIRE_PERMISSION_KEY> {
	const metadata: RequirePermissionMetadata = {
		scopes: Array.isArray(options.scope) ? options.scope : [options.scope],
		resource: options.resource,
		checkOwnership: options.checkOwnership ?? false,
		ownerField: options.ownerField ?? 'createdBy',
	}

	return SetMetadata(REQUIRE_PERMISSION_KEY, metadata)
}

/**
 * Decorator to require global admin permission
 * Shorthand for @RequirePermission({ scope: 'read', resource: 'global' })
 */
export function RequireAdmin(): CustomDecorator<typeof REQUIRE_PERMISSION_KEY> {
	return RequirePermission({ scope: 'read', resource: 'global' })
}

/**
 * Decorator to allow public access (no permission required)
 * Can be used to override class-level RequirePermission
 */
export const PUBLIC_ROUTE_KEY = 'public_route'

export function PublicRoute(): CustomDecorator<typeof PUBLIC_ROUTE_KEY> {
	return SetMetadata(PUBLIC_ROUTE_KEY, true)
}
