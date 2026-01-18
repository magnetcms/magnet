import { Resolve } from '@magnet-cms/common'
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common'
import { MedicalRecordsService } from './medical-records.service'
import { MedicalRecord } from './schemas/medical-record.schema'

@Controller('medical-records')
export class MedicalRecordsController {
	constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

	@Post('')
	@Resolve(() => MedicalRecord)
	create(@Body() createMedicalRecordDto: Partial<MedicalRecord>) {
		return this.medicalRecordsService.create(createMedicalRecordDto)
	}

	@Get()
	@Resolve(() => [MedicalRecord])
	findAll(
		@Query('catId') catId?: string,
		@Query('veterinarianId') veterinarianId?: string,
		@Query('type') type?: string,
	): Promise<MedicalRecord[]> {
		if (catId) {
			return this.medicalRecordsService.findByCat(catId)
		}
		if (veterinarianId) {
			return this.medicalRecordsService.findByVeterinarian(veterinarianId)
		}
		if (type) {
			return this.medicalRecordsService.findByType(type)
		}
		return this.medicalRecordsService.findAll()
	}

	@Get(':id')
	@Resolve(() => MedicalRecord)
	findOne(@Param('id') id: string): Promise<MedicalRecord> {
		return this.medicalRecordsService.findOne(id)
	}

	@Put(':id')
	@Resolve(() => Boolean)
	update(
		@Param('id') id: string,
		@Body() updateMedicalRecordDto: Partial<MedicalRecord>,
	) {
		return this.medicalRecordsService.update(id, updateMedicalRecordDto)
	}

	@Delete(':id')
	@Resolve(() => Boolean)
	remove(@Param('id') id: string) {
		return this.medicalRecordsService.remove(id)
	}
}
