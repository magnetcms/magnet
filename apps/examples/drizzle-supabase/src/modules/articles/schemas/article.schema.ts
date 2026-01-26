import { Field, Schema } from '@magnet-cms/common'

/**
 * Article schema for news articles.
 * Demonstrates full Supabase integration with database, auth, and storage.
 */
@Schema({
	i18n: true,
	versioning: true,
})
export class Article {
	@Field.Text({
		required: true,
		intl: true,
		tab: 'General',
		description: 'Article title',
	})
	title: string

	@Field.Slug({
		from: 'title',
		intl: true,
		tab: 'General',
		description: 'URL slug',
	})
	slug: string

	@Field.RichText({
		intl: true,
		tab: 'General',
		description: 'Article content',
	})
	content: string

	@Field.Textarea({
		intl: true,
		tab: 'General',
		description: 'Brief summary for article listings',
	})
	summary: string

	@Field.Image({
		tab: 'Media',
		description: 'Cover image (uploaded to Supabase Storage)',
	})
	coverImage: string

	@Field.Text({
		tab: 'Sidebar',
		description: 'Linked to Supabase Auth user',
	})
	authorId: string

	@Field.Select({
		tab: 'Sidebar',
		description: 'Article category',
		options: [
			{ label: 'News', value: 'news' },
			{ label: 'Tutorial', value: 'tutorial' },
			{ label: 'Opinion', value: 'opinion' },
			{ label: 'Review', value: 'review' },
		],
	})
	category: string

	@Field.Tags({ tab: 'Sidebar', description: 'Article tags' })
	tags: string[]

	@Field.Boolean({
		default: false,
		tab: 'Sidebar',
		description: 'Featured article',
	})
	featured: boolean

	@Field.Number({
		default: 0,
		tab: 'Sidebar',
		description: 'View count',
	})
	viewCount: number
}
