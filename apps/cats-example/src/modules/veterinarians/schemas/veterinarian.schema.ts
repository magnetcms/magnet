import { Prop, Schema, UI, Validators } from '@magnet-cms/common'
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'

@Schema()
export class Veterinarian {
	@Prop({ required: true })
	@Validators(IsString(), Length(2, 100), IsNotEmpty())
	@UI({ tab: 'General', row: true })
	name!: string

	@Prop({ required: true })
	@Validators(IsString(), Length(2, 200), IsNotEmpty())
	@UI({ tab: 'General', row: true })
	clinic!: string

	@Prop({ required: true, unique: true })
	@Validators(IsString(), Length(5, 50), IsNotEmpty())
	@UI({ tab: 'General' })
	licenseNumber!: string

	@Prop({ required: false })
	@Validators(IsString(), IsOptional())
	@UI({
		tab: 'General',
		type: 'select',
		options: [
			{ key: 'general', value: 'General Practice' },
			{ key: 'surgery', value: 'Surgery' },
			{ key: 'dentistry', value: 'Dentistry' },
			{ key: 'dermatology', value: 'Dermatology' },
			{ key: 'cardiology', value: 'Cardiology' },
		],
	})
	specialization?: string

	// Many-to-Many relation with Cat
	// This is handled via arrays of ObjectIds in both schemas
	// The Cat schema will have veterinarians array, and we can query both ways
}
