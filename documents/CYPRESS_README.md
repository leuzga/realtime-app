# Cypress E2E Testing

Debido a limitaciones de Docker en esta máquina (credenciales), los tests de Cypress se deben ejecutar **localmente**.

## Test Files Created

✓ `frontend/cypress/e2e/critical-filter.cy.ts` - Filter by CRITICAL status + telemetry
✓ `frontend/cypress/e2e/sorting.cy.ts` - Sort by CPU/Memory/Latency
✓ `frontend/cypress/e2e/infinite-scroll.cy.ts` - Load More + Back to Top

## Setup (Local)

```bash
# 1. Instalar dependencias frontend
cd frontend
npm install

# 2. Asegurar que el app está corriendo
# En otra terminal:
cd realtime-app
docker compose -f docker-compose.dev.yml up

# 3. Ejecutar tests
cd frontend

# Opción A: UI interactivo (recomendado para desarrollo)
npm run e2e

# Opción B: Headless (CI/CD)
npm run e2e:run
```

## Test Coverage

### critical-filter.cy.ts
- [x] Filter nodes to CRITICAL status only
- [x] Display telemetry data for selected node
- [x] Show critical alert count in badge

### sorting.cy.ts
- [x] Sort nodes by CPU load
- [x] Sort nodes by Memory usage
- [x] Sort nodes by Latency (default)
- [x] Toggle sort order (asc/desc)

### infinite-scroll.cy.ts
- [x] Display initial 24 nodes
- [x] Show Load More button
- [x] Load more nodes on click
- [x] Auto-load on scroll
- [x] Back to Top button functionality

## Alternative: Docker E2E

Si quieres correr tests en Docker (necesita resolver credenciales):

```bash
# Usar imagen Cypress pre-configurada
docker compose -f docker-compose.e2e.yml up --abort-on-container-exit
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Tests fallan por conexión | Verificar que backend está en http://localhost:4000 |
| No encuentra elementos | Aumentar timeout en cypress.config.ts |
| Elementos no visibles | Scroll container puede necesitar ajustes |

---

**Estado**: Tests listos para ejecutar localmente ✓
