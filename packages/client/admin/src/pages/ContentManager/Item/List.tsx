import { Button, DataTable } from '@magnet/ui/components'
import { useNavigate } from 'react-router-dom'
import { Head } from '~/components/Head'
import { useContentManager } from '~/hooks/useContentManager'
import { useSchema } from '~/hooks/useSchema'

const ContentManagerList = () => {
	const navigate = useNavigate()
	const schema = useContentManager()

	if (!schema) {
		return null
	}

	const { data: items } = useSchema(schema.name.key)

	if (!items) {
		return null
	}

	return (
		<>
			<Head
				title={schema.name.title}
				actions={
					<Button
						onClick={() =>
							navigate(`/content-manager/${schema.name.key}/create`)
						}
					>
						Create
					</Button>
				}
			/>

			<DataTable data={items} />
		</>
	)
}

export default ContentManagerList
