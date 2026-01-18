import type { ProjectConfig } from '../types.js'

export function generateDockerCompose(config: ProjectConfig): string {
	const { database, projectName } = config

	if (database === 'mongoose') {
		return generateMongoDockerCompose(projectName)
	}

	// For Drizzle/Neon/Supabase, no local Docker needed by default
	return generatePostgresDockerCompose(projectName)
}

function generateMongoDockerCompose(projectName: string): string {
	const containerName = projectName.replace(/[^a-z0-9-]/gi, '-')

	return `services:
  mongodb:
    image: mongo:7.0
    container_name: ${containerName}-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: ${projectName}
    volumes:
      - mongodb-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongodb-data:
`
}

function generatePostgresDockerCompose(projectName: string): string {
	const containerName = projectName.replace(/[^a-z0-9-]/gi, '-')

	return `# Note: If using Neon or Supabase, you may not need this local database.
# This is provided for local development purposes.

services:
  postgres:
    image: postgres:16
    container_name: ${containerName}-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${projectName}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
`
}
