/**
 * ViewTransitions interceptor tests (view-transitions 2026-06-05).
 *
 * The cross-dissolve itself needs a real View Transitions engine (jsdom has
 * none), so these tests cover the part that IS pure DOM/URL reasoning and must
 * be correct: the SKIP LOGIC that decides whether a click is taken over.
 *
 * Signal: an intercepted same-origin click drives navigation through the mocked
 * router (jsdom has no startViewTransition, so it takes the plain `router.push`
 * fallback). So `push` firing ⇒ the click was taken over; `push` NOT firing ⇒
 * the click was left to the browser. A bubble-phase preventer is installed so
 * jsdom never actually follows the un-intercepted anchors (which would only emit
 * harmless "Not implemented: navigation" noise) — it runs AFTER the component's
 * capture-phase listener, so it never changes whether `push` fired.
 *
 * `next/navigation` is mocked because `useRouter` needs App Router context jsdom
 * does not provide (same pattern as HamburgerNav.test.tsx mocking usePathname).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const { pushMock, pathnameMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  pathnameMock: vi.fn((): string => '/'),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock(),
}));

import { ViewTransitions } from '@/components/ViewTransitions';

const suppressNav = (e: Event) => e.preventDefault();

/** Build an <a>, append it, dispatch a plain (or modified) left-click, detach. */
function clickAnchor(attrs: Record<string, string>, init: MouseEventInit = {}): void {
  const a = document.createElement('a');
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
  a.textContent = 'link';
  document.body.appendChild(a);
  a.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }),
  );
  a.remove();
}

beforeEach(() => {
  pushMock.mockClear();
  pathnameMock.mockClear();
  pathnameMock.mockReturnValue('/');
  render(<ViewTransitions />); // attaches the capture-phase document listener
  // Bubble phase, so jsdom's default navigation is canceled for every test
  // anchor without affecting the capture-phase interceptor's decision.
  document.addEventListener('click', suppressNav);
});

afterEach(() => {
  document.removeEventListener('click', suppressNav);
  cleanup();
  document.body.innerHTML = '';
  window.history.pushState({}, '', '/'); // restore jsdom location between tests
});

describe('ViewTransitions interceptor', () => {
  it('intercepts a plain left-click on a same-origin internal link', () => {
    clickAnchor({ href: '/work/access-map/' });
    expect(pushMock).toHaveBeenCalledWith('/work/access-map/');
  });

  it('preserves the hash + query on an intercepted cross-page link', () => {
    clickAnchor({ href: '/work/?filter=ai#grid' });
    expect(pushMock).toHaveBeenCalledWith('/work/?filter=ai#grid');
  });

  it('still navigates to the homepage (instant-cut path) from another page', () => {
    // From a non-root page, a click to '/' is intercepted and navigates, but
    // takes the instant-cut branch (no View Transition) to protect the cinematic.
    window.history.pushState({}, '', '/work/access-map/');
    clickAnchor({ href: '/' });
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('treats a click to the current URL as a no-op (not intercepted)', () => {
    // jsdom location is http://localhost/ → a link to '/' is the same page.
    clickAnchor({ href: '/' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept an external link', () => {
    clickAnchor({ href: 'https://github.com/skypie99' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a mailto: link', () => {
    clickAnchor({ href: 'mailto:hello@example.com' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a target=_blank link', () => {
    clickAnchor({ href: '/work/', target: '_blank' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a download link', () => {
    clickAnchor({ href: '/resume.pdf', download: '' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a modifier (cmd/ctrl) click', () => {
    clickAnchor({ href: '/work/' }, { metaKey: true });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a same-page in-page hash link', () => {
    // jsdom location is http://localhost/ → '/#work' is a same-path fragment.
    clickAnchor({ href: '/#work' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('attaches a rejection handler to every View Transition promise (no uncaught TimeoutError)', () => {
    // Regression guard for the live `TimeoutError: Transition was aborted because
    // of timeout in DOM update` console spew. jsdom has no startViewTransition;
    // install one that drives the callback (so the nav still happens) and returns
    // a transition whose `finished` REJECTS — exactly what the browser does when a
    // transition is aborted/interrupted. The component must attach a `.catch` to
    // each promise so the rejection never surfaces as a console error. (The
    // callback's own promise is now commit/backstop-resolved — no rAF involved;
    // its backstop timer is cleared by the unmount cleanup in afterEach.)
    const finished = Promise.reject(new Error('TimeoutError: Transition was aborted'));
    const updateCallbackDone = Promise.resolve();
    const ready = Promise.resolve();
    // Since the enfilade (R4/BP1), `finished` is consumed via
    // `.finally(clearDirection).catch(noop)` — the rejection handler rides the
    // finally-chain, so the mechanism assertion is "finally attached once";
    // the swallow itself is proven behaviorally: `finished` here is ALREADY
    // rejected, so if the chain missed it, vitest would fail this file with
    // an unhandled rejection (and the dedicated abort test below re-proves
    // clear-on-abort end to end).
    const finishedFinally = vi.spyOn(finished, 'finally');
    const updateCatch = vi.spyOn(updateCallbackDone, 'catch');
    const readyCatch = vi.spyOn(ready, 'catch');

    const svt = vi.fn((cb: () => unknown) => {
      cb(); // runs router.push(dest) + returns the commit-resolved promise
      return { finished, updateCallbackDone, ready };
    });
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/work/access-map/' });

      expect(svt).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith('/work/access-map/');
      // The fix: a rejection handler is attached to all three transition promises
      // (finished via its finally-chain — see the note above).
      expect(finishedFinally).toHaveBeenCalledTimes(1);
      expect(updateCatch).toHaveBeenCalledTimes(1);
      expect(readyCatch).toHaveBeenCalledTimes(1);
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
    }
  });

  it('resolves the update callback on ROUTE COMMIT (pathname change), not paint', async () => {
    // The View Transitions spec suspends rendering while the update callback's
    // promise is pending — a paint/rAF-based resolver deadlocks into the UA's
    // ~4s timeout (the D5 freeze). The repair resolves on pathname commit.
    cleanup(); // drop the beforeEach instance; this test controls rerenders
    pathnameMock.mockReturnValue('/');
    const view = render(<ViewTransitions />);

    let callbackPromise: Promise<void> | undefined;
    const svt = vi.fn((cb: () => Promise<void>) => {
      callbackPromise = cb();
      return {
        finished: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        ready: Promise.resolve(),
      };
    });
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/work/access-map/' });
      expect(svt).toHaveBeenCalledTimes(1);

      let resolved = false;
      void callbackPromise!.then(() => {
        resolved = true;
      });
      await Promise.resolve();
      await Promise.resolve();
      expect(resolved).toBe(false); // no commit yet — promise must still be pending

      // Next commits the new route → usePathname flips → effect settles.
      pathnameMock.mockReturnValue('/work/access-map/');
      view.rerender(<ViewTransitions />);
      await Promise.resolve();
      await Promise.resolve();
      expect(resolved).toBe(true); // resolved WITHOUT any timer or paint
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
    }
  });

  it('backstop-resolves a stuck navigation instead of riding the UA timeout', async () => {
    vi.useFakeTimers();

    let callbackPromise: Promise<void> | undefined;
    const svt = vi.fn((cb: () => Promise<void>) => {
      callbackPromise = cb();
      return {
        finished: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        ready: Promise.resolve(),
      };
    });
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/work/access-map/' });
      expect(svt).toHaveBeenCalledTimes(1);

      let resolved = false;
      void callbackPromise!.then(() => {
        resolved = true;
      });
      // Pathname never changes (stuck nav). The 1.5s backstop must fire —
      // well under the UA's ~4s DOM-update timeout.
      await vi.advanceTimersByTimeAsync(1500);
      expect(resolved).toBe(true);
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      vi.useRealTimers();
    }
  });

  it('sets data-nav-direction="descend" on a parent→child click and clears it on finish (enfilade, R4/BP1)', async () => {
    window.history.pushState({}, '', '/work/');
    let resolveFinished!: () => void;
    const finished = new Promise<void>((r) => {
      resolveFinished = r;
    });
    const svt = vi.fn((cb: () => unknown) => {
      cb();
      return { finished, updateCallbackDone: Promise.resolve(), ready: Promise.resolve() };
    });
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/work/access-map/' });
      expect(svt).toHaveBeenCalledTimes(1);
      // While the transition is in flight, the attribute drives the keyframes.
      expect(document.documentElement.dataset.navDirection).toBe('descend');

      resolveFinished();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      // finished.finally(clearDirection) — a clean root for the next navigation.
      expect(document.documentElement.dataset.navDirection).toBeUndefined();
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      delete document.documentElement.dataset.navDirection;
    }
  });

  it('sets data-nav-direction="ascend" on a child→parent click (the breadcrumb leg)', () => {
    window.history.pushState({}, '', '/work/access-map/');
    const svt = vi.fn((cb: () => unknown) => {
      cb();
      return {
        finished: new Promise<void>(() => {}), // pending — attr stays up for the assert
        updateCallbackDone: Promise.resolve(),
        ready: Promise.resolve(),
      };
    });
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/work/' });
      expect(svt).toHaveBeenCalledTimes(1);
      expect(document.documentElement.dataset.navDirection).toBe('ascend');
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      delete document.documentElement.dataset.navDirection;
    }
  });

  it('sets NO direction attribute on a non-parent navigation (plain dissolve preserved)', () => {
    window.history.pushState({}, '', '/work/access-map/');
    const svt = vi.fn((cb: () => unknown) => {
      cb();
      return {
        finished: new Promise<void>(() => {}),
        updateCallbackDone: Promise.resolve(),
        ready: Promise.resolve(),
      };
    });
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/about/' });
      expect(svt).toHaveBeenCalledTimes(1); // the VT still runs — just directionless
      expect(document.documentElement.dataset.navDirection).toBeUndefined();
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      delete document.documentElement.dataset.navDirection;
    }
  });

  it('clears the direction attribute even when the transition is aborted (finished rejects)', async () => {
    window.history.pushState({}, '', '/work/');
    let rejectFinished!: (e: Error) => void;
    const finished = new Promise<void>((_r, rej) => {
      rejectFinished = rej;
    });
    const svt = vi.fn((cb: () => unknown) => {
      cb();
      return { finished, updateCallbackDone: Promise.resolve(), ready: Promise.resolve() };
    });
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/work/access-map/' });
      expect(document.documentElement.dataset.navDirection).toBe('descend');

      rejectFinished(new Error('Transition was aborted'));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      // finally() ran (attr cleared) and catch(noop) swallowed the rejection.
      expect(document.documentElement.dataset.navDirection).toBeUndefined();
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      delete document.documentElement.dataset.navDirection;
    }
  });

  it('keeps the SECOND navigation\'s direction when a rapid re-nav skips the first transition (seq guard)', async () => {
    // Skeptic-caught (BP1 verify): VT2 skips VT1; VT1's finished then FULFILLS
    // and its finally(clearDirection) runs in a microtask — without the
    // sequence guard it would delete the attribute VT2 just set, and the
    // second enfilade would silently play as a plain dissolve.
    window.history.pushState({}, '', '/work/');
    let resolveFirst!: () => void;
    const finishedFirst = new Promise<void>((r) => {
      resolveFirst = r;
    });
    const finishedSecond = new Promise<void>(() => {}); // stays pending
    let call = 0;
    const svt = vi.fn((cb: () => unknown) => {
      cb();
      call += 1;
      return {
        finished: call === 1 ? finishedFirst : finishedSecond,
        updateCallbackDone: Promise.resolve(),
        ready: Promise.resolve(),
      };
    });
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/work/access-map/' });
      expect(document.documentElement.dataset.navDirection).toBe('descend');

      clickAnchor({ href: '/work/dashboard/' }); // rapid second descend, VT1 superseded
      expect(svt).toHaveBeenCalledTimes(2);
      expect(document.documentElement.dataset.navDirection).toBe('descend');

      resolveFirst(); // VT1 settles (skip → fulfilled) AFTER being superseded
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      // The guard: VT1's clear is suppressed — VT2's direction survives.
      expect(document.documentElement.dataset.navDirection).toBe('descend');
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      delete document.documentElement.dataset.navDirection;
    }
  });

  it('sets NO direction attribute under reduced motion (the RM branch never reaches the enfilade)', () => {
    window.history.pushState({}, '', '/work/');
    const svt = vi.fn();
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;
    const realMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia;

    try {
      clickAnchor({ href: '/work/access-map/' });
      // RM branch: plain push, no View Transition, no attribute — the shipped
      // instant cut is the first-class RM experience, untouched.
      expect(pushMock).toHaveBeenCalledWith('/work/access-map/');
      expect(svt).not.toHaveBeenCalled();
      expect(document.documentElement.dataset.navDirection).toBeUndefined();
    } finally {
      window.matchMedia = realMatchMedia;
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
    }
  });

  it('marks the departed room card on a return home — through the instant-cut branch (door ajar, R4/BP2)', () => {
    // A→home rides the toHome instant cut (no View Transition) — the mark is
    // presence, not motion, so it must survive every degraded branch.
    cleanup();
    window.history.pushState({}, '', '/work/access-map/');
    pathnameMock.mockReturnValue('/work/access-map/');
    const view = render(<ViewTransitions />);

    const card = document.createElement('a');
    card.setAttribute('href', '/work/access-map/');
    card.setAttribute('data-door-target', '/work/access-map/'); // the card's opt-in hook
    document.body.appendChild(card);

    try {
      clickAnchor({ href: '/' });
      expect(pushMock).toHaveBeenCalledWith('/');

      // Next commits '/' → the pathname effect applies the mark.
      pathnameMock.mockReturnValue('/');
      view.rerender(<ViewTransitions />);
      expect(card.hasAttribute('data-door-ajar')).toBe(true);

      // The following commit releases it — present-until-next-nav.
      pathnameMock.mockReturnValue('/about/');
      view.rerender(<ViewTransitions />);
      expect(card.hasAttribute('data-door-ajar')).toBe(false);
    } finally {
      card.remove();
    }
  });

  it('marks the card under reduced motion too (the mark is presence, not motion)', () => {
    cleanup();
    window.history.pushState({}, '', '/work/access-map/');
    pathnameMock.mockReturnValue('/work/access-map/');
    const view = render(<ViewTransitions />);

    const card = document.createElement('a');
    card.setAttribute('href', '/work/access-map/');
    card.setAttribute('data-door-target', '/work/access-map/'); // the card's opt-in hook
    document.body.appendChild(card);

    const realMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia;

    try {
      clickAnchor({ href: '/' });
      expect(pushMock).toHaveBeenCalledWith('/');

      pathnameMock.mockReturnValue('/');
      view.rerender(<ViewTransitions />);
      expect(card.hasAttribute('data-door-ajar')).toBe(true);
    } finally {
      window.matchMedia = realMatchMedia;
      card.remove();
    }
  });

  it('takes the plain-push instant cut for a same-path search-only navigation', () => {
    // The pathname resolver cannot observe a search-only commit, so these
    // degrade to an instant cut (strictly better than the old 4s freeze).
    window.history.pushState({}, '', '/work/');
    const svt = vi.fn();
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = svt;

    try {
      clickAnchor({ href: '/work/?filter=ai' });
      expect(pushMock).toHaveBeenCalledWith('/work/?filter=ai');
      expect(svt).not.toHaveBeenCalled();
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
    }
  });
});
