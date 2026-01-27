import { SettingField, Settings } from '@magnet-cms/common'

/**
 * Authentication settings schema.
 *
 * These settings control authentication behavior and password policies.
 *
 * @example
 * ```typescript
 * // In a service
 * const authConfig = await settingsService.get(AuthSettings)
 * if (password.length < authConfig.minPasswordLength) {
 *   throw new Error('Password too short')
 * }
 * ```
 */
@Settings({
	group: 'auth',
	label: 'Authentication',
	icon: 'shield',
	order: 5,
	description: 'Configure authentication behavior and password policies',
})
export class AuthSettings {
	@SettingField.Number({
		label: 'Session Duration (hours)',
		description: 'How long user sessions remain valid',
		default: 24,
	})
	sessionDuration = 24

	@SettingField.Number({
		label: 'Refresh Token Duration (days)',
		description: 'How long refresh tokens remain valid',
		default: 7,
	})
	refreshTokenDuration = 7

	@SettingField.Number({
		label: 'Minimum Password Length',
		description: 'Minimum number of characters required for passwords',
		default: 8,
	})
	minPasswordLength = 8

	@SettingField.Boolean({
		label: 'Require Uppercase',
		description: 'Require at least one uppercase letter in passwords',
		default: true,
	})
	requireUppercase = true

	@SettingField.Boolean({
		label: 'Require Number',
		description: 'Require at least one number in passwords',
		default: true,
	})
	requireNumber = true

	@SettingField.Boolean({
		label: 'Require Special Character',
		description: 'Require at least one special character in passwords',
		default: false,
	})
	requireSpecialChar = false

	@SettingField.Number({
		label: 'Max Login Attempts',
		description: 'Maximum failed login attempts before account lockout',
		default: 5,
	})
	maxLoginAttempts = 5

	@SettingField.Number({
		label: 'Lockout Duration (minutes)',
		description: 'How long accounts are locked after too many failed attempts',
		default: 15,
	})
	lockoutDuration = 15

	@SettingField.Boolean({
		label: 'Allow Registration',
		description: 'Allow new users to register themselves',
		default: false,
	})
	allowRegistration = false

	@SettingField.Boolean({
		label: 'Require Email Verification',
		description: 'Require users to verify their email address',
		default: false,
	})
	requireEmailVerification = false
}
