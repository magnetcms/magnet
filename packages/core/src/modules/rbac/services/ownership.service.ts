import { Injectable } from '@nestjs/common'

/**
 * Interface for records with ownership information
 */
export interface OwnableRecord {
	createdBy?: string
	[key: string]: unknown
}

/**
 * Service for handling record-level ownership checks
 *
 * Used to implement record-level permissions where users can only
 * access/modify content they created.
 */
@Injectable()
export class OwnershipService {
	/** Default field name for owner reference */
	private readonly defaultOwnerField = 'createdBy'

	/**
	 * Check if a user owns a specific record
	 *
	 * @param userId - The user's ID
	 * @param record - The record to check ownership of
	 * @param ownerField - The field containing the owner ID (default: 'createdBy')
	 * @returns Whether the user owns the record
	 *
	 * @example
	 * const isOwner = ownershipService.isOwner(userId, document)
	 * if (!isOwner) {
	 *   throw new ForbiddenException('You do not own this record')
	 * }
	 */
	isOwner(
		userId: string,
		record: OwnableRecord,
		ownerField: string = this.defaultOwnerField,
	): boolean {
		const ownerId = record[ownerField]

		if (typeof ownerId !== 'string') {
			return false
		}

		return ownerId === userId
	}

	/**
	 * Filter an array of records to only include those owned by the user
	 *
	 * @param userId - The user's ID
	 * @param records - Array of records to filter
	 * @param ownerField - The field containing the owner ID (default: 'createdBy')
	 * @returns Filtered array containing only records owned by the user
	 *
	 * @example
	 * const allPosts = await postService.findAll()
	 * const userPosts = ownershipService.filterByOwnership(userId, allPosts)
	 */
	filterByOwnership<T extends OwnableRecord>(
		userId: string,
		records: T[],
		ownerField: string = this.defaultOwnerField,
	): T[] {
		return records.filter((record) => this.isOwner(userId, record, ownerField))
	}

	/**
	 * Add ownership information to a record
	 *
	 * @param userId - The user's ID to set as owner
	 * @param record - The record to add ownership to
	 * @param ownerField - The field to set (default: 'createdBy')
	 * @returns The record with ownership information added
	 *
	 * @example
	 * const newPost = ownershipService.setOwner(userId, postData)
	 * await postService.create(newPost)
	 */
	setOwner<T extends Record<string, unknown>>(
		userId: string,
		record: T,
		ownerField: string = this.defaultOwnerField,
	): T & { [key: string]: string } {
		return {
			...record,
			[ownerField]: userId,
		}
	}

	/**
	 * Check ownership and throw if not owner
	 *
	 * @param userId - The user's ID
	 * @param record - The record to check
	 * @param ownerField - The field containing the owner ID
	 * @throws Error if user does not own the record
	 */
	assertOwnership(
		userId: string,
		record: OwnableRecord,
		ownerField: string = this.defaultOwnerField,
	): void {
		if (!this.isOwner(userId, record, ownerField)) {
			throw new Error('Access denied: You do not own this record')
		}
	}

	/**
	 * Get the owner ID from a record
	 *
	 * @param record - The record to get owner from
	 * @param ownerField - The field containing the owner ID
	 * @returns The owner ID or undefined if not set
	 */
	getOwnerId(
		record: OwnableRecord,
		ownerField: string = this.defaultOwnerField,
	): string | undefined {
		const ownerId = record[ownerField]
		return typeof ownerId === 'string' ? ownerId : undefined
	}

	/**
	 * Check if a record has ownership information
	 *
	 * @param record - The record to check
	 * @param ownerField - The field to check for
	 * @returns Whether the record has an owner set
	 */
	hasOwner(
		record: OwnableRecord,
		ownerField: string = this.defaultOwnerField,
	): boolean {
		return typeof record[ownerField] === 'string' && record[ownerField] !== ''
	}

	/**
	 * Transfer ownership of a record to a new user
	 *
	 * @param newOwnerId - The new owner's ID
	 * @param record - The record to transfer
	 * @param ownerField - The field containing the owner ID
	 * @returns The record with updated ownership
	 */
	transferOwnership<T extends OwnableRecord>(
		newOwnerId: string,
		record: T,
		ownerField: string = this.defaultOwnerField,
	): T {
		return {
			...record,
			[ownerField]: newOwnerId,
		}
	}
}
