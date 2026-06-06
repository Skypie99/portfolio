'use client';

import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { CardProductReveal, type ProductRevealMedia } from '@/components/ProductReveal';
import { cn } from '@/lib/cn';
import { useSpotlight } from '@/lib/motion';

type CaseStudyCardProps = {
  title: string;
  category: 'accessmap' | 'claude-corp' | 'prompt-library' | 'ghost' | 'mutual';
  description: string;
  href: string;
  /** Product media for the band (Show-the-work 2026-06-04). Omit → the
   *  golden-hour placeholder; pass `{ src }` to drop in a real screenshot. */
  media?: ProductRevealMedia;
  /** Editorial index for the ghosted numeral. Default 0. */
  index?: number;
  className?: string;
};

/**
 * CaseStudyCard — a liquid-glass panel (the whole card is one link). Mirrors
 * ProjectCard's language: a ghosted serif numeral on the open top glass, then the
 * title, a fine accent rule, a one-line description and a "Read more" cue along the
 * bottom — ink tokens, AA in both modes. A cursor-follow specular glides across the
 * frosted surface (useSpotlight → --mx/--my).
 */
export function CaseStudyCard({ title, category, description, href, media, index = 0, className }: CaseStudyCardProps) {
  const numeral = String(index + 1).padStart(2, '0');
  const spotRef = useSpotlight<HTMLAnchorElement>();

  return (
    <Link
      ref={spotRef}
      href={href}
      aria-label={`${title} — read the case study`}
      data-category={category}
      className={cn(
        'glass-card case-study-card group relative isolate flex min-h-[22rem] flex-col overflow-hidden rounded-[22px]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
        className,
      )}
    >
      <CardField slug={category} />

      {/* Show-the-work 2026-06-04: cinematic product band (placeholder now). */}
      <CardProductReveal
        slug={category}
        title={title}
        media={media ?? { alt: title }}
        className="shrink-0 border-b border-[rgb(var(--rgb-ink)/0.08)]"
      />

      <div className="relative z-10 flex flex-1 flex-col p-7 md:p-8">
        <span
          aria-hidden="true"
          className="font-serif font-light leading-none tabular-nums text-near-black/30 transition-colors duration-slow ease-gh-glide group-hover:text-near-black/45"
          style={{ fontSize: 'clamp(2.6rem, 5vw, 3.6rem)', letterSpacing: '-0.02em' }}
        >
          {numeral}
        </span>

        <div className="mt-auto flex flex-col gap-4">
          <h3
            className="font-serif font-light leading-[1.05] text-near-black"
            style={{ letterSpacing: '-0.022em', fontSize: 'clamp(1.85rem, 2.6vw, 2.4rem)' }}
          >
            {title}
          </h3>
          <span aria-hidden="true" className="block h-px w-12 rounded-full bg-gradient-to-r from-[rgb(var(--rgb-accent)/0.65)] via-[rgb(var(--rgb-accent)/0.3)] to-transparent origin-left transition-transform duration-slow ease-gh-glide group-hover:scale-x-125" />
          <p className="font-sans font-light text-body-sm leading-[1.65] text-charcoal line-clamp-2 text-pretty">
            {description}
          </p>
          <span className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-label text-accent-text transition-transform duration-base ease-gh-glide group-hover:translate-x-1">
            Read more <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
