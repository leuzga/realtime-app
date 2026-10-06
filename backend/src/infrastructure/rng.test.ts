import { describe, expect, it } from 'vitest';
import { mulberry32 } from './rng.js';

describe('mulberry32', () => {
  it('is reproducible for the same seed', () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });

  it('yields values in [0, 1)', () => {
    const rng = mulberry32(9);
    for (let i = 0; i < 1000; i += 1) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
