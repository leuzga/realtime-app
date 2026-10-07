import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TrendIndicator } from './TrendIndicator.js';

describe('TrendIndicator', () => {
  it('renders up arrow', () => {
    const trend = { direction: 'up' as const, magnitude: 5 };
    const { container } = render(<TrendIndicator trend={trend} />);
    expect(container.textContent).toContain('↑');
  });

  it('renders down arrow', () => {
    const trend = { direction: 'down' as const, magnitude: 5 };
    const { container } = render(<TrendIndicator trend={trend} />);
    expect(container.textContent).toContain('↓');
  });

  it('renders flat indicator', () => {
    const trend = { direction: 'flat' as const, magnitude: 0 };
    const { container } = render(<TrendIndicator trend={trend} />);
    expect(container.textContent).toContain('→');
  });

  it('applies isPositive color logic', () => {
    const up = { direction: 'up' as const, magnitude: 1 };
    const { container: up1 } = render(<TrendIndicator trend={up} isPositive={false} />);
    const { container: up2 } = render(<TrendIndicator trend={up} isPositive={true} />);
    expect(up1.textContent).not.toEqual(up2.textContent);
  });
});
