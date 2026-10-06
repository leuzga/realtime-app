import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs.js';

describe('Tabs', () => {
  it('renders all tabs with badges', () => {
    const onChange = vi.fn();
    render(
      <Tabs
        value="all"
        onChange={onChange}
        tabs={[
          { value: 'all', label: 'All', badge: 100 },
          { value: 'ok', label: 'OK', badge: 50 }
        ]}
      />
    );
    expect(screen.getByText(/All/)).toBeInTheDocument();
    expect(screen.getByText(/OK/)).toBeInTheDocument();
  });

  it('calls onChange on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tabs
        value="all"
        onChange={onChange}
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'ok', label: 'OK' }
        ]}
      />
    );
    await user.click(screen.getByText('OK'));
    expect(onChange).toHaveBeenCalledWith('ok');
  });
});
