export type Metric = 'cpuLoad' | 'memoryUsage' | 'latency';

export const STATUS_THRESHOLDS = {
  cpuLoad: { WARNING: 75, CRITICAL: 90 },
  memoryUsage: { WARNING: 80, CRITICAL: 92 },
  latency: { WARNING: 250, CRITICAL: 600 }
} as const;

export const METRIC_LABELS: Record<Metric, string> = {
  cpuLoad: 'CPU Load',
  memoryUsage: 'Memory Usage',
  latency: 'Latency'
};

export const METRIC_UNITS: Record<Metric, string> = {
  cpuLoad: '%',
  memoryUsage: '%',
  latency: 'ms'
};

export const METRIC_MAX: Record<Metric, number> = {
  cpuLoad: 100,
  memoryUsage: 100,
  latency: 1000
};

export const getThreshold = (metric: Metric, level: 'WARNING' | 'CRITICAL'): number =>
  STATUS_THRESHOLDS[metric][level];
