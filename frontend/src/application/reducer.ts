import type { TelemetryData } from '../domain/telemetry.js';

export interface AppState {
  readonly nodes: ReadonlyMap<string, TelemetryData>;
  readonly history: ReadonlyArray<ReadonlyArray<TelemetryData>>;
  readonly statusSince: ReadonlyMap<string, number>;
}

const HISTORY_SIZE = 60;

// Mutable history buffer (internal detail, not exposed)
let historyBuffer: ReadonlyArray<TelemetryData>[] = [];
let historyIndex = 0;

const initStatusSince = (nodes: ReadonlyArray<TelemetryData>): Map<string, number> =>
  new Map(nodes.map((n) => [n.nodeId, n.timestamp]));

export const initState = (): AppState => {
  historyBuffer = new Array(HISTORY_SIZE);
  historyIndex = 0;
  return {
    nodes: new Map(),
    history: [],
    statusSince: new Map()
  };
};

export const reduceSnapshot = (_state: AppState, nodes: ReadonlyArray<TelemetryData>): AppState => {
  historyBuffer = new Array(HISTORY_SIZE);
  historyBuffer[0] = nodes;
  historyIndex = 1;
  return {
    nodes: new Map(nodes.map((n) => [n.nodeId, n])),
    history: [nodes],
    statusSince: initStatusSince(nodes)
  };
};

export const reduceBatch = (state: AppState, updates: ReadonlyArray<TelemetryData>): AppState => {
  const next = new Map(state.nodes);
  const nextStatusSince = new Map(state.statusSince);

  updates.forEach((u) => {
    const prev = state.nodes.get(u.nodeId);
    const prevStatus = prev?.status;
    const statusChanged = prevStatus !== u.status;

    if (statusChanged) {
      nextStatusSince.set(u.nodeId, u.timestamp);
    } else if (!nextStatusSince.has(u.nodeId)) {
      nextStatusSince.set(u.nodeId, u.timestamp);
    }

    next.set(u.nodeId, u);
  });

  const snapshot = Array.from(next.values());
  historyBuffer[historyIndex] = snapshot;
  historyIndex = (historyIndex + 1) % HISTORY_SIZE;

  const history: ReadonlyArray<TelemetryData>[] = [];
  for (let i = 0; i < HISTORY_SIZE; i++) {
    const frameIndex = (historyIndex + i) % HISTORY_SIZE;
    if (historyBuffer[frameIndex] !== undefined) {
      history.push(historyBuffer[frameIndex]!);
    }
  }

  return { nodes: next, history, statusSince: nextStatusSince };
};
