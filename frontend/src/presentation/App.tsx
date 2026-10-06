import { useEffect, useState } from 'react';
import { getStore } from '../application/store.js';
import { createWsClient } from '../infrastructure/wsClient.js';
import { NodeChart } from './NodeChart.js';
import { NodeGrid } from './NodeGrid.js';
import { MetricsOverview } from './MetricsOverview.js';
import './dashboard/tokens.css';

const store = getStore();
const wsUrl = (import.meta.env as any).DEV ? 'ws://localhost:4000/ws' : '/ws';

const renderHeader = (wsStatus: string) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 'var(--size-lg)'
    }}
  >
    <div>
      <h1 style={{ margin: 0, marginBottom: '4px' }}>Fleet Operations Dashboard</h1>
      <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>Real-time monitoring & telemetry</p>
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px'
      }}
    >
      <div
        style={{
          fontSize: '12px',
          padding: '6px 12px',
          background: wsStatus === 'connected' ? 'var(--palette-success)' : 'var(--palette-critical)',
          borderRadius: 'var(--radius-sm)',
          color: '#000',
          fontWeight: 'var(--weight-medium)'
        }}
      >
        {wsStatus === 'connected' ? '● Live' : '● Offline'}
      </div>
      <span style={{ fontSize: '10px', opacity: 0.5 }}>WebSocket: {wsStatus}</span>
    </div>
  </div>
);

export const App = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState('connecting');

  useEffect(() => {
    const unsubWs = createWsClient({
      url: wsUrl,
      onConnect: () => setWsStatus('connected'),
      onMessage: (msg) => store.dispatch(msg),
      onError: () => setWsStatus('error')
    });
    return unsubWs;
  }, []);

  return (
    <div style={{ padding: 'var(--size-lg)', maxWidth: '1400px', margin: '0 auto' }}>
      {renderHeader(wsStatus)}

      <div style={{ marginBottom: 'var(--size-xl)' }}>
        <h2 style={{ fontSize: '14px', marginTop: 0, marginBottom: 'var(--size-md)', opacity: 0.8, fontWeight: 'var(--weight-medium)' }}>
          System Metrics
        </h2>
        <MetricsOverview />
      </div>

      <div style={{ display: selectedNode ? 'grid' : 'block', gridTemplateColumns: '1fr 400px', gap: 'var(--size-lg)' }}>
        <div>
          <h2 style={{ fontSize: '14px', marginTop: 0, marginBottom: 'var(--size-md)', opacity: 0.8, fontWeight: 'var(--weight-medium)' }}>
            Active Nodes ({selectedNode ? '▼' : '▶'})
          </h2>
          <NodeGrid onSelectNode={setSelectedNode} />
        </div>
        {selectedNode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-md)' }}>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--palette-neutral-1)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ← Back to Grid
            </button>
            <NodeChart nodeId={selectedNode} metric="cpuLoad" />
            <NodeChart nodeId={selectedNode} metric="memoryUsage" />
            <NodeChart nodeId={selectedNode} metric="latency" />
          </div>
        )}
      </div>
    </div>
  );
};
