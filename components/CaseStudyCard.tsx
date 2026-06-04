'use client';

import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { cn } from '@/lib/cn';
import { useSpotlight } from '@/lib/motion';

type CaseStudyCardProps = {
  title: string;
  category: 'accessmap' | 'claude-corp' | 'prompt-library' | 'pacman' | 'mutual';
  description: string;
  href: string;
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
export function CaseStudyCard({ title, category, description, href, index = 0, className }: CaseStudyCardProps) {
  const numeral = String(index + 1).padStart(2, '0');
  const spotRef = useSpotlight<HTMLAnchorElement>();

  return (
    <Link
      ref={spotRef}
      href={href}
      aria-label={`${title} — read the case study`}
      data-category={category}
      className={cn(
        'glass-card case-study-card group relative isolate flex aspect-[4/5] flex-col overflow-hidden rounded-[22px]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
        className,
      )}
    >
      <CardField slug={category} />

      <div className="relative z-10 flex flex-1 flex-col p-7 md:p-8">
        <span
          aria-hidden="true"
          className="font-serif font-light leading-none text-near-black/15"
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
          <span aria-hidden="true" className="block h-px w-12 rounded-full bg-gradient-to-r from-[rgb(var(--rgb-accent)/0.65)] via-[rgb(var(--rgb-accent)/0.3)] to-transparent" />
          <p className="font-sans font-light text-body-sm leading-[1.65] text-charcoal line-clamp-2 text-pretty">
            {description}
          </p>
          <span className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-label text-accent-text transition-transform duration-fast ease-out group-hover:translate-x-1">
            Read more <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
