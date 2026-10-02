#!/bin/bash
# Learnhouse Local Stack Startup Script
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$DIR/logs"

echo "============================================"
echo " Starting Learnhouse LMS Local Stack...     "
echo "============================================"

# 1. Check/Start PostgreSQL & Redis
echo "[1/4] Checking PostgreSQL and Redis..."
brew services start postgresql@16 >/dev/null 2>&1 || true
brew services start redis >/dev/null 2>&1 || true

# 2. Start Backend API
echo "[2/4] Starting API Server on http://lvh.me:1348..."
if lsof -Pi :1348 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "  -> API is already running on port 1348."
else
    cd "$DIR/apps/api"
    nohup bash run_demo_api.sh </dev/null > "$DIR/logs/api.log" 2>&1 &
    echo $! > "$DIR/logs/api.pid"
    echo "  -> API started (PID $(cat "$DIR/logs/api.pid"))."
fi

# 3. Start Collab Server
echo "[3/4] Starting Collaboration Server on port 4000..."
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "  -> Collab is already running on port 4000."
else
    cd "$DIR/apps/collab"
    nohup bash run_demo_collab.sh </dev/null > "$DIR/logs/collab.log" 2>&1 &
    echo $! > "$DIR/logs/collab.pid"
    echo "  -> Collab started (PID $(cat "$DIR/logs/collab.pid"))."
fi

# 4. Start Web Frontend
echo "[4/4] Starting Web Frontend on http://lvh.me:3010..."
if lsof -Pi :3010 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "  -> Web is already running on port 3010."
else
    cd "$DIR/apps/web"
    nohup bun run dev -p 3010 </dev/null > "$DIR/logs/web.log" 2>&1 &
    echo $! > "$DIR/logs/web.pid"
    echo "  -> Web started (PID $(cat "$DIR/logs/web.pid"))."
fi

echo "============================================"
echo " Learnhouse is UP and running!             "
echo " Web UI:           http://lvh.me:3010/login "
echo " Demo Org:         http://demo.lvh.me:3010/dash"
echo " API Docs:         http://lvh.me:1348/docs   "
echo " Logs directory:   $DIR/logs/               "
echo "============================================"
