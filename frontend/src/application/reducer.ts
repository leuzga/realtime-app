import type { TelemetryData } from '../domain/telemetry.js';

export interface AppState {
  readonly nodes: ReadonlyMap<string, TelemetryData>;
  readonly history: ReadonlyArray<ReadonlyArray<TelemetryData>>;
}

const HISTORY_SIZE = 60;

// Mutable history buffer (internal detail, not exposed)
let historyBuffer: ReadonlyArray<TelemetryData>[] = [];
let historyIndex = 0;

export const initState = (): AppState => {
  historyBuffer = new Array(HISTORY_SIZE);
  historyIndex = 0;
  return {
    nodes: new Map(),
    history: []
  };
};

export const reduceSnapshot = (_state: AppState, nodes: ReadonlyArray<TelemetryData>): AppState => {
  historyBuffer = new Array(HISTORY_SIZE);
  historyBuffer[0] = nodes;
  historyIndex = 1;
  return {
    nodes: new Map(nodes.map((n) => [n.nodeId, n])),
    history: [nodes]
  };
};

export const reduceBatch = (state: AppState, updates: ReadonlyArray<TelemetryData>): AppState => {
  const next = new Map(state.nodes);
  updates.forEach((u) => next.set(u.nodeId, u));
  const snapshot = Array.from(next.values());

  historyBuffer[historyIndex] = snapshot;
  historyIndex = (historyIndex + 1) % HISTORY_SIZE;

  const history = historyBuffer.filter((h) => h !== undefined);
  return { nodes: next, history };
};
