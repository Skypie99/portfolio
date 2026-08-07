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
      /* UP-36 (ui-polish 2026-08-01) — INVESTIGATED, DELIBERATELY NOT CHANGED.
         The audit reads this link as "unstyled in light" and prescribes nudging
         the light cool token. Both halves were measured and both are dead ends,
         so do not re-derive them:
         (1) It is not a contrast problem. Paint-sampled on the real rail this
             link measures 6.94:1 light / 9.46:1 dark — comfortably over AA. The
             audit's two samples (66,103,93 / 145,199,201) are anti-aliased
             blends of ONE token, `cool-deep`, that flips; they are not a
             two-token parity gap.
         (2) The token nudge cannot be spent. `--rgb-cool-deep` also inks every
             TagPill, whose worst chip measures 4.89:1 — 0.39 over the floor —
             so the salience direction (lighter/more saturated) runs out almost
             immediately. And tailwind.config.ts:11 records the cool family as a
             sanctioned link colour, which is comment-wins against re-tuning it.
         What IS true, and is Sky's call rather than this phase's: the type
         recipe here is byte-identical to SidebarFeatured.tsx:60 ("OPEN IT →",
         same rail, ~30px above) which uses `text-accent-text`. Estate-wide, 48
         of 49 mono `tracking-label` micro-CTAs use the accent family; this is
         the one. It reads as a miss from the ratified sweep in 6e0f54f, which
         normalised eyebrows to accent-ink but listed only app/*.tsx. Against
         that, b4e3ff3 deliberately darkened this label to wa-teal-deep "so
         they stay AA-readable on the teal" — the token now spelled
         `text-cool-deep`, same --rgb-cool-deep triplet, renamed by UP-06/P10.
         Two recorded intents disagree, so
         the one-class change is filed as a fork, not taken here.
         Measured cost if she wants it: accent-ink on this rail = 6.11:1 light /
         8.99:1 dark, both clear. See DECISIONS §P `P7-UP-36-GRAMMAR`. */
      className="group font-mono text-meta tracking-label uppercase text-cool-deep inline-flex items-center gap-1"
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
