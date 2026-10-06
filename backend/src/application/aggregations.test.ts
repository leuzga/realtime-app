import { describe, expect, it } from 'vitest';
import { aggregateStats, countByStatus, findCriticals } from './aggregations.js';

const nodes = [
  { nodeId: 'a', status: 'OK' as const, cpuLoad: 20, memoryUsage: 30, latency: 100, timestamp: 0 },
  { nodeId: 'b', status: 'CRITICAL' as const, cpuLoad: 95, memoryUsage: 90, latency: 500, timestamp: 0 },
  { nodeId: 'c', status: 'WARNING' as const, cpuLoad: 75, memoryUsage: 80, latency: 250, timestamp: 0 }
];

describe('aggregateStats', () => {
  it('computes averages', () => {
    const stats = aggregateStats(nodes);
    expect(stats.count).toBe(3);
    expect(stats.avgCpu).toBeCloseTo((20 + 95 + 75) / 3, 1);
    expect(stats.criticalCount).toBe(1);
  });

  it('handles empty array', () => {
    const stats = aggregateStats([]);
    expect(stats.count).toBe(0);
    expect(stats.avgCpu).toBe(0);
  });
});

describe('countByStatus', () => {
  it('counts by status', () => {
    const counts = countByStatus(nodes);
    expect(counts.OK).toBe(1);
    expect(counts.CRITICAL).toBe(1);
    expect(counts.WARNING).toBe(1);
  });
});

describe('findCriticals', () => {
  it('filters critical nodes', () => {
    const criticals = findCriticals(nodes);
    expect(criticals).toHaveLength(1);
    expect(criticals[0].nodeId).toBe('b');
  });
});
