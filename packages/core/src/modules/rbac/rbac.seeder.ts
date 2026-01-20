import {
	DefaultRoleNames,
	InjectModel,
	Model,
	PermissionNamePatterns,
	type PermissionScope,
} from '@magnet-cms/common'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { User } from '~/modules/user/schemas/user.schema'
import { Permission } from './schemas/permission.schema'
import { Role } from './schemas/role.schema'

/**
 * Default permission definition
 */
interface DefaultPermission {
	name: string
	displayName: string
	description: string
	scope: PermissionScope
	resource: {
		type: 'global' | 'schema' | 'field' | 'record'
		target?: string
		conditions?: Array<{
			field: string
			operator: 'equals' | 'in' | 'contains'
			value: string
		}>
	}
}

/**
 * Default role definition
 */
interface DefaultRole {
	name: string
	displayName: string
	description: string
	priority: number
	permissionNames: string[]
	inheritsFrom?: string[]
}

/**
 * Seeder for initializing default RBAC roles and permissions
 *
 * This service runs on module initialization and:
 * 1. Creates default system permissions if they don't exist
 * 2. Creates default system roles if they don't exist
 * 3. Migrates existing users from legacy `role` field to new `roles` array
 */
@Injectable()
export class RbacSeeder implements OnModuleInit {
	private readonly logger = new Logger(RbacSeeder.name)

	constructor(
		@InjectModel(Permission)
		private readonly permissionModel: Model<Permission>,
		@InjectModel(Role)
		private readonly roleModel: Model<Role>,
		@InjectModel(User)
		private readonly userModel: Model<User>,
	) {}

	/**
	 * Initialize RBAC system on module start
	 */
	async onModuleInit(): Promise<void> {
		this.logger.log('Initializing RBAC system...')

		try {
			await this.seedPermissions()
			await this.seedRoles()
			await this.migrateUsers()
			this.logger.log('RBAC system initialized successfully')
		} catch (error) {
			this.logger.error(
				'Failed to initialize RBAC system',
				error instanceof Error ? error.stack : String(error),
			)
		}
	}

	/**
	 * Seed default permissions
	 */
	private async seedPermissions(): Promise<void> {
		const existingPermissions = await this.permissionModel.find()
		const existingNames = new Set(
			existingPermissions.map((p: Permission & { id: string }) => p.name),
		)

		const defaultPermissions = this.getDefaultPermissions()
		let created = 0

		for (const permDef of defaultPermissions) {
			if (!existingNames.has(permDef.name)) {
				await this.permissionModel.create({
					...permDef,
					isSystem: true,
				})
				created++
			}
		}

		if (created > 0) {
			this.logger.log(`Created ${created} default permissions`)
		}
	}

	/**
	 * Seed default roles
	 */
	private async seedRoles(): Promise<void> {
		const existingRoles = await this.roleModel.find()
		const existingNames = new Set(
			existingRoles.map((r: Role & { id: string }) => r.name),
		)

		// Get all permissions for mapping
		const allPermissions = await this.permissionModel.find()
		const permissionNameToId = new Map(
			allPermissions.map((p: Permission & { id: string }) => [p.name, p.id]),
		)

		const defaultRoles = this.getDefaultRoles()
		let created = 0

		for (const roleDef of defaultRoles) {
			if (!existingNames.has(roleDef.name)) {
				// Map permission names to IDs
				const permissionIds = roleDef.permissionNames
					.map((name) => permissionNameToId.get(name))
					.filter((id): id is string => id !== undefined)

				// Map inheritsFrom role names to IDs
				let inheritsFromIds: string[] | undefined
				if (roleDef.inheritsFrom) {
					const roleNameToId = new Map(
						existingRoles.map((r: Role & { id: string }) => [r.name, r.id]),
					)
					inheritsFromIds = roleDef.inheritsFrom
						.map((name) => roleNameToId.get(name))
						.filter((id): id is string => id !== undefined)
				}

				await this.roleModel.create({
					name: roleDef.name,
					displayName: roleDef.displayName,
					description: roleDef.description,
					priority: roleDef.priority,
					permissions: permissionIds,
					inheritsFrom: inheritsFromIds,
					isSystem: true,
				})
				created++
			}
		}

		if (created > 0) {
			this.logger.log(`Created ${created} default roles`)
		}
	}

	/**
	 * Migrate users from legacy role field to roles array
	 */
	private async migrateUsers(): Promise<void> {
		// Get all roles for mapping
		const allRoles = await this.roleModel.find()
		const roleNameToId = new Map(
			allRoles.map((r: Role & { id: string }) => [r.name, r.id]),
		)

		// Legacy role name to new role name mapping
		const legacyRoleMapping: Record<string, string> = {
			admin: DefaultRoleNames.ADMIN,
			editor: DefaultRoleNames.EDITOR,
			viewer: DefaultRoleNames.VIEWER,
		}

		// Find users with legacy role field but no roles array
		const allUsers = await this.userModel.find()
		let migrated = 0

		for (const user of allUsers) {
			// Cast to access potentially undefined properties
			const userData = user as { role?: string; roles?: string[]; id: string }

			// Skip if user already has roles assigned
			if (userData.roles && userData.roles.length > 0) {
				continue
			}

			// Check if user has legacy role
			if (userData.role && typeof userData.role === 'string') {
				const newRoleName = legacyRoleMapping[userData.role]
				if (newRoleName) {
					const roleId = roleNameToId.get(newRoleName)
					if (roleId) {
						await this.userModel.update(
							{ id: userData.id },
							{
								roles: [roleId],
								// Keep legacy role for backward compatibility during transition
								// It will be removed in a future migration
							},
						)
						migrated++
					}
				}
			}
		}

		if (migrated > 0) {
			this.logger.log(
				`Migrated ${migrated} users from legacy role to roles array`,
			)
		}
	}

	/**
	 * Get default permission definitions
	 */
	private getDefaultPermissions(): DefaultPermission[] {
		const permissions: DefaultPermission[] = []

		// Global admin permissions
		for (const scope of [
			'create',
			'read',
			'update',
			'delete',
			'publish',
		] as PermissionScope[]) {
			permissions.push({
				name: PermissionNamePatterns.global(scope),
				displayName: `Global ${this.capitalizeFirst(scope)}`,
				description: `Full ${scope} access to all resources`,
				scope,
				resource: { type: 'global' },
			})
		}

		// RBAC management permissions
		for (const resource of ['roles', 'permissions', 'users']) {
			for (const scope of [
				'create',
				'read',
				'update',
				'delete',
			] as PermissionScope[]) {
				permissions.push({
					name: PermissionNamePatterns.admin(resource, scope),
					displayName: `${this.capitalizeFirst(scope)} ${this.capitalizeFirst(resource)}`,
					description: `Permission to ${scope} ${resource}`,
					scope,
					resource: { type: 'schema', target: `rbac:${resource}` },
				})
			}
		}

		// Content management permissions (generic, schema-specific ones are created dynamically)
		for (const scope of [
			'create',
			'read',
			'update',
			'delete',
			'publish',
		] as PermissionScope[]) {
			// Generic content permission for any schema
			permissions.push({
				name: `content:*:${scope}`,
				displayName: `${this.capitalizeFirst(scope)} Any Content`,
				description: `Permission to ${scope} content in any schema`,
				scope,
				resource: { type: 'schema', target: '*' },
			})
		}

		// Own content permissions (record-level)
		for (const scope of ['read', 'update', 'delete'] as PermissionScope[]) {
			permissions.push({
				name: `content:own:${scope}`,
				displayName: `${this.capitalizeFirst(scope)} Own Content`,
				description: `Permission to ${scope} content created by the user`,
				scope,
				resource: {
					type: 'record',
					target: '*',
					conditions: [
						{ field: 'createdBy', operator: 'equals', value: '$currentUser' },
					],
				},
			})
		}

		return permissions
	}

	/**
	 * Get default role definitions
	 */
	private getDefaultRoles(): DefaultRole[] {
		return [
			{
				name: DefaultRoleNames.SUPER_ADMIN,
				displayName: 'Super Admin',
				description:
					'Full system access. Can manage all content, users, roles, and system settings.',
				priority: 100,
				permissionNames: [
					'global:create',
					'global:read',
					'global:update',
					'global:delete',
					'global:publish',
				],
			},
			{
				name: DefaultRoleNames.ADMIN,
				displayName: 'Admin',
				description:
					'Administrative access. Can manage content, users, and roles.',
				priority: 80,
				permissionNames: [
					'content:*:create',
					'content:*:read',
					'content:*:update',
					'content:*:delete',
					'content:*:publish',
					'admin:roles:read',
					'admin:users:create',
					'admin:users:read',
					'admin:users:update',
				],
			},
			{
				name: DefaultRoleNames.EDITOR,
				displayName: 'Editor',
				description:
					'Can create, edit, and publish content. Cannot delete content or manage users.',
				priority: 60,
				permissionNames: [
					'content:*:create',
					'content:*:read',
					'content:*:update',
					'content:*:publish',
				],
			},
			{
				name: DefaultRoleNames.AUTHOR,
				displayName: 'Author',
				description: 'Can create and manage their own content only.',
				priority: 40,
				permissionNames: [
					'content:*:create',
					'content:own:read',
					'content:own:update',
					'content:own:delete',
				],
			},
			{
				name: DefaultRoleNames.VIEWER,
				displayName: 'Viewer',
				description: 'Read-only access to content.',
				priority: 20,
				permissionNames: ['content:*:read'],
			},
		]
	}

	/**
	 * Capitalize first letter of a string
	 */
	private capitalizeFirst(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}
}
