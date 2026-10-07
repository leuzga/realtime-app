import { describe, it, expect } from 'vitest';
import {
  trendOf,
  thresholdContext,
  worstMetric,
  recommendationFor,
  statusDuration,
  fleetImpact,
  countByStatus,
  buildNodeInsight
} from './insights.js';
import type { TelemetryData } from '../domain/telemetry.js';

describe('insights', () => {
  describe('countByStatus', () => {
    it('counts nodes by status', () => {
      const nodes: TelemetryData[] = [
        { nodeId: '1', status: 'OK', cpuLoad: 50, memoryUsage: 50, latency: 100, timestamp: 0 },
        { nodeId: '2', status: 'WARNING', cpuLoad: 75, memoryUsage: 50, latency: 100, timestamp: 0 },
        { nodeId: '3', status: 'CRITICAL', cpuLoad: 95, memoryUsage: 95, latency: 700, timestamp: 0 }
      ];
      const counts = countByStatus(nodes);
      expect(counts).toEqual({ OK: 1, WARNING: 1, CRITICAL: 1 });
    });

    it('handles empty array', () => {
      const counts = countByStatus([]);
      expect(counts).toEqual({ OK: 0, WARNING: 0, CRITICAL: 0 });
    });
  });

  describe('trendOf', () => {
    it('detects uptrend', () => {
      const series = [10, 15, 20, 25, 30, 35, 40];
      const trend = trendOf(series);
      expect(trend.direction).toBe('up');
      expect(trend.magnitude).toBeGreaterThan(0);
    });

    it('detects downtrend', () => {
      const series = [40, 35, 30, 25, 20, 15, 10];
      const trend = trendOf(series);
      expect(trend.direction).toBe('down');
      expect(trend.magnitude).toBeGreaterThan(0);
    });

    it('detects flat trend', () => {
      const series = [20, 20, 20, 20, 20];
      const trend = trendOf(series);
      expect(trend.direction).toBe('flat');
      expect(trend.magnitude).toBeLessThan(0.1);
    });

    it('handles single value', () => {
      const trend = trendOf([42]);
      expect(trend.direction).toBe('flat');
      expect(trend.magnitude).toBe(0);
    });

    it('handles empty series', () => {
      const trend = trendOf([]);
      expect(trend.direction).toBe('flat');
      expect(trend.magnitude).toBe(0);
    });
  });

  describe('thresholdContext', () => {
    it('returns OK for value below WARNING', () => {
      const ctx = thresholdContext('cpuLoad', 50);
      expect(ctx.level).toBe('OK');
      expect(ctx.distance).toBe(25); // 75 - 50
      expect(ctx.headroomPct).toBe(100);
    });

    it('returns WARNING for value at/above WARNING but below CRITICAL', () => {
      const ctx = thresholdContext('cpuLoad', 80);
      expect(ctx.level).toBe('WARNING');
      expect(ctx.distance).toBe(5); // 80 - 75
      expect(ctx.headroomPct).toBeGreaterThan(0);
      expect(ctx.headroomPct).toBeLessThan(100);
    });

    it('returns CRITICAL for value at/above CRITICAL', () => {
      const ctx = thresholdContext('cpuLoad', 92);
      expect(ctx.level).toBe('CRITICAL');
      expect(ctx.distance).toBe(2); // 92 - 90
    });

    it('handles different metrics correctly', () => {
      const cpuCtx = thresholdContext('cpuLoad', 85);
      expect(cpuCtx.level).toBe('WARNING');

      const memCtx = thresholdContext('memoryUsage', 85);
      expect(memCtx.level).toBe('WARNING');

      const latCtx = thresholdContext('latency', 300);
      expect(latCtx.level).toBe('WARNING');

      const latCritCtx = thresholdContext('latency', 650);
      expect(latCritCtx.level).toBe('CRITICAL');
    });
  });

  describe('worstMetric', () => {
    it('returns CRITICAL metric', () => {
      const node: TelemetryData = {
        nodeId: '1',
        status: 'CRITICAL',
        cpuLoad: 95,
        memoryUsage: 50,
        latency: 100,
        timestamp: 0
      };
      expect(worstMetric(node)).toBe('cpuLoad');
    });

    it('prefers CRITICAL over WARNING', () => {
      const node: TelemetryData = {
        nodeId: '1',
        status: 'CRITICAL',
        cpuLoad: 95,
        memoryUsage: 85,
        latency: 100,
        timestamp: 0
      };
      const worst = worstMetric(node);
      expect(worst).toBe('cpuLoad');
    });

    it('picks WARNING if no CRITICAL', () => {
      const node: TelemetryData = {
        nodeId: '1',
        status: 'WARNING',
        cpuLoad: 50,
        memoryUsage: 85,
        latency: 100,
        timestamp: 0
      };
      expect(worstMetric(node)).toBe('memoryUsage');
    });
  });

  describe('recommendationFor', () => {
    it('gives CPU recommendation for CRITICAL CPU', () => {
      const node: TelemetryData = {
        nodeId: '1',
        status: 'CRITICAL',
        cpuLoad: 95,
        memoryUsage: 50,
        latency: 100,
        timestamp: 0
      };
      const rec = recommendationFor(node);
      expect(rec).toContain('Shed load');
    });

    it('gives memory recommendation for CRITICAL memory', () => {
      const node: TelemetryData = {
        nodeId: '1',
        status: 'CRITICAL',
        cpuLoad: 50,
        memoryUsage: 95,
        latency: 100,
        timestamp: 0
      };
      const rec = recommendationFor(node);
      expect(rec).toContain('memory');
    });

    it('gives latency recommendation for CRITICAL latency', () => {
      const node: TelemetryData = {
        nodeId: '1',
        status: 'CRITICAL',
        cpuLoad: 50,
        memoryUsage: 50,
        latency: 650,
        timestamp: 0
      };
      const rec = recommendationFor(node);
      expect(rec).toContain('network');
    });
  });

  describe('statusDuration', () => {
    it('formats milliseconds correctly', () => {
      const now = 1000;
      const since = 500;
      const dur = statusDuration(since, now);
      expect(dur.ms).toBe(500);
      expect(dur.label).toContain('s');
    });

    it('formats seconds', () => {
      const now = 100000;
      const since = 30000;
      const dur = statusDuration(since, now);
      expect(dur.label).toContain('m');
    });

    it('handles very recent (< 1s)', () => {
      const dur = statusDuration(100, 500);
      expect(dur.label).toBe('just now');
    });
  });

  describe('fleetImpact', () => {
    it('returns ok level when no issues', () => {
      const summary = fleetImpact({ OK: 100, WARNING: 0, CRITICAL: 0 }, 100);
      expect(summary.level).toBe('ok');
    });

    it('returns warning level with WARNING nodes', () => {
      const summary = fleetImpact({ OK: 90, WARNING: 10, CRITICAL: 0 }, 100);
      expect(summary.level).toBe('warning');
      expect(summary.impactPct).toBeCloseTo(10);
    });

    it('returns critical level with CRITICAL nodes', () => {
      const summary = fleetImpact({ OK: 95, WARNING: 0, CRITICAL: 5 }, 100);
      expect(summary.level).toBe('critical');
      expect(summary.impactPct).toBeCloseTo(5);
    });

    it('prefers CRITICAL over WARNING', () => {
      const summary = fleetImpact({ OK: 80, WARNING: 15, CRITICAL: 5 }, 100);
      expect(summary.level).toBe('critical');
      expect(summary.headline).toContain('CRITICAL');
    });

    it('handles zero nodes', () => {
      const summary = fleetImpact({ OK: 0, WARNING: 0, CRITICAL: 0 }, 0);
      expect(summary.level).toBe('ok');
      expect(summary.headline).toContain('No nodes');
    });
  });

  describe('buildNodeInsight', () => {
    it('builds complete insight for a node', () => {
      const node: TelemetryData = {
        nodeId: '1',
        status: 'WARNING',
        cpuLoad: 80,
        memoryUsage: 50,
        latency: 100,
        timestamp: 1000
      };
      const trends = {
        cpuLoad: { direction: 'up' as const, magnitude: 5 },
        memoryUsage: { direction: 'flat' as const, magnitude: 0 },
        latency: { direction: 'down' as const, magnitude: 2 }
      };
      const insight = buildNodeInsight(node, trends, 800, 1000);

      expect(insight.worstMetric).toBe('cpuLoad');
      expect(insight.trends).toBe(trends);
      expect(insight.recommendation).toBeTruthy();
      expect(insight.statusDuration.ms).toBe(200);
    });
  });
});
