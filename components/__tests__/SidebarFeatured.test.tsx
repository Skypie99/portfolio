/**
 * SidebarFeatured.test.tsx — the Featured block answers as one door
 * (luxe Wave 1, item 3 `the-hand-answers`).
 *
 * WHAT THIS PINS, AND WHY EACH ASSERTION EARNS ITS PLACE
 * ------------------------------------------------------
 * The rail's Featured slot is one <a> whose title is an inner <span>. Two
 * consequences of that nesting were measured on 933c59a:
 *   · `.link-draw` triggers on the ELEMENT ITSELF, and a descendant is not
 *     :hover when the pointer is over a sibling — so hovering the role line or
 *     the "Open it" row drew nothing.
 *   · A <span> can never match :focus-visible, so the keyboard got the focus
 *     ring but never the underline. Of the 30 `.link-draw` call sites in the
 *     estate, this was the only one with that break.
 * `.link-draw-group` fixes both by keying the trigger to the `.group` anchor.
 *
 * The load-bearing assertion here is the NEGATIVE one: the rider must never
 * grow a `color` declaration. `--color-link-hover` is rgb(178 81 40), which
 * measures 4.422:1 on `bg-rail` — below the 4.5:1 floor for this 19px regular
 * title. Widening the underline's trigger is safe (a 1px decorative line only
 * owes 3:1); widening the COLOUR's trigger would push a sub-AA state onto
 * whole-block hover and, for the first time, onto keyboard users. axe cannot
 * catch it — axe-core's color-contrast rule evaluates resting computed style
 * and does not simulate :hover, which is exactly how 4.422:1 survived this
 * long. So the guard has to be here, in source.
 *
 * The CSS assertions read globals.css as text rather than asserting computed
 * style: jsdom does not implement the cascade for a stylesheet this component
 * never imports, so a computed-style assertion would be vacuous — the failure
 * mode this repo has already documented twice (the frozen-literal ink guard,
 * the `overflow-x: clip` scrollWidth probe).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn(() => '/') }));

vi.mock('next/navigation', () => ({ usePathname: () => pathnameMock() }));

import { SidebarFeatured } from '@/components/SidebarFeatured';
import type { Deliverable } from '@/lib/schema';

const GLOBALS = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

const FEATURED = {
  id: 'accessmap',
  title: 'AccessMap',
  role: 'Solo builder',
} as unknown as Deliverable;

afterEach(() => {
  cleanup();
  pathnameMock.mockReturnValue('/');
});

describe('SidebarFeatured — the block answers as one door', () => {
  it('pairs link-draw with the group rider on the title', () => {
    // The rider paints nothing alone — it only flips background-size, and the
    // gradient/position/padding/durations all come from `.link-draw`. Dropping
    // either class silently kills the underline, so the PAIR is the contract.
    render(<SidebarFeatured featured={FEATURED} />);
    const title = screen.getByText('AccessMap');
    expect(title.className).toContain('link-draw');
    expect(title.className).toContain('link-draw-group');
  });

  it('shrinks the title to its own width so the line fits the word', () => {
    // Without self-start the span is a stretched flex item and the 1px line
    // draws the full 184px rail column under a ~90px word.
    render(<SidebarFeatured featured={FEATURED} />);
    expect(screen.getByText('AccessMap').className).toContain('self-start');
  });

  it('still withdraws the CTA nudge on the featured project’s own route', () => {
    // §7.2: a room knows you walked through it. The rider must not have
    // disturbed the existing stilling contract.
    pathnameMock.mockReturnValue('/work/accessmap/');
    render(<SidebarFeatured featured={FEATURED} />);
    const cta = screen.getByText('Open it');
    expect(cta.className).not.toContain('group-hover:translate-x-1');
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the nudge when the visitor is elsewhere', () => {
    render(<SidebarFeatured featured={FEATURED} />);
    const cta = screen.getByText('Open it');
    expect(cta.className).toContain('group-hover:translate-x-1');
    expect(cta.className).toContain('group-focus-visible:translate-x-1');
  });
});

describe('SidebarFeatured — the rider in globals.css', () => {
  it('is keyed to the group ancestor on BOTH hover and focus-visible', () => {
    // Focus parity is the half of this item the ledger did not name; asserting
    // only :hover would let the regression back in.
    expect(GLOBALS).toContain('.group:hover > .link-draw-group');
    expect(GLOBALS).toContain('.group:focus-visible > .link-draw-group');
  });

  it('never gains a colour declaration (the sub-AA hover guard)', () => {
    const start = GLOBALS.indexOf('.group:hover > .link-draw-group');
    expect(start).toBeGreaterThan(-1);
    const block = GLOBALS.slice(start, GLOBALS.indexOf('}', start) + 1);
    expect(
      block,
      'The link-draw-group rider must stay state-only. --color-link-hover is ' +
        '4.422:1 on bg-rail, under the 4.5:1 floor for the 19px title — adding ' +
        'color here hands a sub-AA state to whole-block hover and to keyboard users.',
    ).not.toContain('color:');
  });

  it('leaves the base .link-draw rule intact for the other 29 sites', () => {
    expect(GLOBALS).toContain('.link-draw:hover,\n.link-draw:focus-visible {');
  });
});

describe('UP-36 — the Notes rail link is NOT preempted', () => {
  it('carries no link-draw of any kind', () => {
    // Sky's open fork is the Notes link's COLOUR family. `.link-draw:hover`
    // sets `color: var(--color-link-hover)`, and even a colour-neutral rider
    // would paint the underline FROM that same accent variable (the gradient
    // uses --color-link-hover, not currentColor) — either way an underline
    // there resolves one side of her fork. It also has a byte-identical twin
    // ("Open it →", ~30px above on the same rail) with no underline, so adding
    // one to a single member of a matched pair manufactures a new mismatch.
    // This item therefore changed ZERO bytes in that file, on purpose.
    const src = readFileSync(join(process.cwd(), 'components', 'SidebarRailLinks.tsx'), 'utf8');
    expect(src).not.toContain('link-draw');
  });

  it('keeps its response channel — the nudge — on hover and focus alike', () => {
    const src = readFileSync(join(process.cwd(), 'components', 'SidebarRailLinks.tsx'), 'utf8');
    expect(src).toContain('group-hover:translate-x-1');
    expect(src).toContain('group-focus-visible:translate-x-1');
  });
});

describe('the rider stays scoped to the one span that needs it', () => {
  it('appears in exactly one component', () => {
    // If a second site ever wants it, that is a decision to make deliberately —
    // not something to discover after the fact.
    const files = ['components/SidebarFeatured.tsx', 'components/Sidebar.tsx', 'components/Footer.tsx'];
    const users = files.filter((f) =>
      readFileSync(join(process.cwd(), f), 'utf8').includes('link-draw-group'),
    );
    expect(users).toEqual(['components/SidebarFeatured.tsx']);
  });
});
