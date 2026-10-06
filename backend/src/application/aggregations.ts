import type { TelemetryData } from '../domain/telemetry.js';
import { foldL } from './pipe.js';

export interface AggregateStats {
  readonly count: number;
  readonly avgCpu: number;
  readonly avgMemory: number;
  readonly avgLatency: number;
  readonly criticalCount: number;
}

/** Pure aggregation: compute statistics from fleet */
export const aggregateStats =
  (nodes: ReadonlyArray<TelemetryData>): AggregateStats => {
    if (nodes.length === 0) {
      return { count: 0, avgCpu: 0, avgMemory: 0, avgLatency: 0, criticalCount: 0 };
    }

    const fold = foldL<TelemetryData, AggregateStats>(
      (acc, node) => ({
        count: acc.count + 1,
        avgCpu: acc.avgCpu + node.cpuLoad,
        avgMemory: acc.avgMemory + node.memoryUsage,
        avgLatency: acc.avgLatency + node.latency,
        criticalCount: acc.criticalCount + (node.status === 'CRITICAL' ? 1 : 0)
      })
    )({
      count: 0,
      avgCpu: 0,
      avgMemory: 0,
      avgLatency: 0,
      criticalCount: 0
    });

    const result = fold(nodes);
    return {
      ...result,
      avgCpu: result.avgCpu / nodes.length,
      avgMemory: result.avgMemory / nodes.length,
      avgLatency: result.avgLatency / nodes.length
    };
  };

/** Pure aggregation: count nodes by status */
export const countByStatus =
  (nodes: ReadonlyArray<TelemetryData>): Readonly<Record<string, number>> =>
    foldL<TelemetryData, Record<string, number>>((acc, node) => ({
      ...acc,
      [node.status]: (acc[node.status] ?? 0) + 1
    }))({})( nodes);

/** Pure aggregation: find criticals */
export const findCriticals =
  (nodes: ReadonlyArray<TelemetryData>): ReadonlyArray<TelemetryData> =>
    nodes.filter((n) => n.status === 'CRITICAL');
