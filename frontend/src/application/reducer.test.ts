import { describe, expect, it } from 'vitest';
import { initState, reduceBatch, reduceSnapshot } from './reducer.js';

const node = (id: string) => ({
  nodeId: id,
  status: 'OK' as const,
  cpuLoad: 10,
  memoryUsage: 20,
  latency: 30,
  timestamp: 1
});

describe('reducer', () => {
  it('snapshot replaces state', () => {
    const state = reduceSnapshot(initState(), [node('a'), node('b')]);
    expect(state.nodes.size).toBe(2);
    expect(state.history.length).toBe(1);
  });

  it('batch merges updates', () => {
    const state = reduceSnapshot(initState(), [node('a')]);
    const next = reduceBatch(state, [{ ...node('a'), cpuLoad: 50 }]);
    expect(next.nodes.get('a')?.cpuLoad).toBe(50);
    expect(next.history.length).toBe(2);
  });

  it('limits history to 60 frames', () => {
    let state = reduceSnapshot(initState(), [node('x')]);
    for (let i = 0; i < 100; i += 1) state = reduceBatch(state, [{ ...node('x'), timestamp: i }]);
    expect(state.history.length).toBe(60);
  });
});
