# Magnet CMS

A modern, headless CMS framework built on NestJS. Magnet provides a flexible architecture for building content management systems with a powerful admin UI and extensible plugin system.

![Magnet CMS Demo](docs/assets/magnet-demo.gif)

## Features

- **NestJS Core**: Built on the robust NestJS framework for enterprise-grade applications
- **Database Agnostic**: Supports multiple databases via adapters (Mongoose, Drizzle ORM)
- **Modern Admin UI**: Beautiful React-based admin interface with comprehensive content management
- **Plugin System**: Extend functionality with plugins like Content Builder and SEO
- **TypeScript First**: Full TypeScript support throughout the entire stack
- **Schema Discovery**: Automatic schema detection and metadata extraction
- **Authentication**: Built-in JWT authentication with guards and strategies
- **Monorepo Architecture**: Turborepo-based workspace for efficient development
- **Comprehensive Testing**: E2E testing with Playwright

## Prerequisites

- **Bun** 1.2.2 or later (recommended) or Node.js 18+
- **Database** (choose one):
  - **MongoDB** 6.0+ (for Mongoose adapter)
  - **PostgreSQL**, **MySQL**, or **SQLite** (for Drizzle adapter)
  - **Supabase** (for Supabase adapter with auth and storage)
- A terminal and code editor

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd magnet

# Install dependencies
bun install

# Start development
bun run dev

# Start admin UI only
bun run dev:admin
```

## Package Overview

### Core Packages

| Package | Description |
|---------|-------------|
| `@magnet-cms/core` | Core NestJS module with Admin, Auth, Content, and Database modules |
| `@magnet-cms/common` | Shared types, decorators, and utilities |
| `@magnet-cms/utils` | Utility functions and helpers |

### Adapters

| Package | Description |
|---------|-------------|
| `@magnet-cms/adapter-mongoose` | Mongoose database adapter with schema decorators for MongoDB |
| `@magnet-cms/adapter-drizzle` | Drizzle ORM adapter supporting PostgreSQL, MySQL, and SQLite |
| `@magnet-cms/adapter-supabase` | Supabase adapter providing auth strategy and storage adapter |

### Client Packages

| Package | Description |
|---------|-------------|
| `@magnet-cms/admin` | React-based admin UI application |
| `@magnet-cms/ui` | Shared UI component library (shadcn/ui based) |

### Plugins

| Package | Description |
|---------|-------------|
| `@magnet-cms/plugin-content-builder` | Visual content builder plugin |
| `@magnet-cms/plugin-seo` | SEO management plugin |

## Project Structure

```
magnet/
├── apps/
│   ├── e2e/               # End-to-end tests (Playwright)
│   └── templates/         # Project templates and examples
│       ├── drizzle-neon/       # Drizzle + Neon PostgreSQL template
│       ├── drizzle-supabase/   # Drizzle + Supabase template
│       ├── mongoose-auth/      # Mongoose + Auth strategy template
│       └── mongoose-cats/      # Mongoose + Cats example template
├── packages/
│   ├── adapters/
│   │   ├── drizzle/       # Drizzle ORM database adapter
│   │   ├── mongoose/      # Mongoose database adapter
│   │   └── supabase/      # Supabase adapter (auth & storage)
│   ├── client/
│   │   ├── admin/         # Admin UI application
│   │   └── ui/            # Shared UI component library (shadcn/ui based)
│   ├── common/            # Shared types, decorators, and utilities
│   ├── core/              # Core Magnet framework (NestJS modules)
│   ├── plugins/
│   │   ├── content-builder/   # Visual content builder plugin
│   │   └── seo/               # SEO management plugin
│   ├── tooling/           # Shared build and config tools
│   │   ├── biome/         # Biome linting configuration
│   │   ├── tsup/          # tsup build configuration
│   │   └── typescript/    # TypeScript configurations
│   └── utils/             # Utility functions
├── docs/                  # Documentation assets
├── scripts/               # Development scripts
└── package.json
```

## Available Scripts

```bash
# Development
bun run dev              # Start all packages in development mode
bun run dev:admin        # Start admin UI development server
bun run dev:docs         # Start documentation site

# Building
bun run build            # Build all packages

# Code Quality
bun run lint             # Lint all packages
bun run check-types      # TypeScript type checking

# Testing
bun run test:e2e         # Run end-to-end tests
```

## Getting Started with Magnet

### Installation

Install Magnet in your NestJS project:

```bash
# For MongoDB (Mongoose adapter)
bun add @magnet-cms/core @magnet-cms/common @magnet-cms/adapter-mongoose

# For PostgreSQL/MySQL/SQLite (Drizzle adapter)
bun add @magnet-cms/core @magnet-cms/common @magnet-cms/adapter-drizzle drizzle-orm

# For Supabase
bun add @magnet-cms/core @magnet-cms/common @magnet-cms/adapter-drizzle @magnet-cms/adapter-supabase
```

### Basic Configuration

#### MongoDB (Mongoose)

Configure Magnet with Mongoose adapter in your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common'
import { MagnetModule } from '@magnet-cms/core'

@Module({
  imports: [
    MagnetModule.forRoot({
      db: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/magnet',
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      },
    }),
  ],
})
export class AppModule {}
```

#### PostgreSQL/MySQL/SQLite (Drizzle)

Configure Magnet with Drizzle adapter:

```typescript
import { Module } from '@nestjs/common'
import { MagnetModule } from '@magnet-cms/core'

@Module({
  imports: [
    MagnetModule.forRoot({
      db: {
        connectionString: process.env.DATABASE_URL,
        dialect: 'postgresql', // or 'mysql', 'sqlite'
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      },
    }),
  ],
})
export class AppModule {}
```

#### Supabase

Configure Magnet with Supabase adapter:

```typescript
import { Module } from '@nestjs/common'
import { MagnetModule } from '@magnet-cms/core'

@Module({
  imports: [
    MagnetModule.forRoot({
      db: {
        connectionString: process.env.SUPABASE_DATABASE_URL,
        dialect: 'postgresql',
      },
      jwt: {
        secret: process.env.SUPABASE_JWT_SECRET,
      },
      // Supabase adapter provides auth and storage
    }),
  ],
})
export class AppModule {}
```

### Creating a Schema

Use decorators to define your content models:

```typescript
import { Schema, Prop } from '@magnet-cms/common'

@Schema()
export class Cat {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  age: number

  @Prop()
  breed?: string
}
```

## Documentation

Comprehensive documentation is available at the `/apps/docs` directory or by running:

```bash
bun run dev:docs
```

Visit the documentation to learn more about:

- Installation and setup
- Core concepts
- Creating schemas
- Using adapters
- Building plugins
- Admin UI customization
- API reference

## Development

### Setup Development Environment

1. Clone the repository
2. Install dependencies: `bun install`
3. Start development: `bun run dev`

### Running the Example Templates

```bash
# MongoDB example
cd apps/templates/mongoose-cats
bun install
bun run start:dev

# Neon PostgreSQL example
cd apps/templates/drizzle-neon
bun install
bun run dev

# Supabase example
cd apps/templates/drizzle-supabase
bun install
bun run dev

# Auth strategy example
cd apps/templates/mongoose-auth
bun install
bun run start:dev
```

### Building Packages

```bash
# Build all packages
bun run build

# Build specific package
cd packages/core
bun run build
```

## Technology Stack

- **Runtime**: Bun / Node.js
- **Framework**: NestJS
- **Frontend**: React + Vite
- **UI Components**: shadcn/ui
- **Databases**: 
  - MongoDB (via Mongoose adapter)
  - PostgreSQL / MySQL / SQLite (via Drizzle ORM adapter)
  - Supabase (via Supabase adapter)
- **Build Tool**: Turborepo + tsup
- **Testing**: Playwright
- **Documentation**: Next.js + Fumadocs
- **Code Quality**: Biome + TypeScript

## Monorepo Tools

- **Package Manager**: Bun workspaces
- **Build System**: Turborepo
- **Bundler**: tsup (for libraries), Vite (for apps)
- **Linter/Formatter**: Biome

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- How to report bugs
- How to suggest features
- Development setup and guidelines
- Coding standards and conventions
- Pull request process

## License

Magnet CMS is licensed under the [MIT License](LICENSE). See the LICENSE file for details.
