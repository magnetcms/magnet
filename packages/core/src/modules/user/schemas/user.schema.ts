import { Prop, Schema, UI, Validators } from '@magnet-cms/common'
import { hash } from 'bcryptjs'
import {
	IsArray,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
} from 'class-validator'

@Schema({ versioning: false, i18n: false })
export class User {
	@Prop({ required: true, unique: true })
	@Validators(IsEmail(), IsNotEmpty())
	@UI({ tab: 'General', type: 'email', row: true })
	email!: string

	@Prop({ required: true })
	@Validators(IsString(), Length(6, 100), IsNotEmpty())
	password!: string

	@Prop({ required: true })
	@Validators(IsString(), Length(2, 100), IsNotEmpty())
	@UI({ tab: 'General', row: true })
	name!: string

	/**
	 * Array of role IDs assigned to this user (many-to-many relationship)
	 * References Role documents from the RBAC module
	 */
	@Prop({ required: false, default: [], ref: 'Role' })
	@Validators(IsArray(), IsOptional())
	@UI({
		tab: 'Roles',
		type: 'relationship',
	})
	roles!: string[]

	/**
	 * @deprecated Legacy single role field - kept for migration compatibility
	 * This field will be removed in a future version. Use `roles` instead.
	 */
	@Prop({ required: false })
	@Validators(IsString(), IsOptional())
	@UI({ hidden: true })
	role?: string

	async hashPassword(): Promise<void> {
		this.password = await hash(this.password, 10)
	}
}
