import { MagnetModuleOptions } from '@magnet/common'
import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { UserService } from '~/modules/user'
import { RegisterDTO } from './dto/register.dto'

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		@Inject(MagnetModuleOptions) private readonly options: MagnetModuleOptions,
	) {}

	async register(registerDto: RegisterDTO) {
		const existingUser = await this.userService.findOne({
			email: registerDto.email,
		})

		if (existingUser) throw new ConflictException('Email already in use')

		const hashedPassword = await hash(registerDto.password, 10)
		const newUser = await this.userService.create({
			...registerDto,
			password: hashedPassword,
		})

		return newUser
	}

	async validateUser(email: string, pass: string) {
		const user = await this.userService.findOne({ email })
		if (!user) return null

		const isPasswordValid = await compare(pass, user.password)
		if (!isPasswordValid) return null

		return user
	}

	async login(user: { id: string; email: string; role: string }) {
		const payload = { sub: user.id, email: user.email, role: user.role }
		return {
			access_token: this.jwtService.sign(payload, {
				secret: this.options.jwt.secret,
			}),
		}
	}

	async exists() {
		const users = await this.userService.findAll()
		return users.length > 0
	}
}
