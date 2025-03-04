import {
	ControllerMetadata,
	MethodMetadata,
	SchemaMetadata,
} from '@magnet/common'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ControllerDiscoveryService } from './services/controller-discovery.service'
import { MethodDiscoveryService } from './services/method-discovery.service'
import { SchemaDiscoveryService } from './services/schema-discovery.service'

const EXCLUDED_SCHEMAS = ['setting', 'history']

@Injectable()
export class DiscoveryService implements OnModuleInit {
	private controllers: ControllerMetadata[] = []
	private schemas: SchemaMetadata[] = []
	private settingsSchemas: SchemaMetadata[] = []

	constructor(
		private readonly controllerDiscovery: ControllerDiscoveryService,
		private readonly schemaDiscovery: SchemaDiscoveryService,
		private readonly methodDiscovery: MethodDiscoveryService,
	) {}

	onModuleInit() {
		const { schemas, settings } = this.schemaDiscovery.discoverSchemas()
		this.controllers = this.controllerDiscovery.discoverControllers()
		this.schemas = schemas
		this.settingsSchemas = settings
	}

	getDiscoveredSchemas(): string[] {
		return this.schemas
			.filter((schema) => !EXCLUDED_SCHEMAS.includes(schema.name.toLowerCase()))
			.map((schema) => schema.name)
	}

	getDiscoveredSchema(name: string): SchemaMetadata | { error: string } {
		return (
			this.schemas.find((schema) => schema.name === name) || {
				error: 'Schema not found',
			}
		)
	}

	getDiscoveredSettingsSchemas(): string[] {
		return this.settingsSchemas.map((schema) => schema.name)
	}

	getDiscoveredSettingsSchemaNames(): string[] {
		return this.settingsSchemas.map((schema) => schema.name)
	}

	getDiscoveredSettingsSchema(
		name: string,
	): SchemaMetadata | { error: string } {
		return (
			this.settingsSchemas.find((schema) => schema.name === name) || {
				error: 'Schema not found',
			}
		)
	}

	getDiscoveredControllers(): string[] {
		return this.controllers.map((controller) => controller.name)
	}

	getDiscoveredController(
		name: string,
	): ControllerMetadata | { error: string } {
		return (
			this.controllers.find((controller) => controller.name === name) || {
				error: 'Controller not found',
			}
		)
	}

	getMethodDetails(
		path: string,
		methodName: string,
	): MethodMetadata | { error: string } {
		return this.methodDiscovery.getMethodDetails(
			path,
			methodName,
			this.controllers,
		)
	}
}
