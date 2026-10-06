import { useNodeChart } from '../application/useNodeChart.js';
import { ElevatedCard } from './dashboard/ElevatedCard.js';

const renderChart = (series: readonly number[], maxVal: number, w: number, h: number) => {
  if (series.length === 0) return null;
  const points = series
    .map((v, i) => [(i / (series.length - 1)) * w, h - (v / maxVal) * h])
    .filter((_, i) => i < series.length);
  return (
    <svg width={w} height={h} style={{ border: '1px solid var(--palette-border)', display: 'block', borderRadius: 'var(--radius-sm)' }}>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--palette-success)', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: 'var(--palette-success)', stopOpacity: 0.2 }} />
        </linearGradient>
      </defs>
      <polyline
        points={points.map((p) => p.join(',')).join(' ')}
        fill="url(#grad)"
        stroke="var(--palette-success)"
        strokeWidth="2"
      />
      <line x1="0" y1={h - (75 / maxVal) * h} x2={w} y2={h - (75 / maxVal) * h} stroke="var(--palette-border)" strokeWidth="1" strokeDasharray="4" />
    </svg>
  );
};

interface NodeChartProps {
  nodeId: string;
  metric: 'cpuLoad' | 'memoryUsage' | 'latency';
}

export const NodeChart = ({ nodeId, metric }: NodeChartProps) => {
  const { series, maxVal } = useNodeChart(nodeId, metric);

  const metricLabel = { cpuLoad: 'CPU Load', memoryUsage: 'Memory Usage', latency: 'Latency (ms)' }[metric];

  if (series.length === 0) return <ElevatedCard>No historical data</ElevatedCard>;

  return (
    <ElevatedCard>
      <div style={{ fontSize: '12px', marginBottom: '12px', opacity: 0.8 }}>
        <strong>{metricLabel}</strong> — {nodeId}
      </div>
      {renderChart(series, maxVal, 300, 120)}
      <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.6 }}>
        {series.length} samples · max {Math.max(...series).toFixed(1)}
      </div>
    </ElevatedCard>
  );
};
