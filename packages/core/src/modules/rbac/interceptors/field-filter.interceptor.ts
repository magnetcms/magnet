import type { AuthUser, FieldPermission } from '@magnet-cms/common'
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common'
import type { Request } from 'express'
import { type Observable, from, switchMap } from 'rxjs'
import { RbacService } from '../rbac.service'

/**
 * Extended request with user
 */
interface AuthenticatedRequest extends Request {
	user?: AuthUser
}

/**
 * Response with potential field metadata
 */
interface FilteredResponse {
	data?: unknown
	_fieldPermissions?: Record<string, FieldPermission>
	[key: string]: unknown
}

/**
 * Interceptor that filters response fields based on user permissions
 *
 * This interceptor:
 * 1. Checks the user's field-level permissions for the requested schema
 * 2. Removes fields the user cannot see (visible: false)
 * 3. Adds metadata about readonly fields for the UI
 *
 * @example
 * // Apply to a controller
 * @UseInterceptors(FieldFilterInterceptor)
 * @Controller('content')
 * export class ContentController { ... }
 */
@Injectable()
export class FieldFilterInterceptor implements NestInterceptor {
	constructor(private readonly rbacService: RbacService) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<FilteredResponse> {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
		const user = request.user
		const schema = request.params.schema

		return next.handle().pipe(
			switchMap((data: unknown) => {
				return from(this.processResponse(data, user, schema))
			}),
		)
	}

	/**
	 * Process the response and filter fields based on permissions
	 */
	private async processResponse(
		data: unknown,
		user: AuthUser | undefined,
		schema: string | undefined,
	): Promise<FilteredResponse> {
		// If no user or no schema, return data as-is
		if (!user || !schema) {
			return this.wrapAsResponse(data)
		}

		const roleIds = user.roles ?? []

		// If user has no roles, return data as-is (permission guard should have blocked)
		if (roleIds.length === 0) {
			return this.wrapAsResponse(data)
		}

		// Get field permissions for this user and schema
		const fieldPermissions = await this.rbacService.getFieldPermissions(
			roleIds,
			schema,
		)

		// If no field-level permissions defined, return data as-is
		if (Object.keys(fieldPermissions).length === 0) {
			return this.wrapAsResponse(data)
		}

		// Filter the response data
		const filteredData = this.filterData(data, fieldPermissions)

		// Return filtered data with field permission metadata for UI
		const response = this.wrapAsResponse(filteredData)
		response._fieldPermissions = fieldPermissions
		return response
	}

	/**
	 * Wrap data in a FilteredResponse
	 */
	private wrapAsResponse(data: unknown): FilteredResponse {
		if (this.isObject(data)) {
			return data as FilteredResponse
		}
		return { data }
	}

	/**
	 * Filter data based on field permissions
	 */
	private filterData(
		data: unknown,
		fieldPermissions: Record<string, FieldPermission>,
	): unknown {
		if (Array.isArray(data)) {
			return data.map((item) => this.filterObject(item, fieldPermissions))
		}

		if (this.isObject(data)) {
			return this.filterObject(data, fieldPermissions)
		}

		return data
	}

	/**
	 * Filter a single object based on field permissions
	 */
	private filterObject(
		obj: unknown,
		fieldPermissions: Record<string, FieldPermission>,
	): unknown {
		if (!this.isObject(obj)) {
			return obj
		}

		const record = obj as Record<string, unknown>
		const result: Record<string, unknown> = {}

		for (const [key, value] of Object.entries(record)) {
			const permission = fieldPermissions[key]

			// If no permission defined for this field, include it (default visible)
			if (!permission) {
				result[key] = value
				continue
			}

			// If field is not visible, skip it
			if (!permission.visible) {
				continue
			}

			// Include the field
			result[key] = value
		}

		return result
	}

	/**
	 * Type guard for objects
	 */
	private isObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value)
	}
}
