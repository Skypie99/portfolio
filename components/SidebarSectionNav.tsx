'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';
import { useActiveSection } from '@/lib/motion';
import { sectionIdsForRoute, sectionsForRoute } from '@/lib/sectionNav';

/**
 * SidebarSectionNav — "On this page" scroll-spy index (view-transitions 2026-06-05).
 *
 * A quiet section index for the desktop rail. As you scroll, the current section
 * is gently emphasized (ink-weight shift + a 2px terracotta marker) and exposed
 * to assistive tech via `aria-current`. Driven by the existing
 * IntersectionObserver-based `useActiveSection` hook (no scroll-handler thrash;
 * one state update only when the active section CHANGES).
 *
 * Behavior across pages — SUPERSEDED 2026-08-01 by UP-10 (ui-polish train,
 * phase P3). The previous contract, recorded here as confirmed with Sky, was:
 * render the HOMEPAGE's five links on every non-longform route, "so the rail
 * stays consistent", with the active marker gated to `pathname === '/'`. That
 * rested on a premise which did not survive measurement — on all eight other
 * routes 5 of 5 entries pointed at ids the page does not contain and the
 * scroll-spy lit nothing, so the consistency was of shape only. The index now
 * describes the route you are actually on:
 *   1. `sectionsForRoute` returns THIS route's real, named sections (lib/
 *      sectionNav.ts owns the map and the three rules it follows), and
 *   2. a route with no index — /work, /certificates, /blog, /contact, the 404 —
 *      renders NOTHING here rather than an empty or borrowed shell.
 * Half 2 changes rail COMPOSITION, which is the half Sky's earlier ruling was
 * about; it is on her list as DECISIONS §P `P3-UP-10-SUPPRESS` and is one
 * commit to revoke. Half 1 is forced and needs no ruling.
 *
 * The `onHome` gate is gone because every listed id exists on its own route, so
 * `useActiveSection` is now correct everywhere rather than inert off-home. Note
 * what that hook does NOT do: when no id resolves it returns early, so `active`
 * is component state that would otherwise persist across a soft navigation
 * (this rail never unmounts). Ids DO collide across routes on purpose — `work`
 * names a section on both `/` and `/about` — so the hook clears on every id
 * list change; without that reset the previous route's marker would follow the
 * reader onto the next page. See lib/motion.ts.
 *
 * The "On this page" label string itself is Sky's copy — never reworded.
 *
 * Accessibility:
 *   - `aria-current="true"` on the active link, inside a plain <nav>/<ul>/<a>
 *     with NO aria-live / role=status — so a screen reader is NOT spammed as the
 *     attribute silently flips on scroll (AT announces aria-current on focus/
 *     navigation, not on mutation of an unfocused link).
 *   - The marker is decorative (aria-hidden); the semantic lives on aria-current.
 *   - Links stay keyboard-operable with the site's terracotta focus ring.
 *   - Reduced motion: the marker's scale transition is snapped instantly by the
 *     global prefers-reduced-motion rule in globals.css; the active state still
 *     updates (it's IntersectionObserver-driven, not motion).
 *   - No-JS: the <nav> + its links are server-rendered from the static map and
 *     navigate as plain anchors; only the live active-tracking is absent. (This
 *     is why the map is static rather than a DOM read like SidebarArticleNav's —
 *     see that file's C-42-rider for what an SSR-empty index costs.)
 */

// Single Note / case study — SidebarArticleNav shows that article's own
// contents here instead (§8.3), so this site-section index steps aside.
const LONGFORM_ROUTE = /^\/(blog|work)\/[^/]+\/?$/;

export function SidebarSectionNav() {
  const pathname = usePathname() ?? '';
  const sections = sectionsForRoute(pathname);
  // Hooks stay unconditional; the hook no-ops on an empty/unresolvable id list.
  const active = useActiveSection(sectionIdsForRoute(pathname) as string[]);

  // On a single article, the contents index (SidebarArticleNav) takes this slot.
  if (LONGFORM_ROUTE.test(pathname)) return null;
  // A route with no in-page sections gets no index at all — not an empty shell.
  if (sections.length === 0) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <span className="font-mono text-label tracking-label uppercase text-text-meta">
        On this page
      </span>
      <ul className="flex flex-col gap-2.5">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <Link
                href={s.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'group relative inline-flex items-center pl-3',
                  'font-mono text-meta tracking-label uppercase',
                  'transition-colors duration-fast ease-out',
                  isActive ? 'text-ink' : 'text-text-meta hover:text-ink',
                )}
              >
                {/* Quiet active marker — a 2px terracotta bar that scales in from
                    center. Decorative; aria-current carries the semantic. The
                    global reduced-motion rule snaps the scale transition. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 origin-center rounded-pill bg-terracotta',
                    'transition-transform duration-fast ease-out',
                    isActive ? 'scale-y-100' : 'scale-y-0',
                  )}
                />
                <span className="transition-transform duration-fast ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
                  {s.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
