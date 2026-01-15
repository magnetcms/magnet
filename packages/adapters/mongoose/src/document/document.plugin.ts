import { Injectable, Logger } from '@nestjs/common'
import { Schema } from 'mongoose'
import type { DocumentPluginOptions } from './document.interface'

@Injectable()
export class DocumentPluginService {
	private readonly logger = new Logger(DocumentPluginService.name)

	/**
	 * Apply the document plugin to a Mongoose schema
	 * Adds documentId, locale, status fields and compound indexes
	 * @param schema The Mongoose schema to apply the plugin to
	 * @param options Plugin options
	 */
	applyDocumentPlugin(schema: Schema, options: DocumentPluginOptions): void {
		if (!options.hasIntl) {
			return
		}

		this.logger.log('Applying document plugin to schema')

		// Add document fields
		this.addDocumentFields(schema)

		// Add compound indexes
		this.addIndexes(schema)

		// Add methods
		this.addMethods(schema)
	}

	/**
	 * Add document-related fields to the schema
	 */
	private addDocumentFields(schema: Schema): void {
		schema.add({
			documentId: {
				type: String,
				required: true,
				index: true,
			},
			locale: {
				type: String,
				required: true,
				default: 'en',
			},
			status: {
				type: String,
				enum: ['draft', 'published'],
				required: true,
				default: 'draft',
			},
			publishedAt: {
				type: Date,
				default: null,
			},
		})
	}

	/**
	 * Add compound indexes for efficient querying
	 */
	private addIndexes(schema: Schema): void {
		// Compound index for finding a specific document variant
		schema.index(
			{ documentId: 1, locale: 1, status: 1 },
			{ unique: true, name: 'document_locale_status_unique' },
		)

		// Index for listing all locales of a document
		schema.index({ documentId: 1, locale: 1 }, { name: 'document_locale' })

		// Index for listing all documents by status
		schema.index({ status: 1, locale: 1 }, { name: 'status_locale' })
	}

	/**
	 * Add helper methods to the schema
	 */
	private addMethods(schema: Schema): void {
		// Method to check if this is a draft
		schema.method('isDraft', function () {
			return this.status === 'draft'
		})

		// Method to check if this is published
		schema.method('isPublished', function () {
			return this.status === 'published'
		})

		// Static method to find by document ID
		schema.static('findByDocumentId', function (documentId: string, options: { locale?: string; status?: string } = {}) {
			const query: Record<string, any> = { documentId }

			if (options.locale) {
				query.locale = options.locale
			}

			if (options.status) {
				query.status = options.status
			}

			return this.find(query)
		})

		// Static method to find a single document variant
		schema.static('findOneByDocumentId', function (documentId: string, locale: string, status: 'draft' | 'published') {
			return this.findOne({ documentId, locale, status })
		})
	}
}
