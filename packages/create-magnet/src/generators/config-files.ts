import type { ProjectConfig } from '../types.js'

export function generateTsconfig(): string {
	return JSON.stringify(
		{
			compilerOptions: {
				module: 'commonjs',
				declaration: true,
				removeComments: true,
				emitDecoratorMetadata: true,
				experimentalDecorators: true,
				allowSyntheticDefaultImports: true,
				target: 'ES2021',
				sourceMap: true,
				outDir: './dist',
				baseUrl: './',
				incremental: true,
				skipLibCheck: true,
				strictNullChecks: true,
				noImplicitAny: true,
				strictBindCallApply: true,
				forceConsistentCasingInFileNames: true,
				noFallthroughCasesInSwitch: true,
				paths: {
					'~/*': ['src/*'],
				},
			},
		},
		null,
		2,
	)
}

export function generateTsconfigBuild(): string {
	return JSON.stringify(
		{
			extends: './tsconfig.json',
			exclude: ['node_modules', 'dist', 'test', '**/*spec.ts'],
		},
		null,
		2,
	)
}

export function generateNestCliJson(): string {
	return JSON.stringify(
		{
			$schema: 'https://json.schemastore.org/nest-cli',
			collection: '@nestjs/schematics',
			sourceRoot: 'src',
			compilerOptions: {
				deleteOutDir: true,
			},
		},
		null,
		2,
	)
}

export function generateBiomeJson(): string {
	return JSON.stringify(
		{
			$schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
			vcs: {
				enabled: true,
				clientKind: 'git',
				useIgnoreFile: true,
			},
			organizeImports: {
				enabled: true,
			},
			formatter: {
				enabled: true,
				indentStyle: 'tab',
				indentWidth: 2,
				lineWidth: 100,
			},
			linter: {
				enabled: true,
				rules: {
					recommended: true,
					correctness: {
						noUnusedImports: 'error',
						noUnusedVariables: 'error',
					},
					style: {
						noNonNullAssertion: 'off',
					},
				},
			},
			javascript: {
				formatter: {
					quoteStyle: 'single',
					semicolons: 'asNeeded',
				},
			},
		},
		null,
		2,
	)
}

export function generateEnvExample(config: ProjectConfig): string {
	const { database, storage } = config

	const lines: string[] = [
		'# Application',
		'NODE_ENV=development',
		'PORT=3000',
		'',
	]

	// Database
	lines.push('# Database')
	if (database === 'mongoose') {
		lines.push('MONGODB_URI=mongodb://localhost:27017/my-app')
	} else if (database === 'drizzle-neon') {
		lines.push('DATABASE_URL=postgres://user:password@host/database')
	} else if (database === 'drizzle-supabase') {
		lines.push('DATABASE_URL=postgres://user:password@host/database')
		lines.push('')
		lines.push('# Supabase')
		lines.push('SUPABASE_URL=https://your-project.supabase.co')
		lines.push('SUPABASE_ANON_KEY=your-anon-key')
		lines.push('SUPABASE_SERVICE_KEY=your-service-key')
	}
	lines.push('')

	// JWT
	lines.push('# Authentication')
	lines.push('JWT_SECRET=your-super-secret-jwt-key-change-in-production')
	lines.push('')

	// Storage
	if (storage !== 'none') {
		lines.push('# Storage')
		if (storage === 's3') {
			lines.push('S3_BUCKET=your-bucket-name')
			lines.push('S3_REGION=us-east-1')
			lines.push('S3_ACCESS_KEY_ID=your-access-key')
			lines.push('S3_SECRET_ACCESS_KEY=your-secret-key')
		} else if (storage === 'r2') {
			lines.push('R2_BUCKET=your-bucket-name')
			lines.push('R2_ACCOUNT_ID=your-account-id')
			lines.push('R2_ACCESS_KEY_ID=your-access-key')
			lines.push('R2_SECRET_ACCESS_KEY=your-secret-key')
		} else if (storage === 'supabase') {
			lines.push('SUPABASE_STORAGE_BUCKET=media')
		}
		lines.push('')
	}

	return lines.join('\n')
}

export function generateGitignore(): string {
	return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/

# Uploads (if using local storage)
uploads/

# Misc
*.tsbuildinfo
`
}

export function generateReadme(config: ProjectConfig): string {
	const { projectName, database, packageManager } = config
	const runCmd = packageManager === 'npm' ? 'npm run' : packageManager

	let dbSetupInstructions = ''
	if (database === 'mongoose') {
		dbSetupInstructions = `### Start MongoDB

\`\`\`bash
${runCmd} docker:up
\`\`\`

This starts a MongoDB instance at \`mongodb://localhost:27017/${projectName}\`.`
	} else if (database === 'drizzle-neon') {
		dbSetupInstructions = `### Database Setup (Neon)

1. Create a project at [Neon](https://neon.tech)
2. Copy the connection string to your \`.env\` file
3. The database schema will be auto-created on first run`
	} else if (database === 'drizzle-supabase') {
		dbSetupInstructions = `### Database Setup (Supabase)

1. Create a project at [Supabase](https://supabase.com)
2. Copy your project URL and keys to the \`.env\` file
3. The database schema will be auto-created on first run`
	}

	return `# ${projectName}

A headless CMS built with [Magnet CMS](https://github.com/magnet-cms/magnet) and NestJS.

## Getting Started

### Prerequisites

- Node.js 18+
- ${database === 'mongoose' ? 'Docker (for MongoDB)' : 'A database connection'}

### Installation

\`\`\`bash
# Install dependencies
${packageManager} install

# Copy environment variables
cp .env.example .env
\`\`\`

${dbSetupInstructions}

### Development

\`\`\`bash
${runCmd} dev
\`\`\`

The API will be available at \`http://localhost:3000\`.

### Admin UI

The Magnet Admin UI runs at \`http://localhost:3001\` when started separately.

## Scripts

| Script | Description |
|--------|-------------|
| \`${runCmd} dev\` | Start development server |
| \`${runCmd} build\` | Build for production |
| \`${runCmd} start:prod\` | Start production server |
| \`${runCmd} docker:up\` | Start database container |
| \`${runCmd} docker:down\` | Stop database container |

## Project Structure

\`\`\`
src/
├── app.module.ts     # Root application module
├── main.ts           # Application entry point
└── modules/          # Feature modules
    └── items/        # Example module
\`\`\`

## Learn More

- [Magnet CMS Documentation](https://magnet-cms.dev/docs)
- [NestJS Documentation](https://docs.nestjs.com)
`
}
