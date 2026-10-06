import type { NodeStatus } from '../../domain/telemetry.js';

const statusColor: Record<NodeStatus, string> = {
  OK: 'var(--palette-success)',
  WARNING: 'var(--palette-warning)',
  CRITICAL: 'var(--palette-critical)'
};

export const Badge = ({ status }: { status: NodeStatus }) => (
  <span
    style={{
      display: 'inline-block',
      background: statusColor[status],
      color: '#000',
      padding: '2px 8px',
      borderRadius: 'var(--radius-sm)',
      fontSize: '12px',
      fontWeight: 'var(--weight-medium)',
      minWidth: '60px',
      textAlign: 'center'
    }}
  >
    {status}
  </span>
);
