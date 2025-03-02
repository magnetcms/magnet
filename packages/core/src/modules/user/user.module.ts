import { Module } from '@nestjs/common'
import { DatabaseModule } from '~/modules/database'
import { User } from './schemas/user.schema'
import { UserService } from './user.service'

@Module({
	imports: [DatabaseModule.forFeature(User)],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
