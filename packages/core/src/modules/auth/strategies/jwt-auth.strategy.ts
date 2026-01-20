import type {
	AuthConfig,
	AuthResult,
	AuthStrategy,
	AuthUser,
	LoginCredentials,
	RegisterData,
} from '@magnet-cms/common'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { UserService } from '~/modules/user'

/**
 * JWT-based authentication strategy.
 * This is the default strategy that maintains backward compatibility.
 *
 * Extends PassportStrategy for integration with NestJS guards,
 * and implements AuthStrategy for the extensible auth system.
 */
export class JwtAuthStrategy
	extends PassportStrategy(Strategy, 'jwt')
	implements AuthStrategy
{
	readonly name = 'jwt'
	private readonly secret: string
	private readonly expiresIn: string

	constructor(
		config: AuthConfig,
		private readonly userService: UserService,
	) {
		const secret = config.jwt?.secret || ''
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret,
		})

		this.secret = secret
		this.expiresIn = config.jwt?.expiresIn || '7d'
	}

	/**
	 * Passport validate method - called by JwtAuthGuard after JWT is verified.
	 * Also satisfies the AuthStrategy.validate() interface.
	 */
	async validate(
		payload:
			| { sub: string; email: string; role?: string; roles?: string[] }
			| unknown,
	): Promise<AuthUser | null> {
		// Handle JWT payload format
		if (
			payload &&
			typeof payload === 'object' &&
			'sub' in payload &&
			'email' in payload
		) {
			const jwtPayload = payload as {
				sub: string
				email: string
				role?: string
				roles?: string[]
			}
			const role = jwtPayload.role || 'viewer'
			return {
				id: jwtPayload.sub,
				email: jwtPayload.email,
				role,
				roles: jwtPayload.roles || [role],
			}
		}
		return null
	}

	/**
	 * Validate user credentials against the database
	 */
	async validateCredentials(
		email: string,
		password: string,
	): Promise<AuthUser | null> {
		const user = await this.userService.findOne({ email })
		if (!user) return null

		const isPasswordValid = await compare(password, user.password)
		if (!isPasswordValid) return null

		const role = user.role || 'viewer'
		const userData = user as { roles?: string[] }
		return {
			id:
				(user as { id?: string; _id?: { toString(): string } }).id ||
				(
					user as { id?: string; _id?: { toString(): string } }
				)._id?.toString() ||
				'',
			email: user.email,
			role,
			roles: userData.roles || [role],
		}
	}

	/**
	 * Authenticate and return JWT token
	 */
	async login(credentials: LoginCredentials): Promise<AuthResult> {
		const user = await this.validateCredentials(
			credentials.email,
			credentials.password,
		)
		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const payload = {
			sub: user.id,
			email: user.email,
			role: user.role,
			roles: user.roles,
		}
		const token = sign(payload, this.secret, { expiresIn: this.expiresIn })

		return {
			access_token: token,
			token_type: 'Bearer',
		}
	}

	/**
	 * Register a new user and return the user object
	 */
	async register(data: RegisterData): Promise<AuthUser> {
		const existingUser = await this.userService.findOne({ email: data.email })
		if (existingUser) {
			throw new ConflictException('Email already in use')
		}

		const hashedPassword = await hash(data.password, 10)
		const newUser = await this.userService.create({
			email: data.email,
			password: hashedPassword,
			name: data.name,
			role: data.role || 'viewer',
		})

		const role = newUser.role || 'viewer'
		const newUserData = newUser as { roles?: string[] }
		return {
			id:
				(newUser as { id?: string; _id?: { toString(): string } }).id ||
				(
					newUser as { id?: string; _id?: { toString(): string } }
				)._id?.toString() ||
				'',
			email: newUser.email,
			role,
			roles: newUserData.roles || [role],
		}
	}

	getPassportStrategyName(): string {
		return 'jwt'
	}
}
