/**
 * RouteFocus (W4-02 · N1) — arrival focus tests.
 *
 * Forward/direct arrivals keep the shipped focus-to-main orientation; a
 * popstate (history Back) arrival at a recorded keyboard departure's origin
 * reseats focus on the recorded Home #work row link instead, so the next
 * Tab continues down the work list. `next/navigation` is mocked because
 * usePathname needs App Router context jsdom does not provide (same pattern
 * as ViewTransitions.test.tsx).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const { pathnameMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn((): string => '/'),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

import { RouteFocus } from '@/components/RouteFocus';
import {
  _resetReturnFocusForTests,
  notePopstate,
  recordReturnFocus,
} from '@/lib/returnFocus';

function addRowLink(href: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.setAttribute('data-return-focus', href);
  document.body.appendChild(a);
  return a;
}

/** The layout's <main id="main" tabIndex={-1}>. */
function addMain(): HTMLElement {
  const main = document.createElement('main');
  main.id = 'main';
  main.tabIndex = -1;
  document.body.appendChild(main);
  return main;
}

/** Render at `from`, then commit a route change to `to` (one pathname effect run). */
function commit(rerender: (ui: React.ReactElement) => void, to: string): void {
  pathnameMock.mockReturnValue(to);
  rerender(<RouteFocus />);
}

beforeEach(() => {
  _resetReturnFocusForTests();
  // jsdom has no checkVisibility (and lays out nothing) — stub the guard.
  Object.defineProperty(HTMLElement.prototype, 'checkVisibility', {
    configurable: true,
    value: () => true,
  });
});

afterEach(() => {
  delete (HTMLElement.prototype as Partial<Record<'checkVisibility', unknown>>).checkVisibility;
  cleanup();
  document.body.innerHTML = '';
  window.history.pushState({}, '', '/');
});

describe('RouteFocus', () => {
  it('focuses <main> on a forward client-side arrival (shipped orientation, unchanged)', () => {
    const main = addMain();
    pathnameMock.mockReturnValue('/');
    const { rerender } = render(<RouteFocus />);
    commit(rerender, '/work/flagstone/');
    expect(document.activeElement).toBe(main);
  });

  it('announces the arrival (role=status copy survives the repair)', () => {
    addMain();
    pathnameMock.mockReturnValue('/');
    const { rerender } = render(<RouteFocus />);
    commit(rerender, '/work/flagstone/');
    const status = document.querySelector('p[role="status"]');
    expect(status?.textContent).toContain('page loaded');
  });

  it('reseats a keyboard reader on the recorded row link after history Back', () => {
    const main = addMain();
    const row = addRowLink('/work/flagstone/');
    pathnameMock.mockReturnValue('/');
    const { rerender } = render(<RouteFocus />);

    // keyboard Enter on the row: the interceptor records, the push commits.
    recordReturnFocus(row, '/', '/work/flagstone/', true);
    commit(rerender, '/work/flagstone/');
    expect(document.activeElement).toBe(main); // case page: focus-to-main, as shipped

    // history Back: popstate fires, then the home route commits.
    notePopstate();
    commit(rerender, '/');
    expect(document.activeElement).toBe(row); // the chair, not <main>
  });

  it('keeps focus-to-main after Back for a POINTER departure (keyboard-only restore)', () => {
    const main = addMain();
    const row = addRowLink('/work/flagstone/');
    pathnameMock.mockReturnValue('/');
    const { rerender } = render(<RouteFocus />);

    recordReturnFocus(row, '/', '/work/flagstone/', false); // mouse click
    commit(rerender, '/work/flagstone/');
    notePopstate();
    commit(rerender, '/');
    expect(document.activeElement).toBe(main);
  });

  it('keeps focus-to-main for a FORWARD click-return to the origin (popstate-only restore)', () => {
    const main = addMain();
    const row = addRowLink('/work/flagstone/');
    pathnameMock.mockReturnValue('/');
    const { rerender } = render(<RouteFocus />);

    recordReturnFocus(row, '/', '/work/flagstone/', true);
    commit(rerender, '/work/flagstone/');
    // no popstate — a click on the sidebar wordmark pushes back to '/'
    commit(rerender, '/');
    expect(document.activeElement).toBe(main);
  });

  it('keeps focus-to-main when the recorded link is gone from the restored page (stale origin)', () => {
    const main = addMain();
    const row = addRowLink('/work/flagstone/');
    pathnameMock.mockReturnValue('/');
    const { rerender } = render(<RouteFocus />);

    recordReturnFocus(row, '/', '/work/flagstone/', true);
    commit(rerender, '/work/flagstone/');
    row.remove(); // the link did not survive restoration
    notePopstate();
    commit(rerender, '/');
    expect(document.activeElement).toBe(main);
  });

  it('leaves focus untouched for archive transitions (shipped behavior, unchanged)', () => {
    addMain();
    pathnameMock.mockReturnValue('/');
    const { rerender } = render(<RouteFocus />);
    commit(rerender, '/archive');
    expect(document.activeElement).toBe(document.body);
  });
});
