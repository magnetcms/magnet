import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
} from '@magnet-cms/ui/components'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
	title?: string
	message: string
	onRetry?: () => void
	retryLabel?: string
}

export const ErrorState = ({
	title = 'Something went wrong',
	message,
	onRetry,
	retryLabel = 'Try again',
}: ErrorStateProps) => {
	return (
		<div className="flex items-center justify-center min-h-[400px] p-6">
			<Alert variant="destructive" className="max-w-md">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>{title}</AlertTitle>
				<AlertDescription className="mt-2">{message}</AlertDescription>
				{onRetry && (
					<div className="mt-4">
						<Button
							variant="outline"
							size="sm"
							onClick={onRetry}
							className="w-full"
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							{retryLabel}
						</Button>
					</div>
				)}
			</Alert>
		</div>
	)
}
