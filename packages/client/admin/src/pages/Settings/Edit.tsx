import { type SchemaMetadata } from '@magnet/common'
import { Button } from '@magnet/ui/components'
import { names } from '@magnet/utils'
import { useParams } from 'react-router-dom'
import { FormBuilder } from '~/components/FormBuilder'
import { Head } from '~/components/Head'
import { useSetting } from '~/hooks/useDiscovery'

const SettingsEdit = () => {
	const { group } = useParams()

	const name = names(group as string)

	const { data: schema } = useSetting(name.key)

	if (!schema) return <div>Loading...</div>

	return (
		<>
			<Head title={name.title} actions={<Button>Save</Button>} />
			<FormBuilder schema={schema as SchemaMetadata} onSubmit={() => {}} />
		</>
	)
}

export default SettingsEdit
