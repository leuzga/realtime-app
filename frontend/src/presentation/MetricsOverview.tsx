import { useKpis } from '../application/useKpis.js';
import { useKpiTrends } from '../application/useKpiTrends.js';
import { thresholdContext } from '../application/insights.js';
import { MetricCard } from './dashboard/MetricCard.js';
import { TrendIndicator } from './dashboard/TrendIndicator.js';
import { InfoIcon } from './dashboard/InfoIcon.js';

const renderMetrics = (cpuAvg: number, memoryAvg: number, latencyAvg: number, cpuContext: any, memContext: any, latContext: any, cpuTrend: any, memTrend: any, latTrend: any) => [
  {
    label: 'CPU Average',
    value: cpuAvg,
    max: 100,
    unit: '%',
    color: cpuContext.level === 'CRITICAL' ? 'var(--palette-critical)' : cpuContext.level === 'WARNING' ? 'var(--palette-warning)' : 'var(--palette-success)',
    tooltip: 'Average CPU load across all active nodes. High = nodes working hard.',
    trend: cpuTrend
  },
  {
    label: 'Memory Usage',
    value: memoryAvg,
    max: 100,
    unit: '%',
    color: memContext.level === 'CRITICAL' ? 'var(--palette-critical)' : memContext.level === 'WARNING' ? 'var(--palette-warning)' : 'var(--palette-success)',
    tooltip: 'Average memory consumption. Critical if ≥ 92%.',
    trend: memTrend
  },
  {
    label: 'Avg Latency',
    value: latencyAvg,
    max: 1000,
    unit: 'ms',
    color: latContext.level === 'CRITICAL' ? 'var(--palette-critical)' : latContext.level === 'WARNING' ? 'var(--palette-warning)' : 'var(--palette-success)',
    tooltip: 'Mean response time in milliseconds. Critical if ≥ 600ms.',
    trend: latTrend
  }
];

export const MetricsOverview = () => {
  const kpis = useKpis();
  const trends = useKpiTrends();

  const cpuContext = thresholdContext('cpuLoad', kpis.avgCpu);
  const memContext = thresholdContext('memoryUsage', kpis.avgMemory);
  const latContext = thresholdContext('latency', kpis.avgLatency);

  const metrics = renderMetrics(kpis.avgCpu, kpis.avgMemory, kpis.avgLatency, cpuContext, memContext, latContext, trends.cpu, trends.memory, trends.latency);

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
