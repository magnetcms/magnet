import { DynamicModule, Module } from '@nestjs/common'
import { DatabaseModule } from '~/modules/database'
import { User } from '~/modules/user/schemas/user.schema'
import { PermissionGuard } from './guards/permission.guard'
import { FieldFilterInterceptor } from './interceptors/field-filter.interceptor'
import { RbacController } from './rbac.controller'
import { RbacSeeder } from './rbac.seeder'
import { RbacService } from './rbac.service'
import { Permission } from './schemas/permission.schema'
import { Role } from './schemas/role.schema'
import { OwnershipService } from './services/ownership.service'

/**
 * RBAC (Role-Based Access Control) Module
 *
 * Provides comprehensive role-based access control for Magnet CMS including:
 * - Permission management
 * - Role management with inheritance
 * - User role assignment
 * - Permission guards and decorators
 * - Field-level permission filtering
 * - Record-level ownership checks
 *
 * @example
 * // Import in your app module
 * import { RbacModule } from '@magnet-cms/core'
 *
 * @Module({
 *   imports: [
 *     MagnetModule.forRoot({ ... }),
 *     RbacModule,
 *   ],
 * })
 * export class AppModule {}
 *
 * @example
 * // Use in controllers
 * @UseGuards(JwtAuthGuard, PermissionGuard)
 * @RequirePermission({ scope: 'read', resource: 'users' })
 * async listUsers() { ... }
 */
@Module({
	imports: [DatabaseModule.forFeature([Permission, Role, User])],
	controllers: [RbacController],
	providers: [
		RbacService,
		OwnershipService,
		PermissionGuard,
		FieldFilterInterceptor,
		RbacSeeder,
	],
	exports: [
		RbacService,
		OwnershipService,
		PermissionGuard,
		FieldFilterInterceptor,
	],
})
export class RbacModule {
	/**
	 * Configure the RBAC module as a global module
	 *
	 * When using forRoot(), the module's providers are available
	 * throughout the application without needing to import the module.
	 */
	static forRoot(): DynamicModule {
		return {
			module: RbacModule,
			global: true,
			imports: [DatabaseModule.forFeature([Permission, Role, User])],
			controllers: [RbacController],
			providers: [
				RbacService,
				OwnershipService,
				PermissionGuard,
				FieldFilterInterceptor,
				RbacSeeder,
			],
			exports: [
				RbacService,
				OwnershipService,
				PermissionGuard,
				FieldFilterInterceptor,
			],
		}
	}
}
