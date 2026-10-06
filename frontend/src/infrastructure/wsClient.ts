import { parseMessage } from '../domain/telemetry.js';
import type { ServerMessage } from '../domain/telemetry.js';

export interface WsClientOpts {
  readonly url: string;
  readonly onMessage: (msg: ServerMessage) => void;
  readonly onConnect?: () => void;
  readonly onError?: (err: Event | Error) => void;
}

const BACKOFF_INIT = 100;
const BACKOFF_MAX = 10000;

export const createWsClient = (opts: WsClientOpts) => {
  let ws: WebSocket | undefined;
  let backoff = BACKOFF_INIT;
  let isClosed = false;

  const connect = (): void => {
    if (isClosed) return;
    ws = new WebSocket(opts.url);
    ws.onopen = () => {
      backoff = BACKOFF_INIT;
      opts.onConnect?.();
    };
    ws.onmessage = (e) => {
      try {
        opts.onMessage(parseMessage(e.data));
      } catch (err) {
        opts.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    };
    ws.onerror = (e) => opts.onError?.(e);
    ws.onclose = () => {
      backoff = Math.min(backoff * 1.5, BACKOFF_MAX);
      setTimeout(connect, backoff);
    };
  };

  connect();
  return () => {
    isClosed = true;
    ws?.close();
  };
};
