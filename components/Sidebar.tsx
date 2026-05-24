import Link from 'next/link';

import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';
import { getFeaturedDeliverable, getProfile } from '@/lib/content';

/**
 * Sidebar — F-02. Persistent left rail on desktop (>=960px),
 * hidden on mobile (the hamburger overlay takes its place).
 *
 * Markup is <nav aria-label="Site navigation"> per Alex §2.1
 * (the sidebar's purpose is navigation, not "tangentially related" content).
 */
export function Sidebar() {
  const profile = getProfile();
  const featured = getFeaturedDeliverable();

  return (
    <nav
      aria-label="Site navigation"
      className={cn(
        'hidden md:flex flex-col gap-12',
        'sticky top-0 self-start',
        'w-sidebar shrink-0',
        'h-screen',
        'p-8',
        'bg-cream',
        'border-r border-border-decorative',
      )}
    >
      {/* Wordmark — Cycle 18: link-draw underline matches the editorial
          hover treatment used in the footer email + detail Links list.
          inline-block so the gradient-backed underline tracks the text width. */}
      <Link
        href="/"
        className="link-draw inline-block font-serif font-normal text-display-s text-near-black"
      >
        {profile.wordmarkText}
      </Link>

      {/* Featured slot — falls back to "Latest Work" when no featured deliverable.
          Featured link points at the deliverable's detail page (Peter perf nit:
          the previous "/" was a dead link disguised as a CTA). */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-label tracking-label uppercase text-text-meta">
          Featured
        </span>
        {featured ? (
          <Link
            href={`/work/${featured.id}/`}
            aria-label={`Featured deliverable: ${featured.title} — ${featured.role}`}
            className="group flex flex-col gap-2 text-near-black transition-colors duration-fast ease-out"
          >
            {/* Cycle 18: only the title gets the link-draw underline so the
                multi-line block (role label, View work arrow) doesn't get a
                visually broken underline across line breaks. */}
            <span className="link-draw inline-block font-serif font-normal text-display-s leading-tight">
              {featured.title}
            </span>
            <span className="font-sans text-body-sm text-charcoal">
              {featured.role}
            </span>
            <span className="font-mono text-meta tracking-label uppercase text-accent-text mt-1 inline-flex items-center gap-1 transition-transform duration-fast ease-out group-hover:translate-x-1">
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

      <div className="mt-auto">
        <Button href={`mailto:${profile.contactEmail}`} fullWidth>
          Get in touch
        </Button>
      </div>
    </nav>
  );
}
