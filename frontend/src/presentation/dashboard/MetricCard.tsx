import { useMemo } from 'react';
import { DonutChart } from './DonutChart.js';
import { ElevatedCard } from './ElevatedCard.js';

interface MetricCardProps {
  readonly label: string;
  readonly value: number;
  readonly max: number;
  readonly unit?: string;
  readonly color: string;
}

export const MetricCard = ({ label, value, max, unit, color }: MetricCardProps) => {
  const displayValue = useMemo(() => value.toFixed(1), [value]);

  return (
    <ElevatedCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-md)' }}>
        <DonutChart value={value} max={max} color={color} size={80} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>{label}</div>
          <div style={{ fontSize: '28px', fontWeight: 'var(--weight-medium)' }}>
            {displayValue}
            {unit && <span style={{ fontSize: '16px', opacity: 0.7 }}> {unit}</span>}
          </div>
        </div>
      </div>
    </ElevatedCard>
  );
};
