import { SchemaProperty, UISelect, UITypes } from '@magnet/common'
import {
	RHFCheckbox,
	RHFDatePicker,
	RHFRadioGroup,
	RHFSelect,
	RHFSwitch,
	RHFText,
	RHFTextarea,
} from '@magnet/ui/components'
import { capitalize } from '@magnet/utils'
import { ReactElement } from 'react'

export const fieldRenderer: Record<
	UITypes,
	(prop: SchemaProperty) => ReactElement
> = {
	array: (_prop) => <div>array</div>,
	blocks: (_prop) => <div>blocks</div>,
	checkbox: (prop) => (
		<RHFCheckbox
			key={prop.name}
			name={prop.name}
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
		/>
	),
	code: (_prop) => <div>code</div>,
	date: (prop) => (
		<RHFDatePicker
			key={prop.name}
			name={prop.name}
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
		/>
	),
	email: (prop) => (
		<RHFText
			key={prop.name}
			name={prop.name}
			type="email"
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
		/>
	),
	group: (_prop) => <div>group</div>,
	json: (_prop) => <div>json</div>,
	number: (prop) => (
		<RHFText
			key={prop.name}
			name={prop.name}
			type="number"
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
		/>
	),
	point: (_prop) => <div>point</div>,
	radio: (prop) => (
		<RHFRadioGroup
			key={prop.name}
			name={prop.name}
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
			options={(prop.ui as UISelect).options.map((option) => ({
				value: option.value,
				label: option.key,
			}))}
		/>
	),
	relationship: (_prop) => <div>relationship</div>,
	richText: (_prop) => <div>richText</div>,
	text: (prop) => (
		<RHFText
			key={prop.name}
			name={prop.name}
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
		/>
	),
	textarea: (prop) => (
		<RHFTextarea
			key={prop.name}
			name={prop.name}
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
		/>
	),
	select: (prop) => (
		<RHFSelect
			key={prop.name}
			name={prop.name}
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
			multiple={(prop.ui as UISelect).multi}
			options={(prop.ui as UISelect).options.map((option) => ({
				value: option.value,
				label: option.key,
			}))}
		/>
	),
	switch: (prop) => (
		<RHFSwitch
			key={prop.name}
			name={prop.name}
			label={capitalize(prop.ui?.label || prop.name)}
			description={prop.ui?.description}
		/>
	),
	upload: (_prop) => <div>upload</div>,
}
