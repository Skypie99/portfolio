import Link from 'next/link';

import { SidebarArticleNav } from '@/components/SidebarArticleNav';
import { SidebarFeatured } from '@/components/SidebarFeatured';
import { SidebarProgress } from '@/components/SidebarProgress';
import { SidebarNotesLink, SidebarWriteCta } from '@/components/SidebarRailLinks';
import { SidebarSectionNav } from '@/components/SidebarSectionNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/cn';
import { getFeaturedDeliverable, getProfile } from '@/lib/content';

/**
 * Sidebar — F-02. Persistent left rail on desktop (>=960px),
 * hidden on mobile (the hamburger overlay takes its place).
 *
 * 2026-06-10 voice pass: the rail reads like a proper brand mark, quieter.
 *  - Wordmark. The generic brand line that used to sit here ("Technology
 *    designed with accessibility in mind.") was cut in the truth pass
 *    2026-08-21: it was the most-repeated of three competing taglines and
 *    the only one that dropped the AI half of what Sky actually does. The
 *    hero positioning line carries the position now, in one place.
 *  - Featured callout preserved
 *  - Clean "Write to me." CTA pinned to the bottom — no © / location clutter
 *
 * Markup is <nav aria-label="Site navigation"> per Alex §2.1.
 */
export function Sidebar() {
  const profile = getProfile();
  const featured = getFeaturedDeliverable();

  return (
    <nav
      aria-label="Site navigation"
      // Stable hook for RailInert (homepage chrome guard) — it toggles the
      // native `inert` attribute here while the pinned desert scene fully
      // obscures the rail. No visual effect.
      data-rail=""
      className={cn(
        'relative',
        'hidden md:flex flex-col gap-16',
        'sticky top-0 self-start',
        'w-sidebar shrink-0',
        'h-screen',
        'p-12',
        'bg-rail',
        'border-r border-cool-soft/50',
        // Short-viewport steps (globals.css R4): tightens gap/py below 900px
        // viewport height + overflow-y:auto floor, so the bottom CTA always
        // renders. No effect at >=900px heights.
        'rail-nav',
      )}
    >
      {/* Reading-progress hairline on the right edge — fills as the page
          scrolls; collapses to nothing under reduced motion. */}
      <SidebarProgress />

      {/* ── Brand block ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          // B3 (Phase B, wave-1 banked question, luxe-audit wave1/REPORT.md #4):
          // this flex column's default align-items:stretch was widening the link
          // to the full 183px content column regardless of `inline-block`, so its
          // `.link-draw` underline drew ~69px past "Sky Halisky"'s own 113.7px of
          // text — measured, not assumed. self-start is the same fix already used
          // for the identical condition on Footer's LinkedIn link.
          className="link-draw inline-block self-start font-serif font-normal text-step-2 leading-none text-ink"
        >
          {profile.wordmarkText}
        </Link>
        {/* Light/dark theme toggle */}
        <ThemeToggle withLabel className="mt-2" />
      </div>

      {/* Hairline */}
      <div aria-hidden="true" className="border-t border-stone/70" />

      {/* ── Featured slot ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-label tracking-label uppercase text-text-meta">
          Featured
        </span>
        {/* IN-19 / §7.2: route-aware (aria-current + stilled arrow on-route).
            Extracted to a client leaf so the rail stays a server component and
            the featured JSON read stays on the server. */}
        <SidebarFeatured featured={featured} />
      </div>

      {/* ── On this page (scroll-spy section index) ─────────────────── */}
      {/* Home + most routes: the site-section index. A single Note / case
          study swaps in that article's own contents (§8.3); the two are
          mutually exclusive by route, so only one ever renders. */}
      <SidebarSectionNav />
      <SidebarArticleNav />

      {/* ── Notes link ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-label tracking-label uppercase text-text-meta">
          Notes
        </span>
        <SidebarNotesLink />
      </div>

      {/* ── Bottom block ───────────────────────────────────────────── */}
      <div className="mt-auto flex flex-col gap-4">
        <SidebarWriteCta />
      </div>
    </nav>
  );
}
