import { describe, expect, it } from 'vitest';
import type { TelemetryData } from '../domain/telemetry.js';
import { batchMessage, encode, snapshotMessage } from './messages.js';

const node: TelemetryData = {
  nodeId: 'node-0001',
  status: 'OK',
  cpuLoad: 10,
  memoryUsage: 20,
  latency: 30,
  timestamp: 1
};

describe('messages', () => {
  it('encodes a snapshot', () => {
    expect(JSON.parse(encode(snapshotMessage([node])))).toEqual({ type: 'snapshot', nodes: [node] });
  });

  it('encodes a batch', () => {
    expect(JSON.parse(encode(batchMessage([node])))).toEqual({ type: 'batch', updates: [node] });
  });

  it('rejects invalid telemetry', () => {
    expect(() => encode(batchMessage([{ ...node, cpuLoad: 150 }]))).toThrow();
  });
});
