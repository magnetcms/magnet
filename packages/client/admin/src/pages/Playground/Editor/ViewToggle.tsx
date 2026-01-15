import { cn } from '@magnet/ui/lib'
import { Code2, FileJson, PencilRuler } from 'lucide-react'
import type { ViewMode } from '../types/builder.types'

interface ViewToggleProps {
	value: ViewMode
	onChange: (value: ViewMode) => void
}

const views: { id: ViewMode; label: string; icon: typeof PencilRuler }[] = [
	{ id: 'builder', label: 'Builder', icon: PencilRuler },
	{ id: 'json', label: 'JSON', icon: FileJson },
	{ id: 'code', label: 'Code', icon: Code2 },
]

export function ViewToggle({ value, onChange }: ViewToggleProps) {
	return (
		<div className="flex bg-muted p-0.5 rounded-lg select-none">
			{views.map((view) => {
				const Icon = view.icon
				return (
					<button
						key={view.id}
						type="button"
						onClick={() => onChange(view.id)}
						className={cn(
							'px-3 py-1 text-xs font-medium rounded-[5px] transition-all flex items-center gap-2',
							value === view.id
								? 'text-foreground bg-background shadow-sm ring-1 ring-black/5'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						<Icon className="h-3 w-3" />
						{view.label}
					</button>
				)
			})}
		</div>
	)
}
