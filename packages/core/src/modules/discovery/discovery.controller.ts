import { MethodMetadata } from '@magnet/common'
import { Controller, Get, Param } from '@nestjs/common'
import { DiscoveryService } from './discovery.service'

@Controller('discovery')
export class DiscoveryController {
	constructor(private readonly discoveryService: DiscoveryService) {}

	@Get('controllers')
	getControllers() {
		return this.discoveryService.getDiscoveredControllers()
	}

	@Get('schemas')
	getSchemas() {
		return this.discoveryService.getDiscoveredSchemas()
	}

	@Get('settings')
	getSettingsSchemas() {
		return this.discoveryService.getDiscoveredSettingsSchemas()
	}

	@Get('method/:path/:methodName')
	getMethodDetails(
		@Param('path') path: string,
		@Param('methodName') methodName: string,
	): MethodMetadata | { error: string } {
		return this.discoveryService.getMethodDetails(path, methodName)
	}
}
