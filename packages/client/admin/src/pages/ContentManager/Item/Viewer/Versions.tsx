import { Button, Spinner } from '@magnet/ui/components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ContentHeader } from '~/components/ContentHeader'
import { useAdapter } from '~/core/provider/MagnetProvider'
import { useContentManager } from '~/hooks/useContentManager'

interface Version {
	versionId: string
	status: 'draft' | 'published' | 'archived'
	createdAt: string
	createdBy?: string
	notes?: string
	data: Record<string, unknown>
}

interface HistoryAdapter {
	getVersions: (id: string, collection: string) => Promise<Version[]>
	getVersion: (versionId: string) => Promise<Version>
	publishVersion: (versionId: string) => Promise<void>
	archiveVersion: (versionId: string) => Promise<void>
	deleteVersion: (versionId: string) => Promise<void>
}

const ContentManagerViewerVersions = () => {
	const { id, schema: schemaName } = useParams()
	const queryClient = useQueryClient()
	const adapter = useAdapter()
	const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

	const contentManager = useContentManager()
	if (!contentManager) return <Spinner />

	const { name } = contentManager

	// Base path for tab navigation
	const basePath = `/content-manager/${name.key}/${id}`

	// Tabs for navigation
	const tabs = [
		{ label: 'Edit', to: '' },
		{ label: 'Versions', to: 'versions' },
		{ label: 'API', to: 'api' },
	]

	// Get history adapter
	const historyAdapter = (adapter as unknown as { history: HistoryAdapter })
		.history

	// Fetch all versions for the current document
	const { data: versions, isLoading: isLoadingVersions } = useQuery({
		queryKey: ['versions', schemaName, id],
		queryFn: () => historyAdapter.getVersions(id as string, name.key),
		enabled: !!id,
	})

	// Fetch details of the selected version
	const { data: versionDetails, isLoading: isLoadingDetails } = useQuery({
		queryKey: ['version', selectedVersion],
		queryFn: () => historyAdapter.getVersion(selectedVersion as string),
		enabled: !!selectedVersion,
	})

	// Restore version mutation (publish)
	const restoreMutation = useMutation({
		mutationFn: (versionId: string) => {
			return historyAdapter.publishVersion(versionId)
		},
		onSuccess: () => {
			toast.success('Version restored', {
				description: 'The selected version has been published',
			})
			queryClient.invalidateQueries({ queryKey: ['versions', schemaName, id] })
		},
		onError: (error) => {
			toast.error(`Failed to restore version: ${error.message}`)
		},
	})

	// Publish draft mutation
	const publishMutation = useMutation({
		mutationFn: (versionId: string) => {
			return historyAdapter.publishVersion(versionId)
		},
		onSuccess: () => {
			toast.success('Version published', {
				description: 'The draft has been published successfully',
			})
			queryClient.invalidateQueries({ queryKey: ['versions', schemaName, id] })
		},
		onError: (error) => {
			toast.error(`Failed to publish draft: ${error.message}`)
		},
	})

	// Archive version mutation
	const archiveMutation = useMutation({
		mutationFn: (versionId: string) => {
			return historyAdapter.archiveVersion(versionId)
		},
		onSuccess: () => {
			toast.success('Version archived', {
				description: 'The version has been archived successfully',
			})
			queryClient.invalidateQueries({ queryKey: ['versions', schemaName, id] })
		},
		onError: (error) => {
			toast.error(`Failed to archive version: ${error.message}`)
		},
	})

	// Delete version mutation
	const deleteMutation = useMutation({
		mutationFn: (versionId: string) => {
			return historyAdapter.deleteVersion(versionId)
		},
		onSuccess: () => {
			toast.success('Version deleted', {
				description: 'The version has been deleted successfully',
			})
			queryClient.invalidateQueries({ queryKey: ['versions', schemaName, id] })
			setSelectedVersion(null)
		},
		onError: (error) => {
			toast.error(`Failed to delete version: ${error.message}`)
		},
	})

	if (isLoadingVersions) return <Spinner />

	if (!versions)
		return <div>No versions found for this {name.title.toLowerCase()}</div>

	// Sort versions by date (newest first)
	const sortedVersions = [...versions].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	)

	// Group versions by status
	const publishedVersions = sortedVersions.filter(
		(v) => v.status === 'published',
	)
	const draftVersions = sortedVersions.filter((v) => v.status === 'draft')
	const archivedVersions = sortedVersions.filter((v) => v.status === 'archived')

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleString()
	}

	return (
		<div className="flex flex-col w-full min-h-0">
			<ContentHeader basePath={basePath} title={name.title} tabs={tabs} />

			<div className="flex-1 overflow-y-auto p-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Version list section */}
					<div className="md:col-span-1 border rounded-md overflow-hidden">
						<div className="bg-muted p-3 font-medium">Version History</div>
						<div className="p-2 flex flex-col divide-y">
							{draftVersions.length > 0 && (
								<div className="pb-2">
									<h3 className="font-semibold text-sm mb-2 text-muted-foreground">
										Drafts
									</h3>
									{draftVersions.map((version) => (
										<button
											key={version.versionId}
											type="button"
											className={`p-2 cursor-pointer rounded-md w-full text-left ${selectedVersion === version.versionId ? 'bg-accent' : 'hover:bg-muted'}`}
											onClick={() => setSelectedVersion(version.versionId)}
										>
											<div className="text-sm font-medium">
												Draft - {formatDate(version.createdAt)}
											</div>
											{version.createdBy && (
												<div className="text-xs text-muted-foreground">
													By: {version.createdBy}
												</div>
											)}
										</button>
									))}
								</div>
							)}

							{publishedVersions.length > 0 && (
								<div className="py-2">
									<h3 className="font-semibold text-sm mb-2 text-muted-foreground">
										Published
									</h3>
									{publishedVersions.map((version) => (
										<button
											key={version.versionId}
											type="button"
											className={`p-2 cursor-pointer rounded-md w-full text-left ${selectedVersion === version.versionId ? 'bg-accent' : 'hover:bg-muted'}`}
											onClick={() => setSelectedVersion(version.versionId)}
										>
											<div className="text-sm font-medium">
												Published - {formatDate(version.createdAt)}
											</div>
											{version.createdBy && (
												<div className="text-xs text-muted-foreground">
													By: {version.createdBy}
												</div>
											)}
										</button>
									))}
								</div>
							)}

							{archivedVersions.length > 0 && (
								<div className="pt-2">
									<h3 className="font-semibold text-sm mb-2 text-muted-foreground">
										Archived
									</h3>
									{archivedVersions.map((version) => (
										<button
											key={version.versionId}
											type="button"
											className={`p-2 cursor-pointer rounded-md w-full text-left ${selectedVersion === version.versionId ? 'bg-accent' : 'hover:bg-muted'}`}
											onClick={() => setSelectedVersion(version.versionId)}
										>
											<div className="text-sm font-medium">
												Archived - {formatDate(version.createdAt)}
											</div>
											{version.createdBy && (
												<div className="text-xs text-muted-foreground">
													By: {version.createdBy}
												</div>
											)}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Version details section */}
					<div className="md:col-span-2 border rounded-md">
						{selectedVersion ? (
							isLoadingDetails ? (
								<div className="flex justify-center items-center h-64">
									<Spinner />
								</div>
							) : versionDetails ? (
								<div className="p-4">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h2 className="text-lg font-semibold">
												{versionDetails.status.charAt(0).toUpperCase() +
													versionDetails.status.slice(1)}{' '}
												Version
											</h2>
											<p className="text-sm text-muted-foreground">
												Created: {formatDate(versionDetails.createdAt)}
												{versionDetails.createdBy &&
													` by ${versionDetails.createdBy}`}
											</p>
											{versionDetails.notes && (
												<p className="text-sm mt-2 p-2 bg-muted rounded-md">
													{versionDetails.notes}
												</p>
											)}
										</div>

										<div className="flex gap-2">
											{versionDetails.status === 'draft' && (
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														publishMutation.mutate(versionDetails.versionId)
													}
													disabled={publishMutation.isPending}
												>
													{publishMutation.isPending
														? 'Publishing...'
														: 'Publish'}
												</Button>
											)}

											{versionDetails.status === 'published' && (
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														archiveMutation.mutate(versionDetails.versionId)
													}
													disabled={archiveMutation.isPending}
												>
													{archiveMutation.isPending
														? 'Archiving...'
														: 'Archive'}
												</Button>
											)}

											{versionDetails.status !== 'published' && (
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														restoreMutation.mutate(versionDetails.versionId)
													}
													disabled={restoreMutation.isPending}
												>
													{restoreMutation.isPending
														? 'Restoring...'
														: 'Restore'}
												</Button>
											)}

											<Button
												size="sm"
												variant="destructive"
												onClick={() =>
													deleteMutation.mutate(versionDetails.versionId)
												}
												disabled={deleteMutation.isPending}
											>
												{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
											</Button>
										</div>
									</div>

									{/* Content preview */}
									<div className="border rounded-md p-4 bg-muted/50">
										<h3 className="text-sm font-medium mb-2">
											Content Preview
										</h3>
										<pre className="text-xs overflow-auto p-2 bg-background rounded-md max-h-[500px]">
											{JSON.stringify(versionDetails.data, null, 2)}
										</pre>
									</div>
								</div>
							) : (
								<div className="p-4 text-center text-muted-foreground">
									Failed to load version details.
								</div>
							)
						) : (
							<div className="p-4 text-center text-muted-foreground h-64 flex items-center justify-center">
								Select a version to view details
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ContentManagerViewerVersions
