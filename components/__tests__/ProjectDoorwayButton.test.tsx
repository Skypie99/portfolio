/**
 * ProjectDoorwayButton — the press language (signature-interaction refinement,
 * 2026-10-19; concept M-CON-002 A r2).
 *
 * Companion to app/__tests__/flagstone-cta-parity.test.tsx, which guards that
 * every homepage doorway renders ONE identical className; this file guards what
 * that className says about touch and pointer behaviour:
 *
 *   · a press is answered (terracotta hairline, restrained tint, the dot
 *     contracts and embers) on the half-fast rung — immediately;
 *   · hover is gated to hover-capable pointers, so a tap never leaves the pill
 *     sitting "hovered" after the finger lifts, or on Back;
 *   · the press never moves the pill (P4 removed the lift; nothing re-adds it);
 *   · keyboard focus stays the ring (and the dot's growth), never a fill;
 *   · the native tap highlight is retired in favour of the designed press.
 *
 * jsdom has no layout engine and vitest runs css:false, so the classes are the
 * contract here (the TapTargets guard's idiom); the rendered, measured proof is
 * the playwright rig banked under
 * qa-reports/2026-10-19_InteractionRefinement-evidence/.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { ProjectDoorwayButton } from '@/components/ProjectDoorwayButton';

afterEach(cleanup);

const classesOf = (el: Element) => el.className.split(/\s+/).filter(Boolean);
/** Every hover utility that is NOT wrapped in the hover-capable media gate. */
const bareHovers = (el: Element) =>
  classesOf(el).filter((c) => /(^|:)hover:/.test(c) && !c.startsWith('[@media(hover:hover)]:'));

function renderDoorway(props: Partial<Parameters<typeof ProjectDoorwayButton>[0]> = {}) {
  render(<ProjectDoorwayButton href="/work/flagstone/" {...props} />);
  const link = screen.getByRole('link', { name: props['aria-label'] ?? 'View project' });
  const dot = link.querySelector('span[aria-hidden="true"].rounded-full') as HTMLElement;
  return { link, dot };
}

describe('ProjectDoorwayButton — the press language', () => {
  it('still renders the shared 44px pill with its href, label and dot', () => {
    const { link, dot } = renderDoorway();
    // next/link normalizes the trailing slash outside the App Router (same tolerance as the parity gate)
    expect(link).toHaveAttribute('href', expect.stringMatching(/^\/work\/flagstone\/?$/));
    expect(link).toHaveClass('h-11', 'rounded-pill', 'border', 'border-border-interactive', 'bg-canvas', 'shadow-soft');
    expect(dot).toHaveClass('h-1.5', 'w-1.5', 'bg-terracotta');
  });

  it('answers a press with the terracotta hairline, the restrained tint and the half-fast rung', () => {
    const { link } = renderDoorway();
    expect(link).toHaveClass(
      'active:!border-accent-primary',
      'active:!bg-accent/10',
      'active:duration-[calc(var(--dur-fast)/2)]',
    );
    // Release settles on the base rung: the destination state's transition is
    // the one that runs, and the rest state declares duration-base / ease-out.
    expect(link).toHaveClass('duration-base', 'ease-out');
    // Border changes are colour-only (1px stays 1px — no layout shift).
    expect(link.className).not.toMatch(/border-\d/);
  });

  it('never moves under the finger: no transform of any kind, at rest, on hover or on press', () => {
    const { link } = renderDoorway();
    expect(link.className).not.toMatch(/translate|scale|rotate/);
  });

  it('gates every hover response to hover-capable pointers (no sticky touch hover)', () => {
    const { link, dot } = renderDoorway();
    expect(bareHovers(link)).toEqual([]);
    expect(bareHovers(dot)).toEqual([]);
    expect(link).toHaveClass(
      '[@media(hover:hover)]:hover:border-ink-muted',
      '[@media(hover:hover)]:hover:bg-blush',
    );
    expect(dot).toHaveClass('[@media(hover:hover)]:group-hover:h-2', '[@media(hover:hover)]:group-hover:w-2');
  });

  it('keeps keyboard focus distinct from the press: the ring (and the dot) answer focus, never a fill', () => {
    const { link, dot } = renderDoorway();
    expect(link).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-accent-primary',
    );
    const focusFills = classesOf(link).filter(
      (c) => c.startsWith('focus-visible:') && /(bg-|border-[a-z])/.test(c),
    );
    expect(focusFills).toEqual([]);
    // the keyboard receives the same invitation the pointer does
    expect(dot).toHaveClass('group-focus-visible:h-2', 'group-focus-visible:w-2');
  });

  it('the signature dot contracts and embers on press, wins over hover and the list-side rules, and rides the half-fast rung', () => {
    const { dot } = renderDoorway();
    expect(dot).toHaveClass(
      'group-active:!h-1',
      'group-active:!w-1',
      'group-active:!bg-accent-hover',
      'group-active:duration-[calc(var(--dur-fast)/2)]',
    );
    // size AND fill are enumerated transitions (never transition-all)
    expect(dot).toHaveClass('transition-[width,height,background-color]');
  });

  it('retires the native tap highlight in favour of the designed press', () => {
    const { link } = renderDoorway();
    expect(link).toHaveClass('[-webkit-tap-highlight-color:transparent]');
  });

  it('still forwards only the three allowed per-instance props', () => {
    const { link } = renderDoorway({ 'aria-label': 'View project: Flagstone case study', tabIndex: -1 });
    expect(link).toHaveAttribute('aria-label', 'View project: Flagstone case study');
    expect(link).toHaveAttribute('tabindex', '-1');
  });
});
