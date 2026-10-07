import { useMemo } from 'react';
import type { TelemetryData } from '../domain/telemetry.js';
import { buildNodeInsight, trendOf } from './insights.js';
import { getSeriesByNode } from './selectors.js';
import { useAppState } from './useAppState.js';

export interface NodeInsightMap {
  [nodeId: string]: ReturnType<typeof buildNodeInsight>;
}

export const useNodeInsights = () => {
  const state = useAppState();

  return useMemo(() => {
    const seriesMap = getSeriesByNode(state);
    const now = Math.max(...Array.from(state.nodes.values()).map((n) => n.timestamp), 0);
    const insights: NodeInsightMap = {};

    for (const [nodeId, node] of state.nodes.entries()) {
      const series = seriesMap.get(nodeId);
      const since = state.statusSince.get(nodeId) ?? node.timestamp;

      if (series) {
        insights[nodeId] = buildNodeInsight(
          node,
          {
            cpuLoad: trendOf(series.cpuLoad),
            memoryUsage: trendOf(series.memoryUsage),
            latency: trendOf(series.latency)
          },
          since,
          now
        );
      }
    }

    return insights;
  }, [state]);
};
