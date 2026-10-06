import { useState, useMemo } from 'react';
import type { TelemetryData } from '../domain/telemetry.js';
import { useNodeGrid } from '../application/useNodeGrid.js';
import { useNodeTabs } from '../application/useNodeTabs.js';
import { useInfiniteScroll } from '../application/useInfiniteScroll.js';
import { Badge } from './dashboard/Badge.js';
import { ElevatedCard } from './dashboard/ElevatedCard.js';
import { Tabs } from './dashboard/Tabs.js';
import { InfoIcon } from './dashboard/InfoIcon.js';
import type { NodeStatus } from '../domain/telemetry.js';

// Style constants
const SORT_BUTTON_BASE_STYLE = { padding: '4px 8px', border: '1px solid var(--palette-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '11px', color: 'var(--palette-fg)', transition: 'all 150ms' } as const;
const ORDER_BUTTON_STYLE = { padding: '4px 8px', border: '1px solid var(--palette-border)', background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '11px', color: 'var(--palette-fg)', transition: 'all 150ms' } as const;
const LOAD_MORE_BUTTON_STYLE = { padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--palette-success)', color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 'var(--weight-medium)' as const, marginTop: '8px', transition: 'background 200ms', alignSelf: 'center' as const, minWidth: '200px' } as const;
const BACK_TO_TOP_STYLE = { position: 'fixed' as const, bottom: '40px', right: '40px', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--palette-success)', color: '#000', cursor: 'pointer', fontSize: '12px', fontWeight: 'var(--weight-medium)' as const, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', transition: 'all 200ms', zIndex: 100 } as const;

// Tab label configs
const OK_LABEL = <span style={{ color: 'var(--palette-success)', fontWeight: 'bold' }}>✓ OK</span>;
const WARNING_LABEL = <span style={{ color: 'var(--palette-warning)', fontWeight: 'bold' }}>⚠ WARNING</span>;
const CRITICAL_LABEL = <span style={{ color: 'var(--palette-critical)', fontWeight: 'bold' }}>✕ CRITICAL</span>;

const renderNodeCard = (node: TelemetryData, onSelect: (id: string) => void) => (
  <div key={node.nodeId} onClick={() => onSelect(node.nodeId)} style={{ cursor: 'pointer' }}>
    <ElevatedCard style={{ cursor: 'pointer', transition: 'border-color 200ms' }}>
      <div style={{ marginBottom: 'var(--size-sm)' }}>
        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>{node.nodeId}</div>
        <Badge status={node.status} />
      </div>
      <div style={{ fontSize: '12px', display: 'grid', gap: '4px', marginTop: 'var(--size-md)' }}>
        <div>
          <span style={{ opacity: 0.7 }}>CPU:</span> <strong>{node.cpuLoad.toFixed(1)}%</strong>
        </div>
        <div>
          <span style={{ opacity: 0.7 }}>MEM:</span> <strong>{node.memoryUsage.toFixed(1)}%</strong>
        </div>
        <div>
          <span style={{ opacity: 0.7 }}>LAT:</span> <strong>{node.latency}ms</strong>
        </div>
      </div>
    </ElevatedCard>
  </div>
);

const renderControls = (
  filter: NodeStatus | null,
  onFilterChange: (f: NodeStatus | null) => void,
  counts: Record<string, number>,
  total: number,
  sort: 'latency' | 'cpu' | 'memory',
  onSortChange: (s: 'latency' | 'cpu' | 'memory') => void,
  order: 'asc' | 'desc',
  onOrderChange: (o: 'asc' | 'desc') => void
) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-md)' }}>
    <Tabs
      value={filter ?? 'all'}
      onChange={(v) => onFilterChange(v === 'all' ? null : (v as NodeStatus))}
      tabs={[
        { value: 'all', label: 'All Nodes', badge: total },
        { value: 'OK', label: OK_LABEL, badge: counts.OK },
        { value: 'WARNING', label: WARNING_LABEL, badge: counts.WARNING, highlight: counts.WARNING > 0 },
        { value: 'CRITICAL', label: CRITICAL_LABEL, badge: counts.CRITICAL, highlight: counts.CRITICAL > 0 }
      ]}
    />
    <div style={{ display: 'flex', gap: 'var(--size-sm)', alignItems: 'center', fontSize: '12px' }}>
      <span style={{ opacity: 0.7 }}>Sort by:</span>
      {(['cpu', 'memory', 'latency'] as const).map((s) => (
        <button
          key={s}
          onClick={() => onSortChange(s)}
          style={{
            ...SORT_BUTTON_BASE_STYLE,
            background: sort === s ? 'var(--palette-neutral-1)' : 'transparent',
            fontWeight: sort === s ? 'bold' : 'normal'
          }}
        >
          {s === 'cpu' ? 'CPU' : s === 'memory' ? 'Memory' : 'Latency'}
        </button>
      ))}
      <button
        onClick={() => onOrderChange(order === 'desc' ? 'asc' : 'desc')}
        style={ORDER_BUTTON_STYLE}
      >
        {order === 'desc' ? '↓' : '↑'}
      </button>
    </div>
  </div>
);

export const NodeGrid = ({ onSelectNode }: { onSelectNode: (id: string) => void }) => {
  const { nodes: allNodes, filter, setFilter, sort, setSort, order, setOrder } = useNodeGrid();
  const { counts, totalNodes } = useNodeTabs();
  const { displayedNodes, scrollContainerRef, scrollToTop, hasMore, displayedCount, loadMore: hookLoadMore } = useInfiniteScroll(allNodes);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget as HTMLDivElement;
    setShowBackToTop(container.scrollTop > 300);

    // Trigger load on scroll near bottom
    const { scrollHeight, clientHeight, scrollTop } = container;
    if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore) {
      hookLoadMore();
    }
  };

  const handleLoadMore = () => {
    hookLoadMore();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-md)', position: 'relative' }}>
      {renderControls(filter, setFilter, counts, totalNodes, sort, setSort, order, setOrder)}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-md)',
          height: '600px',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '8px',
          position: 'relative',
          border: '1px solid var(--palette-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--size-md)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--size-md)'
          }}
        >
          {displayedNodes.map((node) => renderNodeCard(node, onSelectNode))}
        </div>

        {hasMore && (
          <button
            id="load-more-btn"
            onClick={handleLoadMore}
            style={LOAD_MORE_BUTTON_STYLE}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1db852')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--palette-success)')}
          >
            Load 24 More ↓ ({displayedCount} of {allNodes.length})
          </button>
        )}
      </div>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          style={BACK_TO_TOP_STYLE}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1db852')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--palette-success)')}
        >
          ↑ Back to Top
        </button>
      )}
    </div>
  );
};
