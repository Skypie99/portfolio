/**
 * TagPill smoke tests — Cycle 11 (Gary).
 *
 * TagPill is the canonical Dani §3.8 primitive extracted in Cycle 8.
 * It replaced four identical inline pill className combos across
 * ProjectCard, /work/[slug], and the homepage. These tests pin the
 * primitive so future spec drifts surface here, not in three places.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { TagPill } from '@/components/TagPill';

afterEach(() => {
  cleanup();
});

describe('TagPill', () => {
  it('renders its children verbatim', () => {
    render(<TagPill>TypeScript</TagPill>);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('applies the Dani §3.8 token classes (sand bg, umber text, mono uppercase)', () => {
    render(<TagPill>Expo</TagPill>);
    const pill = screen.getByText('Expo');
    // Token class assertions — if Dani's spec moves, these change with it.
    expect(pill).toHaveClass(
      'bg-sand',
      'text-umber',
      'font-mono',
      'uppercase',
      'rounded-pill',
    );
  });

  it('merges additional className via cn() without dropping base classes', () => {
    render(<TagPill className="custom-extra">Tailwind</TagPill>);
    const pill = screen.getByText('Tailwind');
    expect(pill).toHaveClass('custom-extra');
    expect(pill).toHaveClass('bg-sand'); // base preserved
  });
});
