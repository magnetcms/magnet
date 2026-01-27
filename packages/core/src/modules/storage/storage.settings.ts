import { SettingField, Settings } from '@magnet-cms/common'

/**
 * Media & Storage settings schema.
 *
 * These settings control file uploads, storage, and image processing.
 *
 * @example
 * ```typescript
 * // In a service
 * const mediaConfig = await settingsService.get(MediaSettings)
 * if (file.size > mediaConfig.maxFileSize * 1024 * 1024) {
 *   throw new Error('File too large')
 * }
 * ```
 */
@Settings({
	group: 'media',
	label: 'Media & Storage',
	icon: 'image',
	order: 20,
	description:
		'Configure file uploads, storage providers, and image processing',
})
export class MediaSettings {
	@SettingField.Number({
		label: 'Max File Size (MB)',
		description: 'Maximum file size allowed for uploads in megabytes',
		default: 10,
	})
	maxFileSize = 10

	@SettingField.Select({
		label: 'Storage Provider',
		description: 'Where files are stored',
		options: [
			{ label: 'Local Storage', value: 'local' },
			{ label: 'Amazon S3', value: 's3' },
			{ label: 'Cloudinary', value: 'cloudinary' },
			{ label: 'UploadThing', value: 'uploadthing' },
		],
		default: 'local',
	})
	storageProvider = 'local'

	@SettingField.Text({
		label: 'Upload Directory',
		description: 'Base directory for file uploads (local storage)',
		default: 'uploads',
	})
	uploadDirectory = 'uploads'

	@SettingField.Select({
		label: 'Allowed Image Types',
		description: 'Image file types that can be uploaded',
		options: [
			{ label: 'JPEG', value: 'jpg' },
			{ label: 'PNG', value: 'png' },
			{ label: 'GIF', value: 'gif' },
			{ label: 'WebP', value: 'webp' },
			{ label: 'SVG', value: 'svg' },
			{ label: 'AVIF', value: 'avif' },
		],
		default: 'jpg',
	})
	allowedImageTypes = 'jpg'

	@SettingField.Boolean({
		label: 'Auto-optimize Images',
		description: 'Automatically optimize images on upload',
		default: true,
	})
	autoOptimize = true

	@SettingField.Number({
		label: 'Image Quality (%)',
		description: 'Quality level for image optimization (1-100)',
		default: 80,
	})
	imageQuality = 80

	@SettingField.Boolean({
		label: 'Generate Thumbnails',
		description: 'Automatically generate thumbnails for images',
		default: true,
	})
	generateThumbnails = true

	@SettingField.Number({
		label: 'Thumbnail Width',
		description: 'Width of generated thumbnails in pixels',
		default: 200,
	})
	thumbnailWidth = 200

	@SettingField.Number({
		label: 'Max Image Width',
		description: 'Maximum width for uploaded images (0 = no limit)',
		default: 2048,
	})
	maxImageWidth = 2048

	@SettingField.Number({
		label: 'Max Image Height',
		description: 'Maximum height for uploaded images (0 = no limit)',
		default: 2048,
	})
	maxImageHeight = 2048

	@SettingField.Boolean({
		label: 'Preserve Original',
		description: 'Keep original file when optimizing',
		default: false,
	})
	preserveOriginal = false
}
