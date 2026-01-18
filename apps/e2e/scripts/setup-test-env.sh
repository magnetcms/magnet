#!/bin/bash
# Setup script for running e2e tests with Docker containers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="${1:-all}"

echo "🧪 Setting up test environment for: ${TEMPLATE}"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed or not in PATH"
    exit 1
fi

# Function to start an example's Docker containers
start_example() {
    local example=$1
    local compose_file="${SCRIPT_DIR}/../../examples/${example}/docker/docker-compose.yml"
    
    if [ ! -f "$compose_file" ]; then
        echo "⚠️  Docker compose file not found for ${example}, skipping..."
        return
    fi
    
    echo "Starting Docker containers for ${example}..."
    docker compose -f "$compose_file" up -d
    
    # Wait for service to be ready
    echo "Waiting for ${example} to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker compose -f "$compose_file" ps | grep -q "healthy\|running"; then
            echo "✅ ${example} is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo "⚠️  ${example} may not be fully ready, but continuing..."
}

# Start examples
if [ "$TEMPLATE" = "all" ]; then
    echo "Starting all example Docker containers..."
    start_example "mongoose"
    start_example "drizzle-neon"
    start_example "drizzle-supabase"
else
    start_example "$TEMPLATE"
fi

echo "✅ Test environment setup complete!"
