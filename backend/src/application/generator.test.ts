import { describe, expect, it } from 'vitest';
import { TelemetrySchema } from '../domain/telemetry.js';
import { mulberry32 } from '../infrastructure/rng.js';
import {
  SIGNALS,
  clamp,
  createNode,
  formatNodeId,
  nextTelemetry,
  roundTo,
  stepSignal
} from './generator.js';

const constant = (value: number) => () => value;

describe('helpers', () => {
  it('clamp bounds values', () => {
    expect(clamp(0, 10, -5)).toBe(0);
    expect(clamp(0, 10, 15)).toBe(10);
    expect(clamp(0, 10, 5)).toBe(5);
  });

  it('roundTo rounds to given digits', () => {
    expect(roundTo(1, 12.345)).toBe(12.3);
  });

  it('formatNodeId pads index (1-based)', () => {
    expect(formatNodeId(0)).toBe('node-0001');
    expect(formatNodeId(41)).toBe('node-0042');
  });
});

describe('stepSignal', () => {
  it('pulls value toward the mean when noise is neutral', () => {
    // rng 0.5 → zero noise, and 0.5 > spike probability → no spike
    const next = stepSignal(constant(0.5), SIGNALS.cpuLoad, 90);
    expect(next).toBeLessThan(90);
    expect(next).toBeGreaterThan(SIGNALS.cpuLoad.mean);
  });

  it('jumps to spike value when rng hits spike probability', () => {
    expect(stepSignal(constant(0), SIGNALS.latency, 100)).toBe(SIGNALS.latency.spike);
  });

  it('never leaves profile bounds', () => {
    const rng = mulberry32(7);
    let value = SIGNALS.cpuLoad.mean;
    for (let i = 0; i < 5000; i += 1) {
      value = stepSignal(rng, SIGNALS.cpuLoad, value);
      expect(value).toBeGreaterThanOrEqual(SIGNALS.cpuLoad.min);
      expect(value).toBeLessThanOrEqual(SIGNALS.cpuLoad.max);
    }
  });
});

describe('createNode / nextTelemetry', () => {
  it('produces schema-valid telemetry', () => {
    const node = createNode(mulberry32(1), 'node-0001', 1000);
    expect(TelemetrySchema.parse(node)).toEqual(node);
    expect(node.timestamp).toBe(1000);
  });

  it('is deterministic for the same seed', () => {
    const a = nextTelemetry(mulberry32(3), createNode(mulberry32(3), 'n', 0), 1);
    const b = nextTelemetry(mulberry32(3), createNode(mulberry32(3), 'n', 0), 1);
    expect(a).toEqual(b);
  });

  it('does not mutate the previous sample and keeps nodeId', () => {
    const prev = Object.freeze(createNode(mulberry32(5), 'node-0009', 0));
    const next = nextTelemetry(mulberry32(6), prev, 250);
    expect(next).not.toBe(prev);
    expect(next.nodeId).toBe('node-0009');
    expect(next.timestamp).toBe(250);
    expect(TelemetrySchema.safeParse(next).success).toBe(true);
  });
});
