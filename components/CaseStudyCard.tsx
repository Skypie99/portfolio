'use client';

import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { CardProductReveal, type ProductRevealMedia } from '@/components/ProductReveal';
import { cn } from '@/lib/cn';
import { useSpotlight } from '@/lib/motion';
import type { Deliverable } from '@/lib/schema';

type CaseStudyCardProps = {
  title: string;
  category: 'accessmap' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost' | 'mutual';
  description: string;
  href: string;
  /** Product media for the band (Show-the-work 2026-06-04). Omit → the
   *  golden-hour placeholder; pass `{ src }` to drop in a real screenshot. */
  media?: ProductRevealMedia;
  /** The deliverable's links (L3-04): surfaces the LIVE ↗ / GITHUB ↗ quick
   *  links on the card so no proof path dead-ends — the featured card's grammar. */
  links?: Deliverable['links'];
  /** Editorial index for the ghosted numeral. Default 0. */
  index?: number;
  className?: string;
};

/**
 * CaseStudyCard — a liquid-glass panel. Mirrors ProjectCard's language: a ghosted
 * serif numeral on the open top glass, then the title, a fine accent rule, a
 * one-line description, and a footer action row — "Read more →" plus LIVE ↗ /
 * GITHUB ↗ quick links (L3-04: the featured card's grammar, so a live demo is one
 * tap from the grid, not buried inside the case study). Ink tokens, AA in both
 * modes. A cursor-follow specular glides across the frosted surface (useSpotlight
 * → --mx/--my). The card is no longer one whole link — the title and each action
 * are their own focus targets (no nested anchors).
 */
export function CaseStudyCard({ title, category, description, href, media, links, index = 0, className }: CaseStudyCardProps) {
  const numeral = String(index + 1).padStart(2, '0');
  const githubLink = links?.find((l) => l.type === 'github');
  const demoLink = links?.find((l) => l.type === 'demo');
  // L3-09 seam fix: mirrors ProjectCard — surface a proof link (type: 'other')
  // for the rare deliverable whose own repo isn't its own evidence.
  const otherLink = links?.find((l) => l.type === 'other');
  const spotRef = useSpotlight<HTMLDivElement>();

  return (
    <div
      ref={spotRef}
      data-category={category}
      className={cn(
        'glass-card case-study-card group relative isolate flex min-h-[22rem] flex-col overflow-hidden rounded-card',
        // L5-03: the md band (sidebar-narrowed ~424px column) reads as a
        // horizontal media-thumb row — the ProjectCard wide grammar applied at
        // tablet — instead of an inherited ~560px phone stack. lg untouched.
        'md:max-lg:min-h-0 md:max-lg:flex-row',
        className,
      )}
    >
      <CardField slug={category} />

      {/* Show-the-work 2026-06-04: cinematic product band (placeholder now).
          L5-03 md band: the band takes the left 2/5 and stretches to the row's
          height (aspect released) — mirrors ProjectCard's wide treatment. */}
      <CardProductReveal
        slug={category}
        title={title}
        media={media ?? { alt: title }}
        className="shrink-0 border-b border-[rgb(var(--rgb-ink)/0.08)] md:max-lg:w-2/5 md:max-lg:self-stretch md:max-lg:aspect-auto md:max-lg:border-b-0 md:max-lg:border-r"
      />

      <div className="relative z-10 flex flex-1 flex-col p-7 md:max-lg:p-8 lg:p-12">
        <span
          aria-hidden="true"
          className="font-serif font-light text-card-numeral leading-none tabular-nums text-near-black/30 origin-top-left transition duration-slow ease-gh-glide group-hover:text-near-black/45 motion-safe:group-hover:scale-[1.04]"
        >
          {numeral}
        </span>

        <div className="mt-auto flex flex-col gap-4">
          <h3 className="font-serif font-light text-card-title text-near-black">
            <Link
              href={href}
              aria-label={`${title} — read the case study`}
              className="rounded-sm transition-colors duration-fast ease-out hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
            >
              {title}
            </Link>
          </h3>
          <span aria-hidden="true" className="block h-px w-24 rounded-full bg-gradient-to-r from-[rgb(var(--rgb-accent)/0.65)] via-[rgb(var(--rgb-accent)/0.3)] to-transparent origin-left transition-transform duration-slow ease-gh-glide group-hover:scale-x-125" />
          <p className="font-sans font-light text-body-sm leading-[1.65] text-charcoal line-clamp-2 text-pretty">
            {description}
          </p>

          {/* Footer action row (L3-04) — the featured card's proven grammar:
              case-study link + LIVE ↗ / GITHUB ↗ grouped so they wrap as one
              unit on narrow cards. */}
          {/* L5-07: action links carry px/py-1 + negative margins — tap box
              grows to ~23px (the gap-y-2 wrap pitch) with zero layout shift. */}
          <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[rgb(var(--rgb-ink)/0.1)] pt-4">
            <Link
              href={href}
              /* SC 2.5.3 Label in Name: the visible words lead the accessible name. */
              aria-label={`Read more — ${title} case study`}
              className="px-1 py-1 -mx-1 -my-1 inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-accent-text transition-transform duration-base ease-gh-glide hover:translate-x-1 focus-visible:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              Read more <span aria-hidden="true">→</span>
            </Link>
            {(demoLink || githubLink || otherLink) && (
              <span className="ml-auto flex items-center gap-x-6">
                {demoLink && (
                  <a
                    href={demoLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${demoLink.label.toLowerCase()} for ${title} (opens in new tab)`}
                    className="px-1 py-1 -mx-1 -my-1 inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out hover:text-near-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                  >
                    {/* label-derived: "Live" for live products, "Demo" for
                        not-yet-live ones (e.g. Mutual Mesh) */}
                    {demoLink.label.split(' ')[0]} <span aria-hidden="true">↗</span>
                  </a>
                )}
                {githubLink && (
                  <a
                    href={githubLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${title} source on GitHub (opens in new tab)`}
                    className="px-1 py-1 -mx-1 -my-1 inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out hover:text-near-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                  >
                    {/* L3-09: label-driven text (was hardcoded "GitHub"). */}
                    {githubLink.label} <span aria-hidden="true">↗</span>
                  </a>
                )}
                {otherLink && (
                  <a
                    href={otherLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${otherLink.label} for ${title} (opens in new tab)`}
                    className="px-1 py-1 -mx-1 -my-1 inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out hover:text-near-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                  >
                    {otherLink.label} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
