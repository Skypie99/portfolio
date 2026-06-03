import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { cn } from '@/lib/cn';

type CaseStudyCardProps = {
  title: string;
  category: 'accessmap' | 'claude-corp' | 'prompt-library' | 'pacman' | 'mutual';
  description: string;
  href: string;
  /** Editorial index for the corner numeral. Default 0. */
  index?: number;
  className?: string;
};

/**
 * CaseStudyCard — v2 bold-editorial card (the whole card is one link).
 *
 * A golden-hour <CardField> with an index numeral + the oversized serif title
 * (cream over the deep pool), then a clean caption with the one-line description
 * and a quiet "Read more" cue. Matches ProjectCard's language so the grid + the
 * featured card read as one family. No illustration.
 */
export function CaseStudyCard({ title, category, description, href, index = 0, className }: CaseStudyCardProps) {
  const numeral = String(index + 1).padStart(2, '0');

  return (
    <Link
      href={href}
      aria-label={`${title} — read the case study`}
      data-category={category}
      className={cn(
        'case-study-card group relative block overflow-hidden rounded-lg',
        'bg-surface border border-[rgb(var(--rgb-accent)/0.18)] shadow-xl',
        'transition-all duration-280 ease-out hover:-translate-y-1 hover:border-[rgb(var(--rgb-accent)/0.38)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
        className,
      )}
    >
      <CardField slug={category} className="aspect-[4/5]">
        <span
          aria-hidden="true"
          className="absolute left-6 top-5 font-serif font-light leading-none text-[#3A1C0C]/35"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}
        >
          {numeral}
        </span>
        <div className="mt-auto px-6 pb-6">
          <h3
            className="font-serif font-light leading-[1.04] text-[#FAF8F1]"
            style={{ letterSpacing: '-0.022em', fontSize: 'clamp(1.95rem, 2.7vw, 2.55rem)' }}
          >
            {title}
          </h3>
        </div>
      </CardField>

      <div className="flex flex-col gap-5 p-7">
        <span aria-hidden="true" className="block h-px w-10 bg-[rgb(var(--rgb-accent)/0.55)]" />
        <p className="font-sans font-light text-body-sm leading-[1.65] text-charcoal line-clamp-2 text-pretty">
          {description}
        </p>
        <span className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-label text-accent-text transition-transform duration-fast ease-out group-hover:translate-x-1">
          Read more <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
