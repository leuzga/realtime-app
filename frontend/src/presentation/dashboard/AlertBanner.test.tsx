import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AlertBanner } from './AlertBanner.js';

describe('AlertBanner', () => {
  it('renders OK alert', () => {
    const alert = { level: 'ok' as const, headline: 'All clear', detail: '100 nodes OK', impactPct: 0 };
    const { container } = render(<AlertBanner alert={alert} />);
    expect(container.textContent).toContain('All clear');
    expect(container.querySelector('[role="status"]')).toBeTruthy();
  });

  it('renders WARNING alert', () => {
    const alert = { level: 'warning' as const, headline: '5 WARNING', detail: '5% of fleet', impactPct: 5 };
    const { container } = render(<AlertBanner alert={alert} />);
    expect(container.textContent).toContain('5 WARNING');
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('renders CRITICAL alert', () => {
    const alert = { level: 'critical' as const, headline: '2 CRITICAL', detail: '2% of fleet', impactPct: 2 };
    const { container } = render(<AlertBanner alert={alert} />);
    expect(container.textContent).toContain('2 CRITICAL');
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });
});
