import { useQuery } from '@tanstack/react-query'
import { fetcher } from '~/lib/api'

export const useSchema = <T extends Record<string, unknown>>(
	schema: string,
) => {
	return useQuery<T[], Error>({
		queryKey: ['schemas', schema],
		queryFn: () => fetcher<T[]>(`/${schema}s`),
	})
}
