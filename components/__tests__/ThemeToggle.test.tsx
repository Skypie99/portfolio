import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * THE ROOM / Phase G · G1 — the dusk-turn's contract.
 *
 * The turn is a VIEW TRANSITION whose whole visual payload lives in CSS
 * (globals.css keys off `html[data-theme-turn]`), so jsdom can never see the
 * sweep itself. What it CAN guard is the machinery the sweep depends on, and
 * every one of these has a failure mode that ships silently:
 *
 *  1. the marker is written INSIDE the transition callback (pseudo-element
 *     styles resolve against the post-callback DOM — set it outside and the
 *     first frame paints the wrong room's sky, or none);
 *  2. it names the DESTINATION theme, so each leg picks its own ramp;
 *  3. it is released when the turn ends — a stuck marker would repaint the
 *     sky on the next unrelated navigation;
 *  4. a rapid second turn OWNS the marker: the first turn's release must not
 *     strip it (the same race ViewTransitions.tsx documents for
 *     data-nav-direction);
 *  5. under reduced motion NO transition is started at all, so the sky is
 *     never painted and the flip is instant — layer 1 of the RM contract.
 */

const setTheme = vi.fn();
let resolvedTheme = 'light';

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

/** The DOM lib types startViewTransition as returning a full ViewTransition;
 *  these tests only need `finished`, so the stub is installed through unknown.
 *  `mutableDoc` also drops the property's non-optional typing so it can be
 *  deleted between cases. */
type StubTransition = { finished: Promise<void> };
const mutableDoc = document as unknown as {
  startViewTransition?: (cb: () => void) => StubTransition;
};

/** Captures what the DOM looked like at the instant the callback ran. */
let seenInsideCallback: string | undefined;
let settle: (() => void) | undefined;

function installViewTransition() {
  mutableDoc.startViewTransition = (cb: () => void) => {
    cb();
    seenInsideCallback = document.documentElement.dataset.themeTurn;
    return { finished: new Promise<void>((res) => { settle = () => res(); }) };
  };
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  setTheme.mockClear();
  resolvedTheme = 'light';
  seenInsideCallback = undefined;
  settle = undefined;
  delete document.documentElement.dataset.themeTurn;
  document.documentElement.classList.remove('dark');
  setReducedMotion(false);
  installViewTransition();
});

afterEach(() => {
  cleanup();
  delete mutableDoc.startViewTransition;
});

const clickToggle = () => fireEvent.click(screen.getByRole('button'));

describe('the dusk-turn (G1)', () => {
  it('marks the destination room INSIDE the transition callback', () => {
    render(<ThemeToggle />);
    clickToggle();
    // Written before the callback returned — not after the promise settles.
    expect(seenInsideCallback).toBe('dark');
    expect(document.documentElement.dataset.themeTurn).toBe('dark');
    // ...and the class flipped synchronously in the same callback.
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('names the destination on the reverse leg too (dark -> light)', () => {
    resolvedTheme = 'dark';
    render(<ThemeToggle />);
    clickToggle();
    expect(seenInsideCallback).toBe('light');
  });

  it('releases the marker when the turn finishes', async () => {
    render(<ThemeToggle />);
    clickToggle();
    expect(document.documentElement.dataset.themeTurn).toBe('dark');
    settle?.();
    await vi.waitFor(() =>
      expect(document.documentElement.dataset.themeTurn).toBeUndefined(),
    );
  });

  it('a second turn owns the marker — the first turn\'s release must not strip it', async () => {
    render(<ThemeToggle />);
    const firstSettle = (clickToggle(), settle);
    resolvedTheme = 'dark';
    cleanup();
    render(<ThemeToggle />);
    clickToggle(); // second turn claims the marker
    expect(document.documentElement.dataset.themeTurn).toBe('light');

    firstSettle?.(); // the STALE turn finishes late
    await Promise.resolve();
    await Promise.resolve();
    expect(document.documentElement.dataset.themeTurn).toBe('light');
  });

  it('reduced motion: instant flip, no transition, no sky painted', () => {
    setReducedMotion(true);
    const started = vi.fn();
    mutableDoc.startViewTransition = (cb: () => void) => {
      started();
      cb();
      return { finished: Promise.resolve() };
    };
    render(<ThemeToggle />);
    clickToggle();

    expect(started).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.themeTurn).toBeUndefined();
    expect(setTheme).toHaveBeenCalledWith('dark'); // the flip still happens
  });

  it('no View Transitions API: instant flip, no marker left behind', () => {
    delete mutableDoc.startViewTransition;
    render(<ThemeToggle />);
    clickToggle();
    expect(document.documentElement.dataset.themeTurn).toBeUndefined();
    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
