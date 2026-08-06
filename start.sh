#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Installing dependencies (first run only)..."
cd "$ROOT/backend" && npm install --silent
cd "$ROOT/frontend" && npm install --silent

echo ""
echo "🚀 Starting Notebook..."
echo "   Open http://localhost:5173 in your browser"
echo "   Press Ctrl+C to stop"
echo ""

# Start backend in background
cd "$ROOT/backend" && node server.js &
BACKEND_PID=$!

# Start frontend (blocks until Ctrl+C)
cd "$ROOT/frontend" && npm run dev

# Clean up backend when frontend exits
kill $BACKEND_PID 2>/dev/null
