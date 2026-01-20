import { Mixed, Prop, Schema, UI, Validators } from '@magnet-cms/common'
import type { PermissionResource, PermissionScope } from '@magnet-cms/common'
import {
	IsBoolean,
	IsIn,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator'

/**
 * Permission entity schema
 *
 * Defines a single permission that can be assigned to roles.
 * Permissions control access at various levels: global, schema, field, and record.
 *
 * @example
 * // Schema-level permission
 * {
 *   name: 'content:cats:create',
 *   displayName: 'Create Cats',
 *   scope: 'create',
 *   resource: { type: 'schema', target: 'cats' },
 *   isSystem: false
 * }
 *
 * @example
 * // Global permission
 * {
 *   name: 'global:admin',
 *   displayName: 'Full Admin Access',
 *   scope: 'read',
 *   resource: { type: 'global' },
 *   isSystem: true
 * }
 */
@Schema({ versioning: false, i18n: false })
export class Permission {
	/**
	 * Unique name identifier for the permission
	 * Format: {category}:{target}:{scope}
	 * Examples: "content:cats:create", "admin:users:read", "global:admin"
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
	 * Detailed description of what this permission grants
	 */
	@Prop({ required: false })
	@Validators(IsString(), IsOptional())
	@UI({ tab: 'General', type: 'textarea' })
	description?: string

	/**
	 * The action scope this permission grants
	 * One of: create, read, update, delete, publish
	 */
	@Prop({ type: String, required: true })
	@Validators(
		IsString(),
		IsIn(['create', 'read', 'update', 'delete', 'publish']),
	)
	@UI({
		tab: 'General',
		type: 'select',
		options: [
			{ key: 'create', value: 'Create' },
			{ key: 'read', value: 'Read' },
			{ key: 'update', value: 'Update' },
			{ key: 'delete', value: 'Delete' },
			{ key: 'publish', value: 'Publish' },
		],
	})
	scope!: PermissionScope

	/**
	 * Resource definition for this permission
	 * Defines what the permission applies to (global, schema, field, or record level)
	 */
	@Prop({ type: Mixed, required: true })
	@Validators(IsObject())
	resource!: PermissionResource

	/**
	 * Whether this is a built-in system permission that cannot be deleted
	 */
	@Prop({ required: true, default: false })
	@Validators(IsBoolean())
	@UI({
		tab: 'General',
		type: 'checkbox',
		readonly: true,
	})
	isSystem!: boolean
}
