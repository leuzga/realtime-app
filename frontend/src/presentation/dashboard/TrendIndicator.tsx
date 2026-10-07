import type { TrendDirection } from '../../application/insights.js';

export const TrendIndicator = ({ trend, isPositive = false }: { trend: TrendDirection; isPositive?: boolean }) => {
  const arrowChar = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';

  let color: string;
  if (trend.direction === 'flat') {
    color = 'var(--palette-neutral-12)';
  } else if (trend.direction === 'up') {
    color = isPositive ? 'var(--palette-critical)' : 'var(--palette-success)';
  } else {
    color = isPositive ? 'var(--palette-success)' : 'var(--palette-critical)';
  }

  return (
    <span style={{ color, fontSize: '12px', fontWeight: 'bold', marginLeft: '4px' }}>
      {arrowChar}
    </span>
  );
};
