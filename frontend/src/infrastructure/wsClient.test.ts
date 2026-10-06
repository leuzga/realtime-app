import { describe, expect, it, vi, afterEach } from 'vitest';
import { createWsClient } from './wsClient.js';

describe('wsClient', () => {
  afterEach(() => vi.clearAllMocks());

  it('calls onMessage when WS message arrives', async () => {
    const onMsg = vi.fn();
    const onConnect = vi.fn();

    global.WebSocket = vi.fn(() => ({
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null
    })) as any;

    const close = createWsClient({
      url: 'ws://test',
      onMessage: onMsg,
      onConnect
    });

    const ws = (global.WebSocket as any).mock.results[0].value;
    ws.onopen?.();
    expect(onConnect).toHaveBeenCalled();

    ws.onmessage?.({ data: '{"type":"snapshot","nodes":[]}' });
    expect(onMsg).toHaveBeenCalled();

    close();
  });

  it('calls onError for invalid JSON', () => {
    const onErr = vi.fn();

    global.WebSocket = vi.fn(() => ({
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null
    })) as any;

    const close = createWsClient({
      url: 'ws://test',
      onMessage: () => {},
      onError: onErr
    });

    const ws = (global.WebSocket as any).mock.results[0].value;
    ws.onmessage?.({ data: 'invalid' });
    expect(onErr).toHaveBeenCalled();

    close();
  });

  it('reconnects with backoff on close', async () => {
    const calls: number[] = [];
    global.WebSocket = vi.fn(() => {
      calls.push(Date.now());
      return {
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null
      };
    }) as any;

    const close = createWsClient({
      url: 'ws://test',
      onMessage: () => {}
    });

    const ws = (global.WebSocket as any).mock.results[0].value;
    ws.onclose?.();
    await new Promise((r) => setTimeout(r, 200));
    expect(calls.length).toBeGreaterThan(1);

    close();
  });
});
