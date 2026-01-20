import type { AuthUser, PermissionScope } from '@magnet-cms/common'
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import {
	PUBLIC_ROUTE_KEY,
	REQUIRE_PERMISSION_KEY,
	type RequirePermissionMetadata,
} from '~/decorators/require-permission.decorator'
import { RbacService } from '../rbac.service'

/**
 * Extended request with user
 */
interface AuthenticatedRequest extends Request {
	user?: AuthUser
}

/**
 * Guard that enforces permission requirements on routes
 *
 * Must be used after JwtAuthGuard to ensure user is authenticated.
 *
 * @example
 * // Apply to controller or method
 * @UseGuards(JwtAuthGuard, PermissionGuard)
 * @RequirePermission({ scope: 'read', resource: 'users' })
 * async listUsers() { ... }
 */
@Injectable()
export class PermissionGuard implements CanActivate {
	private readonly logger = new Logger(PermissionGuard.name)

	constructor(
		private readonly reflector: Reflector,
		private readonly rbacService: RbacService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Check if route is marked as public
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			PUBLIC_ROUTE_KEY,
			[context.getHandler(), context.getClass()],
		)

		if (isPublic) {
			return true
		}

		// Get permission metadata from handler or class
		const permissionMetadata =
			this.reflector.getAllAndOverride<RequirePermissionMetadata>(
				REQUIRE_PERMISSION_KEY,
				[context.getHandler(), context.getClass()],
			)

		// No permission requirement means allow access
		if (!permissionMetadata) {
			return true
		}

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
		const user = request.user

		// User must be authenticated
		if (!user) {
			this.logger.warn('Permission check failed: No authenticated user')
			throw new ForbiddenException('Authentication required')
		}

		// Get user's role IDs
		const roleIds = user.roles ?? []

		// If user has no roles, deny access (unless they have the legacy role field)
		if (roleIds.length === 0 && !user.role) {
			this.logger.warn(
				`Permission check failed: User ${user.id} has no roles assigned`,
			)
			throw new ForbiddenException('No roles assigned')
		}

		// Resolve the resource (static string or dynamic function)
		const resource = this.resolveResource(permissionMetadata.resource, request)

		// Check if user has any of the required permission scopes
		const hasPermission = await this.checkPermissions(
			roleIds,
			permissionMetadata.scopes,
			resource,
			request,
			permissionMetadata,
		)

		if (!hasPermission) {
			this.logger.warn(
				`Permission denied: User ${user.id} lacks ${permissionMetadata.scopes.join('|')} permission on ${resource}`,
			)
			throw new ForbiddenException(
				`Insufficient permissions for ${permissionMetadata.scopes.join(' or ')} on ${resource}`,
			)
		}

		// Resolve and attach permissions to request for downstream use
		if (!user.permissions) {
			user.permissions = await this.rbacService.resolveUserPermissions(roleIds)
		}

		return true
	}

	/**
	 * Resolve the resource identifier from metadata
	 */
	private resolveResource(
		resource: RequirePermissionMetadata['resource'],
		request: Request,
	): string {
		if (!resource) {
			return 'global'
		}

		if (typeof resource === 'function') {
			return resource(request)
		}

		return resource
	}

	/**
	 * Check if user has any of the required permissions
	 */
	private async checkPermissions(
		roleIds: string[],
		scopes: PermissionScope[],
		resource: string,
		request: AuthenticatedRequest,
		metadata: RequirePermissionMetadata,
	): Promise<boolean> {
		// Check each scope - user needs ANY of them
		for (const scope of scopes) {
			const hasPermission = await this.rbacService.hasPermission(
				roleIds,
				scope,
				resource,
				{
					currentUserId: request.user?.id,
					record: metadata.checkOwnership
						? await this.getRecordFromRequest(request)
						: undefined,
				},
			)

			if (hasPermission) {
				// If ownership check is required and permission is granted, verify ownership
				if (metadata.checkOwnership) {
					const record = await this.getRecordFromRequest(request)
					if (
						record &&
						!this.checkOwnership(request.user, record, metadata.ownerField)
					) {
						continue // User doesn't own this record, try next scope
					}
				}
				return true
			}
		}

		return false
	}

	/**
	 * Extract record from request body or cache
	 * This is a simplified version - in practice, you might need to fetch the record
	 */
	private async getRecordFromRequest(
		request: Request,
	): Promise<Record<string, unknown> | undefined> {
		// Record might be in request body (for updates) or attached by a previous middleware
		const record = (request as Request & { record?: Record<string, unknown> })
			.record
		if (record) {
			return record
		}

		// For update/delete operations, the record data might be in the body
		if (request.body && typeof request.body === 'object') {
			return request.body as Record<string, unknown>
		}

		return undefined
	}

	/**
	 * Check if the user owns the record
	 */
	private checkOwnership(
		user: AuthUser | undefined,
		record: Record<string, unknown>,
		ownerField: string,
	): boolean {
		if (!user) {
			return false
		}

		const ownerId = record[ownerField]
		return ownerId === user.id
	}
}
