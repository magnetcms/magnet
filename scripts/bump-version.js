#!/usr/bin/env node

/**
 * Script to bump version across all publishable packages
 * Usage: node scripts/bump-version.js <major|minor|patch|version>
 * Examples:
 *   node scripts/bump-version.js patch    # 0.0.1 -> 0.0.2
 *   node scripts/bump-version.js minor    # 0.0.1 -> 0.1.0
 *   node scripts/bump-version.js major    # 0.0.1 -> 1.0.0
 *   node scripts/bump-version.js 1.2.3    # set to specific version
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

function parseVersion(version) {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/)
	if (!match) {
		throw new Error(`Invalid version format: ${version}`)
	}
	return {
		major: Number.parseInt(match[1], 10),
		minor: Number.parseInt(match[2], 10),
		patch: Number.parseInt(match[3], 10),
		suffix: match[4],
	}
}

function bumpVersion(currentVersion, bumpType) {
	// If bumpType is a specific version, use it
	if (/^\d+\.\d+\.\d+/.test(bumpType)) {
		return bumpType
	}

	const { major, minor, patch, suffix } = parseVersion(currentVersion)

	switch (bumpType) {
		case 'major':
			return `${major + 1}.0.0${suffix}`
		case 'minor':
			return `${major}.${minor + 1}.0${suffix}`
		case 'patch':
			return `${major}.${minor}.${patch + 1}${suffix}`
		default:
			throw new Error(
				`Invalid bump type: ${bumpType}. Use major, minor, patch, or a specific version.`,
			)
	}
}

function updatePackageVersion(packagePath, newVersion) {
	const pkgJsonPath = path.join(process.cwd(), packagePath, 'package.json')

	if (!fs.existsSync(pkgJsonPath)) {
		console.error(`❌ Package not found: ${packagePath}`)
		return null
	}

	const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
	const oldVersion = pkg.version

	pkg.version = newVersion

	fs.writeFileSync(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)

	console.log(`✅ ${pkg.name}: ${oldVersion} -> ${newVersion}`)
	return { name: pkg.name, oldVersion, newVersion }
}

function main() {
	const args = process.argv.slice(2)

	if (args.length === 0) {
		console.error('❌ Error: Please specify version bump type or version')
		console.error('\nUsage:')
		console.error('  node scripts/bump-version.js <major|minor|patch|version>')
		console.error('\nExamples:')
		console.error('  node scripts/bump-version.js patch    # 0.0.1 -> 0.0.2')
		console.error('  node scripts/bump-version.js minor    # 0.0.1 -> 0.1.0')
		console.error('  node scripts/bump-version.js major    # 0.0.1 -> 1.0.0')
		console.error('  node scripts/bump-version.js 1.2.3    # set to 1.2.3')
		process.exit(1)
	}

	const bumpType = args[0]

	// Get current version from first package
	const firstPkgPath = path.join(process.cwd(), PACKAGES[0], 'package.json')
	const firstPkg = JSON.parse(fs.readFileSync(firstPkgPath, 'utf8'))
	const currentVersion = firstPkg.version

	let newVersion
	try {
		newVersion = bumpVersion(currentVersion, bumpType)
	} catch (error) {
		console.error(`❌ ${error.message}`)
		process.exit(1)
	}

	console.log(`🚀 Bumping version: ${currentVersion} -> ${newVersion}\n`)

	const updates = []
	for (const packagePath of PACKAGES) {
		const result = updatePackageVersion(packagePath, newVersion)
		if (result) {
			updates.push(result)
		}
	}

	console.log('\n📦 Version bump summary:')
	console.log(`   Updated ${updates.length} packages to version ${newVersion}`)
	console.log('\n💡 Next steps:')
	console.log('   1. Review the changes')
	console.log(
		`   2. Commit: git add . && git commit -m "chore: bump version to v${newVersion}"`,
	)
	console.log(`   3. Tag: git tag v${newVersion}`)
	console.log('   4. Push: git push origin main --tags')
}

main()
