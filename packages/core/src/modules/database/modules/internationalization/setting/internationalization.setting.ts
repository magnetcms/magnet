import { Prop, Setting, UI } from '@magnet/common'

export const locales = [
	{ key: 'English', value: 'en' },
	{ key: 'Spanish', value: 'es' },
	{ key: 'Portuguese', value: 'pt' },
]

export const timezones = [
	{ key: 'UTC', value: 'utc' },
	{ key: 'Local', value: 'local' },
]

@Setting()
export class Internationalization {
	@Prop({ required: true, default: 'utc' })
	@UI({ type: 'select', options: timezones })
	timezone!: string

	@Prop({ required: true, default: ['en'] })
	@UI({ type: 'select', options: locales, multi: true })
	locales!: string[]
}
