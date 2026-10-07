import { STATUS_THRESHOLDS } from '../../domain/thresholds.js';
import type { Metric } from '../../domain/thresholds.js';

export const ThresholdBar = ({ metric, value }: { metric: Metric; value: number }) => {
  const thresholds = STATUS_THRESHOLDS[metric];
  const max = metric === 'latency' ? 1000 : 100;

  const warningPct = (thresholds.WARNING / max) * 100;
  const criticalPct = (thresholds.CRITICAL / max) * 100;
  const valuePct = Math.min((value / max) * 100, 100);

  const fillColor = value >= thresholds.CRITICAL ? 'var(--palette-critical)' : value >= thresholds.WARNING ? 'var(--palette-warning)' : 'var(--palette-success)';

  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ position: 'relative', height: '6px', background: 'var(--palette-neutral-1)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${valuePct}%`, background: fillColor, transition: 'width 200ms' }} />

        <div style={{ position: 'absolute', top: 0, left: `${warningPct}%`, height: '100%', width: '2px', background: 'var(--palette-warning)', opacity: 0.6 }} />
        <div style={{ position: 'absolute', top: 0, left: `${criticalPct}%`, height: '100%', width: '2px', background: 'var(--palette-critical)', opacity: 0.6 }} />
      </div>
      <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
        <span>0</span>
        <span>{value.toFixed(0)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
