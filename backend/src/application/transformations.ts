import { deriveStatus } from '../domain/status.js';
import type { Metrics, Rng, TelemetryData } from '../domain/telemetry.js';
import { mapArray, compose } from './pipe.js';

/** Pure transformation: extract metrics from telemetry */
export const extractMetrics = (data: TelemetryData): Metrics => ({
  cpuLoad: data.cpuLoad,
  memoryUsage: data.memoryUsage,
  latency: data.latency
});

/** Pure transformation: enrich telemetry with derived status */
export const enrichWithStatus = (data: { nodeId: string; cpuLoad: number; memoryUsage: number; latency: number; timestamp: number }): TelemetryData => ({
  ...data,
  status: deriveStatus(extractMetrics(data as TelemetryData))
});

/** Pure transformation: validate bounds on metrics */
export const clampMetrics =
  (metrics: Metrics): Metrics => ({
    cpuLoad: Math.min(100, Math.max(0, metrics.cpuLoad)),
    memoryUsage: Math.min(100, Math.max(0, metrics.memoryUsage)),
    latency: Math.max(0, metrics.latency)
  });

/** Pure transformation: select subset of nodes by predicate */
export const selectNodes =
  (predicate: (node: TelemetryData) => boolean) =>
  (nodes: ReadonlyArray<TelemetryData>): ReadonlyArray<TelemetryData> =>
    nodes.filter(predicate);

/** Pure transformation: batch nodes by size */
export const batchNodes =
  (size: number) =>
  (nodes: ReadonlyArray<TelemetryData>): ReadonlyArray<ReadonlyArray<TelemetryData>> => {
    const batches: TelemetryData[][] = [];
    for (let i = 0; i < nodes.length; i += size) {
      batches.push([...nodes.slice(i, i + size)]);
    }
    return batches;
  };

/** Pure transformation pipeline: map f over telemetry array */
export const mapTelemetry =
  <A>(f: (t: TelemetryData) => A) =>
  (nodes: ReadonlyArray<TelemetryData>): ReadonlyArray<A> =>
    mapArray(f)(nodes);

/** Compose enrichStatus with clamp: enrich -> clamp metrics -> status */
export const enrichAndClamp = compose(
  (data: Omit<TelemetryData, 'status'>) =>
    enrichWithStatus(data),
  (metrics: Omit<TelemetryData, 'status'>) =>
    ({ ...metrics, ...clampMetrics(metrics) } as Omit<TelemetryData, 'status'>)
);
