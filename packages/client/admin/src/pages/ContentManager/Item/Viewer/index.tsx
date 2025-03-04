import { Outlet } from 'react-router-dom'
import { Head } from '~/components/Head'
import { useContentManager } from '~/hooks/useContentManager'

const actions = [
	{
		label: 'Edit',
		to: '',
		default: true,
	},
	// {
	// 	label: 'Live Preview',
	// 	to: 'live-preview',
	// },
	{
		label: 'Versions',
		to: 'versions',
	},
	{
		label: 'API',
		to: 'api',
	},
]

const ContentManagerViewer = () => {
	const schema = useContentManager()

	if (!schema) {
		return null
	}

	return (
		<>
			<Head
				title={schema.name.title}
				actions={{
					grouped: true,
					items: actions,
				}}
			/>
			<Outlet context={schema} />
		</>
	)
}

export default ContentManagerViewer
