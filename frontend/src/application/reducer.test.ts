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

  it('initializes statusSince on snapshot', () => {
    const state = reduceSnapshot(initState(), [node('a'), node('b')]);
    expect(state.statusSince.size).toBe(2);
    expect(state.statusSince.get('a')).toBe(1);
    expect(state.statusSince.get('b')).toBe(1);
  });

  it('updates statusSince when status changes', () => {
    let state = reduceSnapshot(initState(), [node('a')]);
    expect(state.statusSince.get('a')).toBe(1);

    state = reduceBatch(state, [{ ...node('a'), status: 'WARNING' as const, timestamp: 100 }]);
    expect(state.statusSince.get('a')).toBe(100);
  });

  it('preserves statusSince when status unchanged', () => {
    let state = reduceSnapshot(initState(), [node('a')]);
    state = reduceBatch(state, [{ ...node('a'), cpuLoad: 50, timestamp: 100 }]);
    expect(state.statusSince.get('a')).toBe(1);
  });

  it('maintains chronological order in history after wrap', () => {
    let state = reduceSnapshot(initState(), [{ ...node('x'), timestamp: 0 }]);
    for (let i = 1; i < 70; i += 1) {
      state = reduceBatch(state, [{ ...node('x'), timestamp: i }]);
    }

    expect(state.history.length).toBe(60);
    const timestamps = state.history.map((frame) => frame[0]?.timestamp ?? -1);
    for (let i = 1; i < timestamps.length; i += 1) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
    }
  });
});
