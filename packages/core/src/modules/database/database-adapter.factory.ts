import { DatabaseAdapter, detectDatabaseAdapter } from '@magnet/common'

export class DatabaseAdapterFactory {
	private static cachedAdapter: DatabaseAdapter

	static getAdapter(): DatabaseAdapter {
		if (DatabaseAdapterFactory.cachedAdapter)
			return DatabaseAdapterFactory.cachedAdapter

		const adapterName = detectDatabaseAdapter()

		try {
			DatabaseAdapterFactory.cachedAdapter = require(
				`@magnet/adapter-${adapterName}`,
			).Adapter
		} catch (error) {
			throw new Error(`Adapter ${adapterName} not found`)
		}

		return DatabaseAdapterFactory.cachedAdapter
	}
}
