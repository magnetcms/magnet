import type { ControllerMetadata, SchemaMetadata } from '@magnet/common'
import { useQuery } from '@tanstack/react-query'
import { useAdapter } from '~/core/provider/MagnetProvider'

export const CONTROLLERS_KEY = ['discovery', 'controllers']
export const SCHEMAS_KEY = ['discovery', 'schemas']
export const SETTINGS_KEY = ['discovery', 'settings']

export const useControllers = () => {
	const adapter = useAdapter()

	return useQuery<string[], Error>({
		queryKey: CONTROLLERS_KEY,
		queryFn: () => adapter.discovery.getControllers(),
	})
}

export const useSchemas = () => {
	const adapter = useAdapter()

	return useQuery<string[], Error>({
		queryKey: SCHEMAS_KEY,
		queryFn: () => adapter.discovery.getSchemas(),
	})
}

export const useSettings = () => {
	const adapter = useAdapter()

	return useQuery<string[], Error>({
		queryKey: SETTINGS_KEY,
		queryFn: () => adapter.discovery.getSettings(),
	})
}

export const useSchema = (name: string) => {
	const adapter = useAdapter()

	return useQuery<SchemaMetadata | { error: string }, Error>({
		queryKey: [...SCHEMAS_KEY, name],
		queryFn: () => adapter.discovery.getSchema(name),
		enabled: !!name,
	})
}

export const useSetting = (name: string) => {
	const adapter = useAdapter()

	return useQuery<SchemaMetadata | { error: string }, Error>({
		queryKey: [...SETTINGS_KEY, name],
		queryFn: () => adapter.discovery.getSetting(name),
		enabled: !!name,
	})
}

export const useController = (name: string) => {
	const adapter = useAdapter()

	return useQuery<ControllerMetadata | { error: string }, Error>({
		queryKey: [...CONTROLLERS_KEY, name],
		queryFn: () => adapter.discovery.getController(name),
		enabled: !!name,
	})
}
