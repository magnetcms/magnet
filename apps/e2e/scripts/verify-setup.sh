#!/bin/bash
# Verify Docker setup for all examples

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

EXAMPLES=("mongoose" "drizzle-neon" "drizzle-supabase")

echo "🔍 Verifying Docker Setup for All Examples"
echo "==========================================="
echo ""

ALL_READY=true

for example in "${EXAMPLES[@]}"; do
    echo "Checking $example..."
    
    cd "$ROOT_DIR/apps/examples/$example"
    
    if [ -f "docker/docker-compose.yml" ]; then
        # Check if containers are running
        if docker compose -f docker/docker-compose.yml ps | grep -q "Up"; then
            echo "  ✅ Docker containers are running"
            
            # Check specific service health
            case $example in
                "mongoose")
                    if docker exec "${example}-mongodb" mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
                        echo "  ✅ MongoDB is healthy"
                    else
                        echo "  ⚠️  MongoDB may not be ready"
                        ALL_READY=false
                    fi
                    ;;
                "drizzle-neon")
                    if docker exec "${example}-postgres" pg_isready -U postgres > /dev/null 2>&1; then
                        echo "  ✅ PostgreSQL is healthy"
                    else
                        echo "  ⚠️  PostgreSQL may not be ready"
                        ALL_READY=false
                    fi
                    ;;
                "drizzle-supabase")
                    if docker exec "drizzle-supabase-db" pg_isready -U postgres > /dev/null 2>&1; then
                        echo "  ✅ PostgreSQL is healthy"
                    else
                        echo "  ⚠️  PostgreSQL may not be ready"
                        ALL_READY=false
                    fi
                    # Check Kong
                    if curl -s http://localhost:8000 > /dev/null 2>&1; then
                        echo "  ✅ Supabase Kong is responding"
                    else
                        echo "  ⚠️  Supabase Kong may not be ready"
                        ALL_READY=false
                    fi
                    ;;
            esac
        else
            echo "  ❌ Docker containers are not running"
            echo "     Run: cd apps/examples/$example && bun run docker:up"
            ALL_READY=false
        fi
    else
        echo "  ⚠️  No Docker setup found"
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ALL_READY" = true ]; then
    echo "✅ All Docker containers are running and healthy!"
    echo ""
    echo "Next steps:"
    echo "  1. Set environment variables for the example you want to test"
    echo "  2. Start servers: bun run dev:admin"
    echo "  3. Run tests: cd apps/e2e && bun run test"
else
    echo "⚠️  Some containers need attention"
    echo ""
    echo "To start all containers:"
    echo "  cd apps/e2e && bun run docker:start-all"
fi
echo ""
