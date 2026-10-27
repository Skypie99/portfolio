'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

import { THEME_COLORS } from '@/lib/theme';

/**
 * ThemeColorSync (CC1) — make the browser toolbar follow the site's ACTUAL
 * theme, not just the operating system's.
 *
 * The static `viewport.themeColor` pair in app/layout.tsx is media-keyed
 * (`prefers-color-scheme`). That is the correct no-JavaScript answer, but it
 * lies the moment a visitor pins the site to the opposite theme: the page goes
 * dark while the toolbar stays cream, or the reverse.
 *
 * The class on <html> is the single source of truth once JavaScript runs — the
 * toggle flips it inside the view-transition callback and next-themes keeps it
 * in sync for system changes. This component therefore observes that class
 * (not React state, which lands a frame later) and rewrites the theme-color
 * metadata to match:
 *
 *  - exactly ONE `meta[name="theme-color"]` remains readable, with no `media`
 *    gate, so there is no last-one-wins ambiguity in the head;
 *  - the two static tags remain in the SSR HTML as the no-JS fallback until
 *    this mounts;
 *  - only `name`, `content` and `media` are touched. No palette, no JSON-LD,
 *    no CSP.
 *
 * Superseded tags are DE-NAMED, not removed. They are React-owned metadata
 * nodes (the `viewport` export): detaching one leaves React's own deletion
 * pass with a null parent — `commitDeletionEffectsOnFiber` then threw
 * "Cannot read properties of null (reading 'removeChild')" on every in-site
 * navigation (measured 2026-10-27 on the released site). De-naming removes
 * the tag from the `meta[name="theme-color"]` set just as completely — the
 * browser chrome and every reader key off `name` — while leaving React's
 * node attached so its lifecycle stays intact.
 *
 * It ALSO observes <head> child changes. Next's App Router re-renders the
 * route's metadata on a client navigation and drops the runtime tag with it;
 * without the second observer the toolbar silently reverted to the OS colour
 * after the first in-site link (measured: meta count 1 → 0 on / → /blog/).
 *
 * Renders nothing.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    let queued = false;

    const apply = () => {
      const dark = root.classList.contains('dark');
      const desired = dark ? THEME_COLORS.dark : THEME_COLORS.light;
      const tags = Array.from(
        document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
      );
      let canonical = tags[0];

      if (!canonical) {
        canonical = document.createElement('meta');
        canonical.setAttribute('name', 'theme-color');
        canonical.setAttribute('content', desired);
        document.head.appendChild(canonical);
        return;
      }
      // Idempotent: only write when something is actually wrong, so the head
      // observer below settles instead of re-triggering itself.
      if (canonical.getAttribute('content') !== desired) {
        canonical.setAttribute('content', desired);
      }
      if (canonical.hasAttribute('media')) canonical.removeAttribute('media');
      // De-name superseded tags instead of detaching them (see the header
      // note): React owns these nodes and deletes them on the next metadata
      // swap, so they must stay attached until then.
      for (const extra of tags.slice(1)) extra.removeAttribute('name');
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        apply();
      });
    };

    apply();

    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
    const headObserver = new MutationObserver(schedule);
    headObserver.observe(document.head, { childList: true });

    return () => {
      themeObserver.disconnect();
      headObserver.disconnect();
    };
  }, [resolvedTheme]);

  return null;
}
