/**
 * NumberedStep smoke tests — Cycle 11 (Gary).
 *
 * The step component is reused on / and /about under hairline-divided
 * <ol> wrappers (Cycle 7). These tests confirm Dani §3.6's binding
 * choices: Umber numeral (NEVER raw Terracotta at 19px — Alex BLK-3.b),
 * h3 step title, body paragraph copy.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { NumberedStep } from '@/components/NumberedStep';

afterEach(() => {
  cleanup();
});

describe('NumberedStep', () => {
  it('renders the numeral, title, and body from props', () => {
    render(<NumberedStep number="02" title="Build" body="Loop with agents, iterate." />);
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Build' })).toBeInTheDocument();
    expect(screen.getByText('Loop with agents, iterate.')).toBeInTheDocument();
  });

  it('numeral uses Umber accent-text token, NOT raw Terracotta (Alex BLK-3.b)', () => {
    render(<NumberedStep number="01" title="Discover" body="Scope honest." />);
    const numeral = screen.getByText('01');
    // text-accent-text resolves to Umber (#7F4323) — passes 4.5:1 on cream
    // at 19px (normal-text threshold). Raw text-terracotta would fail.
    expect(numeral).toHaveClass('text-accent-text');
    expect(numeral).not.toHaveClass('text-terracotta');
  });

  it('numeral is aria-hidden — the title and body carry the meaning', () => {
    render(<NumberedStep number="03" title="Ship" body="Refine in production." />);
    const numeral = screen.getByText('03');
    expect(numeral).toHaveAttribute('aria-hidden', 'true');
  });
});
