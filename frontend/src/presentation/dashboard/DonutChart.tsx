import { useMemo } from 'react';

interface DonutChartProps {
  readonly value: number;
  readonly max: number;
  readonly color: string;
  readonly size?: number;
  readonly thickness?: number;
}

export const DonutChart = ({
  value,
  max,
  color,
  size = 100,
  thickness = 8
}: DonutChartProps) => {
  const ratio = useMemo(() => Math.min(100, (value / max) * 100), [value, max]);
  const circumference = 2 * Math.PI * (size / 2 - thickness / 2);
  const offset = circumference - (ratio / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - thickness / 2}
          fill="none"
          stroke="var(--palette-border)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - thickness / 2}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 300ms ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'var(--weight-medium)'
        }}
      >
        <div style={{ fontSize: '20px' }}>{Math.round(ratio)}%</div>
      </div>
    </div>
  );
};
