#!/bin/bash
# Learnhouse Local Stack Shutdown Script

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping Learnhouse services..."

kill_port() {
  local port=$1
  local name=$2
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Stopping $name on port $port (PIDs: $pids)..."
    kill -9 $pids 2>/dev/null || true
  else
    echo "$name on port $port is not running."
  fi
}

kill_port 3010 "Web Frontend"
kill_port 4000 "Collab Server"
kill_port 1348 "API Server"

rm -f "$DIR/logs/"*.pid 2>/dev/null || true

echo "All Learnhouse services stopped."
