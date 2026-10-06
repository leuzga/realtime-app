# Architecture & Technical Decisions

## State Management Strategy

**Redux-based Store (Application Layer)**
- Centralized state management using a custom Redux-like reducer pattern
- Immutable state updates via `reducer.ts` dispatching actions for node updates, filtering, sorting
- Selectors (`selectors.ts`) provide memoized derived state to prevent unnecessary re-renders
- Application hooks (`useAppState.ts`, `useNodeGrid.ts`, etc.) encapsulate component-specific logic

**Rationale:**
- Predictable state flow for high-frequency real-time updates
- Separation of concerns: domain/application/infrastructure layers
- Enables fine-grained memoization and performance optimization

## Performance Optimizations

1. **React Memoization**: Components wrapped with `React.memo` to prevent unnecessary re-renders
2. **Selector Memoization**: `selectors.ts` returns stable references, reducing downstream renders
3. **WebSocket Streaming**: Real-time data updates via `wsClient.ts` pushed directly to reducer, bypassing UI blocking
4. **Windowing/Virtualization**: Large node lists use virtual scrolling via `useInfiniteScroll.ts`
5. **State Colocation**: Domain-specific state (node telemetry, aggregations) co-located with business logic

## Architecture Layers

```
Presentation (React Components)
    ↓
Application (Hooks, Selectors, Reducer)
    ↓
Infrastructure (WebSocket Client, Config)
    ↓
Domain (Validators, Telemetry, Status)
```

- **Presentation**: UI components (`MetricsOverview.tsx`, `NodeGrid.tsx`, `NodeChart.tsx`)
- **Application**: State management and derived logic (`reducer.ts`, `selectors.ts`, hooks)
- **Infrastructure**: External integrations (`wsClient.ts`, environment config)
- **Domain**: Core business logic (`status.ts`, `validators.ts`, `telemetry.ts`)

## Trade-offs & Time Constraints (2-Day Window)

1. **Mock WebSocket vs. Real Backend**: Used simulated async stream (`generator.ts`) instead of external backend. Reduces setup complexity while maintaining realistic data patterns.
2. **Custom Redux vs. External Library**: Implemented lightweight reducer pattern instead of external Redux/Zustand for faster iteration and smaller bundle.
3. **CSS Modules vs. Styled Components**: Used plain CSS with design tokens for faster styling without runtime overhead.
4. **Cypress E2E Coverage**: Prioritized 1-2 critical user journeys (filtering, drilling into node details) over exhaustive coverage.

## Scaling for 10,000+ Active Nodes

**Strategies:**
1. **Server-Side Filtering & Aggregation**: Move filtering/sorting to backend; frontend receives only visible subset
2. **Time-Series Database**: Switch from in-memory state to time-series DB (InfluxDB, Prometheus) for historical telemetry
3. **Event-Driven Updates**: Use Redis pub/sub or message queue (Kafka) instead of single WebSocket connection
4. **Partial State Sync**: Implement incremental updates (delta encoding) to reduce bandwidth
5. **Read Replicas**: Load-balance WebSocket connections across multiple server instances
6. **Caching & CDN**: Cache static UI assets; use edge CDN for geographically distributed access

**Performance Thresholds:**
- Current architecture: ~100-500 active nodes with 50ms update frequency
- Production scaling: paginated grids, lazy-loaded detail views, server-driven pagination

## Testing Strategy

- **Unit Tests**: Reducer logic, selectors, validators using Jest
- **Integration Tests**: WebSocket client integration, state synchronization
- **E2E Tests**: Cypress covering critical user journeys (filtering by status, node detail inspection)
- **Performance Tests**: Monitor render counts, WebSocket message throughput under load

## Dependencies & Build

- **Frontend Build**: Vite for fast development and optimized production bundles
- **Testing**: Jest + React Testing Library for unit/integration; Cypress for E2E
- **Docker**: Multi-stage build for production (Node.js + nginx reverse proxy)
