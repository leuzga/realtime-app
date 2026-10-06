import { useSyncExternalStore } from 'use-sync-external-store';
import { getStore } from './store.js';

const store = getStore();

export const useAppState = () =>
  useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getState()
  );
