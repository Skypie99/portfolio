'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

/**
 * Route-change transition (motion-polish 2026-06-03).
 *
 * Next's App Router re-mounts `template.tsx` on every navigation, so a CSS
 * enter animation here plays once per page change — a calm crossfade + small
 * rise on `--ease-gh-glide` / `--dur-transition` (see .page-enter in
 * globals.css). It turns the site's hard route cuts into one continuous,
 * cinematic flow.
 *
 * TWO exemptions keep it safe:
 *  1. The homepage ('/') renders children UNWRAPPED — the locked cinematic
 *     intro + hero first-load stays byte-identical and never gets a transition
 *     layered over it.
 *  2. The INITIAL page load is exempt (the `armed` flag is false until after
 *     the first mount) so we never fade the LCP element on a cold load — only
 *     client-side navigations animate.
 *
 * Reduced motion: the .page-enter animation is gated to `no-preference`, so RM
 * visitors get the final state instantly. No-JS visitors only ever see the
 * (unwrapped) SSR page — client navigations require JS — so content is always
 * present and visible.
 */

// Module-scoped: false during SSR + the first client render (so hydration
// matches), then flipped true after the initial mount. Persists across
// navigations, so every subsequent client navigation animates.
let armed = false;

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    armed = true;
  }, []);

  const animate = armed && pathname !== '/';
  return animate ? <div className="page-enter">{children}</div> : <>{children}</>;
}
