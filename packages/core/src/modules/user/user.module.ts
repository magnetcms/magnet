import { DynamicModule, Module, Type } from '@nestjs/common'
import { DatabaseModule } from '~/modules/database'
import { User } from './schemas/user.schema'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	imports: [DatabaseModule.forFeature(User)],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {
	static forFeature(customSchema?: Type): DynamicModule {
		const schema = customSchema || User
		return {
			module: UserModule,
			imports: [DatabaseModule.forFeature(schema)],
			controllers: [UserController],
			providers: [UserService],
			exports: [UserService],
		}
	}
}
