import { useQuery } from '@tanstack/react-query'
import { useAdapter } from '~/core/provider/MagnetProvider'

/**
 * Hook to fetch settings data by group
 * Note: This is different from useSetting in useDiscovery.ts which fetches schema metadata
 */
export const useSettingData = <T extends Record<string, unknown>>(
	group: string,
) => {
	const adapter = useAdapter()

	return useQuery<T[], Error>({
		queryKey: ['settings', group],
		queryFn: () => adapter.settings.getByGroup<T>(group),
		enabled: !!group,
	})
}
