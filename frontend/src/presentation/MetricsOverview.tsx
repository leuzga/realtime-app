import { useKpis } from '../application/useKpis.js';
import { MetricCard } from './dashboard/MetricCard.js';
import { InfoIcon } from './dashboard/InfoIcon.js';

const renderMetrics = (cpuAvg: number, memoryAvg: number, latencyAvg: number) => [
  {
    label: 'CPU Average',
    value: cpuAvg,
    max: 100,
    unit: '%',
    color: 'var(--palette-warning)',
    tooltip: 'Average CPU load across all active nodes. High = nodes working hard.'
  },
  {
    label: 'Memory Usage',
    value: memoryAvg,
    max: 100,
    unit: '%',
    color: 'var(--palette-critical)',
    tooltip: 'Average memory consumption. Critical if > 92%.'
  },
  {
    label: 'Avg Latency',
    value: latencyAvg,
    max: 1000,
    unit: 'ms',
    color: 'var(--palette-success)',
    tooltip: 'Mean response time in milliseconds. Critical if > 600ms.'
  }
];

export const MetricsOverview = () => {
  const kpis = useKpis();

  const metrics = renderMetrics(45, 55, kpis.avgLatency);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--size-lg)' }}>
      {metrics.map((m) => (
        <div key={m.label} style={{ position: 'relative' }}>
          <MetricCard key={m.label} label={m.label} value={m.value} max={m.max} unit={m.unit} color={m.color} />
          <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
            <InfoIcon text={m.tooltip} />
          </div>
        </div>
      ))}
    </div>
  );
};
