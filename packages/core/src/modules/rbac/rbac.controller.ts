import type {
	CreatePermissionData,
	CreateRoleData,
	UpdatePermissionData,
	UpdateRoleData,
} from '@magnet-cms/common'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common'
import type { Request } from 'express'
import {
	PublicRoute,
	RequirePermission,
} from '~/decorators/require-permission.decorator'
import { RestrictedRoute } from '~/decorators/restricted.route'
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from './guards/permission.guard'
import { RbacService } from './rbac.service'

/**
 * Extended request with user
 */
interface AuthenticatedRequest extends Request {
	user?: { id: string; roles: string[] }
}

/**
 * Controller for RBAC (Role-Based Access Control) management
 *
 * Provides endpoints for managing roles, permissions, and user assignments.
 */
@Controller('rbac')
@RestrictedRoute()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RbacController {
	constructor(private readonly rbacService: RbacService) {}

	// ============================================================================
	// Role Endpoints
	// ============================================================================

	/**
	 * List all roles
	 * GET /rbac/roles
	 */
	@Get('roles')
	@RequirePermission({ scope: 'read', resource: 'rbac:roles' })
	async listRoles() {
		try {
			return await this.rbacService.findAllRoles()
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to list roles',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Get a role by ID
	 * GET /rbac/roles/:id
	 */
	@Get('roles/:id')
	@RequirePermission({ scope: 'read', resource: 'rbac:roles' })
	async getRole(@Param('id') id: string) {
		try {
			const role = await this.rbacService.findRoleById(id)
			if (!role) {
				throw new HttpException('Role not found', HttpStatus.NOT_FOUND)
			}
			return role
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to get role',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Create a new role
	 * POST /rbac/roles
	 */
	@Post('roles')
	@RequirePermission({ scope: 'create', resource: 'rbac:roles' })
	async createRole(@Body() body: CreateRoleData) {
		try {
			return await this.rbacService.createRole(body)
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to create role',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Update a role
	 * PUT /rbac/roles/:id
	 */
	@Put('roles/:id')
	@RequirePermission({ scope: 'update', resource: 'rbac:roles' })
	async updateRole(@Param('id') id: string, @Body() body: UpdateRoleData) {
		try {
			const role = await this.rbacService.updateRole(id, body)
			if (!role) {
				throw new HttpException('Role not found', HttpStatus.NOT_FOUND)
			}
			return role
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to update role',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Delete a role
	 * DELETE /rbac/roles/:id
	 */
	@Delete('roles/:id')
	@RequirePermission({ scope: 'delete', resource: 'rbac:roles' })
	async deleteRole(@Param('id') id: string) {
		try {
			const result = await this.rbacService.deleteRole(id)
			if (!result) {
				throw new HttpException('Role not found', HttpStatus.NOT_FOUND)
			}
			return { success: true }
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to delete role',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Get permissions for a role
	 * GET /rbac/roles/:id/permissions
	 */
	@Get('roles/:id/permissions')
	@RequirePermission({ scope: 'read', resource: 'rbac:roles' })
	async getRolePermissions(@Param('id') id: string) {
		try {
			return await this.rbacService.getRolePermissions(id)
		} catch (error) {
			throw new HttpException(
				error instanceof Error
					? error.message
					: 'Failed to get role permissions',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Assign permissions to a role
	 * POST /rbac/roles/:id/permissions
	 */
	@Post('roles/:id/permissions')
	@RequirePermission({ scope: 'update', resource: 'rbac:roles' })
	async assignPermissionsToRole(
		@Param('id') id: string,
		@Body() body: { permissionIds: string[] },
	) {
		try {
			const role = await this.rbacService.assignPermissionsToRole(
				id,
				body.permissionIds,
			)
			if (!role) {
				throw new HttpException('Role not found', HttpStatus.NOT_FOUND)
			}
			return role
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to assign permissions',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Remove permissions from a role
	 * DELETE /rbac/roles/:id/permissions
	 */
	@Delete('roles/:id/permissions')
	@RequirePermission({ scope: 'update', resource: 'rbac:roles' })
	async removePermissionsFromRole(
		@Param('id') id: string,
		@Body() body: { permissionIds: string[] },
	) {
		try {
			const role = await this.rbacService.removePermissionsFromRole(
				id,
				body.permissionIds,
			)
			if (!role) {
				throw new HttpException('Role not found', HttpStatus.NOT_FOUND)
			}
			return role
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to remove permissions',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	// ============================================================================
	// Permission Endpoints
	// ============================================================================

	/**
	 * List all permissions
	 * GET /rbac/permissions
	 */
	@Get('permissions')
	@RequirePermission({ scope: 'read', resource: 'rbac:permissions' })
	async listPermissions() {
		try {
			return await this.rbacService.findAllPermissions()
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to list permissions',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Get a permission by ID
	 * GET /rbac/permissions/:id
	 */
	@Get('permissions/:id')
	@RequirePermission({ scope: 'read', resource: 'rbac:permissions' })
	async getPermission(@Param('id') id: string) {
		try {
			const permission = await this.rbacService.findPermissionById(id)
			if (!permission) {
				throw new HttpException('Permission not found', HttpStatus.NOT_FOUND)
			}
			return permission
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to get permission',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Create a new permission
	 * POST /rbac/permissions
	 */
	@Post('permissions')
	@RequirePermission({ scope: 'create', resource: 'rbac:permissions' })
	async createPermission(@Body() body: CreatePermissionData) {
		try {
			return await this.rbacService.createPermission(body)
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to create permission',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Update a permission
	 * PUT /rbac/permissions/:id
	 */
	@Put('permissions/:id')
	@RequirePermission({ scope: 'update', resource: 'rbac:permissions' })
	async updatePermission(
		@Param('id') id: string,
		@Body() body: UpdatePermissionData,
	) {
		try {
			const permission = await this.rbacService.updatePermission(id, body)
			if (!permission) {
				throw new HttpException('Permission not found', HttpStatus.NOT_FOUND)
			}
			return permission
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to update permission',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Delete a permission
	 * DELETE /rbac/permissions/:id
	 */
	@Delete('permissions/:id')
	@RequirePermission({ scope: 'delete', resource: 'rbac:permissions' })
	async deletePermission(@Param('id') id: string) {
		try {
			const result = await this.rbacService.deletePermission(id)
			if (!result) {
				throw new HttpException('Permission not found', HttpStatus.NOT_FOUND)
			}
			return { success: true }
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to delete permission',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	// ============================================================================
	// User Permission Endpoints
	// ============================================================================

	/**
	 * Get resolved permissions for the current user
	 * GET /rbac/me/permissions
	 */
	@Get('me/permissions')
	@PublicRoute() // Allow any authenticated user to see their own permissions
	async getMyPermissions(@Req() req: AuthenticatedRequest) {
		try {
			if (!req.user) {
				throw new HttpException(
					'Authentication required',
					HttpStatus.UNAUTHORIZED,
				)
			}

			const roleIds = req.user.roles ?? []
			return await this.rbacService.resolveUserPermissions(roleIds)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error
					? error.message
					: 'Failed to get user permissions',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Get resolved permissions for a specific user
	 * GET /rbac/users/:id/permissions
	 */
	@Get('users/:id/permissions')
	@RequirePermission({ scope: 'read', resource: 'rbac:users' })
	async getUserPermissions(@Param('id') userId: string) {
		try {
			// We need to get the user's roles first
			// This would typically be done through a UserService
			// For now, we'll return an error indicating the user service needs to be injected
			throw new HttpException(
				'User lookup not implemented - inject UserService',
				HttpStatus.NOT_IMPLEMENTED,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error
					? error.message
					: 'Failed to get user permissions',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	// ============================================================================
	// System Status Endpoints
	// ============================================================================

	/**
	 * Check if RBAC is initialized (has roles)
	 * GET /rbac/status
	 * This is public to allow checking if setup is needed
	 */
	@Get('status')
	@PublicRoute()
	async getStatus() {
		try {
			const hasRoles = await this.rbacService.hasRoles()
			return {
				initialized: hasRoles,
				message: hasRoles
					? 'RBAC system is initialized'
					: 'RBAC system needs initialization',
			}
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to get RBAC status',
				HttpStatus.BAD_REQUEST,
			)
		}
	}
}
