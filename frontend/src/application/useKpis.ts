import { getKpis } from './selectors.js';
import { useAppState } from './useAppState.js';

export const useKpis = () => {
  const state = useAppState();
  return getKpis(state);
};
