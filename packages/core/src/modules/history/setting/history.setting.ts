import { Field, Setting } from '@magnet-cms/common'

@Setting()
export class Versioning {
	@Field.Number({ required: true, default: 10, tab: 'Versioning' })
	maxVersions!: number

	@Field.Select({
		required: true,
		default: 'true',
		tab: 'Versioning',
		options: [
			{ label: 'Enabled', value: 'true' },
			{ label: 'Disabled', value: 'false' },
		],
	})
	draftsEnabled!: string

	@Field.Select({
		required: true,
		default: 'false',
		tab: 'Versioning',
		options: [
			{ label: 'Required', value: 'true' },
			{ label: 'Not Required', value: 'false' },
		],
	})
	requireApproval!: string

	@Field.Select({
		required: true,
		default: 'false',
		tab: 'Versioning',
		options: [
			{ label: 'Enabled', value: 'true' },
			{ label: 'Disabled', value: 'false' },
		],
	})
	autoPublish!: string
}
