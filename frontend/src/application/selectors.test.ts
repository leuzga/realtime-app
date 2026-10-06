import { describe, expect, it } from 'vitest';
import { filterAndSort, getKpis } from './selectors.js';
import { initState, reduceSnapshot } from './reducer.js';

const nodes = [
  { nodeId: 'a', status: 'OK' as const, cpuLoad: 10, memoryUsage: 20, latency: 100, timestamp: 0 },
  { nodeId: 'b', status: 'CRITICAL' as const, cpuLoad: 95, memoryUsage: 90, latency: 500, timestamp: 0 },
  { nodeId: 'c', status: 'WARNING' as const, cpuLoad: 80, memoryUsage: 75, latency: 250, timestamp: 0 }
];

describe('selectors', () => {
  const state = reduceSnapshot(initState(), nodes);

  it('computes KPIs', () => {
    const kpis = getKpis(state);
    expect(kpis.activeCount).toBe(3);
    expect(kpis.criticalCount).toBe(1);
    expect(kpis.avgLatency).toBeCloseTo(283.3, 1);
  });

  it('filters by status', () => {
    expect(filterAndSort(state.nodes.values(), 'CRITICAL', 'latency', 'desc')).toHaveLength(1);
  });

  it('sorts by metric desc', () => {
    const sorted = filterAndSort(state.nodes.values(), null, 'latency', 'desc');
    expect(sorted?.[0]?.nodeId).toBe('b');
  });

  it('sorts by metric asc', () => {
    const sorted = filterAndSort(state.nodes.values(), null, 'cpu', 'asc');
    expect(sorted?.[0]?.nodeId).toBe('a');
  });
});
