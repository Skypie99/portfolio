'use client';

import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { cn } from '@/lib/cn';
import { useSpotlight } from '@/lib/motion';

const FOIL = 'linear-gradient(118deg, #9a6c1f 0%, #e9c46a 38%, #fbe6b0 52%, #c79a3e 68%, #9a6c1f 100%)';
const INSCRIPTION = 'linear-gradient(to top, rgb(24 13 6) 16%, rgb(24 13 6 / 0.84) 46%, transparent 74%)';

type CaseStudyCardProps = {
  title: string;
  category: 'accessmap' | 'claude-corp' | 'prompt-library' | 'pacman' | 'mutual';
  description: string;
  href: string;
  /** Editorial index for the foil-stamped numeral. Default 0. */
  index?: number;
  className?: string;
};

/**
 * CaseStudyCard — a sun-baked carved stone tablet (the whole card is one link).
 * Matches ProjectCard: a foil-stamped numeral on the lit top, the title incised
 * into the shadowed lower stone, a one-line inscription, a "Read more" cue. A
 * raking sun crosses on hover (useSpotlight) and the carving re-lights.
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
        'stone-card case-study-card group relative isolate flex aspect-[4/5] flex-col overflow-hidden rounded-[16px]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ecb87f]',
        className,
      )}
    >
      <CardField slug={category} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%]"
        style={{ background: INSCRIPTION }}
      />

      <div className="relative z-10 flex flex-1 flex-col p-7 md:p-8">
        <span
          aria-hidden="true"
          className="stone-numeral font-serif font-light leading-none"
          style={{
            fontSize: 'clamp(2.4rem, 4.6vw, 3.6rem)',
            backgroundImage: FOIL,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          {numeral}
        </span>

        <div className="mt-auto flex flex-col gap-4">
          <h3
            className="stone-carve font-serif font-light leading-[1.05]"
            style={{ fontSize: 'clamp(1.95rem, 2.7vw, 2.55rem)' }}
          >
            {title}
          </h3>
          <span aria-hidden="true" className="block h-0.5 w-12 rounded-full" style={{ background: FOIL }} />
          <p className="font-sans font-light text-body-sm leading-[1.65] text-[#e7dcc6] line-clamp-2 text-pretty">
            {description}
          </p>
          <span className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-label text-[#ecb87f] transition-transform duration-fast ease-out group-hover:translate-x-1">
            Read more <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
