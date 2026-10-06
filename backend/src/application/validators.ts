import { z } from 'zod';
import type { TelemetryData } from '../domain/telemetry.js';

/** Pure validator: check if value in range */
export const inRange =
  (min: number, max: number) =>
  (value: number): boolean =>
    value >= min && value <= max;

/** Pure validator: check if all metrics valid */
export const isValidMetrics =
  (node: TelemetryData): boolean =>
    inRange(0, 100)(node.cpuLoad) &&
    inRange(0, 100)(node.memoryUsage) &&
    inRange(0, Infinity)(node.latency) &&
    node.timestamp >= 0;

/** Pure validator: check if array non-empty */
export const isNonEmpty = <A>(arr: ReadonlyArray<A>): arr is ReadonlyArray<A> => arr.length > 0;

/** Pure validator: check if node timestamp recent */
export const isRecent =
  (maxAgeMsec: number) =>
  (node: TelemetryData, now: number): boolean =>
    now - node.timestamp < maxAgeMsec;

/** Pure validator: validate batch with Zod */
export const validateBatch =
  (schema: z.ZodType) =>
  (data: unknown): { valid: boolean; error?: string } => {
    try {
      schema.parse(data);
      return { valid: true };
    } catch (err) {
      return { valid: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  };
