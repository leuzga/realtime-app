export const Sparkline = ({ series, max = 100, color = 'var(--palette-success)', height = 24, width = 60 }: {
  series: readonly number[];
  max?: number;
  color?: string;
  height?: number;
  width?: number;
}) => {
  if (series.length < 2) {
    return (
      <div style={{ width, height, background: 'var(--palette-neutral-1)', borderRadius: 'var(--radius-sm)' }} />
    );
  }

  const pointCount = Math.min(series.length, 30);
  const step = Math.max(1, Math.floor(series.length / pointCount));
  const points: string[] = [];

  for (let i = 0; i < series.length; i += step) {
    const x = (i / (series.length - 1)) * width;
    const y = height - (series[i] / max) * height;
    points.push(`${x},${y}`);
  }

  const polylinePoints = points.join(' ');
  const uniqueId = `grad_${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      width={width}
      height={height}
      style={{ borderRadius: 'var(--radius-sm)' }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={uniqueId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={polylinePoints} fill="none" stroke={color} strokeWidth="1.5" />
      <polygon points={`${polylinePoints} ${width},${height} 0,${height}`} fill={`url(#${uniqueId})`} />
    </svg>
  );
};
