export type UIPresentationFields = 'tab' | 'collapsible' | 'row' | 'customUI'

export type UITypes =
	| 'array'
	| 'blocks'
	| 'checkbox'
	| 'code'
	| 'date'
	| 'email'
	| 'group'
	| 'json'
	| 'number'
	| 'point'
	| 'radio'
	| 'relationship'
	| 'richText'
	| 'select'
	| 'switch'
	| 'text'
	| 'textarea'
	| 'upload'

export type UIBase = {
	label?: string
	description?: string
	type?: UITypes
	row?: boolean
	collapsible?: boolean
}

export type UISelectItem = {
	key: string
	value: string
}

export type UITab = UIBase & {
	tab: string
	side?: never
	options?: UISelectItem[]
}

export type UISide = UIBase & {
	side: true
	tab?: never
	options?: UISelectItem[]
}

export type UISelect = UIBase & {
	type: 'select'
	multi?: boolean
	options: UISelectItem[]
}

export type UIDecoratorOptions = UITab | UISide | UISelect
