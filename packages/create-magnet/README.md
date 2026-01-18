# create-magnet

CLI tool to scaffold new [Magnet CMS](https://github.com/magnet-cms/magnet) projects.

## Usage

```bash
# Using npx
npx create-magnet my-project

# Using bunx
bunx create-magnet my-project

# Using pnpm
pnpm create magnet my-project

# Using yarn
yarn create magnet my-project
```

## Interactive Mode

When run without arguments, the CLI will guide you through project setup:

```bash
npx create-magnet
```

You'll be prompted to select:

- **Project name** - The name/directory for your project
- **Database adapter** - Choose from:
  - Mongoose (MongoDB)
  - Drizzle + Neon (PostgreSQL)
  - Drizzle + Supabase (PostgreSQL)
- **Plugins** - Optional plugins to include:
  - Content Builder - Visual schema builder
  - SEO - SEO management
- **Storage adapter** - File storage option:
  - Local filesystem
  - AWS S3
  - Cloudflare R2
  - Supabase Storage
- **Example module** - Whether to include a sample module
- **Package manager** - npm, bun, pnpm, or yarn

## CLI Options

```bash
Usage: create-magnet [options] [project-name]

Create a new Magnet CMS project

Arguments:
  project-name              Name of the project

Options:
  -V, --version             output the version number
  -d, --database <adapter>  Database adapter (mongoose, drizzle-neon, drizzle-supabase)
  --no-install              Skip dependency installation
  --no-example              Skip example module
  -h, --help                display help for command
```

## Examples

```bash
# Create a project with all defaults (interactive)
npx create-magnet

# Create a project with a specific name
npx create-magnet my-cms

# Create a project with Mongoose and skip install
npx create-magnet my-cms --database mongoose --no-install

# Create a minimal project without example module
npx create-magnet my-cms --no-example
```

## Generated Project Structure

```
my-project/
├── src/
│   ├── app.module.ts         # Root module with MagnetModule
│   ├── main.ts               # Application entry point
│   └── modules/
│       └── items/            # Example module (if included)
│           ├── dto/
│           ├── schemas/
│           ├── items.controller.ts
│           ├── items.module.ts
│           └── items.service.ts
├── docker/
│   └── docker-compose.yml    # Local database setup
├── .env.example              # Environment variables template
├── .gitignore
├── biome.json
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
└── tsconfig.json
```

## Getting Started After Creation

```bash
cd my-project

# Copy environment variables
cp .env.example .env

# Start the database
npm run docker:up    # or: bun run docker:up

# Start development server
npm run dev          # or: bun run dev
```

## License

MIT
