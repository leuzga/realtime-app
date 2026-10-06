import type { AppState } from './reducer.js';
import { initState, reduceBatch, reduceSnapshot } from './reducer.js';
import type { ServerMessage } from '../domain/telemetry.js';

export type StoreListener = () => void;

export class Store {
  private state: AppState = initState();
  private listeners = new Set<StoreListener>();

  getState(): AppState {
    return this.state;
  }

  dispatch(message: ServerMessage): void {
    this.state = message.type === 'snapshot' ? reduceSnapshot(this.state, message.nodes) : reduceBatch(this.state, message.updates);
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

let instance: Store | undefined;

export const getStore = (): Store => {
  if (!instance) instance = new Store();
  return instance;
};
