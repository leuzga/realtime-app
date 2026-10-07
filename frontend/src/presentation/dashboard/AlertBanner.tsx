import type { FleetAlertSummary } from '../../application/insights.js';

export const AlertBanner = ({ alert }: { alert: FleetAlertSummary }) => {
  if (alert.level === 'ok') {
    return (
      <div
        role="status"
        style={{
          padding: 'var(--size-md) var(--size-lg)',
          background: 'var(--palette-success)',
          color: '#000',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--size-md)',
          fontSize: '13px'
        }}
      >
        <strong>{alert.headline}</strong> · {alert.detail}
      </div>
    );
  }

  const bgColor = alert.level === 'critical' ? 'var(--palette-critical)' : 'var(--palette-warning)';

  return (
    <div
      role="alert"
      style={{
        padding: 'var(--size-md) var(--size-lg)',
        background: bgColor,
        color: '#000',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--size-md)',
        fontSize: '13px',
        fontWeight: 'var(--weight-medium)'
      }}
    >
      <strong>{alert.headline}</strong> · {alert.detail}
    </div>
  );
};
