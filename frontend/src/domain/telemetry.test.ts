import { describe, expect, it } from 'vitest';
import { parseMessage } from './telemetry.js';

describe('parseMessage', () => {
  it('parses snapshot', () => {
    const msg = parseMessage(
      '{"type":"snapshot","nodes":[{"nodeId":"x","status":"OK","cpuLoad":10,"memoryUsage":20,"latency":30,"timestamp":1}]}'
    );
    expect(msg.type).toBe('snapshot');
    expect(msg.type === 'snapshot' && msg.nodes.length).toBe(1);
  });

  it('rejects invalid payload', () => {
    expect(() => parseMessage('{"type":"snapshot","nodes":[{"invalid":true}]}')).toThrow();
  });
});
