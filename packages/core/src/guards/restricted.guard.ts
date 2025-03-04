import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { IS_RESTRICTED_ROUTE } from '../decorators/restricted.route'

@Injectable()
export class RestrictedGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		// Check if the route is marked as restricted
		const isRestrictedRoute = this.reflector.getAllAndOverride<boolean>(
			IS_RESTRICTED_ROUTE,
			[context.getHandler(), context.getClass()],
		)

		// If not a restricted route, allow access
		if (!isRestrictedRoute) {
			return true
		}

		const request = context.switchToHttp().getRequest<Request>()

		// Get the origin from the request
		const origin = request.headers.origin || request.headers.host

		// Whitelist of allowed origins (add your specific site here)
		const allowedOrigins = ['http://localhost:3000']

		// Check if the origin is in the allowed list
		const isAllowedOrigin = allowedOrigins.some((allowed) =>
			origin?.includes(allowed),
		)

		if (process.env.NODE_ENV !== 'development' && !isAllowedOrigin) {
			throw new ForbiddenException('Access from this origin is not allowed')
		}

		return true
	}
}
