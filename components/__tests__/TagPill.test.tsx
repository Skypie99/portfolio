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

  it('applies the stable base classes + one of the desert spectrum hues', () => {
    render(<TagPill>Expo</TagPill>);
    const pill = screen.getByText('Expo');
    // Stable base — mono uppercase pill — always present.
    expect(pill).toHaveClass('font-mono', 'uppercase', 'rounded-pill', 'px-3', 'py-1');
    // A deterministic teal→gold→terracotta tint is applied (one of the variants).
    expect(pill.className).toMatch(
      /\bbg-(cool-soft|gold-glow|cool-mid|accent|rose|emerald)\b/,
    );
  });

  it('assigns a deterministic hue per label (same label → same hue)', () => {
    const hueOf = (label: string) => {
      render(<TagPill>{label}</TagPill>);
      const cls = screen.getByText(label).className.match(/bg-[\w-]+/)?.[0];
      cleanup();
      return cls;
    };
    expect(hueOf('Mobile')).toBe(hueOf('Mobile'));
  });

  it('reserves the terracotta accent for the explicit `accent` prop only (L2-05)', () => {
    // The hot terracotta wash is out of the deterministic hash pool: an ordinary
    // label never lands on it (no false emphasis), and `accent` opts into it.
    render(<TagPill accent>Featured</TagPill>);
    expect(screen.getByText('Featured')).toHaveClass('bg-accent/30');
  });

  it('merges additional className via cn() without dropping base classes', () => {
    render(<TagPill className="custom-extra">Tailwind</TagPill>);
    const pill = screen.getByText('Tailwind');
    expect(pill).toHaveClass('custom-extra');
    expect(pill).toHaveClass('rounded-pill'); // base preserved
  });
});
