import { SchemaMetadata } from '@magnet/common'
import { Spinner } from '@magnet/ui/components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ContentHeader } from '~/components/ContentHeader'
import { FormBuilder } from '~/components/FormBuilder'
import type { LocaleOption } from '~/components/LocaleSwitcher'
import type { ContentData, LocaleStatus } from '~/core/adapters/types'
import { useAdapter } from '~/core/provider/MagnetProvider'
import { useContentManager } from '~/hooks/useContentManager'

const ContentManagerViewerEdit = () => {
	const { id: documentId, schema: schemaName } = useParams()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const adapter = useAdapter()
	const isCreating = !documentId || documentId === 'create'

	// State for locale
	const [currentLocale, setCurrentLocale] = useState('en')

	// Get schema metadata and name information
	const contentManager = useContentManager()
	if (!contentManager) return <Spinner />

	const { name, schemaMetadata } = contentManager
	const schemaOptions =
		'options' in schemaMetadata ? schemaMetadata.options : undefined
	const hasI18n = schemaOptions?.i18n !== false
	const hasVersioning = schemaOptions?.versioning !== false

	// Fetch available locales from settings
	const { data: localesConfig } = useQuery({
		queryKey: ['settings', 'locales'],
		queryFn: () => adapter.settings.getLocales(),
		enabled: hasI18n,
	})

	// Convert configured locales to LocaleOption format
	const availableLocales: LocaleOption[] = useMemo(() => {
		if (!localesConfig) return [{ code: 'en', name: 'English' }]
		return localesConfig.configured.map((code) => {
			const locale = localesConfig.available.find((l) => l.value === code)
			return { code, name: locale?.key ?? code }
		})
	}, [localesConfig])

	// Fetch locale statuses for the document (only if i18n is enabled)
	const { data: localeStatuses } = useQuery({
		queryKey: ['content', schemaName, documentId, 'locales'],
		queryFn: () =>
			adapter.content.getLocaleStatuses(name.key, documentId as string),
		enabled: !isCreating && !!documentId && hasI18n,
	})

	// Get current locale status
	const currentLocaleStatus = localeStatuses?.[currentLocale] as
		| LocaleStatus
		| undefined

	// Determine which status to fetch from the API
	// Priority: draft if exists, otherwise published
	const effectiveStatus = (() => {
		if (!hasVersioning) return undefined
		// If draft exists, fetch draft; otherwise fetch published as base
		if (currentLocaleStatus?.hasDraft) {
			return 'draft'
		}
		if (currentLocaleStatus?.hasPublished) {
			return 'published'
		}
		return 'draft' // Default for new documents
	})()

	// Fetch item if editing
	const { data: item, isLoading: isLoadingItem } = useQuery({
		queryKey: [
			'content',
			schemaName,
			documentId,
			hasI18n ? currentLocale : undefined,
			hasVersioning ? effectiveStatus : undefined,
		],
		queryFn: () =>
			adapter.content.get<ContentData>(name.key, documentId as string, {
				...(hasI18n && { locale: currentLocale }),
				...(hasVersioning && { status: effectiveStatus }),
			}),
		enabled: !isCreating && !!documentId,
	})

	// Create mutation
	const createMutation = useMutation({
		mutationFn: (data: ContentData) =>
			adapter.content.create<
				ContentData & { documentId?: string; id?: string }
			>(name.key, data, {
				...(hasI18n && { locale: currentLocale }),
			}),
		onSuccess: (data) => {
			toast.success('Content created', {
				description: `${name.title} was created successfully`,
			})
			queryClient.invalidateQueries({ queryKey: ['content', schemaName] })
			// Use documentId if available (i18n/versioning enabled), otherwise use id
			const itemId = data.documentId || data.id
			navigate(`/content-manager/${name.key}/${itemId}`)
		},
		onError: (error) => {
			toast.error(`Failed to create ${name.title}: ${error.message}`)
		},
	})

	// Update mutation - always saves to draft
	const updateMutation = useMutation({
		mutationFn: (data: ContentData) =>
			adapter.content.update(name.key, documentId as string, data, {
				...(hasI18n && { locale: currentLocale }),
				...(hasVersioning && { status: 'draft' }),
			}),
		onSuccess: () => {
			toast.success('Content updated', {
				description: `${name.title} was updated successfully`,
			})
			queryClient.invalidateQueries({
				queryKey: ['content', schemaName, documentId],
			})
		},
		onError: (error) => {
			toast.error(`Failed to update ${name.title}: ${error.message}`)
		},
	})

	// Publish mutation (only used if versioning is enabled)
	const publishMutation = useMutation({
		mutationFn: () =>
			adapter.content.publish(name.key, documentId as string, {
				...(hasI18n && { locale: currentLocale }),
			}),
		onSuccess: () => {
			toast.success('Content published', {
				description: `${name.title} (${currentLocale}) was published successfully`,
			})
			queryClient.invalidateQueries({
				queryKey: ['content', schemaName, documentId],
			})
		},
		onError: (error) => {
			toast.error(`Failed to publish: ${error.message}`)
		},
	})

	// Unpublish mutation
	const unpublishMutation = useMutation({
		mutationFn: () =>
			adapter.content.unpublish(name.key, documentId as string, currentLocale),
		onSuccess: () => {
			toast.success('Content unpublished', {
				description: `${name.title} (${currentLocale}) was unpublished`,
			})
			queryClient.invalidateQueries({
				queryKey: ['content', schemaName, documentId],
			})
		},
		onError: (error) => {
			toast.error(`Failed to unpublish: ${error.message}`)
		},
	})

	// Add locale mutation
	const addLocaleMutation = useMutation({
		mutationFn: ({
			locale,
			initialData,
		}: { locale: string; initialData: ContentData }) =>
			adapter.content.addLocale(
				name.key,
				documentId as string,
				locale,
				initialData,
			),
		onSuccess: (_, { locale }) => {
			toast.success('Locale added', {
				description: `${locale} translation was created`,
			})
			queryClient.invalidateQueries({
				queryKey: ['content', schemaName, documentId],
			})
			setCurrentLocale(locale)
		},
		onError: (error) => {
			toast.error(`Failed to add locale: ${error.message}`)
		},
	})

	// Handler for form submission
	const handleSubmit = (data: ContentData) => {
		if (isCreating) {
			createMutation.mutate(data)
		} else {
			updateMutation.mutate(data)
		}
	}

	// Handle locale change
	const handleLocaleChange = (locale: string) => {
		setCurrentLocale(locale)
	}

	// Handle add locale - copy current item's data as initial content
	const handleAddLocale = (locale: string) => {
		const currentItem = Array.isArray(item) ? item[0] : item
		// Strip system fields, keep only user data
		const {
			id,
			_id,
			documentId: _docId,
			locale: _locale,
			status,
			createdAt,
			updatedAt,
			publishedAt,
			createdBy,
			updatedBy,
			__v,
			...userData
		} = currentItem || {}
		addLocaleMutation.mutate({ locale, initialData: userData as ContentData })
	}

	// Trigger form submission
	const handleSave = () => {
		const form = document.querySelector('form')
		if (form) {
			form.dispatchEvent(
				new Event('submit', { cancelable: true, bubbles: true }),
			)
		}
	}

	// Loading state
	if (!isCreating && isLoadingItem) {
		return <Spinner />
	}

	const isMutating =
		createMutation.isPending ||
		updateMutation.isPending ||
		publishMutation.isPending ||
		unpublishMutation.isPending

	// Base path for tab navigation
	const basePath = `/content-manager/${name.key}/${documentId}`

	// Tabs for navigation
	const tabs = isCreating
		? undefined
		: [
				{ label: 'Edit', to: '' },
				{ label: 'Versions', to: 'versions' },
				{ label: 'API', to: 'api' },
			]

	// More menu items (publish/unpublish actions)
	const moreMenuItems = []
	if (!isCreating && hasVersioning) {
		// Always show publish option (edits create/update draft, which can be published)
		moreMenuItems.push({
			label: 'Publish',
			onClick: () => publishMutation.mutate(),
		})
		if (currentLocaleStatus?.hasPublished) {
			moreMenuItems.push({
				label: 'Unpublish',
				onClick: () => unpublishMutation.mutate(),
				variant: 'destructive' as const,
			})
		}
	}

	// Get current item data
	const currentItem = Array.isArray(item) ? item[0] : item

	// Determine display status based on what's being viewed
	const displayStatus = hasVersioning ? effectiveStatus : undefined

	return (
		<div className="flex flex-col w-full min-h-0">
			<ContentHeader
				basePath={basePath}
				title={isCreating ? `Create ${name.title}` : name.title}
				status={displayStatus}
				lastEdited={
					typeof currentItem?.updatedAt === 'string' ||
					currentItem?.updatedAt instanceof Date
						? currentItem.updatedAt
						: undefined
				}
				tabs={tabs}
				onDiscard={() => navigate(`/content-manager/${name.key}`)}
				onSave={handleSave}
				isSaving={isMutating}
				saveLabel={isCreating ? 'Create' : 'Save changes'}
				localeProps={
					hasI18n && !isCreating
						? {
								currentLocale,
								locales: availableLocales,
								localeStatuses,
								onLocaleChange: handleLocaleChange,
								onAddLocale: handleAddLocale,
								disabled: isMutating || addLocaleMutation.isPending,
							}
						: undefined
				}
				moreMenuItems={moreMenuItems.length > 0 ? moreMenuItems : undefined}
			/>

			{/* Info bar when editing published content (will create draft on save) */}
			{!isCreating && hasVersioning && !currentLocaleStatus?.hasDraft && currentLocaleStatus?.hasPublished && (
				<div className="px-6 py-2 border-b border-border bg-amber-50 dark:bg-amber-950/30 flex items-center gap-2">
					<span className="text-xs text-amber-700 dark:text-amber-400">
						Editing published content. Changes will be saved as a new draft.
					</span>
				</div>
			)}

			{/* Content form */}
			<div className="flex-1 overflow-y-auto p-6">
				<FormBuilder
					schema={schemaMetadata as SchemaMetadata}
					onSubmit={handleSubmit}
					initialValues={currentItem}
					metadata={
						!isCreating
							? {
									createdAt:
										typeof currentItem?.createdAt === 'string' ||
										currentItem?.createdAt instanceof Date
											? currentItem.createdAt
											: undefined,
									updatedAt:
										typeof currentItem?.updatedAt === 'string' ||
										currentItem?.updatedAt instanceof Date
											? currentItem.updatedAt
											: undefined,
									publishedAt:
										typeof currentItem?.publishedAt === 'string' ||
										currentItem?.publishedAt instanceof Date
											? currentItem.publishedAt
											: undefined,
								}
							: undefined
					}
				/>
			</div>
		</div>
	)
}

export default ContentManagerViewerEdit
