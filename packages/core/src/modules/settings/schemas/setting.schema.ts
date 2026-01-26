import {
	Field,
	Mixed,
	Prop,
	Schema,
	type SettingValue,
} from '@magnet-cms/common'

@Schema({ versioning: false, i18n: false })
export class Setting {
	@Field.Text({ required: true, unique: true })
	key!: string

	// Mixed type for arbitrary values - keep as @Prop
	@Prop({ type: Mixed, required: true })
	value!: SettingValue

	@Field.Text({ required: true })
	group!: string

	@Field.Text({ required: true })
	type!: string
}
