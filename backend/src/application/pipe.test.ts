import { describe, expect, it } from 'vitest';
import { foldL, mapArray, compose } from './pipe.js';

describe('foldL', () => {
  it('reduces array to single value', () => {
    const sum = foldL<number, number>((acc, val) => acc + val)(0);
    expect(sum([1, 2, 3])).toBe(6);
  });

  it('works with objects', () => {
    const merge = foldL<{ k: string; v: number }, Record<string, number>>(
      (acc, item) => ({ ...acc, [item.k]: item.v })
    )({});
    expect(merge([{ k: 'a', v: 1 }, { k: 'b', v: 2 }])).toEqual({ a: 1, b: 2 });
  });
});

describe('mapArray', () => {
  it('maps over readonly array', () => {
    const double = mapArray((n: number) => n * 2);
    const result = double([1, 2, 3] as const);
    expect(result).toEqual([2, 4, 6]);
  });
});

describe('compose', () => {
  it('composes right-to-left', () => {
    const inc = (n: number) => n + 1;
    const dbl = (n: number) => n * 2;
    const result = compose(dbl, inc)(5);
    expect(result).toBe(12); // (5 + 1) * 2
  });
});
