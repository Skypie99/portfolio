import Link from 'next/link';

import { Button } from '@/components/Button';
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
        'hidden md:flex flex-col gap-10',
        'sticky top-0 self-start',
        'w-sidebar shrink-0',
        'h-screen',
        'p-8',
        'bg-cream',
        'border-r border-border-decorative',
      )}
    >
      {/* ── Brand block ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="link-draw inline-block font-serif font-normal text-[1.375rem] leading-none text-near-black"
        >
          {profile.wordmarkText}
        </Link>
        <p className="font-mono text-meta tracking-label uppercase text-text-meta leading-snug">
          AI engineer · Accessibility
        </p>
        {/* Availability micro-status */}
        <p className="font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-2 mt-2">
          <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5">
            <span className="hero-status-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-terracotta" />
          </span>
          Available for work
        </p>
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
            <span className="link-draw inline-block font-serif font-normal text-[1.375rem] leading-tight">
              {featured.title}
            </span>
            <span className="font-sans text-body-sm text-charcoal">
              {featured.role}
            </span>
            <span className="font-mono text-meta tracking-label uppercase text-accent-text mt-1 inline-flex items-center gap-1 transition-transform duration-fast ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1">
              View work
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

      {/* ── Bottom block ───────────────────────────────────────────── */}
      <div className="mt-auto flex flex-col gap-4">
        <Button href={`mailto:${profile.contactEmail}`} fullWidth>
          Get in touch
        </Button>
        <div className="flex items-center justify-between font-mono text-meta tracking-label uppercase text-text-meta">
          <span>{'©'} {year}</span>
          <span>{profile.location}</span>
        </div>
      </div>
    </nav>
  );
}
