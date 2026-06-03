'use client';

import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { cn } from '@/lib/cn';
import { useSpotlight } from '@/lib/motion';
import type { Deliverable } from '@/lib/schema';

type ProjectCardProps = {
  deliverable: Deliverable;
  /** Max number of tech labels to render. Default 4. */
  maxTech?: number;
  /** Wide (featured) card — hero + details side-by-side on md+. */
  wide?: boolean;
  /** Editorial index for the corner numeral ("01", "02"…). Default 0. */
  index?: number;
  className?: string;
};

const FOIL = 'linear-gradient(118deg, #f6e3ad 0%, #c89b4b 48%, #f2db9f 100%)';

/**
 * ProjectCard — sleek-dark glass card (Linear/Stripe register, warm soul).
 *
 * A dark glass panel with a fine glowing gradient rim, a warm golden-hour ember
 * glow + grain (CardField), and a cursor-follow spotlight (useSpotlight). Gold-foil
 * numeral, crisp light-on-dark type, a single glowing CTA.
 *
 * A11y: the title is an <h3> wrapping a link labelled "<title> — <role>, <year>";
 * a case-study link + demo/github links carry their own labels; glow layers are
 * aria-hidden; focus-visible rings throughout.
 */
export function ProjectCard({ deliverable: d, maxTech = 4, wide = false, index = 0, className }: ProjectCardProps) {
  const githubLink = d.links?.find((l) => l.type === 'github');
  const demoLink = d.links?.find((l) => l.type === 'demo');
  const numeral = String(index + 1).padStart(2, '0');
  const spotRef = useSpotlight<HTMLDivElement>();

  const numeralEl = (
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
  );

  const featuredEl = d.featured && (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-[#FAF8F1]/15 bg-[#FAF8F1]/[0.06] px-2.5 py-1 font-mono text-meta uppercase tracking-label text-[#FAF8F1]/85 backdrop-blur-sm">
      <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full" style={{ background: FOIL }} />
      Featured
    </span>
  );

  const titleEl = (
    <>
      <p className="mb-2 flex items-center gap-2 font-mono text-meta uppercase tracking-label text-[#FAF8F1]/55">
        <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full" style={{ background: FOIL }} />
        {d.role} · {d.year}
      </p>
      <h3
        className="font-serif font-light leading-[1.05] text-[#FAF8F1]"
        style={{ letterSpacing: '-0.022em', fontSize: wide ? 'clamp(2.5rem, 3.6vw, 3.7rem)' : 'clamp(1.9rem, 2.6vw, 2.5rem)' }}
      >
        <Link
          href={`/work/${d.id}/`}
          aria-label={`${d.title} — ${d.role}, ${d.year}`}
          className="rounded-sm transition-opacity duration-fast ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF8F1]"
        >
          {d.title}
        </Link>
      </h3>
    </>
  );

  const detailsEl = (
    <>
      <span aria-hidden="true" className="block h-0.5 w-12 rounded-full" style={{ background: FOIL }} />
      <p
        className="font-sans font-light text-body-sm leading-[1.65] text-[#FAF8F1]/60 text-pretty"
        style={{ display: '-webkit-box', WebkitLineClamp: wide ? 4 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {d.summary}
      </p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {d.tech.slice(0, maxTech).map((t) => (
          <li key={t} className="font-mono text-meta uppercase tracking-label text-[#FAF8F1]/45">
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#FAF8F1]/10 pt-4">
        <Link
          href={`/work/${d.id}/`}
          aria-label={`Read case study for ${d.title}`}
          className="inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-[#E8AE78] transition-all duration-fast ease-out hover:text-[#F2C893] hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8AE78]"
        >
          View project <span aria-hidden="true">→</span>
        </Link>
        {demoLink && (
          <a
            href={demoLink.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open live demo for ${d.title} (opens in new tab)`}
            className="ml-auto inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-[#FAF8F1]/45 transition-colors duration-fast ease-out hover:text-[#FAF8F1]/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8AE78]"
          >
            Live <span aria-hidden="true">↗</span>
          </a>
        )}
        {githubLink && (
          <a
            href={githubLink.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${d.title} source on GitHub (opens in new tab)`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-[#FAF8F1]/45 transition-colors duration-fast ease-out hover:text-[#FAF8F1]/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8AE78]',
              !demoLink && 'ml-auto',
            )}
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </>
  );

  return (
    <div
      ref={spotRef}
      className={cn(
        'dark-card work-card group relative isolate flex flex-col overflow-hidden rounded-[18px]',
        wide && 'md:flex-row md:items-stretch md:min-h-[24rem]',
        className,
      )}
    >
      <CardField slug={d.id} />

      {wide ? (
        <>
          {/* hero (left) */}
          <div className="relative z-10 flex flex-col justify-between p-8 md:w-[56%] md:p-10">
            <div className="flex items-start justify-between gap-4">
              {numeralEl}
              {featuredEl}
            </div>
            <div className="mt-12 md:mt-0">{titleEl}</div>
          </div>
          {/* details (right) */}
          <div className="relative z-10 flex flex-col justify-center gap-5 border-t border-[#FAF8F1]/10 p-8 md:w-[44%] md:border-l md:border-t-0 md:p-10">
            {detailsEl}
          </div>
        </>
      ) : (
        <div className="relative z-10 flex flex-1 flex-col p-7 md:p-8">
          <div className="flex items-start justify-between gap-4">
            {numeralEl}
            {featuredEl}
          </div>
          <div className="mt-auto flex flex-col gap-5 pt-12">
            <div>{titleEl}</div>
            {detailsEl}
          </div>
        </div>
      )}
    </div>
  );
}
