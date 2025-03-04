import { SchemaMetadata } from '@magnet/common'
import { FormBuilder } from '~/components/FormBuilder'
import { useContentManager } from '~/hooks/useContentManager'

const ContentManagerViewerEdit = () => {
	const schema = useContentManager()

	if (!schema) {
		return null
	}

	const onSubmit = (data: Record<string, unknown>) => {
		console.log(data)
	}

	return (
		<FormBuilder
			schema={schema.schemaMetadata as SchemaMetadata}
			onSubmit={onSubmit}
		/>
	)
}

export default ContentManagerViewerEdit
