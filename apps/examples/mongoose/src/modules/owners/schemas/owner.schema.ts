import { Prop, Schema, UI, Validators } from '@magnet-cms/common'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
} from 'class-validator'

@Schema()
export class Owner {
	@Prop({ required: true })
	@Validators(IsString(), Length(2, 100), IsNotEmpty())
	@UI({ tab: 'General', row: true })
	name!: string

	@Prop({ required: true, unique: true })
	@Validators(IsEmail(), IsNotEmpty())
	@UI({ tab: 'General', type: 'email', row: true })
	email!: string

	@Prop({ required: true })
	@Validators(IsString(), Length(10, 20), IsNotEmpty())
	@UI({ tab: 'General', type: 'phone' })
	phone!: string

	@Prop({ required: false })
	@Validators(IsString(), IsOptional())
	@UI({ tab: 'General' })
	address?: string

	// Virtual relation to cats - one owner has many cats
	// This is handled via the Cat.owner field (many-to-one from Cat side)
}
