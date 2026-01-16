# Magnet CMS - Publishing Guide

This guide explains how to publish Magnet CMS packages to npm.

## Prerequisites

1. NPM account with publishing permissions for `@magnet` scope
2. `NPM_TOKEN` secret configured in GitHub repository settings
3. All packages built and tested

## Setup (One-time)

### 1. Add NPM_TOKEN to GitHub Secrets

- Go to: Repository Settings > Secrets and variables > Actions
- Click "New repository secret"
- Name: `NPM_TOKEN`
- Value: Your npm token (generate at https://www.npmjs.com/settings/tokens)

### 2. Prepare packages for publishing

```bash
bun run prepare-publish
```

This will update package.json files to set `private: false` and add metadata.

## Publishing Workflow

### Method 1: Automatic (via Git Tags)

**1. Update version numbers:**

```bash
bun run bump:patch    # for patch version (0.0.1 -> 0.0.2)
bun run bump:minor    # for minor version (0.0.1 -> 0.1.0)
bun run bump:major    # for major version (0.0.1 -> 1.0.0)
```

**2. Review and commit changes:**

```bash
git add .
git commit -m "chore: release v0.0.2"
```

**3. Create and push tag:**

```bash
git tag v0.0.2
git push origin main --tags
```

**4. GitHub Actions will automatically:**

- Build all packages
- Convert workspace dependencies to version numbers
- Publish packages to npm (in correct order)
- Create a GitHub release

### Method 2: Manual Trigger

1. Go to: Repository > Actions > Publish to NPM
2. Click "Run workflow"
3. Optionally specify a version tag
4. Click "Run workflow" button

## Package Publishing Order

The workflow publishes packages in dependency order:

1. `@magnet/utils` (no dependencies)
2. `@magnet/common` (no dependencies)
3. `@magnet/adapter-mongoose` (depends on common)
4. `@magnet/core` (depends on common, utils)
5. `@magnet/ui` (depends on utils)
6. `@magnet/admin` (depends on ui, utils)
7. `@magnet/plugin-*` (depends on core/common)

## Packages Included

| Package | Description |
|---------|-------------|
| `@magnet/common` | Common types and decorators |
| `@magnet/core` | Core CMS functionality |
| `@magnet/utils` | Utility functions |
| `@magnet/admin` | Admin UI components |
| `@magnet/ui` | UI component library |
| `@magnet/adapter-mongoose` | Mongoose database adapter |
| `@magnet/plugin-seo` | SEO plugin |
| `@magnet/plugin-content-builder` | Content builder plugin |

## Troubleshooting

### "Version already exists" error

This is expected if you're republishing the same version. Bump the version and try again.

### "Not authorized" error

- Check `NPM_TOKEN` is correctly set in GitHub secrets
- Verify token has publishing permissions for `@magnet` scope

### "Module not found" errors

- Ensure all packages are built: `bun run build`
- Check workspace dependencies are correctly resolved

### Package not publishing

- Verify package.json has `"private": false`
- Check package has valid `main` or `exports` fields
- Ensure package has `dist` folder with built files

## Verification

After publishing, verify packages are available:

```bash
npm view @magnet/core
npm view @magnet/admin
```

Test installation:

```bash
npm install @magnet/core @magnet/admin
```

## Useful Scripts

| Script | Description |
|--------|-------------|
| `bun run prepare-publish` | Prepare all packages for publishing |
| `bun run validate-publish` | Validate packages are ready to publish |
| `bun run bump:patch` | Bump patch version (0.0.1 -> 0.0.2) |
| `bun run bump:minor` | Bump minor version (0.0.1 -> 0.1.0) |
| `bun run bump:major` | Bump major version (0.0.1 -> 1.0.0) |
| `bun run version X.Y.Z` | Set specific version |

## Notes

- Always test packages locally before publishing
- Version numbers should follow [semantic versioning](https://semver.org)
- All packages in a release are published with the same version
- Workspace dependencies are automatically converted to proper versions
- Only non-private packages are published to npm
