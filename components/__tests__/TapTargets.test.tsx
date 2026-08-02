/**
 * Tap-target extension guard — UP-02 / F7-2 (ui-polish 2026-08-01).
 *
 * The card action rows ("View project →" / "Read more →" plus the Live ↗ /
 * GitHub ↗ group) measure 23.391px tall as border boxes. The house 44 floor is
 * reached with a ONE-SIDED stretched ::after, and the direction is not a style
 * choice — it is the whole correctness argument:
 *
 *   · The row is a WRAPPING flex row. `py-1` + `-my-1` makes the margin box
 *     15.391px, so the wrap pitch is 15.391 + gap-y-2 (8px) = 23.391px and the
 *     border boxes of two wrapped lines ALREADY ABUT. Every extra pixel has to
 *     come from outside the row.
 *   · So the leading link grows UP (into the dead band above the hairline) and
 *     the trailing external links grow DOWN (into the card's own bottom
 *     padding). Wrapped, the two extensions move apart; unwrapped, they are
 *     separated horizontally. Measured: 44.391px effective, 0 overlaps, over
 *     20 frames — build-plan/receipts/p2/.
 *   · A SYMMETRIC extension would satisfy any naive "≥44px is present" check
 *     while re-creating the F7-3 overlap on the wrapped home card at 375. That
 *     is why each test also asserts the opposite direction is ABSENT.
 *   · Padding is the wrong mechanism entirely: `*:focus-visible`
 *     (globals.css:422) traces the element's own border box, so growing it
 *     would draw a 44px ring around a 15px label. Hence the `py-1`/`-my-1` pair
 *     must SURVIVE — asserted here so a future "just add padding" cannot pass.
 *
 * jsdom has no layout engine and vitest runs with css:false, so the box cannot
 * be measured in-suite; the classes are the contract, and the pixel/geometry
 * proof is the banked playwright rig. Non-vacuousness: revert either component
 * and all four cases fail.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { CaseStudyCard } from '@/components/CaseStudyCard';
import { ProjectCard } from '@/components/ProjectCard';
import type { Deliverable } from '@/lib/schema';

/** The extension recipe, split by direction. */
const UP = ['relative', "after:content-['']", 'after:absolute', 'after:inset-x-0', 'after:-top-[21px]', 'after:bottom-0'];
const DOWN = ['relative', "after:content-['']", 'after:absolute', 'after:inset-x-0', 'after:top-0', 'after:-bottom-[21px]'];
/** The wrap pitch the extension is built around — load-bearing, must survive. */
const PITCH = ['py-1', '-my-1'];

const links: Deliverable['links'] = [
  { label: 'Live demo', href: 'https://accessmap.skypistudio.com', type: 'demo' as const },
  { label: 'GitHub', href: 'https://github.com/Skypie99/AccessMap', type: 'github' as const },
];

const deliverable: Deliverable = {
  id: 'accessmap',
  title: 'AccessMap',
  summary: 'Privacy-respecting accessibility flagging app for disabled users navigating the city.',
  role: 'Solo builder',
  tech: ['Expo', 'React Native'],
  year: 2026,
  heroImage: { src: '/images/deliverables/accessmap/hero.jpg', alt: 'Warm-toned mockup of the AccessMap interface' },
  tags: ['accessibility'],
  featured: false,
  links,
};

afterEach(() => {
  cleanup();
});

/** Asserts a one-sided 44px extension in `dir`, and that the other side is absent. */
function expectExtended(el: HTMLElement, dir: 'up' | 'down') {
  const [want, other] = dir === 'up' ? [UP, DOWN] : [DOWN, UP];
  expect(el).toHaveClass(...want);
  expect(el).toHaveClass(...PITCH);
  // The opposite direction's inset must NOT also be present — a two-sided box
  // is the F7-3 overlap this recipe exists to avoid.
  const opposite = other.filter((c) => !want.includes(c));
  for (const c of opposite) expect(el.className.split(/\s+/)).not.toContain(c);
}

describe('card action rows carry the one-sided 44px tap extension (UP-02 / F7-2)', () => {
  it('ProjectCard: the leading "View project" link grows UP', () => {
    render(<ProjectCard deliverable={deliverable} />);
    expectExtended(screen.getByRole('link', { name: /view project.*accessmap.*case study/i }), 'up');
  });

  it('ProjectCard: the trailing external links grow DOWN', () => {
    render(<ProjectCard deliverable={deliverable} />);
    expectExtended(screen.getByRole('link', { name: /open live demo for accessmap/i }), 'down');
    expectExtended(screen.getByRole('link', { name: /view accessmap source on github/i }), 'down');
  });

  it('CaseStudyCard: the leading "Read more" link grows UP', () => {
    render(
      <CaseStudyCard title="AccessMap" category="accessmap" description="A map-first mobile app." href="/work/accessmap/" links={links} />,
    );
    expectExtended(screen.getByRole('link', { name: /read more.*accessmap case study/i }), 'up');
  });

  it('CaseStudyCard: the trailing external links grow DOWN', () => {
    render(
      <CaseStudyCard title="AccessMap" category="accessmap" description="A map-first mobile app." href="/work/accessmap/" links={links} />,
    );
    expectExtended(screen.getByRole('link', { name: /open live demo for accessmap/i }), 'down');
    expectExtended(screen.getByRole('link', { name: /view accessmap source on github/i }), 'down');
  });
});
