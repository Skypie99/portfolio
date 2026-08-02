/**
 * useActiveSection — the scroll-spy's cross-route reset (UP-10, ui-polish
 * 2026-08-01).
 *
 * WHY THIS EXISTS. The hook's consumers (SidebarSectionNav, SidebarArticleNav)
 * live in the persistent rail, which sits OUTSIDE {children} in the root layout,
 * so a client-side navigation swaps the page WITHOUT unmounting them. `active`
 * is component state, and every write is conditional on finding a section — so
 * before this reset, a section id that exists on two routes left the previous
 * route's marker lit on the next page. Measured on the built site: scroll
 * /about's "The Work" band, click the rail wordmark, and home's rail rendered
 * "The Work" with aria-current="true" while the reader sat at scrollY 0 in the
 * hero. That is a change to HOMEPAGE rail behaviour, which P3 forbids outright.
 * (`work` names a section on both `/` and `/about` by design — the ids describe
 * their own pages, and renaming one would only hide the defect.)
 *
 * jsdom has no IntersectionObserver — which is exactly why the component tests
 * mock this hook — so the test installs a controllable fake and drives it. The
 * end-to-end proof against the real built site is the re-runnable
 * receipts/p3/softnav-probe.mjs; this is the permanent regression guard.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useActiveSection } from '@/lib/motion';

/** Minimal IntersectionObserver stand-in whose callback we fire by hand. */
class FakeIO {
  static current: FakeIO | null = null;
  cb: (entries: unknown[]) => void;
  observed: Element[] = [];
  constructor(cb: (entries: unknown[]) => void) {
    this.cb = cb;
    FakeIO.current = this;
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

/** Report `id` as fully in view. */
function enter(id: string) {
  const target = document.getElementById(id);
  act(() => {
    FakeIO.current?.cb([{ isIntersecting: true, intersectionRatio: 1, target }]);
  });
}

function addSections(...ids: string[]) {
  for (const id of ids) {
    const el = document.createElement('section');
    el.id = id;
    document.body.appendChild(el);
  }
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', FakeIO as unknown as typeof IntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  FakeIO.current = null;
});

describe('useActiveSection', () => {
  it('starts empty and reports the section that comes into view', () => {
    addSections('method', 'work');
    const { result } = renderHook(({ ids }) => useActiveSection(ids), {
      initialProps: { ids: ['method', 'work'] },
    });

    expect(result.current).toBe('');
    enter('work');
    expect(result.current).toBe('work');
  });

  it('clears the active id when the id list changes — a marker never follows a route change', () => {
    addSections('method', 'work');
    const { result, rerender } = renderHook(({ ids }) => useActiveSection(ids), {
      initialProps: { ids: ['method', 'work'] },
    });

    enter('work');
    expect(result.current).toBe('work');

    // The soft navigation: same mounted component, a new route's id list. The
    // colliding id ('work' exists on the next route too) is the whole hazard —
    // without the reset the stale value survives and lights the wrong entry.
    document.body.innerHTML = '';
    addSections('work', 'process', 'about', 'certificates', 'contact');
    rerender({ ids: ['work', 'process', 'about', 'certificates', 'contact'] });

    expect(result.current).toBe('');
  });

  it('clears even when the new route resolves no sections at all', () => {
    addSections('method');
    const { result, rerender } = renderHook(({ ids }) => useActiveSection(ids), {
      initialProps: { ids: ['method'] },
    });

    enter('method');
    expect(result.current).toBe('method');

    // An unindexed route passes an empty list; the hook returns before
    // subscribing, so the reset must come FIRST or the stale id persists.
    document.body.innerHTML = '';
    rerender({ ids: [] });

    expect(result.current).toBe('');
  });

  it('does not re-subscribe when the ids array is a new reference with the same contents', () => {
    addSections('method', 'work');
    const { result, rerender } = renderHook(({ ids }) => useActiveSection(ids), {
      initialProps: { ids: ['method', 'work'] },
    });

    enter('work');
    expect(result.current).toBe('work');

    // The effect keys off the JOINED string, so an equal-but-new array must not
    // count as a change — otherwise every render would blank the marker.
    rerender({ ids: ['method', 'work'] });
    expect(result.current).toBe('work');
  });
});
