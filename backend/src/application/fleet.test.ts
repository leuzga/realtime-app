import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../infrastructure/rng.js';
import { initFleet, tickFleet } from './fleet.js';

describe('initFleet', () => {
  it('creates the requested number of uniquely identified nodes', () => {
    const fleet = initFleet(mulberry32(1), 50, 0);
    expect(fleet).toHaveLength(50);
    expect(new Set(fleet.map((n) => n.nodeId)).size).toBe(50);
  });
});

describe('tickFleet', () => {
  const fleet = Object.freeze(initFleet(mulberry32(1), 100, 0));

  it('updates nothing with ratio 0 and preserves identity', () => {
    const tick = tickFleet(mulberry32(2), fleet, 250, 0);
    expect(tick.updates).toHaveLength(0);
    tick.fleet.forEach((node, i) => expect(node).toBe(fleet[i]));
  });

  it('updates every node with ratio 1', () => {
    const tick = tickFleet(mulberry32(2), fleet, 250, 1);
    expect(tick.updates).toHaveLength(100);
    expect(tick.updates.every((n) => n.timestamp === 250)).toBe(true);
  });

  it('returns only changed nodes as updates and keeps order', () => {
    const tick = tickFleet(mulberry32(2), fleet, 250, 0.3);
    expect(tick.updates.length).toBeGreaterThan(0);
    expect(tick.updates.length).toBeLessThan(100);
    expect(tick.fleet.map((n) => n.nodeId)).toEqual(fleet.map((n) => n.nodeId));
    tick.updates.forEach((u) => expect(fleet).not.toContain(u));
  });
});
