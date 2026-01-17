import { Prop, Schema, UI, Validators } from '@magnet-cms/common'
import { Type } from 'class-transformer'
import {
	IsBoolean,
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Length,
	Max,
	Min,
} from 'class-validator'
import { SchemaTypes } from 'mongoose'

@Schema()
export class Cat {
	@Prop({ unique: true, required: true })
	@Validators(IsString(), Length(10, 20), IsNotEmpty())
	@UI({ tab: 'General', row: true })
	tagID: string

	@Prop({ required: true, intl: true })
	@Validators(IsString(), Length(2, 255), IsNotEmpty())
	@UI({ tab: 'General', row: true, description: 'Cat name' })
	name: string

	@Type(() => Date)
	@Prop({ required: true })
	@Validators(IsDate(), IsNotEmpty())
	@UI({ tab: 'General', type: 'date', row: true })
	birthdate: Date

	@Prop({ required: true, intl: true })
	@Validators(IsString(), Length(2, 50), IsNotEmpty())
	@UI({ tab: 'General', description: 'Breed of the cat' })
	breed: string

	@Prop({ required: false, intl: true })
	@Validators(IsString(), IsOptional())
	@UI({ tab: 'General', description: 'Additional description' })
	description?: string

	@Prop({ required: true })
	@Validators(IsNumber(), Min(0.5), Max(15), IsNotEmpty())
	@UI({ tab: 'General', type: 'number', description: 'Weight in kg' })
	weight: number

	// Many-to-One relation with Owner
	@Prop({
		type: SchemaTypes.ObjectId,
		ref: 'Owner',
		required: true,
	})
	@Validators(IsNotEmpty())
	@UI({ tab: 'Relations', type: 'relationship', description: 'Cat owner' })
	owner!: string

	// Many-to-Many relation with Veterinarian
	@Prop({
		type: [SchemaTypes.ObjectId],
		ref: 'Veterinarian',
		required: false,
		default: [],
	})
	@Validators(IsOptional())
	@UI({
		tab: 'Relations',
		type: 'relationship',
		description: 'Veterinarians treating this cat',
	})
	veterinarians?: string[]

	// One-to-One relation with Media (main photo)
	@Prop({
		type: SchemaTypes.ObjectId,
		ref: 'Media',
		required: false,
	})
	@Validators(IsOptional())
	@UI({ tab: 'Media', type: 'upload', description: 'Main photo' })
	photo?: string

	// One-to-Many relation with Media (gallery)
	@Prop({
		type: [SchemaTypes.ObjectId],
		ref: 'Media',
		required: false,
		default: [],
	})
	@Validators(IsOptional())
	@UI({ tab: 'Media', type: 'upload', description: 'Additional photos' })
	photos?: string[]

	// Note: medicalRecords is a virtual relation (One-to-Many from MedicalRecord.cat)
	// Accessed via reverse populate in queries

	@Prop({ required: true })
	@Validators(IsBoolean())
	@UI({
		tab: 'General',
		type: 'switch',
		description: 'Is the cat castrated?',
	})
	castrated: boolean
}
