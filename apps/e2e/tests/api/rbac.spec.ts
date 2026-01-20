import { expect, test } from '../../src/fixtures/base.fixture'
import { testData } from '../../src/helpers/test-data'

test.describe('RBAC API', () => {
	test.describe('Roles', () => {
		test('GET /rbac/roles returns list of roles', async ({ apiClient }) => {
			// First authenticate
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			const response = await apiClient.getRoles()
			expect(response.ok()).toBeTruthy()

			const roles = await response.json()
			expect(Array.isArray(roles)).toBe(true)
			// Should have default system roles
			expect(roles.length).toBeGreaterThanOrEqual(5)

			// Check for default role names
			const roleNames = roles.map((r: { name: string }) => r.name)
			expect(roleNames).toContain('super-admin')
			expect(roleNames).toContain('admin')
			expect(roleNames).toContain('editor')
			expect(roleNames).toContain('author')
			expect(roleNames).toContain('viewer')
		})

		test('GET /rbac/roles/:id returns a specific role', async ({
			apiClient,
		}) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			// Get all roles first
			const rolesResponse = await apiClient.getRoles()
			const roles = await rolesResponse.json()
			const adminRole = roles.find((r: { name: string }) => r.name === 'admin')

			expect(adminRole).toBeDefined()

			const response = await apiClient.getRole(adminRole.id)
			expect(response.ok()).toBeTruthy()

			const role = await response.json()
			expect(role.name).toBe('admin')
			expect(role.displayName).toBe('Admin')
			expect(role.isSystem).toBe(true)
		})

		test('POST /rbac/roles creates a new role', async ({ apiClient }) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			const newRole = {
				name: `test-role-${Date.now()}`,
				displayName: 'Test Role',
				description: 'A test role for E2E testing',
				priority: 10,
			}

			const response = await apiClient.createRole(newRole)
			expect(response.ok()).toBeTruthy()

			const role = await response.json()
			expect(role.name).toBe(newRole.name)
			expect(role.displayName).toBe(newRole.displayName)
			expect(role.description).toBe(newRole.description)
			expect(role.isSystem).toBe(false)
			expect(role.id).toBeDefined()
		})

		test('PUT /rbac/roles/:id updates a role', async ({ apiClient }) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			// Create a role to update
			const createResponse = await apiClient.createRole({
				name: `update-test-role-${Date.now()}`,
				displayName: 'Update Test Role',
			})
			const createdRole = await createResponse.json()

			// Update the role
			const response = await apiClient.updateRole(createdRole.id, {
				displayName: 'Updated Role Name',
				description: 'Updated description',
			})
			expect(response.ok()).toBeTruthy()

			const updatedRole = await response.json()
			expect(updatedRole.displayName).toBe('Updated Role Name')
			expect(updatedRole.description).toBe('Updated description')
		})

		test('DELETE /rbac/roles/:id deletes a non-system role', async ({
			apiClient,
		}) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			// Create a role to delete
			const createResponse = await apiClient.createRole({
				name: `delete-test-role-${Date.now()}`,
				displayName: 'Delete Test Role',
			})
			const createdRole = await createResponse.json()

			// Delete the role
			const response = await apiClient.deleteRole(createdRole.id)
			expect(response.ok()).toBeTruthy()

			// Verify it's deleted
			const getResponse = await apiClient.getRole(createdRole.id)
			expect(getResponse.ok()).toBe(false)
		})

		test('DELETE /rbac/roles/:id fails for system roles', async ({
			apiClient,
		}) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			// Get the admin system role
			const rolesResponse = await apiClient.getRoles()
			const roles = await rolesResponse.json()
			const adminRole = roles.find((r: { name: string }) => r.name === 'admin')

			// Try to delete the system role
			const response = await apiClient.deleteRole(adminRole.id)
			expect(response.ok()).toBe(false)
			expect(response.status()).toBe(400)
		})
	})

	test.describe('Permissions', () => {
		test('GET /rbac/permissions returns list of permissions', async ({
			apiClient,
		}) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			const response = await apiClient.getPermissions()
			expect(response.ok()).toBeTruthy()

			const permissions = await response.json()
			expect(Array.isArray(permissions)).toBe(true)
			// Should have default system permissions
			expect(permissions.length).toBeGreaterThanOrEqual(1)
		})

		test('GET /rbac/permissions/:id returns a specific permission', async ({
			apiClient,
		}) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			// Get all permissions first
			const permissionsResponse = await apiClient.getPermissions()
			const permissions = await permissionsResponse.json()
			const firstPermission = permissions[0]

			expect(firstPermission).toBeDefined()

			const response = await apiClient.getPermission(firstPermission.id)
			expect(response.ok()).toBeTruthy()

			const permission = await response.json()
			expect(permission.id).toBe(firstPermission.id)
			expect(permission.name).toBeDefined()
			expect(permission.scope).toBeDefined()
		})

		test('POST /rbac/permissions creates a new permission', async ({
			apiClient,
		}) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			const newPermission = {
				name: `test:perm:${Date.now()}`,
				displayName: 'Test Permission',
				description: 'A test permission for E2E testing',
				scope: 'read',
				resource: { type: 'schema', target: 'test-schema' },
			}

			const response = await apiClient.createPermission(newPermission)
			expect(response.ok()).toBeTruthy()

			const permission = await response.json()
			expect(permission.name).toBe(newPermission.name)
			expect(permission.displayName).toBe(newPermission.displayName)
			expect(permission.scope).toBe(newPermission.scope)
			expect(permission.id).toBeDefined()
		})

		test('DELETE /rbac/permissions/:id deletes a non-system permission', async ({
			apiClient,
		}) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			// Create a permission to delete
			const createResponse = await apiClient.createPermission({
				name: `delete:perm:${Date.now()}`,
				displayName: 'Delete Test Permission',
				scope: 'read',
				resource: { type: 'schema', target: 'test-schema' },
			})
			const createdPermission = await createResponse.json()

			// Delete the permission
			const response = await apiClient.deletePermission(createdPermission.id)
			expect(response.ok()).toBeTruthy()

			// Verify it's deleted
			const getResponse = await apiClient.getPermission(createdPermission.id)
			expect(getResponse.ok()).toBe(false)
		})
	})

	test.describe('User Permissions', () => {
		test('GET /rbac/me/permissions returns current user permissions', async ({
			apiClient,
		}) => {
			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			const response = await apiClient.getMyPermissions()
			expect(response.ok()).toBeTruthy()

			const permissions = await response.json()
			expect(permissions).toHaveProperty('global')
			expect(permissions).toHaveProperty('schemas')
			expect(permissions).toHaveProperty('fields')
			expect(permissions).toHaveProperty('records')
			expect(permissions).toHaveProperty('roleIds')
			expect(permissions).toHaveProperty('roleNames')

			expect(Array.isArray(permissions.global)).toBe(true)
			expect(Array.isArray(permissions.roleIds)).toBe(true)
			expect(Array.isArray(permissions.roleNames)).toBe(true)
		})

		test('GET /rbac/me/permissions returns 401 when not authenticated', async ({
			request,
			apiBaseURL,
		}) => {
			const response = await request.get(`${apiBaseURL}/rbac/me/permissions`)
			expect(response.status()).toBe(401)
		})
	})

	test.describe('Permission Enforcement', () => {
		test('Users with viewer role cannot create content', async ({
			apiClient,
		}) => {
			// Skip this test for now as permission enforcement requires the
			// full RBAC middleware to be in place
			test.skip()

			const userData = testData.user.create()
			const auth = await apiClient.register(userData)
			apiClient.setToken(auth.access_token)

			// Get viewer role
			const rolesResponse = await apiClient.getRoles()
			const roles = await rolesResponse.json()
			const viewerRole = roles.find(
				(r: { name: string }) => r.name === 'viewer',
			)

			// Assign only viewer role to user
			const meResponse = await apiClient.getMe()
			const me = await meResponse.json()
			await apiClient.assignUserRoles(me.id, [viewerRole.id])

			// Try to create content - should fail with 403
			const response = await apiClient.createContent('cats', {
				name: 'Test Cat',
				tagID: 'test-001',
				birthdate: new Date().toISOString(),
				breed: 'Test Breed',
				weight: 5,
				owner: 'test-owner-id',
				castrated: false,
			})

			expect(response.status()).toBe(403)
		})
	})
})
