import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'

import { RegisterDTO } from './dto/register.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

interface AuthenticatedUser {
	id: string
	email: string
	role: string
}

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('register')
	async register(@Body() registerDto: RegisterDTO) {
		const user = await this.authService.register(registerDto)
		return this.authService.login(user)
	}

	@Post('login')
	async login(@Body() body: { email: string; password: string }) {
		const user = await this.authService.validateUser(body.email, body.password)
		if (!user) throw new BadRequestException('Invalid credentials')

		return this.authService.login(user as AuthenticatedUser)
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	me(@Request() req: { user: AuthenticatedUser }) {
		return req.user
	}

	@Get('status')
	async status(@Request() req: any) {
		if (req.user) {
			return { authenticated: true, user: req.user }
		}

		const existingUser = await this.authService.exists()

		return {
			authenticated: false,
			requiresSetup: !existingUser,
			message: existingUser
				? 'Authentication required.'
				: 'No users found. Initial setup required.',
		}
	}
}
