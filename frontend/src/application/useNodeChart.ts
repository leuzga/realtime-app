import { getNodeSeries } from './selectors.js';
import { useAppState } from './useAppState.js';

export const useNodeChart = (nodeId: string, metric: 'cpuLoad' | 'memoryUsage' | 'latency') => {
  const state = useAppState();
  const series = getNodeSeries(state, nodeId, metric);
  const maxVal = Math.max(...series, metric === 'latency' ? 1000 : 100);
  return { series, maxVal };
};
