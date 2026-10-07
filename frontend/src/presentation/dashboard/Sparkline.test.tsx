import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from './Sparkline.js';

describe('Sparkline', () => {
  it('renders SVG for valid series', () => {
    const series = [10, 20, 30, 20, 10];
    const { container } = render(<Sparkline series={series} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('polyline')).toBeTruthy();
  });

  it('renders placeholder for single value', () => {
    const series = [42];
    const { container } = render(<Sparkline series={series} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders placeholder for empty series', () => {
    const series: number[] = [];
    const { container } = render(<Sparkline series={series} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('accepts custom max and color', () => {
    const series = [50, 100, 75];
    const { container } = render(<Sparkline series={series} max={200} color="red" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
