import { describe, it, expect } from 'vitest';
import { STATUS_THRESHOLDS, getThreshold, METRIC_LABELS, METRIC_UNITS, METRIC_MAX } from './thresholds.js';

describe('thresholds', () => {
  it('has correct WARNING thresholds', () => {
    expect(STATUS_THRESHOLDS.cpuLoad.WARNING).toBe(75);
    expect(STATUS_THRESHOLDS.memoryUsage.WARNING).toBe(80);
    expect(STATUS_THRESHOLDS.latency.WARNING).toBe(250);
  });

  it('has correct CRITICAL thresholds', () => {
    expect(STATUS_THRESHOLDS.cpuLoad.CRITICAL).toBe(90);
    expect(STATUS_THRESHOLDS.memoryUsage.CRITICAL).toBe(92);
    expect(STATUS_THRESHOLDS.latency.CRITICAL).toBe(600);
  });

  it('getThreshold returns correct values', () => {
    expect(getThreshold('cpuLoad', 'WARNING')).toBe(75);
    expect(getThreshold('cpuLoad', 'CRITICAL')).toBe(90);
    expect(getThreshold('latency', 'CRITICAL')).toBe(600);
  });

  it('has labels for all metrics', () => {
    expect(METRIC_LABELS.cpuLoad).toBe('CPU Load');
    expect(METRIC_LABELS.memoryUsage).toBe('Memory Usage');
    expect(METRIC_LABELS.latency).toBe('Latency');
  });

  it('has units for all metrics', () => {
    expect(METRIC_UNITS.cpuLoad).toBe('%');
    expect(METRIC_UNITS.memoryUsage).toBe('%');
    expect(METRIC_UNITS.latency).toBe('ms');
  });

  it('has max values for all metrics', () => {
    expect(METRIC_MAX.cpuLoad).toBe(100);
    expect(METRIC_MAX.memoryUsage).toBe(100);
    expect(METRIC_MAX.latency).toBe(1000);
  });
});
