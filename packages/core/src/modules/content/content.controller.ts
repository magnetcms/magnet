import { ValidationException } from '@magnet-cms/common'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common'
import type { Request } from 'express'
import { RequirePermission } from '~/decorators/require-permission.decorator'
import { RestrictedRoute } from '~/decorators/restricted.route'
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '~/modules/rbac/guards/permission.guard'
import { ContentService } from './content.service'

/**
 * Helper to extract schema from request params
 * Used in @RequirePermission decorator
 */
const getSchemaFromRequest = (req: Request): string => {
	const schema = req.params.schema
	if (!schema) {
		throw new HttpException(
			'Schema parameter is required',
			HttpStatus.BAD_REQUEST,
		)
	}
	return schema
}

@Controller('content')
@RestrictedRoute()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ContentController {
	constructor(private readonly contentService: ContentService) {}

	/**
	 * List all documents for a schema
	 * GET /content/:schema
	 * Query params: locale, status
	 */
	@Get(':schema')
	@RequirePermission({ scope: 'read', resource: getSchemaFromRequest })
	async list(
		@Param('schema') schema: string,
		@Query('locale') locale?: string,
		@Query('status') status?: 'draft' | 'published',
	) {
		try {
			return await this.contentService.list(schema, { locale, status })
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to list documents',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Get a document by documentId
	 * GET /content/:schema/:documentId
	 * Query params: locale, status
	 */
	@Get(':schema/:documentId')
	@RequirePermission({ scope: 'read', resource: getSchemaFromRequest })
	async get(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
		@Query('locale') locale?: string,
		@Query('status') status?: 'draft' | 'published',
	) {
		try {
			const result = await this.contentService.findByDocumentId(
				schema,
				documentId,
				{ locale, status },
			)
			if (!result) {
				throw new HttpException('Document not found', HttpStatus.NOT_FOUND)
			}
			return result
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to get document',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Create a new empty document (for immediate redirect flow)
	 * POST /content/:schema/new
	 * Body: { locale?, createdBy? }
	 * Returns: { documentId: string }
	 */
	@Post(':schema/new')
	@RequirePermission({ scope: 'create', resource: getSchemaFromRequest })
	async createEmpty(
		@Param('schema') schema: string,
		@Body() body?: {
			locale?: string
			createdBy?: string
		},
	) {
		try {
			const result = await this.contentService.create(
				schema,
				{},
				{
					locale: body?.locale,
					createdBy: body?.createdBy,
				},
			)
			return { documentId: result.documentId }
		} catch (error) {
			// Let ValidationException propagate to global filter for proper error formatting
			if (error instanceof ValidationException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to create document',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Create a new document
	 * POST /content/:schema
	 * Body: { data, locale?, createdBy? }
	 */
	@Post(':schema')
	@RequirePermission({ scope: 'create', resource: getSchemaFromRequest })
	async create(
		@Param('schema') schema: string,
		@Body() body: {
			data: Record<string, unknown>
			locale?: string
			createdBy?: string
		},
	) {
		try {
			return await this.contentService.create(schema, body.data, {
				locale: body.locale,
				createdBy: body.createdBy,
			})
		} catch (error) {
			// Let ValidationException propagate to global filter for proper error formatting
			if (error instanceof ValidationException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to create document',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Update a document
	 * PUT /content/:schema/:documentId
	 * Query params: locale, status
	 * Body: { data, updatedBy? }
	 */
	@Put(':schema/:documentId')
	@RequirePermission({
		scope: 'update',
		resource: getSchemaFromRequest,
		checkOwnership: true,
	})
	async update(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
		@Query('locale') locale?: string,
		@Query('status') status?: 'draft' | 'published',
		@Body() body?: { data: Record<string, unknown>; updatedBy?: string },
	) {
		try {
			const result = await this.contentService.update(
				schema,
				documentId,
				body?.data ?? {},
				{
					locale,
					status,
					updatedBy: body?.updatedBy,
				},
			)
			if (!result) {
				throw new HttpException('Document not found', HttpStatus.NOT_FOUND)
			}
			return result
		} catch (error) {
			if (error instanceof HttpException) throw error
			// Let ValidationException propagate to global filter for proper error formatting
			if (error instanceof ValidationException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to update document',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Delete a document (all locales and statuses)
	 * DELETE /content/:schema/:documentId
	 */
	@Delete(':schema/:documentId')
	@RequirePermission({ scope: 'delete', resource: getSchemaFromRequest })
	async delete(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
	) {
		try {
			const result = await this.contentService.delete(schema, documentId)
			if (!result) {
				throw new HttpException('Document not found', HttpStatus.NOT_FOUND)
			}
			return { success: true }
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to delete document',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Publish a document locale
	 * POST /content/:schema/:documentId/publish
	 * Query params: locale
	 */
	@Post(':schema/:documentId/publish')
	@RequirePermission({ scope: 'publish', resource: getSchemaFromRequest })
	async publish(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
		@Query('locale') locale?: string,
		@Body() body?: { publishedBy?: string },
	) {
		try {
			const result = await this.contentService.publish(schema, documentId, {
				locale,
				publishedBy: body?.publishedBy,
			})
			if (!result) {
				throw new HttpException(
					'Document not found or no draft to publish',
					HttpStatus.NOT_FOUND,
				)
			}
			return result
		} catch (error) {
			if (error instanceof HttpException) throw error
			if (error instanceof ValidationException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to publish document',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Unpublish a document locale
	 * POST /content/:schema/:documentId/unpublish
	 * Query params: locale
	 */
	@Post(':schema/:documentId/unpublish')
	@RequirePermission({ scope: 'publish', resource: getSchemaFromRequest })
	async unpublish(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
		@Query('locale') locale?: string,
	) {
		try {
			const result = await this.contentService.unpublish(
				schema,
				documentId,
				locale,
			)
			return { success: result }
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to unpublish document',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Add a new locale to an existing document
	 * POST /content/:schema/:documentId/locale
	 * Body: { locale, data, createdBy? }
	 */
	@Post(':schema/:documentId/locale')
	@RequirePermission({ scope: 'create', resource: getSchemaFromRequest })
	async addLocale(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
		@Body() body: {
			locale: string
			data: Record<string, unknown>
			createdBy?: string
		},
	) {
		try {
			return await this.contentService.addLocale(
				schema,
				documentId,
				body.locale,
				body.data,
				{ createdBy: body.createdBy },
			)
		} catch (error) {
			// Let ValidationException propagate to global filter for proper error formatting
			if (error instanceof ValidationException) {
				throw error
			}
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to add locale',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Delete a specific locale
	 * DELETE /content/:schema/:documentId/locale/:locale
	 */
	@Delete(':schema/:documentId/locale/:locale')
	@RequirePermission({ scope: 'delete', resource: getSchemaFromRequest })
	async deleteLocale(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
		@Param('locale') locale: string,
	) {
		try {
			const result = await this.contentService.deleteLocale(
				schema,
				documentId,
				locale,
			)
			return { success: result }
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to delete locale',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Get locale statuses for a document
	 * GET /content/:schema/:documentId/locales
	 */
	@Get(':schema/:documentId/locales')
	@RequirePermission({ scope: 'read', resource: getSchemaFromRequest })
	async getLocaleStatuses(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
	) {
		try {
			return await this.contentService.getLocaleStatuses(schema, documentId)
		} catch (error) {
			throw new HttpException(
				error instanceof Error
					? error.message
					: 'Failed to get locale statuses',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Get version history for a document
	 * GET /content/:schema/:documentId/versions
	 * Query params: locale
	 */
	@Get(':schema/:documentId/versions')
	@RequirePermission({ scope: 'read', resource: getSchemaFromRequest })
	async getVersions(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
		@Query('locale') locale?: string,
	) {
		try {
			return await this.contentService.getVersions(schema, documentId, locale)
		} catch (error) {
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to get versions',
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * Restore a specific version
	 * POST /content/:schema/:documentId/restore
	 * Query params: locale, version
	 */
	@Post(':schema/:documentId/restore')
	@RequirePermission({ scope: 'update', resource: getSchemaFromRequest })
	async restoreVersion(
		@Param('schema') schema: string,
		@Param('documentId') documentId: string,
		@Query('locale') locale: string,
		@Query('version') version: string,
	) {
		try {
			const versionNumber = Number.parseInt(version, 10)
			if (Number.isNaN(versionNumber)) {
				throw new HttpException(
					'Invalid version number',
					HttpStatus.BAD_REQUEST,
				)
			}
			const result = await this.contentService.restoreVersion(
				schema,
				documentId,
				locale,
				versionNumber,
			)
			if (!result) {
				throw new HttpException('Version not found', HttpStatus.NOT_FOUND)
			}
			return result
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				error instanceof Error ? error.message : 'Failed to restore version',
				HttpStatus.BAD_REQUEST,
			)
		}
	}
}
