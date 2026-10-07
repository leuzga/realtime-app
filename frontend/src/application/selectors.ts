import type { NodeStatus, TelemetryData } from '../domain/telemetry.js';
import type { AppState } from './reducer.js';
import type { Metric } from '../domain/thresholds.js';

export interface KPIs {
  readonly activeCount: number;
  readonly criticalCount: number;
  readonly warningCount: number;
  readonly avgLatency: number;
  readonly avgCpu: number;
  readonly avgMemory: number;
}

// Memoization cache for selectors
let kpiCache: { state: AppState; result: KPIs } | null = null;
let filterSortCache: { nodesId: object; args: string; result: TelemetryData[] } | null = null;
let seriesByNodeCache: { state: AppState; result: Map<string, { cpuLoad: number[]; memoryUsage: number[]; latency: number[] }> } | null = null;

export const getKpis = (state: AppState): KPIs => {
  if (kpiCache?.state === state) return kpiCache.result;

  const nodes = state.nodes.values();
  let activeCount = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let sumLatency = 0;
  let sumCpu = 0;
  let sumMemory = 0;

  for (const n of nodes) {
    activeCount++;
    if (n.status === 'CRITICAL') criticalCount++;
    if (n.status === 'WARNING') warningCount++;
    sumLatency += n.latency;
    sumCpu += n.cpuLoad;
    sumMemory += n.memoryUsage;
  }

  const result: KPIs = {
    activeCount,
    criticalCount,
    warningCount,
    avgLatency: activeCount > 0 ? sumLatency / activeCount : 0,
    avgCpu: activeCount > 0 ? sumCpu / activeCount : 0,
    avgMemory: activeCount > 0 ? sumMemory / activeCount : 0
  };

  kpiCache = { state, result };
  return result;
};

export const filterAndSort = (
  nodes: ReadonlyMap<string, TelemetryData>,
  statusFilter: NodeStatus | null,
  sortBy: 'latency' | 'cpu' | 'memory',
  order: 'asc' | 'desc'
): TelemetryData[] => {
  const cacheKey = `${statusFilter}|${sortBy}|${order}`;
  if (filterSortCache?.nodesId === nodes && filterSortCache?.args === cacheKey) return filterSortCache.result;

  const arr = Array.from(nodes.values());
  const filtered =
    statusFilter !== null ? arr.filter((n) => n.status === statusFilter) : arr;

  filtered.sort((a, b) => {
    const aVal = sortBy === 'latency' ? a.latency : sortBy === 'cpu' ? a.cpuLoad : a.memoryUsage;
    const bVal = sortBy === 'latency' ? b.latency : sortBy === 'cpu' ? b.cpuLoad : b.memoryUsage;
    return order === 'desc' ? bVal - aVal : aVal - bVal;
  });

  filterSortCache = { nodesId: nodes, args: cacheKey, result: filtered };
  return filtered;
};

export const getSeriesByNode = (state: AppState): Map<string, { cpuLoad: number[]; memoryUsage: number[]; latency: number[] }> => {
  if (seriesByNodeCache?.state === state) return seriesByNodeCache.result;

  const result = new Map<string, { cpuLoad: number[]; memoryUsage: number[]; latency: number[] }>();

  for (const frame of state.history) {
    for (const node of frame) {
      if (!result.has(node.nodeId)) {
        result.set(node.nodeId, { cpuLoad: [], memoryUsage: [], latency: [] });
      }
      const series = result.get(node.nodeId)!;
      series.cpuLoad.push(node.cpuLoad);
      series.memoryUsage.push(node.memoryUsage);
      series.latency.push(node.latency);
    }
  }

  seriesByNodeCache = { state, result };
  return result;
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
