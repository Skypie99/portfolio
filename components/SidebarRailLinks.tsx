'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

/**
 * C-68 — the rail's two remaining self-linking doors, made route-aware.
 *
 * The server Sidebar can't call usePathname(); these client leaves mirror
 * SidebarFeatured's IN-19 / §7.2 contract: when the visitor is already ON the
 * link's destination we mark `aria-current="page"` and WITHDRAW the invitation
 * (the arrow stops nudging / the CTA stops lifting) — geometry unchanged, only
 * the hover/focus gesture is dropped. So a room "knows you walked through it."
 * usePathname() is trailingSlash-true and basePath-stripped, so `/blog/` and
 * `/contact/` compare directly.
 */

export function SidebarNotesLink() {
  const onRoute = usePathname() === '/blog/';
  return (
    <Link
      href="/blog/"
      aria-current={onRoute ? 'page' : undefined}
      /* B2 (Phase B, resolves UP-36 / DECISIONS §P `P7-UP-36-GRAMMAR`): Sky
         ratified joining the accent family, 2026-08-25. Not a contrast fix —
         the prior `text-cool-deep` already measured 6.94:1 light / 9.46:1 dark
         — this closes the estate-wide grammar miss instead: 48 of 49 mono
         `tracking-label` micro-CTAs use the accent family, including this
         link's own rail-mate 30px above (SidebarFeatured.tsx:60, "OPEN IT →").
         Measured before shipping: accent-ink on this rail = 6.11:1 light /
         8.99:1 dark, both clear of AA. */
      className="group font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-1"
    >
      <span
        className={cn(
          'transition-transform duration-fast ease-out inline-flex items-center gap-1',
          // §7.2: stilled on its own destination — the nudge is the invitation.
          !onRoute && 'group-hover:translate-x-1 group-focus-visible:translate-x-1',
        )}
      >
        Read the notes
        <span aria-hidden="true">{'→'}</span>
      </span>
    </Link>
  );
}

export function SidebarWriteCta() {
  const onRoute = usePathname() === '/contact/';
  return (
    <Button
      href="/contact/"
      fullWidth
      aria-current={onRoute ? 'page' : undefined}
      // On /contact/ the pinned CTA self-links (and echoes the H1); withdraw its
      // lift/shadow invitation while keeping it a real, operable link. Geometry
      // is unchanged — only the hover response is stilled.
      className={onRoute ? 'hover:translate-y-0 hover:shadow-none' : undefined}
    >
      Write to me.
    </Button>
  );
}
