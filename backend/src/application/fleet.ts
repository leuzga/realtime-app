import type { Rng, TelemetryData } from '../domain/telemetry.js';
import { createNode, formatNodeId, nextTelemetry } from './generator.js';

export type Fleet = ReadonlyArray<TelemetryData>;

export interface Tick {
  readonly fleet: Fleet;
  /** Only the nodes that changed this tick (delta sent over the wire). */
  readonly updates: Fleet;
}

export const initFleet = (rng: Rng, size: number, now: number): Fleet =>
  Array.from({ length: size }, (_, index) => createNode(rng, formatNodeId(index), now));

/** Advances a random subset (≈ updateRatio) of nodes; untouched nodes keep identity. */
export const tickFleet = (rng: Rng, fleet: Fleet, now: number, updateRatio: number): Tick => {
  const next = fleet.map((node) => (rng() < updateRatio ? nextTelemetry(rng, node, now) : node));
  return { fleet: next, updates: next.filter((node, index) => node !== fleet[index]) };
};
