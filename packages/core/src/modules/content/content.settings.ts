import { SettingField, Settings } from '@magnet-cms/common'

/**
 * Content settings schema.
 *
 * These settings control content editing, publishing, and versioning behavior.
 *
 * @example
 * ```typescript
 * // In a service
 * const contentConfig = await settingsService.get(ContentSettings)
 * if (contentConfig.requireApproval) {
 *   await createApprovalRequest(document)
 * }
 * ```
 */
@Settings({
	group: 'content',
	label: 'Content Settings',
	icon: 'file-text',
	order: 15,
	description: 'Configure content editing, publishing, and versioning behavior',
})
export class ContentSettings {
	@SettingField.Select({
		label: 'Default Status',
		description: 'Initial status for new content',
		options: [
			{ label: 'Draft', value: 'draft' },
			{ label: 'Published', value: 'published' },
		],
		default: 'draft',
	})
	defaultStatus = 'draft'

	@SettingField.Boolean({
		label: 'Enable Auto-save',
		description: 'Automatically save content while editing',
		default: true,
	})
	autoSave = true

	@SettingField.Number({
		label: 'Auto-save Interval (seconds)',
		description: 'How often to auto-save content',
		default: 30,
	})
	autoSaveInterval = 30

	@SettingField.Boolean({
		label: 'Require Publish Approval',
		description: 'Require approval before content can be published',
		default: false,
	})
	requireApproval = false

	@SettingField.Number({
		label: 'Max Revisions to Keep',
		description: 'Maximum number of content revisions to store',
		default: 20,
	})
	maxRevisions = 20

	@SettingField.Boolean({
		label: 'Enable Versioning',
		description: 'Track content changes with version history',
		default: true,
	})
	enableVersioning = true

	@SettingField.Boolean({
		label: 'Enable i18n',
		description: 'Enable internationalization for content',
		default: true,
	})
	enableI18n = true

	@SettingField.Text({
		label: 'Default Locale',
		description: 'Default language for content',
		default: 'en',
	})
	defaultLocale = 'en'

	@SettingField.Boolean({
		label: 'Require All Locales',
		description: 'Require content to be translated to all enabled locales',
		default: false,
	})
	requireAllLocales = false

	@SettingField.Boolean({
		label: 'Enable Scheduling',
		description: 'Allow content to be scheduled for future publishing',
		default: true,
	})
	enableScheduling = true

	@SettingField.Boolean({
		label: 'Enable Soft Delete',
		description: 'Move deleted content to trash instead of permanent deletion',
		default: true,
	})
	enableSoftDelete = true

	@SettingField.Number({
		label: 'Trash Retention (days)',
		description: 'How long to keep deleted content in trash',
		default: 30,
	})
	trashRetentionDays = 30
}
