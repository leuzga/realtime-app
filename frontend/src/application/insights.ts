import type { TelemetryData, NodeStatus } from '../domain/telemetry.js';
import { STATUS_THRESHOLDS, type Metric } from '../domain/thresholds.js';

export interface TrendDirection {
  readonly direction: 'up' | 'down' | 'flat';
  readonly magnitude: number;
}

export interface ThresholdContext {
  readonly level: NodeStatus | 'OK';
  readonly distance: number;
  readonly headroomPct: number;
}

export interface StatusDurationLabel {
  readonly ms: number;
  readonly label: string;
}

export interface FleetAlertSummary {
  readonly level: 'ok' | 'warning' | 'critical';
  readonly headline: string;
  readonly detail: string;
  readonly impactPct: number;
}

export interface NodeInsight {
  readonly trends: { cpuLoad: TrendDirection; memoryUsage: TrendDirection; latency: TrendDirection };
  readonly context: { cpuLoad: ThresholdContext; memoryUsage: ThresholdContext; latency: ThresholdContext };
  readonly worstMetric: Metric;
  readonly statusDuration: StatusDurationLabel;
  readonly recommendation: string;
}

export const countByStatus = (nodes: readonly TelemetryData[]): Record<NodeStatus, number> => {
  const counts: Record<NodeStatus, number> = { OK: 0, WARNING: 0, CRITICAL: 0 };
  nodes.forEach((n) => {
    if (n.status in counts) counts[n.status]++;
  });
  return counts;
};

export const trendOf = (series: readonly number[], epsilon: number = 0.01): TrendDirection => {
  if (series.length < 2) return { direction: 'flat', magnitude: 0 };

  const recentCount = Math.min(5, Math.max(2, Math.floor(series.length / 3)));
  const recent = series.slice(-recentCount);
  const older = series.slice(Math.max(0, series.length - recentCount * 2), -recentCount);

  const recentMean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderMean = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentMean;

  const delta = recentMean - olderMean;
  const magnitude = Math.abs(delta);

  if (magnitude < epsilon) return { direction: 'flat', magnitude };
  return { direction: delta > 0 ? 'up' : 'down', magnitude };
};

export const thresholdContext = (metric: Metric, value: number): ThresholdContext => {
  const thresholds = STATUS_THRESHOLDS[metric];
  const max = metric === 'latency' ? 1000 : 100;

  if (value >= thresholds.CRITICAL) {
    return {
      level: 'CRITICAL',
      distance: value - thresholds.CRITICAL,
      headroomPct: Math.max(0, (max - value) / max) * 100
    };
  }

  if (value >= thresholds.WARNING) {
    return {
      level: 'WARNING',
      distance: value - thresholds.WARNING,
      headroomPct: ((thresholds.CRITICAL - value) / (thresholds.CRITICAL - thresholds.WARNING)) * 100
    };
  }

  return {
    level: 'OK',
    distance: thresholds.WARNING - value,
    headroomPct: 100
  };
};

export const worstMetric = (node: TelemetryData): Metric => {
  const cpu = thresholdContext('cpuLoad', node.cpuLoad);
  const mem = thresholdContext('memoryUsage', node.memoryUsage);
  const lat = thresholdContext('latency', node.latency);

  const levelPriority = { CRITICAL: 3, WARNING: 2, OK: 1 };
  const levels = [
    { metric: 'cpuLoad' as const, priority: levelPriority[cpu.level] },
    { metric: 'memoryUsage' as const, priority: levelPriority[mem.level] },
    { metric: 'latency' as const, priority: levelPriority[lat.level] }
  ];

  return levels.sort((a, b) => b.priority - a.priority)[0].metric;
};

export const recommendationFor = (node: TelemetryData): string => {
  const worst = worstMetric(node);
  const value = node[worst];
  const thresholds = STATUS_THRESHOLDS[worst];

  if (value >= thresholds.CRITICAL) {
    if (worst === 'cpuLoad') return 'Shed load or scale out immediately.';
    if (worst === 'memoryUsage') return 'Restart node or add memory; possible leak.';
    if (worst === 'latency') return 'Check network path / upstream dependency.';
  }

  if (value >= thresholds.WARNING) {
    if (worst === 'cpuLoad') return 'Monitor load; prepare scaling if trending up.';
    if (worst === 'memoryUsage') return 'Check for memory leak; monitor closely.';
    if (worst === 'latency') return 'Investigate upstream; latency approaching limit.';
  }

  return 'All metrics nominal.';
};

export const statusDuration = (since: number, now: number): StatusDurationLabel => {
  const ms = now - since;
  if (ms < 1000) return { ms, label: 'just now' };

  const sec = Math.floor(ms / 1000);
  if (sec < 60) return { ms, label: `${sec}s` };

  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  if (min < 60) return { ms, label: `${min}m ${remSec}s` };

  const hours = Math.floor(min / 60);
  const remMin = min % 60;
  return { ms, label: `${hours}h ${remMin}m` };
};

export const fleetImpact = (counts: Record<NodeStatus, number>, total: number): FleetAlertSummary => {
  if (total === 0) return { level: 'ok', headline: 'No nodes', detail: '', impactPct: 0 };

  const criticalPct = (counts.CRITICAL / total) * 100;
  const warningPct = (counts.WARNING / total) * 100;

  if (counts.CRITICAL > 0) {
    return {
      level: 'critical',
      headline: `${counts.CRITICAL} node${counts.CRITICAL > 1 ? 's' : ''} CRITICAL`,
      detail: `${criticalPct.toFixed(1)}% of fleet – immediate action required`,
      impactPct: criticalPct
    };
  }

  if (counts.WARNING > 0) {
    return {
      level: 'warning',
      headline: `${counts.WARNING} node${counts.WARNING > 1 ? 's' : ''} WARNING`,
      detail: `${warningPct.toFixed(1)}% of fleet – monitor closely`,
      impactPct: warningPct
    };
  }

  return {
    level: 'ok',
    headline: 'All nodes healthy',
    detail: `${total} nodes operating normally`,
    impactPct: 0
  };
};

export const buildNodeInsight = (
  node: TelemetryData,
  trends: { cpuLoad: TrendDirection; memoryUsage: TrendDirection; latency: TrendDirection },
  statusSince: number,
  now: number
): NodeInsight => {
  const worst = worstMetric(node);

  return {
    trends,
    context: {
      cpuLoad: thresholdContext('cpuLoad', node.cpuLoad),
      memoryUsage: thresholdContext('memoryUsage', node.memoryUsage),
      latency: thresholdContext('latency', node.latency)
    },
    worstMetric: worst,
    statusDuration: statusDuration(statusSince, now),
    recommendation: recommendationFor(node)
  };
};
