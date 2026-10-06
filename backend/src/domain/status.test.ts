import { describe, expect, it } from 'vitest';
import { deriveStatus } from './status.js';

const healthy = { cpuLoad: 30, memoryUsage: 40, latency: 80 };

describe('deriveStatus', () => {
  it('returns OK when every metric is below warning', () => {
    expect(deriveStatus(healthy)).toBe('OK');
  });

  it.each([
    ['cpuLoad', 75],
    ['memoryUsage', 80],
    ['latency', 250]
  ] as const)('returns WARNING when %s reaches its warning threshold', (metric, value) => {
    expect(deriveStatus({ ...healthy, [metric]: value })).toBe('WARNING');
  });

  it.each([
    ['cpuLoad', 90],
    ['memoryUsage', 92],
    ['latency', 600]
  ] as const)('returns CRITICAL when %s reaches its critical threshold', (metric, value) => {
    expect(deriveStatus({ ...healthy, [metric]: value })).toBe('CRITICAL');
  });

  it('uses the worst metric', () => {
    expect(deriveStatus({ cpuLoad: 80, memoryUsage: 95, latency: 10 })).toBe('CRITICAL');
  });
});
