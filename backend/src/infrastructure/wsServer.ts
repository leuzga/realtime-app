import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { WebSocket, WebSocketServer } from 'ws';

export interface TelemetryServerOptions {
  readonly port: number;
  readonly path: string;
  readonly heartbeatMs: number;
  /** Payload sent to each client right after it connects (e.g. a snapshot). */
  readonly onConnect: () => string;
}

export interface TelemetryServer {
  readonly port: number;
  readonly clientCount: () => number;
  readonly broadcast: (payload: string) => void;
  readonly close: () => Promise<void>;
}

/** Skip clients whose socket buffer is backed up instead of queueing unbounded memory. */
const MAX_BUFFERED_BYTES = 1024 * 1024;

const handleHttp = (server: Server): void => {
  server.on('request', (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' }).end('{"status":"ok"}');
      return;
    }
    res.writeHead(404).end();
  });
};

export const createTelemetryServer = (options: TelemetryServerOptions): Promise<TelemetryServer> =>
  new Promise((resolve, reject) => {
    const http = createServer();
    handleHttp(http);

    const wss = new WebSocketServer({ server: http, path: options.path });
    const alive = new WeakMap<WebSocket, boolean>();

    wss.on('connection', (socket) => {
      alive.set(socket, true);
      socket.on('pong', () => alive.set(socket, true));
      socket.send(options.onConnect());
    });

    const heartbeat = setInterval(() => {
      wss.clients.forEach((socket) => {
        if (!alive.get(socket)) {
          socket.terminate();
          return;
        }
        alive.set(socket, false);
        socket.ping();
      });
    }, options.heartbeatMs);

    const broadcast = (payload: string): void => {
      wss.clients.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN && socket.bufferedAmount < MAX_BUFFERED_BYTES) {
          socket.send(payload);
        }
      });
    };

    const close = (): Promise<void> =>
      new Promise((done) => {
        clearInterval(heartbeat);
        wss.clients.forEach((socket) => socket.terminate());
        wss.close(() => http.close(() => done()));
      });

    http.once('error', reject);
    http.listen(options.port, () => {
      resolve({
        port: (http.address() as AddressInfo).port,
        clientCount: () => wss.clients.size,
        broadcast,
        close
      });
    });
  });
