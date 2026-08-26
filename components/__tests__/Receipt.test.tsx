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

  it('renders tier + method with NO date — the open-ledger row (C4)', () => {
    render(
      <Receipt
        value="IV"
        label="calibration round, open"
        tier="reported"
        methodHref="/colophon/#calibration"
        methodLabel="the record"
      />,
    );
    // Tier word alone, then the method anchor — no invented date between them.
    expect(screen.getByText(/^reported/)).toBeInTheDocument();
    expect(screen.getByText(/^reported/).textContent).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(screen.getByRole('link', { name: 'the record' })).toBeInTheDocument();
  });

  it('figure carries tabular-nums so digits never jitter', () => {
    render(<Receipt value="2,971" label="tests passing" tier="measured" date="2026-08-16" />);
    expect(screen.getByText('2,971')).toHaveClass('tabular-nums');
  });
});

/**
 * THE ROOM / Phase G · G2 — the method underline.
 *
 * The tic's whole promise is that it ADDS a connection without ever becoming
 * the only way to find the method. So the floor these guard is: the door is
 * open before any motion happens, and the pair hooks are actually present for
 * the CSS to key off (globals.css can't be asserted from jsdom, but a missing
 * class hook silently kills the tic and nothing else would notice).
 */
describe('Receipt — the G2 method underline', () => {
  const withMethod = (
    <Receipt
      value="2,971"
      label="tests passing"
      tier="measured"
      date="2026-08-16"
      methodHref="#flagstone-test-count-method"
    />
  );

  it('the card is the method pair, and the anchor carries BOTH draw classes', () => {
    const { container } = render(withMethod);
    expect(container.firstElementChild).toHaveClass('method-pair');
    const link = screen.getByRole('link', { name: 'method' });
    // .method-draw paints nothing on its own — it is a rider that needs
    // .link-draw's gradient on the same element (the .link-draw-group idiom).
    expect(link).toHaveClass('link-draw');
    expect(link).toHaveClass('method-draw');
  });

  it('the method door is ALREADY OPEN at rest — touch and RM lose nothing', () => {
    render(withMethod);
    const link = screen.getByRole('link', { name: 'method' });
    // Visible text in the a11y tree, reachable, not hover-gated in any way.
    expect(link).toBeVisible();
    expect(link).not.toHaveAttribute('aria-hidden');
    expect(link.textContent?.trim()).toBe('method');
    expect(link.className).not.toMatch(/\b(sr-only|invisible|opacity-0|hidden)\b/);
  });

  it('a receipt with no method has nothing to draw — the pair stays inert', () => {
    const { container } = render(
      <Receipt value="15" label="AI agents" tier="reported" date="2026-05-01" />,
    );
    expect(container.querySelector('.method-draw')).toBeNull();
  });
});
