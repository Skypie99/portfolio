'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
 *  - modifier/aux/_blank/ext/mailto/tel/download/in-page-hash → NOT intercepted;
 *    the browser does exactly what it does today (Link client-nav or <a> hard-nav)
 *  - no-JS                     → this never mounts; the cross-document
 *                                @view-transition rule (globals.css) handles hard
 *                                loads for free, and links navigate normally
 *
 * Renders null. Mounted once in the root layout so it persists across all
 * client navigations and is the single source of interception.
 */
export function ViewTransitions() {
  const router = useRouter();

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
          startViewTransition?: (cb: () => void | Promise<void>) => unknown;
        }
      ).startViewTransition;

      if (reduce || toHome || typeof startViewTransition !== 'function') {
        router.push(dest);
        return;
      }

      try {
        startViewTransition.call(document, () => {
          router.push(dest);
          // router.push is fire-and-forget; resolve on the SECOND paint so the
          // statically pre-rendered route has committed before the new snapshot
          // is captured (no loading.tsx flash on a static export).
          return new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
        });
      } catch {
        router.push(dest); // a VT error must never strand the navigation
      }
    }

    document.addEventListener('click', onClick, true); // capture phase
    return () => document.removeEventListener('click', onClick, true);
  }, [router]);

  return null;
}
