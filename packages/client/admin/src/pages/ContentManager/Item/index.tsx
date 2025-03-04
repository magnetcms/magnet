import { Outlet } from 'react-router-dom'
import { useContentManager } from '~/hooks/useContentManager'

export const ContentManagerItem = () => {
	const schema = useContentManager()

	if (!schema) {
		return null
	}

	return (
		<>
			<Outlet context={schema} />
		</>
	)
}

export default ContentManagerItem
