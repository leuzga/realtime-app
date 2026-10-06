import { deriveStatus } from '../domain/status.js';
import type { Metrics, Rng, TelemetryData } from '../domain/telemetry.js';

interface SignalProfile {
  readonly mean: number;
  readonly noise: number;
  readonly min: number;
  readonly max: number;
  readonly spike: number;
}

/** Per-metric behaviour: mean-reverting noise with occasional spikes. */
export const SIGNALS: Readonly<Record<keyof Metrics, SignalProfile>> = {
  cpuLoad: { mean: 45, noise: 8, min: 0, max: 100, spike: 96 },
  memoryUsage: { mean: 55, noise: 3, min: 0, max: 100, spike: 94 },
  latency: { mean: 120, noise: 35, min: 5, max: 2000, spike: 850 }
};

export const MEAN_REVERSION = 0.06;
export const SPIKE_PROBABILITY = 0.02;

export const clamp = (min: number, max: number, value: number): number =>
  Math.min(max, Math.max(min, value));

export const roundTo = (digits: number, value: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/** Ornstein–Uhlenbeck-like step: pull toward mean + symmetric noise, rare spike. */
export const stepSignal = (rng: Rng, profile: SignalProfile, value: number): number => {
  const reverted = value + (profile.mean - value) * MEAN_REVERSION;
  const noisy = reverted + (rng() * 2 - 1) * profile.noise;
  const next = rng() < SPIKE_PROBABILITY ? profile.spike : noisy;
  return clamp(profile.min, profile.max, next);
};

export const formatNodeId = (index: number): string =>
  `node-${String(index + 1).padStart(4, '0')}`;

const toTelemetry = (nodeId: string, timestamp: number, metrics: Metrics): TelemetryData => ({
  nodeId,
  status: deriveStatus(metrics),
  cpuLoad: roundTo(1, metrics.cpuLoad),
  memoryUsage: roundTo(1, metrics.memoryUsage),
  latency: Math.round(metrics.latency),
  timestamp
});

const around = (rng: Rng, profile: SignalProfile, spread: number): number =>
  clamp(profile.min, profile.max, profile.mean + (rng() * 2 - 1) * spread);

export const createNode = (rng: Rng, nodeId: string, now: number): TelemetryData =>
  toTelemetry(nodeId, now, {
    cpuLoad: around(rng, SIGNALS.cpuLoad, 20),
    memoryUsage: around(rng, SIGNALS.memoryUsage, 15),
    latency: around(rng, SIGNALS.latency, 80)
  });

export const nextTelemetry = (rng: Rng, prev: TelemetryData, now: number): TelemetryData =>
  toTelemetry(prev.nodeId, now, {
    cpuLoad: stepSignal(rng, SIGNALS.cpuLoad, prev.cpuLoad),
    memoryUsage: stepSignal(rng, SIGNALS.memoryUsage, prev.memoryUsage),
    latency: stepSignal(rng, SIGNALS.latency, prev.latency)
  });
