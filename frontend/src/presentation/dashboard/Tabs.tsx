import type { ReactNode } from 'react';

export interface Tab<T extends string> {
  readonly value: T;
  readonly label: ReactNode;
  readonly badge?: number | string;
  readonly highlight?: boolean;
}

interface TabsProps<T extends string> {
  readonly value: T;
  readonly onChange: (v: T) => void;
  readonly tabs: ReadonlyArray<Tab<T>>;
}

export const Tabs = <T extends string>({ value, onChange, tabs }: TabsProps<T>) => (
  <div
    style={{
      display: 'flex',
      gap: '4px',
      borderBottom: '1px solid var(--palette-border)',
      overflowX: 'auto',
      paddingBottom: '4px'
    }}
  >
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        style={{
          padding: '8px 12px',
          border: 'none',
          background: value === tab.value ? 'var(--palette-neutral-1)' : 'transparent',
          borderBottom: value === tab.value ? '2px solid var(--palette-success)' : 'none',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: value === tab.value ? 'var(--weight-medium)' : 'normal',
          color: tab.highlight ? 'var(--palette-critical)' : 'var(--palette-fg)',
          whiteSpace: 'nowrap',
          transition: 'all 200ms'
        }}
      >
        {tab.label}
        {tab.badge !== undefined && (
          <span style={{ marginLeft: '6px', opacity: 0.7 }}>({tab.badge})</span>
        )}
      </button>
    ))}
  </div>
);
