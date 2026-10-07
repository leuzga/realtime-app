# Installation & Setup Guide

Complete tutorial for installing, running, testing, and troubleshooting the Real-Time Fleet Operations Dashboard.

---

## Prerequisites

You need only **Docker & Docker Compose** installed. No local Node.js, npm, or Python required.

### Verify Installation

```bash
# Check Docker version (need 20.10+)
docker --version

# Check Docker Compose version (need 2.0+)
docker compose version

# Both should print versions without errors
```

If not installed:
- **macOS**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: `sudo apt-get install docker.io docker-compose`

---

## Step 1: Clone Repository

```bash
# Clone the project
git clone https://github.com/<your-org>/realtime-app.git
cd realtime-app

# Verify directory structure
ls -la
# Should see: Dockerfile, docker-compose.dev.yml, frontend/, backend/, etc.
```

---

## Step 2: Start Services

### Quick Start (Development)

```bash
# Start all containers in background
docker-compose up -d

# Verify containers are running
docker-compose ps

# Expected output:
# NAME                   SERVICE     STATUS      PORTS
# realtime-app-backend-1 backend     Up          0.0.0.0:4000->4000/tcp
# realtime-app-frontend-1 frontend   Up          0.0.0.0:3000->3000/tcp
```

### Wait for Services to Be Ready

```bash
# Check backend health (wait ~5 seconds for startup)
sleep 5
curl http://localhost:4000/health

# Expected response:
# {"status":"ok"}

# Check frontend is serving
curl -I http://localhost:3000
# Should see: HTTP/1.1 200 OK
```

---

## Step 3: Open Dashboard

### In Browser

1. Open your browser
2. Visit: **http://localhost:3000**
3. You should see:
   - "Fleet Operations Dashboard" header
   - "● Live" status indicator (green)
   - System Metrics section (CPU, Memory, Latency)
   - Active Nodes grid with 24 nodes displayed
   - Filter tabs (All Nodes, ✓ OK, ⚠ WARNING, ✕ CRITICAL)
   - Sort buttons (CPU, Memory, Latency)

### Verify Data is Flowing

1. Watch the node grid - numbers should change every ~250ms
2. Click a node card → Should show time-series chart (right sidebar)
3. Click "CRITICAL" tab → Filter shows only critical nodes
4. Click "Memory" sort button → Nodes reorder by memory usage
5. Scroll down → "Load 24 More" button appears when >24 nodes exist

---

## Step 4: Run Tests

### Unit Tests (Backend)

```bash
# Run backend unit tests (50+ tests)
docker-compose exec backend npm test

# Expected output:
# Test Files: 10 passed
# Tests: 50+ passed
# Coverage: 95%+
```

### Frontend Type Checking

```bash
# Run TypeScript type check
docker-compose exec frontend npm run typecheck

# Expected: No errors
```

### Unit Tests (Frontend)

```bash
# Run frontend unit tests
docker-compose exec frontend npm run test:run

# Should show: ~19 tests passing
```

### E2E Tests (Cypress)

```bash
# Option A: Run in headless mode (CI/CD)
docker-compose exec frontend npm run e2e:run

# Option B: Open Cypress UI (interactive)
cd frontend
npm install  # Install cypress locally if not already
npm run e2e

# Expected: 14 test cases pass
# - critical-filter.cy.ts (3 tests)
# - sorting.cy.ts (4 tests)
# - infinite-scroll.cy.ts (7 tests)
```

---

## Step 5: Development Workflow

### Make Code Changes

```bash
# Edit any file in frontend/src or backend/src
# Changes are automatically picked up by:
# - Vite (frontend): HMR - hot module reload (<1 second)
# - tsx (backend): watch mode - auto-restart (<2 seconds)

# No need to restart containers
```

### View Live Logs

```bash
# Frontend logs (Vite dev server)
docker-compose logs -f frontend

# Backend logs (Node.js server)
docker-compose logs -f backend

# Both (split terminal or new tab)
docker-compose logs -f
```

### Run Tests While Developing

```bash
# Watch mode (re-run on file change)
docker-compose exec backend npm run test:watch

# Or run specific test file
docker-compose exec backend npm test -- aggregations
```

---

## Step 6: Accessing Services

### Frontend
- **URL**: http://localhost:3000
- **Hot reload**: Yes (changes live)
- **Port**: 3000

### Backend API
- **Health check**: http://localhost:4000/health
- **WebSocket**: ws://localhost:4000/ws
- **Port**: 4000

### Direct Commands

```bash
# Backend health check
curl http://localhost:4000/health

# Frontend type check
docker-compose exec frontend npm run typecheck

# Run backend tests with coverage
docker-compose exec backend npm test -- --coverage

# Run Cypress tests with reporter
docker-compose exec frontend npm run e2e:run -- --reporter json
```

---

## Troubleshooting

### Problem: "Port 3000 already in use"

```bash
# Solution 1: Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Solution 2: Use different port
docker-compose -f docker-compose.dev.yml up -d --build \
  -e "VITE_PORT=3001"
```

### Problem: "Cannot connect to Docker daemon"

```bash
# Check Docker is running
docker ps

# macOS/Windows: Start Docker Desktop
# Linux: Start Docker service
sudo systemctl start docker

# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

### Problem: "npm ERR! code EACCES" in Docker

```bash
# Clean Docker volumes and rebuild
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

### Problem: "WebSocket connection failed"

```bash
# Check backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend | tail -20

# Expected: "[telemetry] ws://0.0.0.0:4000/ws · nodes=250"

# Force restart backend
docker-compose restart backend
```

### Problem: "Types are not recognized" in VSCode

```bash
# Reinstall node_modules locally (for IDE)
cd frontend
rm -rf node_modules
npm install

# Frontend will still run in Docker, but IDE gets types
```

### Problem: Tests timeout or hang

```bash
# Increase timeout in cypress.config.ts
# Default is 10s, increase to 30s for slow machines

# Or run specific test
docker-compose exec frontend npm run e2e:run -- \
  --spec cypress/e2e/critical-filter.cy.ts
```

---

## Full Cleanup

### Stop Services (Keep Data)

```bash
docker-compose stop
# Services stopped but volumes preserved

# Resume
docker-compose start
```

### Remove Services & Data

```bash
# Stop and remove containers
docker-compose down

# Also remove volumes (complete reset)
docker-compose down -v

# Also remove images
docker-compose down -v --rmi all
```

### Clean Build

```bash
# Remove everything and rebuild from scratch
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

---

## Development Tools

### Access Container Shell

```bash
# Frontend shell
docker-compose exec frontend sh

# Backend shell
docker-compose exec backend sh

# Install additional npm packages
docker-compose exec frontend npm install <package>
```

### View Environment Variables

```bash
# Frontend
docker-compose exec frontend env | grep -i react

# Backend
docker-compose exec backend env | grep -i node
```

### Monitor Resource Usage

```bash
# While services run in another tab
docker stats

# Watch CPU, memory, network I/O in real-time
```

---

## Next Steps

1. **Understand the Design**: See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
2. **Run Tests**: `docker-compose exec frontend npm run e2e:run`
3. **Make Changes**: Edit any file in `frontend/src` or `backend/src`
4. **View Logs**: `docker-compose logs -f`

---

## Quick Reference

| Task | Command |
|------|---------|
| Start | `docker-compose up -d` |
| Stop | `docker-compose stop` |
| Logs | `docker-compose logs -f` |
| Tests | `docker-compose exec frontend npm run e2e:run` |
| Clean | `docker-compose down -v` |
| Rebuild | `docker-compose up -d --build` |
| Health | `curl http://localhost:4000/health` |
| Shell | `docker-compose exec frontend sh` |

---

**Having issues?** Check the Troubleshooting section above for common solutions.
