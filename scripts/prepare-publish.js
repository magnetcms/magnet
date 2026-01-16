#!/usr/bin/env node

/**
 * Script to prepare packages for publishing to npm
 * This script will:
 * 1. Update package.json files to set private: false
 * 2. Add necessary metadata (repository, license, keywords)
 * 3. Validate package configurations
 */

const fs = require('node:fs')
const path = require('node:path')

const PACKAGES_TO_PUBLISH = [
	'packages/common',
	'packages/core',
	'packages/utils',
	'packages/client/admin',
	'packages/client/ui',
	'packages/adapters/mongoose',
	'packages/plugins/seo',
	'packages/plugins/content-builder',
]

const DEFAULT_METADATA = {
	repository: {
		type: 'git',
		url: 'https://github.com/magnet/magnet.git',
	},
	license: 'MIT',
	keywords: ['magnet', 'cms', 'nestjs', 'content-management'],
	homepage: 'https://github.com/magnet/magnet',
	bugs: {
		url: 'https://github.com/magnet/magnet/issues',
	},
}

function updatePackageJson(packagePath) {
	const pkgJsonPath = path.join(process.cwd(), packagePath, 'package.json')

	if (!fs.existsSync(pkgJsonPath)) {
		console.error(`❌ Package not found: ${packagePath}`)
		return false
	}

	const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))

	// Update private flag
	pkg.private = false

	// Update repository with directory
	pkg.repository = {
		...DEFAULT_METADATA.repository,
		directory: packagePath,
	}

	// Add other metadata if missing
	if (!pkg.license) {
		pkg.license = DEFAULT_METADATA.license
	}

	if (!pkg.keywords || pkg.keywords.length === 0) {
		pkg.keywords = [...DEFAULT_METADATA.keywords]

		// Add package-specific keywords
		const pkgName = pkg.name.replace('@magnet/', '')
		if (pkgName.includes('adapter')) {
			pkg.keywords.push('adapter', 'database')
		} else if (pkgName.includes('plugin')) {
			pkg.keywords.push('plugin')
		} else if (pkgName === 'admin') {
			pkg.keywords.push('admin', 'dashboard', 'react')
		} else if (pkgName === 'ui') {
			pkg.keywords.push('ui', 'components', 'react', 'shadcn')
		}
	}

	if (!pkg.homepage) {
		pkg.homepage = DEFAULT_METADATA.homepage
	}

	if (!pkg.bugs) {
		pkg.bugs = DEFAULT_METADATA.bugs
	}

	// Validate required fields
	if (!pkg.name || !pkg.version) {
		console.error(`❌ Package ${packagePath} is missing name or version`)
		return false
	}

	// Validate exports/main
	if (!pkg.main && !pkg.exports) {
		console.error(`❌ Package ${packagePath} is missing main or exports field`)
		return false
	}

	// Write updated package.json
	fs.writeFileSync(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)

	console.log(`✅ Updated ${pkg.name} (${packagePath})`)
	return true
}

function main() {
	console.log('🚀 Preparing packages for publishing...\n')

	let success = true
	for (const packagePath of PACKAGES_TO_PUBLISH) {
		if (!updatePackageJson(packagePath)) {
			success = false
		}
	}

	console.log('\n📦 Package preparation summary:')
	console.log(`   Total packages: ${PACKAGES_TO_PUBLISH.length}`)

	if (success) {
		console.log('   ✅ All packages updated successfully!')
		console.log('\n💡 Next steps:')
		console.log('   1. Review the changes in package.json files')
		console.log('   2. Update version numbers if needed')
		console.log('   3. Commit the changes')
		console.log('   4. Create a git tag: git tag v0.0.1')
		console.log('   5. Push the tag: git push origin v0.0.1')
		console.log('   6. Or manually trigger the workflow from GitHub Actions')
		process.exit(0)
	} else {
		console.log('   ❌ Some packages failed to update')
		process.exit(1)
	}
}

main()
