/**
 * The gallery wall (R4/BP9 · P03) — the promenade's contract, carrying
 * forward the retiring WorkFilterGrid suite's SURVIVING guarantees:
 *  - SSR emits every plate visible (RM/no-JS floor — no inline opacity:0);
 *  - rows carry the depth register (Reveal contract);
 *  - the C-25 `work:seen` entrance-skip survives its host's retirement.
 * Retired WITH the grid, under the §S-delegated rulings (DECISIONS): the
 * featured-outside-the-grid split, the L3-08 lone-card idiom (single column
 * has no lone card), and the filter choreography.
 */
import { describe, expect, it, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { cleanup, render, waitFor } from '@testing-library/react';

import { GalleryWall } from '@/components/GalleryWall';
import type { Deliverable } from '@/lib/schema';

function makeDeliverable(n: number, featured: boolean): Deliverable {
  const slug = `test-project-${n}`;
  return {
    id: slug,
    title: `Test Project ${n}`,
    summary: 'A test deliverable summary long enough for the schema.',
    role: 'Solo builder',
    tech: ['TypeScript'],
    year: 2026,
    heroImage: {
      src: `/images/deliverables/${slug}/hero.png`,
      alt: `Hero for test project ${n}`,
    },
    tags: ['testing'],
    featured,
  };
}

const six: Deliverable[] = [true, false, false, false, false, false].map((f, i) =>
  makeDeliverable(i + 1, f),
);

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe('GalleryWall', () => {
  it('SSR emits every plate visible — no inline opacity:0 (RM/no-JS floor)', () => {
    const html = renderToString(<GalleryWall deliverables={six} />);
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('opacity: 0');
    for (let n = 1; n <= 6; n++) expect(html).toContain(`Test Project ${n}`);
  });

  it('hangs all six full-width in order with catalog numbers 01→06', () => {
    const { container } = render(<GalleryWall deliverables={six} />);
    const rows = container.querySelectorAll('ul > li');
    expect(rows).toHaveLength(6);
    const cards = container.querySelectorAll('.case-study-card');
    expect(cards).toHaveLength(6); // one grammar — no featured split on the wall
    const text = container.textContent ?? '';
    for (const numeral of ['01', '02', '03', '04', '05', '06']) {
      expect(text).toContain(numeral);
    }
  });

  it('alternates per the rule — 01 exempt left, 02 left, then flips (03/05 right)', () => {
    const { container } = render(<GalleryWall deliverables={six} />);
    const cards = Array.from(container.querySelectorAll('.case-study-card'));
    const reversed = cards.map((c) => c.className.includes('lg:flex-row-reverse'));
    expect(reversed).toEqual([false, false, true, false, true, false]);
    for (const c of cards) expect(c.className).toContain('lg:flex-row');
  });

  it('every row carries the depth register (the featured contract, generalized)', () => {
    const { container } = render(<GalleryWall deliverables={six} />);
    expect(container.querySelectorAll('.reveal-depth')).toHaveLength(6);
  });

  it('hangs the FEATURED work first, mechanically — never by JSON-order coincidence', () => {
    const shuffled = [six[1], six[2], six[0], six[3], six[4], six[5]]; // featured at index 2
    const { container } = render(<GalleryWall deliverables={shuffled} />);
    const firstTitle = container.querySelector('.case-study-card h3');
    expect(firstTitle?.textContent).toBe('Test Project 1'); // the featured one
  });

  it('C-25 SURVIVOR: a wall already walked skips its entrance on return', async () => {
    sessionStorage.setItem('work:seen', '1');
    const { container } = render(<GalleryWall deliverables={six} />);
    await waitFor(() => {
      expect(container.querySelector('[data-wall-seen]')).not.toBeNull();
    });
  });

  it('C-25 SURVIVOR: the first visit marks the wall seen for the session', async () => {
    const { container } = render(<GalleryWall deliverables={six} />);
    await waitFor(() => {
      expect(sessionStorage.getItem('work:seen')).toBe('1');
    });
    expect(container.querySelector('[data-wall-seen]')).toBeNull(); // first visit keeps the entrance
  });
});

describe('the route sheds its client machinery (source contract)', () => {
  it('framer-motion and the filter grid are gone from /work/', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    const { join } = await import('node:path');
    const page = readFileSync(join(process.cwd(), 'app', 'work', 'page.tsx'), 'utf8');
    const wall = readFileSync(join(process.cwd(), 'components', 'GalleryWall.tsx'), 'utf8');
    expect(page).not.toContain('WorkFilterGrid');
    expect(page).not.toMatch(/from ['"]framer-motion['"]/);
    expect(wall).not.toMatch(/from ['"]framer-motion['"]/);
    expect(existsSync(join(process.cwd(), 'components', 'WorkFilterGrid.tsx'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'components', 'FilterPill.tsx'))).toBe(false);
  });
});
