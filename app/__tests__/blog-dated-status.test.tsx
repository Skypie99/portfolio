/**
 * T11 / SK-02 — dated-status <time> container + the "What's next" seam.
 *
 * Two guards:
 *   1. DatedStatusNote renders a real, machine-readable <time> carrying the
 *      post's publishedDate, formatted to match the post byline — a dated
 *      snapshot label, not an apologetic/urgent badge.
 *   2. The seam the page splices at is real and correctly ordered: the shared
 *      renderMarkdownProse output for the real post emits a heading with
 *      id="what-s-next" whose very next block is the stale "TestFlight is live"
 *      claim — so splice(seam + 1) lands the stamp exactly between the heading
 *      and the claim. The figure seam ("what-shipped") is a distinct, earlier
 *      seam, left untouched (regression guard on the existing S12 splice).
 */
import { isValidElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { DatedStatusNote } from '@/app/blog/[slug]/page';
import { renderMarkdownProse } from '@/components/MarkdownProse';
import { getBlogPosts } from '@/lib/content';

afterEach(cleanup);

describe('DatedStatusNote (T11 / SK-02)', () => {
  it('renders exactly one machine-readable <time> with the given date', () => {
    const { container } = render(<DatedStatusNote date="2026-05-29" />);
    const times = container.querySelectorAll('time');
    expect(times).toHaveLength(1);
    expect(times[0]).toHaveAttribute('datetime', '2026-05-29');
  });

  it('formats the visible date identically to the post byline', () => {
    const { container } = render(<DatedStatusNote date="2026-05-29" />);
    // Same en-CA long-month call the byline uses; computed the same way so the
    // assertion holds regardless of the host ICU build.
    const expected = new Date('2026-05-29T12:00:00').toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(container.querySelector('time')?.textContent).toBe(expected);
  });

  it('reads as a dated snapshot, not an apologetic or urgent badge', () => {
    const { container } = render(<DatedStatusNote date="2026-05-29" />);
    const text = container.textContent ?? '';
    expect(text).toContain('Status as of');
    // Kill-rule: no availability-signaling / apology copy.
    expect(text).not.toMatch(/coming soon|actively shipping|update soon|available/i);
  });
});

describe('the "What\'s next" dated-status seam (real content/blog.json)', () => {
  const post = getBlogPosts().find((p) => p.id === 'building-accessmap');

  it('the post exists and still carries the time-bound status claim', () => {
    expect(post).toBeTruthy();
    expect(post!.content).toContain('review is pending');
  });

  it('emits heading#what-s-next whose next block is the "TestFlight is live" claim', () => {
    const { container } = render(<>{renderMarkdownProse(post!.content, 'blog')}</>);
    const seam = container.querySelector('#what-s-next');
    expect(seam, 'the what-s-next seam must exist for the splice to land').toBeTruthy();
    // splice(seam + 1, 0, note) inserts the stamp between this heading and the claim.
    expect(seam!.nextElementSibling?.textContent).toContain('TestFlight is live');
  });

  it('keeps the figure seam (#what-shipped) as a distinct, earlier heading', () => {
    const nodes = renderMarkdownProse(post!.content, 'blog');
    const idOf = (el: unknown): string | undefined =>
      isValidElement(el) ? (el.props as { id?: string }).id : undefined;
    const shipped = nodes.findIndex((el) => idOf(el) === 'what-shipped');
    const next = nodes.findIndex((el) => idOf(el) === 'what-s-next');
    expect(shipped).toBeGreaterThanOrEqual(0);
    expect(next).toBeGreaterThan(shipped);
  });
});
