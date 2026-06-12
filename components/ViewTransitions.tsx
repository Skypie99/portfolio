'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

/** Minimal shape of the object `document.startViewTransition()` returns. */
type ViewTransitionLike = {
  finished?: Promise<unknown>;
  updateCallbackDone?: Promise<unknown>;
  ready?: Promise<unknown>;
};

/** Intentionally ignore an expected (post-navigation) transition rejection. */
const noop = (): void => {};

/** Backstop for the update-callback resolver: a stuck navigation must never
 *  ride the UA's ~4s DOM-update timeout (frozen page, hard cut). Well under
 *  4s, generous enough for an uncached static-route fetch; firing early
 *  degrades to an instant cut, never a hang. */
const COMMIT_BACKSTOP_MS = 1500;

/**
 * Filmic page transitions (view-transitions 2026-06-05) — Direction D.
 *
 * One document-level, CAPTURE-phase click interceptor for same-origin
 * navigations. For an eligible plain left-click on an in-app <a>, it
 * preventDefaults — so Next <Link>'s bubble-phase handler bails on
 * `defaultPrevented` and never double-navigates — then drives the navigation
 * through `document.startViewTransition`, producing a TRUE golden cross-dissolve
 * (see the ::view-transition-* block in globals.css). One listener catches BOTH
 * Next <Link> anchors AND plain <a> (e.g. <Button href>) and any future content
 * links, uniformly — no per-link <TransitionLink> swap across the codebase.
 *
 * Degrades on every axis (the event simply proceeds, or we fall back to a plain
 * client push = an instant cut):
 *  - reduced motion            → plain router.push (instant cut)
 *  - no startViewTransition()  → plain router.push (instant cut)
 *  - destination '/'           → plain router.push (protects the GSAP cinematic —
 *                                the homepage never mounts under a transitioning root)
 *  - same-path search-only nav → plain router.push (instant cut; the pathname
 *                                resolver below cannot observe a search-only
 *                                commit, and useSearchParams would force a
 *                                Suspense boundary into the static-export root)
 *  - modifier/aux/_blank/ext/mailto/tel/download/in-page-hash → NOT intercepted;
 *    the browser does exactly what it does today (Link client-nav or <a> hard-nav)
 *  - no-JS                     → this never mounts; the cross-document
 *                                @view-transition rule (globals.css) handles hard
 *                                loads for free, and links navigate normally
 *
 * The update callback resolves on ROUTE COMMIT (pathname change), not on
 * paint: the View Transitions spec suspends rendering — rAF callbacks never
 * fire — while the callback's promise is pending, so a paint-based resolver
 * deadlocks into the UA's ~4s DOM-update timeout and the dissolve never
 * plays. React commits and flushes effects via scheduler macrotasks, which
 * keep running under suspended rendering.
 *
 * Renders null. Mounted once in the root layout so it persists across all
 * client navigations and is the single source of interception.
 */
export function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();

  // In-flight View Transition update-callback resolver. Settled on ROUTE
  // COMMIT (pathname effect below) or by the backstop timer — whichever
  // comes first.
  const pendingRef = useRef<{ resolve: () => void; timer: number } | null>(null);

  const settlePending = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    window.clearTimeout(pending.timer);
    pending.resolve();
  }, []);

  // ROUTE-COMMIT resolver. React flushes this effect on commit via a
  // scheduler macrotask — paint is NOT required — so it runs even while the
  // View Transition has rendering suspended (a rAF would not). First-mount
  // run is a no-op: pendingRef is null.
  useEffect(() => {
    settlePending();
  }, [pathname, settlePending]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Plain left-click only — never hijack modifier / middle / right clicks
      // (those open new tabs etc.), and bail if something already handled it.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.defaultPrevented) return;

      const anchor = (e.target as Element | null)?.closest?.('a');
      if (!anchor) return;

      // New-tab / new-window targets and explicit downloads → leave to the browser.
      const target = anchor.getAttribute('target');
      if (target && target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Resolve against the current location; only intercept same-origin http(s).
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // external site
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return; // mailto:, tel:, …

      // Pure in-page hash on the SAME path → native fragment scroll, not a
      // page transition. Also skip a click to the identical current URL.
      const samePath = url.pathname === window.location.pathname;
      if (samePath && url.hash) return;
      if (samePath && url.search === window.location.search && !url.hash) return;

      const dest = url.pathname + url.search + url.hash;

      // We are taking over this navigation.
      e.preventDefault();

      const reduce =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Arrivals at '/' stay an instant cut so the GSAP cinematic mounts on its
      // well-tested cold path — never measured against a transitioning root.
      const toHome = url.pathname === '/' || url.pathname === '';

      // Feature-detect without leaning on lib.dom typings (cast via unknown, no `any`).
      const startViewTransition = (
        document as unknown as {
          startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike;
        }
      ).startViewTransition;

      // `samePath` here means a search-only navigation (same-path + hash and
      // identical-URL clicks already returned above): the pathname resolver
      // cannot observe that commit, so it degrades to an instant cut.
      if (reduce || toHome || samePath || typeof startViewTransition !== 'function') {
        router.push(dest);
        return;
      }

      try {
        const transition = startViewTransition.call(document, () => {
          router.push(dest);
          // Resolve on ROUTE COMMIT, not paint: rendering (rAF/paint) is
          // suspended while this promise is pending, so a paint-based
          // resolver can never fire — it rides the UA's ~4s DOM-update
          // timeout and the dissolve is replaced by a frozen page + hard
          // cut. The pathname effect above settles this as soon as Next
          // commits the new route (~tens of ms on this static export); the
          // backstop timer covers a stuck navigation.
          return new Promise<void>((resolve) => {
            settlePending(); // a rapid second nav supersedes the previous pending
            const timer = window.setTimeout(() => {
              if (pendingRef.current?.resolve === resolve) pendingRef.current = null;
              resolve();
            }, COMMIT_BACKSTOP_MS);
            pendingRef.current = { resolve, timer };
          });
        });
        // The transition's promises reject when it is aborted/interrupted (a rapid
        // second navigation skips the first) or times out the DOM-update window
        // (`TimeoutError: Transition was aborted because of timeout in DOM update`).
        // The navigation has already happened via router.push, so those rejections
        // are expected and harmless — swallow them so they never surface as
        // uncaught console errors. (The sync `try/catch` only covers throws, not
        // these async rejections.)
        transition?.finished?.catch?.(noop);
        transition?.updateCallbackDone?.catch?.(noop);
        transition?.ready?.catch?.(noop);
      } catch {
        router.push(dest); // a VT error must never strand the navigation
      }
    }

    document.addEventListener('click', onClick, true); // capture phase
    return () => {
      document.removeEventListener('click', onClick, true);
      settlePending(); // never strand a resolver (or its timer) on unmount
    };
  }, [router, settlePending]);

  return null;
}
