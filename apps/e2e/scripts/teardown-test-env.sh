#!/bin/bash
# Teardown script for stopping Docker containers after tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="${1:-all}"

echo "🧹 Tearing down test environment for: ${TEMPLATE}"

# Function to stop an example's Docker containers
stop_example() {
    local example=$1
    local compose_file="${SCRIPT_DIR}/../../examples/${example}/docker/docker-compose.yml"
    
    if [ ! -f "$compose_file" ]; then
        return
    fi
    
    echo "Stopping Docker containers for ${example}..."
    docker compose -f "$compose_file" down
}

# Stop examples
if [ "$TEMPLATE" = "all" ]; then
    echo "Stopping all example Docker containers..."
    stop_example "mongoose"
    stop_example "drizzle-neon"
    stop_example "drizzle-supabase"
else
    stop_example "$TEMPLATE"
fi

echo "✅ Test environment teardown complete!"
