/**
 * Receipt smoke tests — Phase A / A15 (THE ROOM instrument furniture).
 *
 * Tier is carried by the WORD ("measured"/"reported"), never colour alone —
 * these tests pin that both tier words render as real text, and that the
 * method anchor is optional and only appears when a href is given.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Receipt } from '@/components/Receipt';

afterEach(() => {
  cleanup();
});

describe('Receipt', () => {
  it('renders the figure, label, and tier word as real text', () => {
    render(<Receipt value="2,971" label="tests passing" tier="measured" date="2026-08-16" />);
    expect(screen.getByText('2,971')).toBeInTheDocument();
    expect(screen.getByText('tests passing')).toBeInTheDocument();
    expect(screen.getByText(/measured 2026-08-16/)).toBeInTheDocument();
  });

  it('renders "reported" tier text for project-claimed figures', () => {
    render(<Receipt value="100%" label="static" tier="reported" date="2026-06-01" />);
    expect(screen.getByText(/reported 2026-06-01/)).toBeInTheDocument();
  });

  it('renders no method link when methodHref is omitted', () => {
    render(<Receipt value="15" label="AI agents" tier="reported" date="2026-05-01" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the method anchor, defaulting its label to "method"', () => {
    render(
      <Receipt
        value="2,971"
        label="tests passing"
        tier="measured"
        date="2026-08-16"
        methodHref="#flagstone-test-count-method"
      />,
    );
    const link = screen.getByRole('link', { name: 'method' });
    expect(link).toHaveAttribute('href', '#flagstone-test-count-method');
  });

  it('uses the given methodLabel over the "method" default', () => {
    render(
      <Receipt
        value="2,971"
        label="tests passing"
        tier="measured"
        date="2026-08-16"
        methodHref="#flagstone-test-count-method"
        methodLabel="measured 2026-08-16, method"
      />,
    );
    expect(screen.getByRole('link', { name: 'measured 2026-08-16, method' })).toBeInTheDocument();
  });

  it('figure carries tabular-nums so digits never jitter', () => {
    render(<Receipt value="2,971" label="tests passing" tier="measured" date="2026-08-16" />);
    expect(screen.getByText('2,971')).toHaveClass('tabular-nums');
  });
});
