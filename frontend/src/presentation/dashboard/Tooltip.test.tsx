import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip.js';

describe('Tooltip', () => {
  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<Tooltip text="Help text"><button>Hover me</button></Tooltip>);

    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    await user.hover(screen.getByText('Hover me'));
    expect(screen.getByText('Help text')).toBeInTheDocument();
  });

  it('hides tooltip on leave', async () => {
    const user = userEvent.setup();
    render(<Tooltip text="Help text"><button>Hover me</button></Tooltip>);

    await user.hover(screen.getByText('Hover me'));
    expect(screen.getByText('Help text')).toBeInTheDocument();
    await user.unhover(screen.getByText('Hover me'));
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });
});
