#!/usr/bin/env bash
set -euo pipefail

echo "=== Proteus Protection - NGROK Tunnel ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Start PostgreSQL if Docker is available
if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    echo "[1/3] Starting PostgreSQL via Docker..."
    docker compose -f "$PROJECT_DIR/docker-compose.yml" up -d postgres
    sleep 5
else
    echo "WARNING: Docker not running. Make sure PostgreSQL is available on localhost:5432"
fi

# Start Next.js dev server
echo "[2/3] Starting Next.js dev server..."
cd "$PROJECT_DIR"
HOSTNAME=0.0.0.0 PORT=3000 pnpm dev &
sleep 5

# Start NGROK
echo "[3/3] Starting NGROK tunnel on port 3000..."
if [ -f "$PROJECT_DIR/ngrok" ]; then
    "$PROJECT_DIR/ngrok" http 3000
elif command -v ngrok &> /dev/null; then
    ngrok http 3000
else
    echo "ERROR: ngrok not found. Place ngrok in the project root or install it globally."
    exit 1
fi
