/**
 * SkipLink smoke tests — Cycle 38 (Gary).
 *
 * SkipLink is the first child of <body> per Alex §2.2. It must:
 *   - Be visually hidden by default (sr-only) so it doesn't clutter the page
 *     for sighted mouse users.
 *   - Point to '#main' so keyboard Tab → Enter skips the sidebar / nav and
 *     lands at the main content region.
 *
 * We can't meaningfully test the focus:not-sr-only reveal in jsdom (no CSS
 * layout engine), but we can assert the static markup is correct — which is
 * the contract that matters for server-side render and SSG.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { SkipLink } from '@/components/SkipLink';

afterEach(() => {
  cleanup();
});

describe('SkipLink', () => {
  it('has the sr-only class so it is visually hidden by default', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveClass('sr-only');
  });

  it('points to #main so keyboard users can jump to the main content region', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main');
  });
});
