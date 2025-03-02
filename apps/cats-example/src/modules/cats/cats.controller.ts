import { Resolve } from '@magnet/common'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CatsService } from './cats.service'
import { CreateCatDto } from './dto/create-cat.dto'
import { Cat } from './schemas/cat.schema'

@Controller('cats')
export class CatsController {
	constructor(private readonly catsService: CatsService) {}

	@Post('')
	@Resolve(() => Cat)
	create(@Body() createCatDto: CreateCatDto) {
		return this.catsService.create(createCatDto)
	}

	@Get()
	@Resolve(() => [Cat])
	findAll(@Query('sort') sort: boolean): Promise<Cat[]> {
		console.log(sort)
		return this.catsService.findAll()
	}

	@Get(':id')
	@Resolve(() => Cat)
	findOne(@Param('id') id: string): Promise<Cat> {
		return this.catsService.findOne(id)
	}

	@Post(':id')
	@Resolve(() => Boolean)
	update(@Param('id') id: string, @Body() updateCatDto: CreateCatDto) {
		return this.catsService.update(id, updateCatDto)
	}

	@Post(':id/delete')
	@Resolve(() => Boolean)
	remove(@Param('id') id: string) {
		return this.catsService.remove(id)
	}
}
