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
  /** Editorial index for the corner numeral. Default 0. */
  index?: number;
  className?: string;
};

const FOIL = 'linear-gradient(118deg, #f6e3ad 0%, #c89b4b 48%, #f2db9f 100%)';

/**
 * CaseStudyCard — sleek-dark glass card (the whole card is one link). Matches
 * ProjectCard's register: dark glass + glowing rim, a warm ember glow + grain,
 * cursor spotlight, gold-foil numeral, crisp light-on-dark type.
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
        'dark-card case-study-card group relative isolate flex flex-col overflow-hidden rounded-[18px]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8AE78]',
        className,
      )}
    >
      <CardField slug={category} />

      <div className="relative z-10 flex flex-1 flex-col p-7 md:p-8">
        <span
          aria-hidden="true"
          className="font-serif font-light leading-none"
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

        <div className="mt-auto flex flex-col gap-4 pt-12">
          <h3
            className="font-serif font-light leading-[1.05] text-[#FAF8F1]"
            style={{ letterSpacing: '-0.022em', fontSize: 'clamp(1.9rem, 2.6vw, 2.5rem)' }}
          >
            {title}
          </h3>
          <span aria-hidden="true" className="block h-0.5 w-12 rounded-full" style={{ background: FOIL }} />
          <p className="font-sans font-light text-body-sm leading-[1.65] text-[#FAF8F1]/60 line-clamp-2 text-pretty">
            {description}
          </p>
          <span className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-label text-[#E8AE78] transition-transform duration-fast ease-out group-hover:translate-x-1">
            Read more <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
