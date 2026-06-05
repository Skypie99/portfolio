import Link from 'next/link';

import { Button } from '@/components/Button';
import { SidebarProgress } from '@/components/SidebarProgress';
import { SidebarSectionNav } from '@/components/SidebarSectionNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/cn';
import { getFeaturedDeliverable, getProfile } from '@/lib/content';

/**
 * Sidebar — F-02. Persistent left rail on desktop (>=960px),
 * hidden on mobile (the hamburger overlay takes its place).
 *
 * 2026-05-27 polish: the rail now reads like a proper brand mark.
 *  - Wordmark + discipline subtitle ("AI engineer · accessibility")
 *  - Availability micro-status under the wordmark (pulsing dot + label)
 *  - Featured callout preserved
 *  - "© 2026" + location pinned to the bottom under the CTA
 *
 * Markup is <nav aria-label="Site navigation"> per Alex §2.1.
 */
export function Sidebar() {
  const profile = getProfile();
  const featured = getFeaturedDeliverable();
  const year = new Date().getFullYear();

  return (
    <nav
      aria-label="Site navigation"
      className={cn(
        'relative',
        'hidden md:flex flex-col gap-10',
        'sticky top-0 self-start',
        'w-sidebar shrink-0',
        'h-screen',
        'p-8',
        'bg-rail',
        'border-r border-wa-teal-soft/50',
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
        <p className="font-mono text-meta tracking-label uppercase text-text-meta leading-snug">
          AI engineer · Accessibility
        </p>
        {/* Availability micro-status */}
        <p className="font-mono text-meta tracking-label uppercase text-wa-teal-deep inline-flex items-center gap-2 mt-2">
          <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5">
            <span className="hero-status-ping absolute inline-flex h-full w-full rounded-full bg-wa-teal opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-wa-teal" />
          </span>
          Available for work
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
        {featured ? (
          <Link
            href={`/work/${featured.id}/`}
            aria-label={`Featured deliverable: ${featured.title} — ${featured.role}`}
            className="group flex flex-col gap-1.5 text-near-black transition-colors duration-fast ease-out"
          >
            <span className="link-draw inline-block font-serif font-normal text-step-2 leading-tight">
              {featured.title}
            </span>
            <span className="font-sans text-body-sm text-charcoal">
              {featured.role}
            </span>
            <span className="font-mono text-meta tracking-label uppercase text-accent-text mt-1 inline-flex items-center gap-1 transition-transform duration-fast ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1">
              Open it
              <span aria-hidden="true">{'→'}</span>
            </span>
          </Link>
        ) : (
          <Link
            href="/work/"
            className="link-draw inline-block font-serif font-normal text-display-s text-near-black"
          >
            Latest work {'→'}
          </Link>
        )}
      </div>

      {/* ── On this page (scroll-spy section index) ─────────────────── */}
      <SidebarSectionNav />

      {/* ── Blog link ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-label tracking-label uppercase text-text-meta">
          Dispatches
        </span>
        <Link
          href="/blog/"
          className="group font-mono text-meta tracking-label uppercase text-wa-teal-deep inline-flex items-center gap-1"
        >
          <span className="group-hover:translate-x-1 group-focus-visible:translate-x-1 transition-transform duration-fast ease-out inline-flex items-center gap-1">
            Read dispatches
            <span aria-hidden="true">{'→'}</span>
          </span>
        </Link>
      </div>

      {/* ── Bottom block ───────────────────────────────────────────── */}
      <div className="mt-auto flex flex-col gap-4">
        <Button href="/contact/" fullWidth>
          Write to me.
        </Button>
        <div className="flex items-center justify-between font-mono text-meta tracking-label uppercase text-text-meta">
          <span>{'©'} {year}</span>
          <span>{profile.location}</span>
        </div>
      </div>
    </nav>
  );
}
