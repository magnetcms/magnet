# Role-Based Access Control (RBAC)

Magnet CMS includes a comprehensive Role-Based Access Control (RBAC) system that provides granular permission management at multiple levels.

## Overview

The RBAC system allows you to:

- Create roles with specific permissions
- Assign multiple roles to users
- Define permissions at global, schema, field, and record levels
- Enforce permissions automatically through decorators and guards

## Default Roles

Magnet CMS comes with five default system roles that are automatically created on first startup:

| Role | Priority | Description |
|------|----------|-------------|
| **Super Admin** | 100 | Full system access. Can manage all content, users, roles, and system settings. |
| **Admin** | 80 | Administrative access. Can manage content, users, and roles (not system settings). |
| **Editor** | 60 | Can create, edit, and publish content. Cannot delete content or manage users. |
| **Author** | 40 | Can create and manage their own content only. |
| **Viewer** | 20 | Read-only access to content. |

## Permission Scopes

Permissions are defined with the following scopes:

- `create` - Create new records
- `read` - Read/view records
- `update` - Modify existing records
- `delete` - Remove records
- `publish` - Publish/unpublish content

## Permission Levels

Permissions can be applied at different levels of granularity:

### Global Level

Global permissions apply to all resources in the system.

```typescript
// Permission that grants read access to everything
{
  name: 'global:read',
  scope: 'read',
  resource: { type: 'global' }
}
```

### Schema Level

Schema-level permissions apply to specific content types.

```typescript
// Permission for managing cats schema
{
  name: 'content:cats:create',
  scope: 'create',
  resource: { type: 'schema', target: 'cats' }
}
```

### Field Level

Field-level permissions control visibility and editability of specific fields.

```typescript
// Permission for specific fields in cats schema
{
  name: 'content:cats:fields:read',
  scope: 'read',
  resource: {
    type: 'field',
    target: 'cats',
    fields: ['name', 'breed']
  }
}
```

### Record Level

Record-level permissions use conditions to filter which records a user can access.

```typescript
// Permission to manage own content
{
  name: 'content:own:update',
  scope: 'update',
  resource: {
    type: 'record',
    target: '*',
    conditions: [
      { field: 'createdBy', operator: 'equals', value: '$currentUser' }
    ]
  }
}
```

## Using the @RequirePermission Decorator

Protect your API endpoints using the `@RequirePermission` decorator:

```typescript
import { RequirePermission } from '@magnet-cms/core'
import { Controller, Get, Post, Put, Delete } from '@nestjs/common'

@Controller('cats')
export class CatsController {
  @Get()
  @RequirePermission({ scope: 'read', resource: 'cats' })
  async list() {
    // Only users with 'read' permission on 'cats' can access
  }

  @Post()
  @RequirePermission({ scope: 'create', resource: 'cats' })
  async create() {
    // Only users with 'create' permission on 'cats' can access
  }

  @Put(':id')
  @RequirePermission({
    scope: 'update',
    resource: 'cats',
    checkOwnership: true,
    ownerField: 'createdBy'
  })
  async update() {
    // Users need 'update' permission on 'cats'
    // If they don't have full schema permission, ownership is checked
  }

  @Delete(':id')
  @RequirePermission({ scope: 'delete', resource: 'cats' })
  async delete() {
    // Only users with 'delete' permission on 'cats' can access
  }
}
```

### Dynamic Resource Resolution

You can dynamically resolve the resource from the request:

```typescript
@Get(':schema')
@RequirePermission({
  scope: 'read',
  resource: (req) => req.params.schema
})
async listContent(@Param('schema') schema: string) {
  // Permission is checked against the dynamic schema parameter
}
```

## API Endpoints

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rbac/roles` | List all roles |
| GET | `/rbac/roles/:id` | Get a specific role |
| POST | `/rbac/roles` | Create a new role |
| PUT | `/rbac/roles/:id` | Update a role |
| DELETE | `/rbac/roles/:id` | Delete a role (non-system only) |

### Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rbac/permissions` | List all permissions |
| GET | `/rbac/permissions/:id` | Get a specific permission |
| POST | `/rbac/permissions` | Create a new permission |
| DELETE | `/rbac/permissions/:id` | Delete a permission (non-system only) |

### User Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rbac/me/permissions` | Get current user's resolved permissions |
| GET | `/rbac/users/:id/permissions` | Get a specific user's resolved permissions |
| PUT | `/rbac/users/:id/roles` | Assign roles to a user |

## Resolved Permissions

When a user's permissions are resolved, they are aggregated from all their roles (including inherited roles) into a `ResolvedPermissions` object:

```typescript
interface ResolvedPermissions {
  // Global permissions that apply to all resources
  global: PermissionScope[]

  // Schema-level permissions mapped by schema name
  schemas: Record<string, PermissionScope[]>

  // Field-level permissions by schema and field
  fields: Record<string, Record<string, FieldPermission>>

  // Record-level conditions by schema
  records: Record<string, RecordPermission[]>

  // All role IDs the user has (including inherited)
  roleIds: string[]

  // All role names the user has (including inherited)
  roleNames: string[]
}
```

## Role Hierarchy

Roles support inheritance through the `inheritsFrom` field. When a role inherits from another role, it gains all the permissions of the parent role(s).

```typescript
// Create an Editor role that inherits from Viewer
{
  name: 'editor',
  displayName: 'Editor',
  inheritsFrom: ['viewer-role-id'],
  permissions: ['create-permission-id', 'update-permission-id']
}
```

## Admin UI Integration

The admin UI uses the `usePermissions` hook to check permissions:

```typescript
import { usePermissions } from '@/hooks/usePermissions'

function ContentList() {
  const { hasSchemaPermission, isLoading } = usePermissions()

  if (isLoading) return <Spinner />

  const canCreate = hasSchemaPermission('cats', 'create')
  const canDelete = hasSchemaPermission('cats', 'delete')

  return (
    <div>
      {canCreate && <Button>Create New</Button>}
      {/* ... */}
    </div>
  )
}
```

## Migration from Legacy Role Field

If you're upgrading from a previous version of Magnet that used a single `role` string field on users, the RBAC system will automatically migrate existing users:

1. On startup, the RBAC seeder checks for users with the legacy `role` field
2. It maps legacy role values to new Role documents:
   - `"admin"` → Admin role
   - `"editor"` → Editor role
   - `"viewer"` → Viewer role
3. Users are updated with the `roles` array containing the mapped role ID
4. The legacy `role` field is preserved for backward compatibility but marked as deprecated

## Type Definitions

Key types are exported from `@magnet-cms/common`:

```typescript
import {
  PermissionScope,
  PermissionLevel,
  Permission,
  Role,
  ResolvedPermissions,
  FieldPermission,
  RecordPermission,
  PermissionCondition,
  PermissionContext,
  isValidPermissionScope,
  isValidPermissionLevel,
  isRole,
  isPermission,
  DefaultRoleNames,
  PermissionNamePatterns,
} from '@magnet-cms/common'
```

## Best Practices

1. **Use Global Permissions Sparingly**: Reserve global permissions for super admin roles only.

2. **Prefer Schema-Level Over Global**: Use schema-level permissions for content types to maintain security.

3. **Leverage Role Inheritance**: Create base roles and have more privileged roles inherit from them.

4. **Use Record-Level for Ownership**: Apply record-level conditions with `$currentUser` for author-style access.

5. **Cache Permission Checks**: The RBAC service caches resolved permissions for 5 minutes per user.

6. **Test Permission Enforcement**: Always write tests to verify permission enforcement is working correctly.
