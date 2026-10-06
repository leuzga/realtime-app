import { useDeferredValue, useState } from 'react';
import { filterAndSort } from './selectors.js';
import { useAppState } from './useAppState.js';
import type { NodeStatus } from '../domain/telemetry.js';

export const useNodeGrid = () => {
  const state = useAppState();
  const [filter, setFilter] = useState<NodeStatus | null>(null);
  const [sort, setSort] = useState<'latency' | 'cpu' | 'memory'>('latency');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const deferredFilter = useDeferredValue(filter);
  const deferredSort = useDeferredValue(sort);

  const nodes = filterAndSort(state.nodes.values(), deferredFilter, deferredSort, order);

  return {
    nodes,
    filter,
    setFilter: (f: NodeStatus | null) => {
      setFilter(f);
    },
    sort,
    setSort: (s: typeof sort) => {
      setSort(s);
    },
    order,
    setOrder: (o: 'asc' | 'desc') => setOrder(o)
  };
};
