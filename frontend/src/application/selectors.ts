import type { NodeStatus, TelemetryData } from '../domain/telemetry.js';
import type { AppState } from './reducer.js';

export interface KPIs {
  readonly activeCount: number;
  readonly criticalCount: number;
  readonly avgLatency: number;
}

// Memoization cache for selectors
let kpiCache: { state: AppState; result: KPIs } | null = null;
let filterSortCache: { args: string; result: TelemetryData[] } | null = null;

export const getKpis = (state: AppState): KPIs => {
  if (kpiCache?.state === state) return kpiCache.result;

  const nodes = state.nodes.values();
  let activeCount = 0;
  let criticalCount = 0;
  let sumLatency = 0;

  for (const n of nodes) {
    activeCount++;
    if (n.status === 'CRITICAL') criticalCount++;
    sumLatency += n.latency;
  }

  const result: KPIs = {
    activeCount,
    criticalCount,
    avgLatency: activeCount > 0 ? sumLatency / activeCount : 0
  };

  kpiCache = { state, result };
  return result;
};

export const filterAndSort = (
  nodes: Iterable<TelemetryData>,
  statusFilter: NodeStatus | null,
  sortBy: 'latency' | 'cpu' | 'memory',
  order: 'asc' | 'desc'
): TelemetryData[] => {
  const cacheKey = `${statusFilter}|${sortBy}|${order}`;
  if (filterSortCache?.args === cacheKey) return filterSortCache.result;

  const arr = Array.from(nodes);
  const filtered =
    statusFilter !== null ? arr.filter((n) => n.status === statusFilter) : arr;

  filtered.sort((a, b) => {
    const aVal = sortBy === 'latency' ? a.latency : sortBy === 'cpu' ? a.cpuLoad : a.memoryUsage;
    const bVal = sortBy === 'latency' ? b.latency : sortBy === 'cpu' ? b.cpuLoad : b.memoryUsage;
    return order === 'desc' ? bVal - aVal : aVal - bVal;
  });

  filterSortCache = { args: cacheKey, result: filtered };
  return filtered;
};

// Build nodeId -> value map for efficient lookup
const buildNodeMap = (frame: ReadonlyArray<TelemetryData>): Map<string, TelemetryData> =>
  new Map(frame.map((n) => [n.nodeId, n]));

export const getNodeSeries = (
  state: AppState,
  nodeId: string,
  key: 'cpuLoad' | 'memoryUsage' | 'latency'
): ReadonlyArray<number> => {
  const series: number[] = [];
  for (const frame of state.history) {
    const nodeMap = buildNodeMap(frame);
    series.push(nodeMap.get(nodeId)?.[key] ?? 0);
  }
  return series;
};
