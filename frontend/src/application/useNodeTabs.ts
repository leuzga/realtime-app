import { useState } from 'react';
import type { NodeStatus } from '../domain/telemetry.js';
import { countByStatus } from './insights.js';
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
