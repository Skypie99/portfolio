/**
 * WorkFilterGrid floor tests — defects repair R2 (2026-06-12).
 *
 * The grid's REST state is the VISIBLE state: grid items use the featured
 * card's proven contract (motion.li initial={false} for layout/exit only +
 * Reveal owning the CSS/IO entrance with .reveal floors in globals.css).
 * SSR must never serialize inline opacity:0 — the old framer
 * initial:'hidden' variants did exactly that, leaving reduced-motion and
 * no-JS visitors an invisible /work grid. Real framer-motion + real cards,
 * no mocks: the SSR string is what `next build` emits.
 */
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import { WorkFilterGrid } from '@/components/WorkFilterGrid';
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

const deliverables: Deliverable[] = [
  makeDeliverable(1, true),
  makeDeliverable(2, false),
  makeDeliverable(3, false),
];

describe('WorkFilterGrid', () => {
  it('SSR emits every card visible — no inline opacity:0 (RM/no-JS floor)', () => {
    const html = renderToString(<WorkFilterGrid deliverables={deliverables} />);
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('opacity: 0');
    expect(html).toContain('Test Project 1');
    expect(html).toContain('Test Project 2');
    expect(html).toContain('Test Project 3');
  });

  it('grid items carry the depth register (featured contract)', () => {
    const html = renderToString(<WorkFilterGrid deliverables={deliverables} />);
    // 2 non-featured grid cards + the featured card's own Reveal = 3 depth reveals.
    const depthMatches = html.match(/class="[^"]*reveal[^"]*reveal-depth[^"]*"/g) ?? [];
    expect(depthMatches).toHaveLength(3);
  });

  it('renders the featured card outside the grid (unchanged contract)', () => {
    const html = renderToString(<WorkFilterGrid deliverables={deliverables} />);
    // Featured card renders before the <ul> grid, wrapped in its own Reveal.
    const ulIndex = html.indexOf('<ul');
    const featuredIndex = html.indexOf('Test Project 1');
    expect(featuredIndex).toBeGreaterThan(-1);
    expect(ulIndex).toBeGreaterThan(-1);
    expect(featuredIndex).toBeLessThan(ulIndex);
  });

  it('odd trailing card adopts home\'s wide idiom — spans both tracks, never centered (L3-08)', () => {
    // 1 featured + 3 rest = odd rest count → the last grid card is lone.
    const oddSet: Deliverable[] = [
      makeDeliverable(1, true),
      makeDeliverable(2, false),
      makeDeliverable(3, false),
      makeDeliverable(4, false),
    ];
    const html = renderToString(<WorkFilterGrid deliverables={oddSet} />);
    // The lone li spans both tracks (home's grammar) — exactly once, and the
    // retired centered-orphan classes are gone.
    expect(html.match(/lg:col-span-2/g)).toHaveLength(1);
    expect(html).not.toContain('lg:justify-self-center');
    // The lone card renders as the wide horizontal ProjectCard (work-card +
    // lg:flex-row), bookending the grid like the featured card above it.
    expect(html.match(/work-card/g)).toHaveLength(2); // featured + lone
    expect(html.match(/case-study-card/g)).toHaveLength(2); // the paired row
    expect(html).toContain('lg:flex-row');
  });

  it('even rest count keeps every grid card in the case-study grammar', () => {
    const html = renderToString(<WorkFilterGrid deliverables={deliverables} />);
    // 2 rest cards → no lone treatment: no col-span, one work-card (featured).
    expect(html).not.toContain('lg:col-span-2');
    expect(html.match(/work-card/g)).toHaveLength(1);
    expect(html.match(/case-study-card/g)).toHaveLength(2);
  });
});
