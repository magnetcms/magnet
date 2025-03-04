import { useQuery } from '@tanstack/react-query'
import { fetcher } from '~/lib/api'

export const useSetting = <T extends Record<string, unknown>>(
	group: string,
) => {
	return useQuery<T[], Error>({
		queryKey: ['settings', group],
		queryFn: () => fetcher<T[]>(`/settings/${group}`),
	})
}
