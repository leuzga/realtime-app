import type { CSSProperties, ReactNode } from 'react';

export const ElevatedCard = ({
  children,
  style
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      background: 'var(--palette-neutral-0)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--size-md)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
      transition: 'box-shadow 200ms ease, transform 200ms ease',
      ...style
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
  >
    {children}
  </div>
);
