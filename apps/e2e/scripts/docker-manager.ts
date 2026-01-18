#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-expect-error - Bun-specific import
import { $ } from 'bun'

// @ts-expect-error - Bun-specific import.meta.dir
const __dirname = import.meta.dir ?? dirname(fileURLToPath(import.meta.url))

const examples = {
	mongoose: {
		composeFile: resolve(
			__dirname,
			'../../examples/mongoose/docker/docker-compose.yml',
		),
		port: 27017,
		service: 'mongodb',
	},
	'drizzle-neon': {
		composeFile: resolve(
			__dirname,
			'../../examples/drizzle-neon/docker/docker-compose.yml',
		),
		port: 5433,
		service: 'postgres',
	},
	'drizzle-supabase': {
		composeFile: resolve(
			__dirname,
			'../../examples/drizzle-supabase/docker/docker-compose.yml',
		),
		port: 5432,
		service: 'drizzle-supabase-db',
	},
} as const

type ExampleName = keyof typeof examples

async function checkDocker(): Promise<boolean> {
	try {
		await $`docker --version`.quiet()
		return true
	} catch {
		console.error('Docker is not installed or not in PATH')
		return false
	}
}

async function checkDockerCompose(): Promise<boolean> {
	try {
		await $`docker compose version`.quiet()
		return true
	} catch {
		console.error('Docker Compose is not installed or not in PATH')
		return false
	}
}

async function startTemplate(template: ExampleName): Promise<void> {
	const config = examples[template]

	if (!existsSync(config.composeFile)) {
		throw new Error(`Docker compose file not found: ${config.composeFile}`)
	}

	console.log(`Starting Docker containers for ${template}...`)
	await $`docker compose -f ${config.composeFile} up -d`.quiet()

	// Wait for service to be healthy
	console.log(`Waiting for ${config.service} to be ready...`)
	let attempts = 0
	// PostgreSQL needs more time, especially for Supabase
	const maxAttempts =
		template === 'drizzle-supabase'
			? 60
			: template.includes('postgres') || template.includes('drizzle')
				? 45
				: 30

	while (attempts < maxAttempts) {
		try {
			if (config.service === 'mongodb') {
				// Check MongoDB
				const containerName = `${template}-${config.service}`
				await $`docker exec ${containerName} mongosh --eval "db.adminCommand('ping')"`.quiet()
				console.log(`${template} MongoDB is ready!`)
				return
			}
			if (
				config.service === 'postgres' ||
				config.service.includes('postgres') ||
				config.service.includes('db')
			) {
				// Check PostgreSQL - use proper container name
				let containerName = config.service
				if (template === 'drizzle-supabase') {
					containerName = 'drizzle-supabase-db'
				} else if (template === 'drizzle-neon') {
					containerName = `${template}-postgres`
				} else {
					containerName = `${template}-${config.service}`
				}
				await $`docker exec ${containerName} pg_isready -U postgres`.quiet()
				console.log(`${template} PostgreSQL is ready!`)
				return
			}
		} catch {
			attempts++
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
	}

	throw new Error(
		`${template} ${config.service} did not become ready within ${maxAttempts} seconds`,
	)
}

async function stopTemplate(template: ExampleName): Promise<void> {
	const config = examples[template]

	if (!existsSync(config.composeFile)) {
		return
	}

	console.log(`Stopping Docker containers for ${template}...`)
	await $`docker compose -f ${config.composeFile} down`.quiet()
}

async function stopAllTemplates(): Promise<void> {
	console.log('Stopping all example Docker containers...')
	for (const template of Object.keys(examples) as ExampleName[]) {
		await stopTemplate(template).catch(() => {
			// Ignore errors if containers aren't running
		})
	}
}

async function main() {
	const command = process.argv[2]
	const template = process.argv[3] as ExampleName | undefined

	if (!(await checkDocker()) || !(await checkDockerCompose())) {
		process.exit(1)
	}

	switch (command) {
		case 'start':
			if (!template || !(template in examples)) {
				console.error('Usage: bun docker-manager.ts start <example>')
				console.error(`Available examples: ${Object.keys(examples).join(', ')}`)
				process.exit(1)
			}
			await startTemplate(template)
			break

		case 'stop':
			if (!template || !(template in examples)) {
				console.error('Usage: bun docker-manager.ts stop <example>')
				console.error(`Available examples: ${Object.keys(examples).join(', ')}`)
				process.exit(1)
			}
			await stopTemplate(template)
			break

		case 'stop-all':
			await stopAllTemplates()
			break

		default:
			console.error(
				'Usage: bun docker-manager.ts <start|stop|stop-all> [example]',
			)
			process.exit(1)
	}
}

// @ts-expect-error - Bun-specific import.meta.main
if (import.meta.main) {
	main().catch((error) => {
		console.error('Error:', error.message)
		process.exit(1)
	})
}

export { startTemplate, stopTemplate, stopAllTemplates, examples }
