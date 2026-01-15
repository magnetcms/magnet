import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Spinner,
} from '@magnet/ui/components'
import { names } from '@magnet/utils'
import {
	Boxes,
	Code2,
	Database,
	Globe,
	History,
	PenLine,
	Plus,
	Settings2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '~/contexts/useAdmin'

const Playground = () => {
	const navigate = useNavigate()
	const { schemas, isLoading, error } = useAdmin()

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Spinner />
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-4 border-l-4 border-red-500 bg-red-50 text-red-700 rounded">
				<h3 className="font-medium">Error loading schemas</h3>
				<p className="text-sm">{error.message}</p>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						Schema Playground
					</h2>
					<p className="text-muted-foreground">
						Create and edit content schemas visually, then deploy them to code
					</p>
				</div>
				<Button onClick={() => navigate('/playground/new')}>
					<Plus className="mr-2 h-4 w-4" />
					Create Schema
				</Button>
			</div>

			{/* Info Banner */}
			<div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
				<Code2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
				<div className="text-sm text-blue-900">
					<p className="font-medium mb-1">Visual Schema Builder</p>
					<p className="text-blue-700">
						Design your content schemas using a drag-and-drop interface. When
						you deploy, TypeScript code files with decorators will be generated
						in your project.
					</p>
				</div>
			</div>

			{/* Schema Grid */}
			{!schemas || schemas.length === 0 ? (
				<div className="text-center p-12 border rounded-lg text-muted-foreground">
					<Database className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
					<h3 className="text-lg font-medium mb-2">No schemas found</h3>
					<p className="mb-6 max-w-md mx-auto">
						You haven't defined any content schemas yet. Create your first
						schema to get started.
					</p>
					<Button onClick={() => navigate('/playground/new')}>
						<Plus className="mr-2 h-4 w-4" />
						Create Your First Schema
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{schemas.map((schema) => {
						const name = names(schema)
						return (
							<Card
								key={schema}
								className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
								onClick={() => navigate(`/playground/${name.key}`)}
							>
								<CardHeader className="bg-muted/50">
									<CardTitle className="flex items-center">
										<Boxes className="mr-2 h-5 w-5" />
										{name.title}
									</CardTitle>
									<CardDescription className="font-mono text-xs">
										api::{name.key}.{name.key}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-6">
									<div className="grid grid-cols-3 gap-2 text-center text-sm">
										<div className="flex flex-col items-center p-2 rounded-md hover:bg-muted">
											<PenLine className="h-6 w-6 mb-1 text-blue-500" />
											<span className="text-xs">Edit</span>
										</div>
										<div className="flex flex-col items-center p-2 rounded-md hover:bg-muted">
											<History className="h-6 w-6 mb-1 text-amber-500" />
											<span className="text-xs">Versions</span>
										</div>
										<div className="flex flex-col items-center p-2 rounded-md hover:bg-muted">
											<Globe className="h-6 w-6 mb-1 text-green-500" />
											<span className="text-xs">API</span>
										</div>
									</div>
								</CardContent>
								<CardFooter className="bg-muted/30 flex justify-between">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Settings2 className="h-3.5 w-3.5" />
										<span>i18n, versioning</span>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation()
											navigate(`/playground/${name.key}`)
										}}
									>
										Edit Schema
									</Button>
								</CardFooter>
							</Card>
						)
					})}

					{/* Create New Card */}
					<Card
						className="overflow-hidden border-dashed hover:border-solid hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] text-muted-foreground hover:text-foreground"
						onClick={() => navigate('/playground/new')}
					>
						<Plus className="h-10 w-10 mb-2 opacity-50" />
						<span className="font-medium">Create New Schema</span>
					</Card>
				</div>
			)}
		</div>
	)
}

export default Playground
