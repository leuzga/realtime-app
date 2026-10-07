import { useMemo } from 'react';
import { trendOf } from './insights.js';
import { getSeriesByNode, getKpis } from './selectors.js';
import { useAppState } from './useAppState.js';

export const useKpiTrends = () => {
  const state = useAppState();

  return useMemo(() => {
    const kpis = getKpis(state);
    const seriesMap = getSeriesByNode(state);

    const allCpuValues: number[] = [];
    const allMemValues: number[] = [];
    const allLatValues: number[] = [];

    for (const series of seriesMap.values()) {
      allCpuValues.push(...series.cpuLoad);
      allMemValues.push(...series.memoryUsage);
      allLatValues.push(...series.latency);
    }

    return {
      cpu: trendOf(allCpuValues),
      memory: trendOf(allMemValues),
      latency: trendOf(allLatValues)
    };
  }, [state]);
};
