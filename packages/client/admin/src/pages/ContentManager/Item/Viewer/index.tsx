import { Outlet } from 'react-router-dom'
import { useContentManager } from '~/hooks/useContentManager'

const ContentManagerViewer = () => {
	const schema = useContentManager()

	if (!schema) {
		return null
	}

	return <Outlet context={schema} />
}

export default ContentManagerViewer
