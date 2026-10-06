import type { Metrics, NodeStatus } from './telemetry.js';

interface Threshold {
  readonly warning: number;
  readonly critical: number;
}

export const STATUS_THRESHOLDS: Readonly<Record<keyof Metrics, Threshold>> = {
  cpuLoad: { warning: 75, critical: 90 },
  memoryUsage: { warning: 80, critical: 92 },
  latency: { warning: 250, critical: 600 }
};

const SEVERITY: readonly NodeStatus[] = ['OK', 'WARNING', 'CRITICAL'];

const severityOf = (value: number, { warning, critical }: Threshold): number =>
  value >= critical ? 2 : value >= warning ? 1 : 0;

/** Worst metric wins: a node is as unhealthy as its most degraded signal. */
export const deriveStatus = (metrics: Metrics): NodeStatus =>
  SEVERITY[
    Math.max(
      severityOf(metrics.cpuLoad, STATUS_THRESHOLDS.cpuLoad),
      severityOf(metrics.memoryUsage, STATUS_THRESHOLDS.memoryUsage),
      severityOf(metrics.latency, STATUS_THRESHOLDS.latency)
    )
  ] ?? 'OK';
