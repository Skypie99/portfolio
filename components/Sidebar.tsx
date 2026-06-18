import Link from 'next/link';

import { Button } from '@/components/Button';
import { SidebarArticleNav } from '@/components/SidebarArticleNav';
import { SidebarFeatured } from '@/components/SidebarFeatured';
import { SidebarProgress } from '@/components/SidebarProgress';
import { SidebarSectionNav } from '@/components/SidebarSectionNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/cn';
import { getFeaturedDeliverable, getProfile } from '@/lib/content';

/**
 * Sidebar — F-02. Persistent left rail on desktop (>=960px),
 * hidden on mobile (the hamburger overlay takes its place).
 *
 * 2026-06-10 voice pass: the rail reads like a proper brand mark, quieter.
 *  - Wordmark + brand line ("Technology designed with accessibility in mind.")
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
        'border-r border-wa-teal-soft/50',
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
          className="link-draw inline-block font-serif font-normal text-step-2 leading-none text-near-black"
        >
          {profile.wordmarkText}
        </Link>
        <p className="font-mono text-meta tracking-label uppercase text-text-meta leading-snug text-balance">
          Technology designed with accessibility in mind.
        </p>
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
        <Link
          href="/blog/"
          className="group font-mono text-meta tracking-label uppercase text-wa-teal-deep inline-flex items-center gap-1"
        >
          <span className="group-hover:translate-x-1 group-focus-visible:translate-x-1 transition-transform duration-fast ease-out inline-flex items-center gap-1">
            Read the notes
            <span aria-hidden="true">{'→'}</span>
          </span>
        </Link>
      </div>

      {/* ── Bottom block ───────────────────────────────────────────── */}
      <div className="mt-auto flex flex-col gap-4">
        <Button href="/contact/" fullWidth>
          Write to me.
        </Button>
      </div>
    </nav>
  );
}
