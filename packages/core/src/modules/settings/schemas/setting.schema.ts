import { Mixed, Prop, Schema, type SettingValue } from '@magnet-cms/common'

@Schema({ versioning: false, i18n: false })
export class Setting {
	@Prop({ required: true, unique: true })
	key!: string

	@Prop({ type: Mixed, required: true })
	value!: SettingValue

	@Prop({ required: true })
	group!: string

	@Prop({ required: true })
	type!: string
}
