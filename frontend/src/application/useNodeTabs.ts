import { useState } from 'react';
import { countByStatus } from '../../domain/telemetry.js';
import type { NodeStatus } from '../domain/telemetry.js';
import { useAppState } from './useAppState.js';

export const useNodeTabs = () => {
  const state = useAppState();
  const [activeTab, setActiveTab] = useState<'all' | NodeStatus>('all');

  const nodes = Array.from(state.nodes.values());
  const counts = countByStatus(nodes);

  return {
    activeTab,
    setActiveTab,
    counts,
    totalNodes: nodes.length
  };
};

const countByStatus = (nodes: readonly any[]): Record<string, number> => {
  const counts: Record<string, number> = { OK: 0, WARNING: 0, CRITICAL: 0 };
  nodes.forEach((n) => {
    if (n.status in counts) counts[n.status]++;
  });
  return counts;
};
