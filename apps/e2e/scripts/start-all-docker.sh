#!/bin/bash
# Start Docker containers for all examples

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "🐳 Starting Docker containers for all examples..."
echo ""

EXAMPLES=("mongoose" "drizzle-neon" "drizzle-supabase")

for example in "${EXAMPLES[@]}"; do
    echo "Starting $example..."
    cd "$ROOT_DIR/apps/examples/$example"
    if [ -f "docker/docker-compose.yml" ]; then
        docker compose -f docker/docker-compose.yml up -d
        echo "✅ $example Docker containers started"
    else
        echo "⚠️  No Docker setup found for $example"
    fi
done

echo ""
echo "✅ All Docker containers started!"
echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "📋 Connection strings:"
echo "  mongoose:         mongodb://localhost:27017/cats-example"
echo "  drizzle-neon:     postgresql://postgres:postgres@localhost:5433/neon-example"
echo "  drizzle-supabase: postgresql://postgres:postgres@localhost:5432/postgres"
echo ""
echo "🧪 To test a specific example:"
echo "  1. Set the appropriate environment variables"
echo "  2. Start backend: cd apps/examples/<example> && bun run dev"
echo "  3. Start frontend: cd packages/client/admin && bun run dev"
echo "  4. Run tests: cd apps/e2e && bun run test"
echo ""
