import { useMemo } from 'react';
import { fleetImpact, countByStatus } from './insights.js';
import { useAppState } from './useAppState.js';

export const useFleetAlert = () => {
  const state = useAppState();

  return useMemo(() => {
    const nodes = Array.from(state.nodes.values());
    const counts = countByStatus(nodes);
    return fleetImpact(counts, nodes.length);
  }, [state.nodes]);
};
