import { Prop, Schema, UI, Validators } from '@magnet-cms/common'
import {
	IsArray,
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from 'class-validator'

/**
 * Role entity schema
 *
 * Roles are collections of permissions that can be assigned to users.
 * Roles support inheritance through the `inheritsFrom` field.
 *
 * @example
 * // Editor role
 * {
 *   name: 'editor',
 *   displayName: 'Editor',
 *   description: 'Can create and edit content',
 *   permissions: ['perm-1', 'perm-2'],
 *   inheritsFrom: ['viewer'],
 *   isSystem: false,
 *   priority: 50
 * }
 */
@Schema({ versioning: false, i18n: false })
export class Role {
	/**
	 * Unique name identifier for the role
	 * Examples: "super-admin", "admin", "editor", "author", "viewer"
	 */
	@Prop({ required: true, unique: true })
	@Validators(IsString(), IsNotEmpty())
	@UI({ tab: 'General', row: true })
	name!: string

	/**
	 * Human-readable display name
	 */
	@Prop({ required: true })
	@Validators(IsString(), IsNotEmpty())
	@UI({ tab: 'General', row: true })
	displayName!: string

	/**
	 * Description of the role and its purpose
	 */
	@Prop({ required: false })
	@Validators(IsString(), IsOptional())
	@UI({ tab: 'General', type: 'textarea' })
	description?: string

	/**
	 * Array of permission IDs assigned to this role (many-to-many relationship)
	 * These are references to Permission documents
	 */
	@Prop({ required: false, default: [], ref: 'Permission' })
	@Validators(IsArray(), IsOptional())
	@UI({
		tab: 'Permissions',
		type: 'relationship',
		hidden: true, // Hidden because we'll use a custom permission matrix UI
	})
	permissions!: string[]

	/**
	 * Array of role IDs this role inherits from (for role hierarchy)
	 * Permissions from inherited roles are included in this role's effective permissions
	 */
	@Prop({ required: false, default: [], ref: 'Role' })
	@Validators(IsArray(), IsOptional())
	@UI({
		tab: 'Inheritance',
		type: 'relationship',
	})
	inheritsFrom?: string[]

	/**
	 * Whether this is a built-in system role that cannot be deleted
	 * System roles: super-admin, admin, editor, author, viewer
	 */
	@Prop({ required: true, default: false })
	@Validators(IsBoolean())
	@UI({
		tab: 'General',
		type: 'checkbox',
		readonly: true,
	})
	isSystem!: boolean

	/**
	 * Priority for role hierarchy (higher = more authority)
	 * Used when a user has multiple roles to determine precedence
	 * Recommended values: super-admin=100, admin=80, editor=60, author=40, viewer=20
	 */
	@Prop({ required: true, default: 0 })
	@Validators(IsNumber(), Min(0))
	@UI({
		tab: 'General',
		type: 'number',
	})
	priority!: number
}
