import { SchemaMetadata } from '@magnet-cms/common'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ContentHeader } from '~/components/ContentHeader'
import { ErrorState } from '~/components/ErrorState'
import { FormBuilder } from '~/components/FormBuilder'
import { LoadingState } from '~/components/LoadingState'
import type { LocaleOption } from '~/components/LocaleSwitcher'
import type { ContentData, LocaleStatus } from '~/core/adapters/types'
import { useAdapter } from '~/core/provider/MagnetProvider'
import { useAutoSave } from '~/hooks/useAutoSave'
import { useContentManager } from '~/hooks/useContentManager'

const ContentManagerViewerEdit = () => {
	const { id: documentId, schema: schemaName } = useParams()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const adapter = useAdapter()

	// State for locale
	const [currentLocale, setCurrentLocale] = useState('en')

	// Get schema metadata and name information - use safe defaults
	const contentManager = useContentManager()
	const name = contentManager?.name
	const schemaMetadata = contentManager?.schemaMetadata
	const schemaOptions =
		schemaMetadata && 'options' in schemaMetadata
			? schemaMetadata.options
			: undefined
	const hasI18n = schemaOptions?.i18n !== false
	const hasVersioning = schemaOptions?.versioning !== false

	// Fetch available locales from settings - only enabled if we have valid schema and i18n
	const { data: localesConfig } = useQuery({
		queryKey: ['settings', 'locales'],
		queryFn: () => adapter.settings.getLocales(),
		enabled: hasI18n && !!schemaMetadata,
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
			adapter.content.getLocaleStatuses(name?.key || '', documentId as string),
		enabled: !!documentId && hasI18n && !!name?.key,
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

	// Fetch item - only enabled if we have valid schema and documentId
	const {
		data: item,
		isLoading: isLoadingItem,
		error: itemError,
	} = useQuery({
		queryKey: [
			'content',
			schemaName,
			documentId,
			hasI18n ? currentLocale : undefined,
			hasVersioning ? effectiveStatus : undefined,
		],
		queryFn: () =>
			adapter.content.get<ContentData>(name?.key || '', documentId as string, {
				...(hasI18n && { locale: currentLocale }),
				...(hasVersioning && { status: effectiveStatus }),
			}),
		enabled: !!documentId && !!name?.key,
	})

	// Auto-save hook - must be defined before early returns
	const autoSave = useAutoSave({
		documentId: documentId as string,
		schema: name?.key || '',
		locale: hasI18n ? currentLocale : undefined,
		enabled: !!documentId && !!name?.key,
		onSuccess: () => {
			// Invalidate locale statuses to update the status badge
			if (schemaName && documentId) {
				queryClient.invalidateQueries({
					queryKey: ['content', schemaName, documentId, 'locales'],
				})
			}
		},
	})

	// Publish mutation (only used if versioning is enabled) - must be defined before early returns
	const publishMutation = useMutation({
		mutationFn: () =>
			adapter.content.publish(name?.key || '', documentId as string, {
				...(hasI18n && { locale: currentLocale }),
			}),
		onSuccess: () => {
			if (name) {
				toast.success('Content published', {
					description: `${name.title} (${currentLocale}) was published successfully`,
				})
			}
			// Invalidate both the item query and the list query
			if (schemaName && documentId) {
				queryClient.invalidateQueries({
					queryKey: ['content', schemaName, documentId],
				})
			}
			if (name?.key) {
				queryClient.invalidateQueries({
					queryKey: ['content', 'list', name.key],
				})
			}
		},
		onError: (error) => {
			toast.error(`Failed to publish: ${error.message}`)
		},
	})

	// Unpublish mutation - must be defined before early returns
	const unpublishMutation = useMutation({
		mutationFn: () =>
			adapter.content.unpublish(
				name?.key || '',
				documentId as string,
				currentLocale,
			),
		onSuccess: () => {
			if (name) {
				toast.success('Content unpublished', {
					description: `${name.title} (${currentLocale}) was unpublished`,
				})
			}
			// Invalidate both the item query and the list query
			if (schemaName && documentId) {
				queryClient.invalidateQueries({
					queryKey: ['content', schemaName, documentId],
				})
			}
			if (name?.key) {
				queryClient.invalidateQueries({
					queryKey: ['content', 'list', name.key],
				})
			}
		},
		onError: (error) => {
			toast.error(`Failed to unpublish: ${error.message}`)
		},
	})

	// Add locale mutation - must be defined before early returns
	const addLocaleMutation = useMutation({
		mutationFn: ({
			locale,
			initialData,
		}: { locale: string; initialData: ContentData }) =>
			adapter.content.addLocale(
				name?.key || '',
				documentId as string,
				locale,
				initialData,
			),
		onSuccess: (_, { locale }) => {
			toast.success('Locale added', {
				description: `${locale} translation was created`,
			})
			if (schemaName && documentId) {
				queryClient.invalidateQueries({
					queryKey: ['content', schemaName, documentId],
				})
			}
			setCurrentLocale(locale)
		},
		onError: (error) => {
			toast.error(`Failed to add locale: ${error.message}`)
		},
	})

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

	// Handle form value changes - trigger auto-save
	// Use useCallback to prevent recreating the function on every render
	const handleFormChange = useCallback(
		(data: ContentData) => {
			autoSave.save(data)
		},
		[autoSave],
	)

	// Now safe to do early returns after all hooks are called
	if (!contentManager) return <LoadingState />

	// Loading state
	if (isLoadingItem) {
		return <LoadingState message={`Loading ${name?.title || 'content'}...`} />
	}

	// Error state
	if (itemError) {
		return (
			<ErrorState
				title={`Error loading ${name?.title || 'content'}`}
				message={itemError.message || 'Failed to fetch data. Please try again.'}
				onRetry={() => {
					if (schemaName && documentId) {
						queryClient.invalidateQueries({
							queryKey: [
								'content',
								schemaName,
								documentId,
								hasI18n ? currentLocale : undefined,
								hasVersioning ? effectiveStatus : undefined,
							],
						})
					}
				}}
			/>
		)
	}

	const isMutating = publishMutation.isPending || unpublishMutation.isPending

	// Base path for tab navigation
	const basePath = `/content-manager/${name.key}/${documentId}`

	// Tabs for navigation
	const tabs = [
		{ label: 'Edit', to: '' },
		{ label: 'Versions', to: 'versions' },
		{ label: 'API', to: 'api' },
	]

	// More menu items (unpublish and other actions)
	const moreMenuItems = []
	if (hasVersioning) {
		// Only show unpublish in more menu if content is published
		// Publish is shown as primary button outside the menu
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
				title={name.title}
				status={displayStatus}
				lastEdited={
					typeof currentItem?.updatedAt === 'string' ||
					currentItem?.updatedAt instanceof Date
						? currentItem.updatedAt
						: undefined
				}
				tabs={tabs}
				onDiscard={() => navigate(`/content-manager/${name.key}`)}
				onPublish={hasVersioning ? () => publishMutation.mutate() : undefined}
				isPublishing={publishMutation.isPending}
				autoSaveStatus={{
					isSaving: autoSave.isSaving,
					lastSaved: autoSave.lastSaved,
					error: autoSave.error,
				}}
				localeProps={
					hasI18n
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
			{hasVersioning &&
				!currentLocaleStatus?.hasDraft &&
				currentLocaleStatus?.hasPublished && (
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
					initialValues={currentItem}
					onChange={handleFormChange}
					metadata={{
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
					}}
				/>
			</div>
		</div>
	)
}

export default ContentManagerViewerEdit
