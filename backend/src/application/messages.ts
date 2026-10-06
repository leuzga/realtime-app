import { ServerMessageSchema, type ServerMessage } from '../domain/telemetry.js';
import type { Fleet } from './fleet.js';

export const snapshotMessage = (fleet: Fleet): ServerMessage => ({
  type: 'snapshot',
  nodes: [...fleet]
});

export const batchMessage = (updates: Fleet): ServerMessage => ({
  type: 'batch',
  updates: [...updates]
});

/** Validates outbound payloads against the shared contract before serialising. */
export const encode = (message: ServerMessage): string =>
  JSON.stringify(ServerMessageSchema.parse(message));
