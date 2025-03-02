import { MagnetModuleOptions } from '@magnet/common'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { DatabaseModule } from '~/modules/database'
import { UserModule } from '~/modules/user'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
	imports: [
		DatabaseModule,
		UserModule,
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			useFactory: (options: MagnetModuleOptions) => ({
				secret: options.jwt.secret,
				signOptions: { expiresIn: '7d' },
			}),
			inject: [MagnetModuleOptions],
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
