#!/usr/bin/env node

/**
 * Script to validate packages are ready for publishing
 * Checks:
 * - All packages are built
 * - All packages have proper metadata
 * - No workspace dependencies in published packages
 * - All required fields are present
 */

const fs = require('node:fs')
const path = require('node:path')

const PACKAGES = [
	'packages/common',
	'packages/core',
	'packages/utils',
	'packages/client/admin',
	'packages/client/ui',
	'packages/adapters/mongoose',
	'packages/plugins/seo',
	'packages/plugins/content-builder',
]

const REQUIRED_FIELDS = ['name', 'version', 'license']

function validatePackage(packagePath) {
	const pkgJsonPath = path.join(process.cwd(), packagePath, 'package.json')
	const errors = []
	const warnings = []

	if (!fs.existsSync(pkgJsonPath)) {
		errors.push('Package.json not found')
		return { errors, warnings }
	}

	const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))

	// Check if private
	if (pkg.private === true) {
		warnings.push(`Package is marked as private and won't be published`)
	}

	// Check required fields
	for (const field of REQUIRED_FIELDS) {
		if (!pkg[field]) {
			errors.push(`Missing required field: ${field}`)
		}
	}

	// Check for main or exports
	if (!pkg.main && !pkg.exports) {
		errors.push('Missing main or exports field')
	}

	// Check for dist folder
	const distPath = path.join(process.cwd(), packagePath, 'dist')
	if (!fs.existsSync(distPath)) {
		errors.push('dist folder not found - package not built')
	} else {
		// Check if dist is not empty
		const distFiles = fs.readdirSync(distPath)
		if (distFiles.length === 0) {
			errors.push('dist folder is empty')
		}
	}

	// Check for workspace dependencies
	const checkWorkspaceDeps = (deps, depType) => {
		if (!deps) return
		for (const [name, version] of Object.entries(deps)) {
			if (version.startsWith('workspace:')) {
				warnings.push(
					`${depType} has workspace dependency: ${name} (will be converted during publish)`,
				)
			}
		}
	}

	checkWorkspaceDeps(pkg.dependencies, 'dependencies')
	checkWorkspaceDeps(pkg.devDependencies, 'devDependencies')
	checkWorkspaceDeps(pkg.peerDependencies, 'peerDependencies')

	// Check repository field
	if (!pkg.repository) {
		warnings.push('Missing repository field')
	}

	// Check keywords
	if (!pkg.keywords || pkg.keywords.length === 0) {
		warnings.push('No keywords defined')
	}

	return { errors, warnings }
}

function main() {
	console.log('🔍 Validating packages for publishing...\n')

	let hasErrors = false
	const results = []

	for (const packagePath of PACKAGES) {
		const pkgJsonPath = path.join(process.cwd(), packagePath, 'package.json')
		const pkg = fs.existsSync(pkgJsonPath)
			? JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
			: { name: packagePath }

		const { errors, warnings } = validatePackage(packagePath)

		results.push({
			name: pkg.name || packagePath,
			path: packagePath,
			errors,
			warnings,
		})

		if (errors.length > 0) {
			hasErrors = true
			console.log(`❌ ${pkg.name}`)
			for (const error of errors) {
				console.log(`   ✗ ${error}`)
			}
		} else if (warnings.length > 0) {
			console.log(`⚠️  ${pkg.name}`)
			for (const warning of warnings) {
				console.log(`   ⚠ ${warning}`)
			}
		} else {
			console.log(`✅ ${pkg.name}`)
		}

		if (errors.length > 0 || warnings.length > 0) {
			console.log('')
		}
	}

	// Summary
	console.log('📊 Validation Summary:')
	const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0)
	const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0)
	const successCount = results.filter(
		(r) => r.errors.length === 0 && r.warnings.length === 0,
	).length

	console.log(`   ✅ Valid: ${successCount}`)
	console.log(`   ⚠️  Warnings: ${warningCount}`)
	console.log(`   ❌ Errors: ${errorCount}`)

	if (hasErrors) {
		console.log('\n❌ Some packages have errors. Fix them before publishing.')
		console.log('\n💡 Common fixes:')
		console.log('   - Run: bun run build')
		console.log('   - Run: bun run prepare-publish')
		console.log('   - Check package.json has required fields')
		process.exit(1)
	} else {
		console.log('\n✅ All packages are ready for publishing!')
		console.log('\n💡 Next steps:')
		console.log('   1. Bump version: bun run bump:patch (or minor/major)')
		console.log(
			'   2. Commit changes: git add . && git commit -m "chore: release vX.Y.Z"',
		)
		console.log('   3. Create tag: git tag vX.Y.Z')
		console.log('   4. Push: git push origin main --tags')
		process.exit(0)
	}
}

main()
