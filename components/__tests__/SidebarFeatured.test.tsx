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
 * The NEGATIVE assertion — the rider must not grow a `color` declaration —
 * began as an a11y floor: the hover colour was rgb(178 81 40), 4.422:1 on
 * `bg-rail` and sub-AA on five light surfaces, so widening its trigger onto
 * whole-block hover and the keyboard would have shipped a sub-AA state axe
 * cannot see (it does not simulate :hover). Luxe W2 fixed that at the token
 * (`--color-link-hover` → `--rgb-link-hover` = rgb(120 62 38), ≥5.47:1
 * everywhere, guarded in ink-contrast.test.ts). So this is now a DESIGN pin,
 * not a contrast one: the two-tier response (line for block/keyboard, line +
 * colour for pointer-on-word) is deliberate, and unifying it is Sky's call.
 * Keeping the assertion means that unification happens on purpose, not by drift.
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
  id: 'flagstone',
  title: 'Flagstone',
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
    const title = screen.getByText('Flagstone');
    expect(title.className).toContain('link-draw');
    expect(title.className).toContain('link-draw-group');
  });

  it('shrinks the title to its own width so the line fits the word', () => {
    // Without self-start the span is a stretched flex item and the 1px line
    // draws the full 184px rail column under a ~90px word.
    render(<SidebarFeatured featured={FEATURED} />);
    expect(screen.getByText('Flagstone').className).toContain('self-start');
  });

  it('still withdraws the CTA nudge on the featured project’s own route', () => {
    // §7.2: a room knows you walked through it. The rider must not have
    // disturbed the existing stilling contract.
    pathnameMock.mockReturnValue('/work/flagstone/');
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

  it('stays state-only — the two-tier response is a deliberate design pin', () => {
    const start = GLOBALS.indexOf('.group:hover > .link-draw-group');
    expect(start).toBeGreaterThan(-1);
    const block = GLOBALS.slice(start, GLOBALS.indexOf('}', start) + 1);
    expect(
      block,
      'The link-draw-group rider is intentionally line-only: block hover and the ' +
        'keyboard get the underline, the pointer-on-word gets line + colour. The ' +
        'hover colour is now AA-safe everywhere (luxe W2), so unifying the tiers ' +
        'is a design decision — make it on purpose, not by adding color: here.',
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
