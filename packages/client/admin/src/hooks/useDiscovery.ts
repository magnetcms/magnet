import { ControllerMetadata, SchemaMetadata } from '@magnet/common'
import { useQuery } from '@tanstack/react-query'
import { fetcher } from '~/lib/api'

export const CONTROLLERS_KEY = ['discovery', 'controllers']
export const SCHEMAS_KEY = ['discovery', 'schemas']
export const SETTINGS_KEY = ['discovery', 'settings']

export const useControllers = () => {
	return useQuery<string[], Error>({
		queryKey: CONTROLLERS_KEY,
		queryFn: () => fetcher<string[]>('/discovery/controllers'),
	})
}

export const useSchemas = () => {
	return useQuery<string[], Error>({
		queryKey: SCHEMAS_KEY,
		queryFn: () => fetcher<string[]>('/discovery/schemas'),
	})
}

export const useSettings = () => {
	return useQuery<string[], Error>({
		queryKey: SETTINGS_KEY,
		queryFn: () => fetcher<string[]>('/discovery/settings'),
	})
}

export const useSchema = (name: string) => {
	return useQuery<SchemaMetadata | { error: string }, Error>({
		queryKey: [...SCHEMAS_KEY, name],
		queryFn: () =>
			fetcher<SchemaMetadata | { error: string }>(`/discovery/schemas/${name}`),
	})
}

export const useSetting = (name: string) => {
	return useQuery<SchemaMetadata | { error: string }, Error>({
		queryKey: [...SETTINGS_KEY, name],
		queryFn: () =>
			fetcher<SchemaMetadata | { error: string }>(
				`/discovery/settings/${name}`,
			),
	})
}

export const useController = (name: string) => {
	return useQuery<ControllerMetadata | { error: string }, Error>({
		queryKey: [...CONTROLLERS_KEY, name],
		queryFn: () =>
			fetcher<ControllerMetadata | { error: string }>(
				`/discovery/controllers/${name}`,
			),
	})
}
