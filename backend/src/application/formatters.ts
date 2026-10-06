import type { ServerMessage, TelemetryData } from '../domain/telemetry.js';
import { mapArray } from './pipe.js';

/** Pure formatter: JSON serialization with validation */
export const toJsonString = (value: unknown): string => JSON.stringify(value);

/** Pure formatter: TelemetryData to wire format */
export const formatTelemetry =
  (node: TelemetryData): TelemetryData => ({
    ...node,
    cpuLoad: Math.round(node.cpuLoad * 10) / 10,
    memoryUsage: Math.round(node.memoryUsage * 10) / 10,
    latency: Math.round(node.latency)
  });

/** Pure formatter: format array of telemetry */
export const formatTelemetryArray =
  (nodes: ReadonlyArray<TelemetryData>): ReadonlyArray<TelemetryData> =>
    mapArray(formatTelemetry)(nodes);

/** Pure formatter: message to wire string */
export const messageToWire =
  (msg: ServerMessage): string =>
    toJsonString(msg);

/** Pure formatter: truncate string with ellipsis */
export const truncate =
  (len: number) =>
  (str: string): string =>
    str.length > len ? `${str.slice(0, len)}...` : str;
