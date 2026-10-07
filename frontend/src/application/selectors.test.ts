import { describe, expect, it } from 'vitest';
import { filterAndSort, getKpis, getSeriesByNode } from './selectors.js';
import { initState, reduceSnapshot, reduceBatch } from './reducer.js';

const nodes = [
  { nodeId: 'a', status: 'OK' as const, cpuLoad: 10, memoryUsage: 20, latency: 100, timestamp: 0 },
  { nodeId: 'b', status: 'CRITICAL' as const, cpuLoad: 95, memoryUsage: 90, latency: 500, timestamp: 0 },
  { nodeId: 'c', status: 'WARNING' as const, cpuLoad: 80, memoryUsage: 75, latency: 250, timestamp: 0 }
];

describe('selectors', () => {
  const state = reduceSnapshot(initState(), nodes);

  it('computes KPIs with new fields', () => {
    const kpis = getKpis(state);
    expect(kpis.activeCount).toBe(3);
    expect(kpis.criticalCount).toBe(1);
    expect(kpis.warningCount).toBe(1);
    expect(kpis.avgLatency).toBeCloseTo(283.3, 1);
    expect(kpis.avgCpu).toBeCloseTo(61.7, 1);
    expect(kpis.avgMemory).toBeCloseTo(61.7, 1);
  });

  it('filters by status', () => {
    expect(filterAndSort(state.nodes, 'CRITICAL', 'latency', 'desc')).toHaveLength(1);
  });

  it('sorts by metric desc', () => {
    const sorted = filterAndSort(state.nodes, null, 'latency', 'desc');
    expect(sorted?.[0]?.nodeId).toBe('b');
  });

  it('sorts by metric asc', () => {
    const sorted = filterAndSort(state.nodes, null, 'cpu', 'asc');
    expect(sorted?.[0]?.nodeId).toBe('a');
  });

  it('caches filterAndSort by nodes Map identity', () => {
    const result1 = filterAndSort(state.nodes, null, 'latency', 'desc');
    const result2 = filterAndSort(state.nodes, null, 'latency', 'desc');
    expect(result1).toBe(result2);
  });

  it('invalidates filterAndSort cache when nodes Map changes', () => {
    const newState = reduceBatch(state, [{ ...nodes[0], cpuLoad: 99, timestamp: 1 }]);
    const result1 = filterAndSort(state.nodes, null, 'latency', 'desc');
    const result2 = filterAndSort(newState.nodes, null, 'latency', 'desc');
    expect(result1).not.toBe(result2);
  });

  it('builds series per node', () => {
    let state2 = reduceSnapshot(initState(), [nodes[0]]);
    state2 = reduceBatch(state2, [{ ...nodes[0], cpuLoad: 20, timestamp: 1 }]);
    state2 = reduceBatch(state2, [{ ...nodes[0], cpuLoad: 30, timestamp: 2 }]);

    const series = getSeriesByNode(state2);
    expect(series.has('a')).toBe(true);
    expect(series.get('a')?.cpuLoad).toEqual([10, 20, 30]);
  });

  it('memoizes getSeriesByNode by state identity', () => {
    const series1 = getSeriesByNode(state);
    const series2 = getSeriesByNode(state);
    expect(series1).toBe(series2);
  });
});
