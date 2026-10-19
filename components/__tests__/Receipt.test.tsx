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
    const { container } = render(<Receipt value="2,971" label="tests passing" tier="measured" date="2026-08-16" />);
    expect(screen.getByText('2,971')).toBeInTheDocument();
    expect(screen.getByText('tests passing')).toBeInTheDocument();
    // H1: date now lives in a nested <time>, so the combined line is only
    // readable off .textContent — getByText only sees a node's own direct
    // text-node children, not a descendant element's text.
    expect(container.textContent).toMatch(/measured 2026-08-16/);
  });

  it('renders "reported" tier text for project-claimed figures', () => {
    const { container } = render(<Receipt value="100%" label="static" tier="reported" date="2026-06-01" />);
    expect(container.textContent).toMatch(/reported 2026-06-01/);
  });

  it('wraps the date in a <time> element with a matching dateTime (H1)', () => {
    const { container } = render(<Receipt value="2,971" label="tests passing" tier="measured" date="2026-08-16" />);
    const time = container.querySelector('time');
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute('dateTime', '2026-08-16');
    expect(time?.textContent).toBe('2026-08-16');
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

/**
 * RC-2 first visual slice — the unboxed presentation.
 *
 * The homepage hero's evidence strip sets its receipt as one entry of a
 * hairline ledger rather than a bordered card. `unboxed` must drop ONLY the
 * paper (fill, border, radius, padding) and keep everything the card tests
 * above pin: the content and its order, the <time>, the method pair and both
 * draw classes. The default output must not move at all.
 */
describe('Receipt — unboxed presentation (RC-2)', () => {
  const props = {
    value: '0',
    label: 'axe violations: 17 routes × 2 themes, strict rules',
    tier: 'measured' as const,
    date: '2026-08-25',
    methodHref: '/accessibility/#receipts',
    methodLabel: 'evidence',
  };
  const paper = ['bg-receipt', 'border', 'border-receipt-rule', 'rounded-md', 'p-6'];

  it('the default is still the bordered receipt-paper card', () => {
    const { container } = render(<Receipt {...props} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass(...paper, 'method-pair');
  });

  it('unboxed drops the paper and nothing else', () => {
    const { container } = render(<Receipt {...props} unboxed />);
    const root = container.firstElementChild as HTMLElement;
    for (const cls of paper) expect(root).not.toHaveClass(cls);
    expect(root).toHaveClass('flex', 'flex-col', 'gap-2', 'method-pair');
    // Content and order: figure → what it measures → tier · date · method.
    expect(root.children).toHaveLength(3);
    expect(root.children[0]).toHaveTextContent('0');
    expect(root.children[0]).toHaveClass('tabular-nums');
    expect(root.children[1]).toHaveTextContent(props.label);
    expect(root.children[2].textContent ?? '').toMatch(/^measured 2026-08-25/);
    expect(root.querySelector('time')).toHaveAttribute('dateTime', '2026-08-25');
    const link = screen.getByRole('link', { name: 'evidence' });
    expect(link).toHaveAttribute('href', '/accessibility/#receipts');
    expect(link).toHaveClass('link-draw', 'method-draw');
  });

  // Owner refinement 2026-10-18: the one deliberate difference below the root is
  // the ink. Unboxed has no paper behind its small type, so the two meta lines
  // step ink-meta → ink-muted and the method link accent-ink → link-hover.
  // Mapping exactly those classes back must reproduce the card byte for byte.
  it('unboxed and the card render identical markup apart from the root class list and the inks', () => {
    const card = render(<Receipt {...props} />).container.innerHTML;
    cleanup();
    const ledger = render(<Receipt {...props} unboxed />).container.innerHTML;
    const withoutRootClass = (html: string) => html.replace(/^<div class="[^"]*"/, '<div');
    const paperInks = (html: string) =>
      html
        .replace(/text-link-hover hover:text-link-hover/g, 'text-accent-text hover:text-accent-text')
        .replace(/text-ink-muted/g, 'text-text-meta');
    expect(paperInks(withoutRootClass(ledger))).toBe(withoutRootClass(card));
    expect(withoutRootClass(ledger)).not.toBe(withoutRootClass(card));
    expect(ledger).not.toBe(card);
  });

  it('unboxed sets its small type and method link one ink deeper; the card keeps the paper inks', () => {
    const card = render(<Receipt {...props} />).container.firstElementChild as HTMLElement;
    expect(card.children[1]).toHaveClass('text-text-meta');
    expect(card.children[2]).toHaveClass('text-text-meta');
    expect(screen.getByRole('link', { name: 'evidence' })).toHaveClass('text-accent-text', 'hover:text-accent-text');
    cleanup();
    const ledger = render(<Receipt {...props} unboxed />).container.firstElementChild as HTMLElement;
    expect(ledger.children[0]).toHaveClass('text-ink');
    for (const line of [ledger.children[1], ledger.children[2]]) {
      expect(line).toHaveClass('text-ink-muted');
      expect(line).not.toHaveClass('text-text-meta');
    }
    const link = screen.getByRole('link', { name: 'evidence' });
    expect(link).toHaveClass('link-draw', 'method-draw', 'text-link-hover', 'hover:text-link-hover');
    expect(link).not.toHaveClass('text-accent-text', 'hover:text-accent-text');
  });
});
