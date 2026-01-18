# E2E Tests

End-to-end tests for Magnet CMS covering all examples and database adapters.

## Prerequisites

- Docker and Docker Compose installed
- Bun runtime
- Backend and frontend servers (started via `bun run dev:admin`)

## Quick Start

### Run All Tests

```bash
# Start all Docker containers
bun run docker:start-all

# Or use the setup script
./scripts/setup-test-env.sh

# Run tests
bun run test
```

### Test Specific Example

```bash
# Start Docker for a specific example
bun run docker:start mongoose

# Run tests (servers should be running)
bun run test
```

## Available Examples

- `mongoose` - MongoDB with example content schemas
- `drizzle-neon` - PostgreSQL (Drizzle ORM) with Neon driver
- `drizzle-supabase` - Full Supabase stack (PostgreSQL + Auth + Storage)

## Docker Management

### Start Docker Containers

```bash
# Start all examples
bun run docker:stop-all

# Start specific template
bun run docker:start mongoose
```

### Stop Docker Containers

```bash
# Stop all examples
bun run docker:stop-all

# Stop specific template
bun run docker:stop mongoose
```

### Using Shell Scripts

```bash
# Setup (start all containers)
./scripts/setup-test-env.sh

# Teardown (stop all containers)
./scripts/teardown-test-env.sh

# Setup specific template
./scripts/setup-test-env.sh mongoose
```

## Test Scripts

- `bun run test` - Run all tests
- `bun run test:api` - Run API tests only
- `bun run test:ui` - Run UI tests only
- `bun run test:headed` - Run tests in headed mode
- `bun run test:debug` - Run tests in debug mode
- `bun run test:report` - Show test report

## Example-Specific Testing

Each example has its own Docker setup:

### mongoose

- **Database**: MongoDB
- **Port**: 27017
- **Connection**: `mongodb://localhost:27017/cats-example`

### drizzle-neon

- **Database**: PostgreSQL
- **Port**: 5433
- **Connection**: `postgresql://postgres:postgres@localhost:5433/neon-example`

### drizzle-supabase

- **Database**: Full Supabase stack
- **Ports**: 5432 (PostgreSQL), 8000 (Kong), 3010 (Studio)
- **Connection**: `postgresql://postgres:postgres@localhost:5432/postgres`

## Environment Variables

Tests automatically set the correct environment variables for each example. You can override them:

```bash
MONGODB_URI=mongodb://localhost:27017/cats-example \
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/neon-example \
bun run test
```

## CI/CD

For CI environments, use the setup scripts:

```yaml
# Example GitHub Actions
- name: Setup test environment
  run: ./apps/e2e/scripts/setup-test-env.sh

- name: Run tests
  run: cd apps/e2e && bun run test

- name: Teardown
  run: ./apps/e2e/scripts/teardown-test-env.sh
```

## Troubleshooting

### Docker containers not starting

```bash
# Check Docker is running
docker ps

# Check container logs
docker compose -f apps/examples/mongoose/docker/docker-compose.yml logs
```

### Port conflicts

If you have existing databases running, the examples use different ports:
- mongoose: 27017
- drizzle-neon: 5433
- drizzle-supabase: 5432

### Tests failing

1. Ensure Docker containers are running and healthy
2. Ensure backend server is running (`bun run dev:admin`)
3. Check server logs for errors
4. Verify environment variables are set correctly
