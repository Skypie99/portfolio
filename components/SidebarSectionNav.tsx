'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';
import { useActiveSection } from '@/lib/motion';

/**
 * SidebarSectionNav — "On this page" scroll-spy index (view-transitions 2026-06-05).
 *
 * A quiet section index for the desktop rail. As you scroll the homepage, the
 * current section is gently emphasized (ink-weight shift + a 2px terracotta
 * marker) and exposed to assistive tech via `aria-current`. Driven by the
 * existing IntersectionObserver-based `useActiveSection` hook (no scroll-handler
 * thrash; one state update only when the active section CHANGES).
 *
 * Behavior across pages (confirmed with Sky): the block is ALWAYS rendered so the
 * rail stays consistent, but the active marker only ever lights up on the
 * homepage. Two independent guards make off-home inert:
 *   1. `onHome` (pathname === '/') gates `aria-current` + the marker, and
 *   2. `useActiveSection` itself no-ops when the section ids don't resolve
 *      (any non-'/' route) and stays ''.
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
 *   - No-JS: the <nav> + 5 links are server-rendered and navigate as plain
 *     anchors; only the live active-tracking is absent (acceptable).
 */
const SECTIONS = [
  { id: 'work', href: '/#work', label: 'The Work' },
  { id: 'process', href: '/#process', label: 'Method' },
  { id: 'about', href: '/#about', label: 'A Brief Account' },
  { id: 'certificates', href: '/#certificates', label: 'Credentials' },
  { id: 'contact', href: '/#contact', label: "Let's talk" },
] as const;

// Module-stable id list so useActiveSection doesn't re-subscribe each render.
const SECTION_IDS: string[] = SECTIONS.map((s) => s.id);

export function SidebarSectionNav() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const active = useActiveSection(SECTION_IDS); // '' off-home (hook no-ops)

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <span className="font-mono text-label tracking-label uppercase text-text-meta">
        On this page
      </span>
      <ul className="flex flex-col gap-2.5">
        {SECTIONS.map((s) => {
          const isActive = onHome && active === s.id;
          return (
            <li key={s.id}>
              <Link
                href={s.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'group relative inline-flex items-center pl-3',
                  'font-mono text-meta tracking-label uppercase',
                  'transition-colors duration-fast ease-out',
                  isActive ? 'text-near-black' : 'text-text-meta hover:text-near-black',
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
