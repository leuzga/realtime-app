import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { InsightHint } from './InsightHint.js';

describe('InsightHint', () => {
  it('renders recommendation and duration', () => {
    const { container } = render(
      <InsightHint recommendation="Check network path." duration="2m 30s" />
    );
    expect(container.textContent).toContain('Check network path.');
    expect(container.textContent).toContain('2m 30s');
  });

  it('formats "In state" label', () => {
    const { container } = render(<InsightHint recommendation="Test" duration="5m" />);
    expect(container.textContent).toContain('In state:');
  });
});
