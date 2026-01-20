import {
	type FieldPermission,
	InjectModel,
	Model,
	type PermissionCondition,
	type PermissionContext,
	type PermissionScope,
	type RecordPermission,
	type ResolvedPermissions,
	isValidPermissionScope,
} from '@magnet-cms/common'
import { Injectable, Logger } from '@nestjs/common'
import { Permission } from './schemas/permission.schema'
import { Role } from './schemas/role.schema'

/**
 * Service for managing RBAC (Role-Based Access Control)
 *
 * Handles permission resolution, caching, and authorization checks.
 */
@Injectable()
export class RbacService {
	private readonly logger = new Logger(RbacService.name)

	/**
	 * In-memory cache for resolved permissions
	 * Key: userId, Value: { permissions, timestamp }
	 */
	private readonly permissionCache = new Map<
		string,
		{ permissions: ResolvedPermissions; timestamp: number }
	>()

	/** Cache TTL in milliseconds (5 minutes) */
	private readonly cacheTtl = 5 * 60 * 1000

	constructor(
		@InjectModel(Permission)
		private readonly permissionModel: Model<Permission>,
		@InjectModel(Role)
		private readonly roleModel: Model<Role>,
	) {}

	// ============================================================================
	// Permission Resolution
	// ============================================================================

	/**
	 * Resolve all effective permissions for a user
	 *
	 * @param roleIds - Array of role IDs assigned to the user
	 * @returns Resolved permissions structure
	 */
	async resolveUserPermissions(
		roleIds: string[],
	): Promise<ResolvedPermissions> {
		// Check cache first
		const cacheKey = roleIds.sort().join(',')
		const cached = this.permissionCache.get(cacheKey)
		if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
			return cached.permissions
		}

		// Resolve all roles including inherited ones
		const allRoleIds = await this.resolveRoleHierarchy(roleIds)

		// Get all roles
		const roles = await this.roleModel.findMany({})
		const userRoles = roles.filter((role: Role & { id: string }) =>
			allRoleIds.has(role.id),
		)

		// Collect all permission IDs from all roles
		const permissionIds = new Set<string>()
		for (const role of userRoles) {
			for (const permId of role.permissions) {
				permissionIds.add(permId)
			}
		}

		// Get all permissions
		const allPermissions = await this.permissionModel.find()
		const userPermissions = allPermissions.filter(
			(perm: Permission & { id: string }) => permissionIds.has(perm.id),
		)

		// Build resolved permissions structure
		const resolved: ResolvedPermissions = {
			global: [],
			schemas: {},
			fields: {},
			records: {},
			roleIds: Array.from(allRoleIds),
			roleNames: userRoles.map((r: Role & { id: string }) => r.name),
		}

		for (const permission of userPermissions) {
			const { scope, resource } = permission

			switch (resource.type) {
				case 'global':
					if (!resolved.global.includes(scope)) {
						resolved.global.push(scope)
					}
					break

				case 'schema':
					if (resource.target) {
						const schemaTarget = resource.target
						if (!resolved.schemas[schemaTarget]) {
							resolved.schemas[schemaTarget] = []
						}
						if (!resolved.schemas[schemaTarget].includes(scope)) {
							resolved.schemas[schemaTarget].push(scope)
						}
					}
					break

				case 'field':
					if (resource.target && resource.fields) {
						const fieldTarget = resource.target
						if (!resolved.fields[fieldTarget]) {
							resolved.fields[fieldTarget] = {}
						}
						const targetFields = resolved.fields[fieldTarget]
						for (const field of resource.fields) {
							if (!targetFields[field]) {
								targetFields[field] = {
									visible: true,
									readonly: scope === 'read',
								}
							}
							// If they have update permission, mark as not readonly
							if (scope === 'update') {
								targetFields[field].readonly = false
							}
						}
					}
					break

				case 'record':
					if (resource.target && resource.conditions) {
						const recordTarget = resource.target
						if (!resolved.records[recordTarget]) {
							resolved.records[recordTarget] = []
						}
						const targetRecords = resolved.records[recordTarget]
						for (const condition of resource.conditions) {
							targetRecords.push({
								scope,
								condition,
							})
						}
					}
					break
			}
		}

		// Cache the result
		this.permissionCache.set(cacheKey, {
			permissions: resolved,
			timestamp: Date.now(),
		})

		return resolved
	}

	/**
	 * Resolve all role IDs including inherited roles (BFS traversal)
	 */
	private async resolveRoleHierarchy(roleIds: string[]): Promise<Set<string>> {
		const allRoleIds = new Set<string>(roleIds)
		const queue = [...roleIds]
		const visited = new Set<string>()

		// Get all roles for lookup
		const allRoles = await this.roleModel.find()
		const roleMap = new Map(
			allRoles.map((r: Role & { id: string }) => [r.id, r]),
		)

		while (queue.length > 0) {
			const currentId = queue.shift()
			if (!currentId || visited.has(currentId)) {
				continue
			}
			visited.add(currentId)

			const role = roleMap.get(currentId)
			if (role?.inheritsFrom) {
				for (const parentId of role.inheritsFrom) {
					if (!allRoleIds.has(parentId)) {
						allRoleIds.add(parentId)
						queue.push(parentId)
					}
				}
			}
		}

		return allRoleIds
	}

	// ============================================================================
	// Permission Checking
	// ============================================================================

	/**
	 * Check if a user has a specific permission
	 *
	 * @param roleIds - User's role IDs
	 * @param scope - Permission scope to check
	 * @param resource - Resource identifier (schema name, 'global', etc.)
	 * @param context - Optional context for record-level checks
	 * @returns Whether the user has the permission
	 */
	async hasPermission(
		roleIds: string[],
		scope: PermissionScope,
		resource: string,
		context?: PermissionContext,
	): Promise<boolean> {
		const resolved = await this.resolveUserPermissions(roleIds)

		// Check global permissions first (superuser access)
		if (resolved.global.includes(scope)) {
			return true
		}

		// Check schema-level permissions
		if (resolved.schemas[resource]?.includes(scope)) {
			// If no context provided, schema-level permission is sufficient
			if (!context?.record) {
				return true
			}

			// Check record-level conditions if present
			const recordPermissions = resolved.records[resource]
			if (recordPermissions && recordPermissions.length > 0) {
				// Must satisfy at least one record-level condition
				return recordPermissions.some(
					(rp: RecordPermission) =>
						rp.scope === scope &&
						this.evaluateCondition(
							rp.condition,
							context.record as Record<string, unknown>,
							context,
						),
				)
			}

			return true
		}

		// Check record-level permissions without schema-level
		const recordPermissions = resolved.records[resource]
		if (recordPermissions && context?.record) {
			return recordPermissions.some(
				(rp: RecordPermission) =>
					rp.scope === scope &&
					this.evaluateCondition(
						rp.condition,
						context.record as Record<string, unknown>,
						context,
					),
			)
		}

		return false
	}

	/**
	 * Check if user has permission for a specific schema and scope
	 */
	async hasSchemaPermission(
		roleIds: string[],
		schema: string,
		scope: PermissionScope,
	): Promise<boolean> {
		const resolved = await this.resolveUserPermissions(roleIds)

		// Global permissions grant access to all schemas
		if (resolved.global.includes(scope)) {
			return true
		}

		return resolved.schemas[schema]?.includes(scope) ?? false
	}

	/**
	 * Get field permissions for a user on a specific schema
	 */
	async getFieldPermissions(
		roleIds: string[],
		schema: string,
	): Promise<Record<string, FieldPermission>> {
		const resolved = await this.resolveUserPermissions(roleIds)
		return resolved.fields[schema] ?? {}
	}

	/**
	 * Evaluate a permission condition against a record
	 */
	private evaluateCondition(
		condition: PermissionCondition,
		record: Record<string, unknown>,
		context: PermissionContext,
	): boolean {
		const fieldValue = record[condition.field]

		// Resolve special value placeholders
		let compareValue: unknown = condition.value
		if (condition.value === '$currentUser' && context.currentUserId) {
			compareValue = context.currentUserId
		}

		switch (condition.operator) {
			case 'equals':
				return fieldValue === compareValue

			case 'in':
				if (Array.isArray(fieldValue)) {
					return fieldValue.includes(compareValue)
				}
				return false

			case 'contains':
				if (
					typeof fieldValue === 'string' &&
					typeof compareValue === 'string'
				) {
					return fieldValue.includes(compareValue)
				}
				return false

			default:
				return false
		}
	}

	// ============================================================================
	// Cache Management
	// ============================================================================

	/**
	 * Invalidate permission cache for specific role IDs
	 */
	invalidateCache(roleIds?: string[]): void {
		if (!roleIds) {
			this.permissionCache.clear()
			this.logger.debug('Cleared entire permission cache')
			return
		}

		// Clear any cache entries that contain any of the specified role IDs
		for (const [key] of this.permissionCache) {
			const cachedRoleIds = key.split(',')
			if (roleIds.some((id) => cachedRoleIds.includes(id))) {
				this.permissionCache.delete(key)
			}
		}
		this.logger.debug(`Invalidated cache for roles: ${roleIds.join(', ')}`)
	}

	// ============================================================================
	// Role Management
	// ============================================================================

	/**
	 * Get all roles
	 */
	async findAllRoles(): Promise<Array<Role & { id: string }>> {
		return this.roleModel.find()
	}

	/**
	 * Get a role by ID
	 */
	async findRoleById(id: string): Promise<(Role & { id: string }) | null> {
		return this.roleModel.findById(id)
	}

	/**
	 * Get a role by name
	 */
	async findRoleByName(name: string): Promise<(Role & { id: string }) | null> {
		return this.roleModel.findOne({ name })
	}

	/**
	 * Create a new role
	 */
	async createRole(data: Partial<Role>): Promise<Role & { id: string }> {
		const role = await this.roleModel.create(data)
		this.invalidateCache()
		return role
	}

	/**
	 * Update a role
	 */
	async updateRole(
		id: string,
		data: Partial<Role>,
	): Promise<(Role & { id: string }) | null> {
		// Prevent modification of system roles' critical properties
		const existingRole = await this.roleModel.findById(id)
		if (existingRole?.isSystem && data.name !== undefined) {
			throw new Error('Cannot change name of system roles')
		}

		const role = await this.roleModel.update({ id }, data)
		this.invalidateCache()
		return role
	}

	/**
	 * Delete a role
	 */
	async deleteRole(id: string): Promise<boolean> {
		const existingRole = await this.roleModel.findById(id)
		if (existingRole?.isSystem) {
			throw new Error('Cannot delete system roles')
		}

		const result = await this.roleModel.delete({ id })
		this.invalidateCache()
		return result
	}

	// ============================================================================
	// Permission Management
	// ============================================================================

	/**
	 * Get all permissions
	 */
	async findAllPermissions(): Promise<Array<Permission & { id: string }>> {
		return this.permissionModel.find()
	}

	/**
	 * Get a permission by ID
	 */
	async findPermissionById(
		id: string,
	): Promise<(Permission & { id: string }) | null> {
		return this.permissionModel.findById(id)
	}

	/**
	 * Get a permission by name
	 */
	async findPermissionByName(
		name: string,
	): Promise<(Permission & { id: string }) | null> {
		return this.permissionModel.findOne({ name })
	}

	/**
	 * Create a new permission
	 */
	async createPermission(
		data: Partial<Permission>,
	): Promise<Permission & { id: string }> {
		// Validate scope
		if (data.scope && !isValidPermissionScope(data.scope)) {
			throw new Error(`Invalid permission scope: ${data.scope}`)
		}

		const permission = await this.permissionModel.create(data)
		this.invalidateCache()
		return permission
	}

	/**
	 * Update a permission
	 */
	async updatePermission(
		id: string,
		data: Partial<Permission>,
	): Promise<(Permission & { id: string }) | null> {
		// Prevent modification of system permissions' critical properties
		const existingPermission = await this.permissionModel.findById(id)
		if (existingPermission?.isSystem && data.name !== undefined) {
			throw new Error('Cannot change name of system permissions')
		}

		// Validate scope if provided
		if (data.scope && !isValidPermissionScope(data.scope)) {
			throw new Error(`Invalid permission scope: ${data.scope}`)
		}

		const permission = await this.permissionModel.update({ id }, data)
		this.invalidateCache()
		return permission
	}

	/**
	 * Delete a permission
	 */
	async deletePermission(id: string): Promise<boolean> {
		const existingPermission = await this.permissionModel.findById(id)
		if (existingPermission?.isSystem) {
			throw new Error('Cannot delete system permissions')
		}

		const result = await this.permissionModel.delete({ id })
		this.invalidateCache()
		return result
	}

	// ============================================================================
	// Utility Methods
	// ============================================================================

	/**
	 * Check if any roles exist in the system
	 */
	async hasRoles(): Promise<boolean> {
		const roles = await this.roleModel.find()
		return roles.length > 0
	}

	/**
	 * Get permissions for a specific role
	 */
	async getRolePermissions(
		roleId: string,
	): Promise<Array<Permission & { id: string }>> {
		const role = await this.roleModel.findById(roleId)
		if (!role) {
			return []
		}

		const allPermissions = await this.permissionModel.find()
		return allPermissions.filter((p: Permission & { id: string }) =>
			role.permissions.includes(p.id),
		)
	}

	/**
	 * Assign permissions to a role
	 */
	async assignPermissionsToRole(
		roleId: string,
		permissionIds: string[],
	): Promise<(Role & { id: string }) | null> {
		const role = await this.roleModel.findById(roleId)
		if (!role) {
			return null
		}

		// Merge existing permissions with new ones (avoid duplicates)
		const newPermissions = [...new Set([...role.permissions, ...permissionIds])]

		return this.updateRole(roleId, { permissions: newPermissions })
	}

	/**
	 * Remove permissions from a role
	 */
	async removePermissionsFromRole(
		roleId: string,
		permissionIds: string[],
	): Promise<(Role & { id: string }) | null> {
		const role = await this.roleModel.findById(roleId)
		if (!role) {
			return null
		}

		const newPermissions = role.permissions.filter(
			(p: string) => !permissionIds.includes(p),
		)

		return this.updateRole(roleId, { permissions: newPermissions })
	}
}
