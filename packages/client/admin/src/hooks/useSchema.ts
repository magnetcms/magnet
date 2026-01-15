import { useQuery } from '@tanstack/react-query'
import { useAdapter } from '~/core/provider/MagnetProvider'

/**
 * Hook to fetch content items for a schema
 * Note: This fetches actual content data, not schema metadata
 */
export const useContentList = <T extends Record<string, unknown>>(
	schema: string,
) => {
	const adapter = useAdapter()

	return useQuery<T[], Error>({
		queryKey: ['content', schema],
		queryFn: () => adapter.content.list<T>(schema),
		enabled: !!schema,
	})
}
