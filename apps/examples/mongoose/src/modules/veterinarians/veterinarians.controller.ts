import { Resolve } from '@magnet-cms/common'
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { Veterinarian } from './schemas/veterinarian.schema'
import { VeterinariansService } from './veterinarians.service'

@Controller('veterinarians')
export class VeterinariansController {
	constructor(private readonly veterinariansService: VeterinariansService) {}

	@Post('')
	@Resolve(() => Veterinarian)
	create(@Body() createVeterinarianDto: Partial<Veterinarian>) {
		return this.veterinariansService.create(createVeterinarianDto)
	}

	@Get()
	@Resolve(() => [Veterinarian])
	findAll(): Promise<Veterinarian[]> {
		return this.veterinariansService.findAll()
	}

	@Get(':id')
	@Resolve(() => Veterinarian)
	findOne(@Param('id') id: string): Promise<Veterinarian> {
		return this.veterinariansService.findOne(id)
	}

	@Put(':id')
	@Resolve(() => Boolean)
	update(
		@Param('id') id: string,
		@Body() updateVeterinarianDto: Partial<Veterinarian>,
	) {
		return this.veterinariansService.update(id, updateVeterinarianDto)
	}

	@Delete(':id')
	@Resolve(() => Boolean)
	remove(@Param('id') id: string) {
		return this.veterinariansService.remove(id)
	}
}
