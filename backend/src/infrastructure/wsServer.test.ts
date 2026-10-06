import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { createTelemetryServer, type TelemetryServer } from './wsServer.js';

const nextMessage = (socket: WebSocket): Promise<string> =>
  new Promise((resolve) => socket.once('message', (data) => resolve(data.toString())));

describe('createTelemetryServer', () => {
  let server: TelemetryServer | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('sends onConnect payload then broadcasts to clients', async () => {
    server = await createTelemetryServer({
      port: 0,
      path: '/ws',
      heartbeatMs: 60_000,
      onConnect: () => 'hello'
    });

    const client = new WebSocket(`ws://127.0.0.1:${server.port}/ws`);
    expect(await nextMessage(client)).toBe('hello');
    expect(server.clientCount()).toBe(1);

    const pending = nextMessage(client);
    server.broadcast('tick');
    expect(await pending).toBe('tick');
    client.close();
  });

  it('serves /health', async () => {
    server = await createTelemetryServer({ port: 0, path: '/ws', heartbeatMs: 60_000, onConnect: () => '' });
    const res = await fetch(`http://127.0.0.1:${server.port}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('handles 404 on unknown paths', async () => {
    server = await createTelemetryServer({ port: 0, path: '/ws', heartbeatMs: 60_000, onConnect: () => '' });
    const res = await fetch(`http://127.0.0.1:${server.port}/notfound`);
    expect(res.status).toBe(404);
  });

  it('decrements client count on close', async () => {
    server = await createTelemetryServer({ port: 0, path: '/ws', heartbeatMs: 60_000, onConnect: () => '' });
    const client = new WebSocket(`ws://127.0.0.1:${server.port}/ws`);
    await nextMessage(client);
    expect(server.clientCount()).toBe(1);
    client.close();
    await new Promise((r) => setTimeout(r, 100));
    expect(server.clientCount()).toBe(0);
  });
});
