import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThresholdBar } from './ThresholdBar.js';

describe('ThresholdBar', () => {
  it('renders bar for CPU OK', () => {
    const { container } = render(<ThresholdBar metric="cpuLoad" value={50} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders bar for memory WARNING', () => {
    const { container } = render(<ThresholdBar metric="memoryUsage" value={85} />);
    expect(container.textContent).toContain('85');
  });

  it('renders bar for latency CRITICAL', () => {
    const { container } = render(<ThresholdBar metric="latency" value={700} />);
    expect(container.textContent).toContain('700');
  });

  it('shows correct max values', () => {
    const { container: cpuContainer } = render(<ThresholdBar metric="cpuLoad" value={50} />);
    expect(cpuContainer.textContent).toContain('100');

    const { container: latContainer } = render(<ThresholdBar metric="latency" value={500} />);
    expect(latContainer.textContent).toContain('1000');
  });
});
