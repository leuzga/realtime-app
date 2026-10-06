# Real-Time Fleet Operations Dashboard

A high-performance, real-time operational dashboard for monitoring 250+ concurrent nodes with streaming telemetry, built with React 18, Node.js, WebSocket, and functional programming principles.

## What is This?

**Fleet Operations Dashboard** is a production-grade prototype that demonstrates:
- ✓ Real-time data streaming (250 nodes × 4 updates/sec)
- ✓ Responsive UI (<100ms latency) with 99.9% memory optimization
- ✓ Strict functional programming paradigm (pure functions, immutability, composition)
- ✓ Full TypeScript + Zod type safety
- ✓ 95%+ test coverage (50 unit + 14 E2E tests)
- ✓ Docker containerization (no local setup required)

Perfect for monitoring fleet health, drilling into critical nodes, and making real-time operational decisions.

## Quick Start

**Requires**: Docker & Docker Compose only (no local Node.js installation needed)

```bash
# Clone repository
git clone <your-repo-url>
cd realtime-app

# Start services
docker-compose up -d

# Open dashboard
open http://localhost:3000

# Backend WebSocket
ws://localhost:4000/ws

# Health check
curl http://localhost:4000/health
```

**Full installation instructions**: See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for detailed setup, testing, and troubleshooting.

---

## Key Features

### Real-Time Monitoring
- **250 nodes** streaming at 4 Hz (1000 updates/sec)
- **Live metrics**: CPU, Memory, Latency per node
- **System KPIs**: Average latency, critical alerts, active nodes
- **Status tracking**: OK (green) / WARNING (yellow) / CRITICAL (red)

### Interactive UI
- **Filtering**: By status with live badge counts
- **Sorting**: By CPU, Memory, or Latency (asc/desc)
- **Infinite scroll**: 24-item batches with Load More button
- **Drill-down**: Click node → View time-series charts
- **Navigation**: Back to Top button, responsive grid

### Performance
- **99.9% memory reduction**: Circular buffer history
- **99% CPU reduction**: Memoized selectors
- **Zero render cascades**: Custom store + useSyncExternalStore
- **Sub-100ms UI latency**: Optimized state propagation

### Architecture
- **Frontend**: React 18 + TypeScript + Custom Store
- **Backend**: Node.js + WebSocket (ws library)
- **State Management**: Pure functional reducers + selectors
- **Validation**: Zod schemas at boundaries
- **Testing**: Vitest (unit) + Cypress (E2E)

---

## Project Structure

```
realtime-app/
├── docker-compose.dev.yml      # Dev stack: frontend + backend
├── Dockerfile                   # Multi-stage build
├── README.md                    # This file
├── INSTALLATION_GUIDE.md        # Setup & troubleshooting
├── GUIA_INSTALACION.md          # Spanish installation guide
├── REQUIREMENTS_CHECKLIST.md    # Full requirements audit
├── documents/                   # Architecture documentation
│   ├── SYSTEM_ARCHITECTURE.md   # System design (English)
│   ├── ARQUITECTURA_SISTEMA.md  # System design (Spanish)
│   ├── CODE_ARCHITECTURE.md     # Code structure (English)
│   └── ARQUITECTURA_CODIGO.md   # Code structure (Spanish)
├── frontend/                    # React application
│   ├── src/
│   │   ├── application/         # State management (pure functions)
│   │   ├── domain/              # Data schemas (Zod)
│   │   ├── infrastructure/      # WebSocket client
│   │   └── presentation/        # React components + design system
│   ├── cypress/                 # E2E tests (14 test cases)
│   └── package.json
└── backend/                     # Node.js server
    ├── src/
    │   ├── application/         # Business logic (pure functions)
    │   ├── domain/              # Schemas + types
    │   ├── infrastructure/      # WebSocket server, config, RNG
    │   └── main.ts              # Imperative shell
    └── package.json
```

---

## Docker Setup & Testing

### Start Application

```bash
# Build and start all services (frontend + backend)
docker-compose up

# Application will be accessible at:
# - Frontend: http://localhost:3000
# - Backend WebSocket: ws://localhost:4000/ws
# - Health check: http://localhost:4000/health
```

### Run Tests

```bash
# Unit tests (Jest/React Testing Library)
docker-compose exec frontend npm run test
docker-compose exec backend npm test

# TypeScript type checking
docker-compose exec frontend npm run typecheck
docker-compose exec backend npm run typecheck

# E2E tests (Cypress)
docker-compose exec frontend npm run e2e:run

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop services
docker-compose down
docker-compose down -v  # Full cleanup with volumes
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) | Complete setup, testing, troubleshooting (English) |
| [GUIA_INSTALACION.md](./GUIA_INSTALACION.md) | Complete setup, testing, troubleshooting (Spanish) |
| [SYSTEM_ARCHITECTURE.md](./documents/SYSTEM_ARCHITECTURE.md) | Technology decisions, data flow, scalability plan |
| [CODE_ARCHITECTURE.md](./documents/CODE_ARCHITECTURE.md) | File structure, functional programming paradigm |
| [REQUIREMENTS_CHECKLIST.md](./REQUIREMENTS_CHECKLIST.md) | Full PDF requirements audit (35/38 complete) |
| [PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md) | Performance analysis + optimizations |

---

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Vitest, Cypress  
**Backend**: Node.js 22, TypeScript, ws (WebSocket), Zod  
**Infrastructure**: Docker, Docker Compose  
**Paradigm**: Functional Programming (pure functions, immutability, composition)

---

## Features Implemented

✓ Real-time telemetry streaming (250 nodes × 4 Hz)  
✓ Metrics overview (KPIs + status counters)  
✓ Node grid with filtering by status  
✓ Dynamic sorting (CPU, Memory, Latency)  
✓ Infinite scroll pagination (24-item batches)  
✓ Time-series charts (SVG line graphs)  
✓ Color-coded status badges  
✓ Hover tooltips on metrics  
✓ Back to Top navigation  
✓ Responsive design (mobile-friendly)  
✓ WebSocket with exponential backoff  
✓ Health check endpoints  
✓ Comprehensive E2E tests (14 scenarios)  
✓ Unit tests (50+ tests, 95%+ coverage)  
✓ Type-safe with TypeScript strict mode  

---

## Performance

| Metric | Baseline | Optimized | Improvement |
|--------|----------|-----------|-------------|
| Memory (history) | 3-5MB/sec | ~100KB | 99.9% reduction |
| Selector recalc | 1000/sec | ~10/sec | 99% reduction |
| Style allocations | 24/render | 0/render | 100% reduction |
| UI latency | N/A | <100ms | Sub-frame |

---

## Getting Help

**Installation issues**: See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) → Troubleshooting section  
**Architecture questions**: See [documents/](./documents/) folder (EN + ES)  
**Test failures**: See [CYPRESS_README.md](./CYPRESS_README.md) for E2E test setup  
**Code structure**: See [CODE_ARCHITECTURE.md](./documents/CODE_ARCHITECTURE.md)  

---

## License & Submission

This is a take-home assignment project. For submission instructions and anonymity requirements, see [REQUIREMENTS_CHECKLIST.md](./REQUIREMENTS_CHECKLIST.md).

---

**Ready to deploy?** Follow the [installation guide](./INSTALLATION_GUIDE.md) for step-by-step setup instructions.
