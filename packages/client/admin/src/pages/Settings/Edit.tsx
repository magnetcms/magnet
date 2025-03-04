import { Button } from '@magnet/ui/components'
import { names } from '@magnet/utils'
import { useParams } from 'react-router-dom'
import { Head } from '~/components/Head'

const SettingsEdit = () => {
	const { group } = useParams()

	const name = names(String(group))

	return (
		<>
			<Head title={name.title} actions={<Button>Save</Button>} />
		</>
	)
}

export default SettingsEdit
