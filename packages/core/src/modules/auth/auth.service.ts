import type { AuthStrategy } from '@magnet-cms/common'
import { DefaultRoleNames, MagnetModuleOptions } from '@magnet-cms/common'
import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common'
import { compare, hash } from 'bcryptjs'
import { RbacService } from '~/modules/rbac/rbac.service'
import { UserService } from '~/modules/user'
import { AUTH_STRATEGY } from './auth.constants'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RegisterDTO } from './dto/register.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name)

	constructor(
		private userService: UserService,
		@Inject(AUTH_STRATEGY) private readonly authStrategy: AuthStrategy,
		@Inject(MagnetModuleOptions) private readonly options: MagnetModuleOptions,
		private readonly rbacService: RbacService,
	) {}

	/**
	 * Register a new user via the configured auth strategy
	 *
	 * If this is the first user in the system, they are automatically
	 * assigned the SUPER_ADMIN role with full permissions.
	 */
	async register(registerDto: RegisterDTO) {
		// Check if this is the first user
		const isFirstUser = !(await this.exists())

		// Determine role for first user
		const role = isFirstUser ? 'admin' : registerDto.role

		// Register the user
		const user = await this.authStrategy.register({
			email: registerDto.email,
			password: registerDto.password,
			name: registerDto.name,
			role,
		})

		// If first user, assign SUPER_ADMIN role from RBAC system
		if (isFirstUser) {
			try {
				const superAdminRole = await this.rbacService.findRoleByName(
					DefaultRoleNames.SUPER_ADMIN,
				)
				if (superAdminRole) {
					await this.userService.update(user.id, {
						roles: [superAdminRole.id],
					})
					user.roles = [superAdminRole.id]
					this.logger.log(`First user ${user.email} assigned SUPER_ADMIN role`)
				} else {
					this.logger.warn(
						'SUPER_ADMIN role not found - first user created without RBAC roles',
					)
				}
			} catch (error) {
				this.logger.error(
					'Failed to assign SUPER_ADMIN role to first user',
					error instanceof Error ? error.stack : String(error),
				)
			}
		}

		return user
	}

	/**
	 * Validate user credentials via the configured auth strategy
	 */
	async validateUser(email: string, pass: string) {
		return this.authStrategy.validateCredentials(email, pass)
	}

	/**
	 * Login with credentials and return tokens via the configured auth strategy
	 *
	 * Also handles migration of legacy admin users to SUPER_ADMIN RBAC role.
	 */
	async login(credentials: { email: string; password: string }) {
		// Check if user needs RBAC role migration before logging in
		const user = await this.userService.findOne({ email: credentials.email })
		if (user) {
			const userData = user as { role?: string; roles?: string[] }

			// Migrate legacy admin users who don't have RBAC roles assigned
			if (
				userData.role === 'admin' &&
				(!userData.roles || userData.roles.length === 0)
			) {
				try {
					const superAdminRole = await this.rbacService.findRoleByName(
						DefaultRoleNames.SUPER_ADMIN,
					)
					if (superAdminRole) {
						const userId =
							(user as { id?: string; _id?: { toString(): string } }).id ||
							(
								user as { id?: string; _id?: { toString(): string } }
							)._id?.toString()
						if (userId) {
							await this.userService.update(userId, {
								roles: [superAdminRole.id],
							})
							this.logger.log(
								`Migrated legacy admin user ${user.email} to SUPER_ADMIN role`,
							)
						}
					}
				} catch (error) {
					this.logger.error(
						'Failed to migrate legacy admin user to SUPER_ADMIN role',
						error instanceof Error ? error.stack : String(error),
					)
				}
			}
		}

		return this.authStrategy.login(credentials)
	}

	/**
	 * Check if any users exist in the system
	 */
	async exists() {
		// If strategy implements hasUsers(), delegate to it
		const strategy = this.authStrategy as AuthStrategy & {
			hasUsers?: () => Promise<boolean>
		}
		if (strategy.hasUsers) {
			try {
				return await strategy.hasUsers()
			} catch (error) {
				// If hasUsers() fails, fall back to database query
				console.warn(
					'Failed to check users from auth strategy, falling back to database:',
					error,
				)
			}
		}

		// Fall back to checking local database
		const users = await this.userService.findAll()
		return users.length > 0
	}

	/**
	 * Get user by ID
	 */
	async getUserById(id: string) {
		const user = await this.userService.findOneById(id)
		if (!user) throw new NotFoundException('User not found')

		return {
			id: (user as any).id || (user as any)._id?.toString(),
			email: user.email,
			name: user.name,
			role: user.role,
		}
	}

	/**
	 * Update user profile
	 */
	async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
		const user = await this.userService.findOneById(userId)
		if (!user) throw new NotFoundException('User not found')

		if (updateProfileDto.email && updateProfileDto.email !== user.email) {
			const existingUser = await this.userService.findOne({
				email: updateProfileDto.email,
			})
			if (existingUser) throw new ConflictException('Email already in use')
		}

		await this.userService.update(userId, updateProfileDto)
		return this.getUserById(userId)
	}

	/**
	 * Change user password
	 */
	async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
		const user = await this.userService.findOneById(userId)
		if (!user) throw new NotFoundException('User not found')

		const isPasswordValid = await compare(
			changePasswordDto.currentPassword,
			user.password,
		)
		if (!isPasswordValid) {
			throw new BadRequestException('Current password is incorrect')
		}

		const hashedPassword = await hash(changePasswordDto.newPassword, 10)
		await this.userService.update(userId, { password: hashedPassword })

		return { message: 'Password changed successfully' }
	}

	/**
	 * Get the current auth strategy name
	 */
	getStrategyName(): string {
		return this.authStrategy.name
	}
}
