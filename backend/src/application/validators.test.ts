import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { inRange, isValidMetrics, isNonEmpty, isRecent, validateBatch } from './validators.js';

describe('validators', () => {
  it('inRange checks bounds', () => {
    expect(inRange(0, 100)(50)).toBe(true);
    expect(inRange(0, 100)(101)).toBe(false);
    expect(inRange(0, 100)(-1)).toBe(false);
  });

  it('isValidMetrics validates node', () => {
    const valid = { nodeId: 'a', status: 'OK' as const, cpuLoad: 50, memoryUsage: 60, latency: 100, timestamp: 0 };
    expect(isValidMetrics(valid)).toBe(true);

    const invalid = { ...valid, cpuLoad: 150 };
    expect(isValidMetrics(invalid)).toBe(false);
  });

  it('isNonEmpty is type guard', () => {
    const arr: readonly number[] = [1];
    if (isNonEmpty(arr)) {
      expect(arr.length).toBeGreaterThan(0);
    }
  });

  it('isRecent checks timestamp', () => {
    const now = 1000;
    const node = { nodeId: 'a', status: 'OK' as const, cpuLoad: 10, memoryUsage: 20, latency: 30, timestamp: 900 };
    expect(isRecent(200)(node, now)).toBe(true);
    expect(isRecent(50)(node, now)).toBe(false);
  });
});

describe('validateBatch', () => {
  it('validates with Zod schema', () => {
    const schema = z.object({ x: z.number() });
    const valid = validateBatch(schema)({ x: 5 });
    expect(valid.valid).toBe(true);

    const invalid = validateBatch(schema)({ x: 'not a number' });
    expect(invalid.valid).toBe(false);
    expect(invalid.error).toBeDefined();
  });
});
