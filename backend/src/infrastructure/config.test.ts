import { describe, expect, it } from 'vitest';
import { parseConfig } from './config.js';

describe('parseConfig', () => {
  it('applies defaults', () => {
    expect(parseConfig({})).toEqual({
      port: 4000,
      nodeCount: 250,
      tickMs: 250,
      updateRatio: 0.3,
      seed: undefined
    });
  });

  it('coerces string env values', () => {
    const config = parseConfig({ PORT: '5000', NODE_COUNT: '10', TICK_MS: '100', UPDATE_RATIO: '1', SEED: '42' });
    expect(config).toEqual({ port: 5000, nodeCount: 10, tickMs: 100, updateRatio: 1, seed: 42 });
  });

  it('rejects out-of-range values', () => {
    expect(() => parseConfig({ UPDATE_RATIO: '2' })).toThrow();
    expect(() => parseConfig({ NODE_COUNT: '0' })).toThrow();
  });
});
