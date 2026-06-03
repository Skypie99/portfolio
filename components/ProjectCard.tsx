'use client';

import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { cn } from '@/lib/cn';
import { useSpotlight } from '@/lib/motion';
import type { Deliverable } from '@/lib/schema';

const FOIL = 'linear-gradient(118deg, #9a6c1f 0%, #e9c46a 38%, #fbe6b0 52%, #c79a3e 68%, #9a6c1f 100%)';
/** Fixed deep-umber inscription shadow — guarantees AA for the ink on any stone hue. */
const INSCRIPTION = 'linear-gradient(to top, rgb(24 13 6) 16%, rgb(24 13 6 / 0.84) 46%, transparent 74%)';

type ProjectCardProps = {
  deliverable: Deliverable;
  /** Max number of tech labels to render. Default 4. */
  maxTech?: number;
  /** Wide (featured) tablet — larger slab, bigger carved title. */
  wide?: boolean;
  /** Editorial index for the foil-stamped numeral ("01", "02"…). Default 0. */
  index?: number;
  className?: string;
};

/**
 * ProjectCard — a sun-baked carved stone TABLET. The whole card is one slab
 * (CardField paints the refined stone): a foil-stamped numeral on the lit top,
 * the title INCISED into the shadowed lower stone, the inscription (role·year,
 * summary, tech, CTA) ink-pressed beneath it. A raking sun crosses on hover and
 * the carving re-lights (useSpotlight → --mx/--my/--mxn/--myn).
 *
 * A11y: the <h3> title wraps a <Link aria-label="<title> — <role>, <year>">; a
 * separate case-study link + demo/github links carry their own labels; the stone
 * layers are aria-hidden; ink/title clear AA over the deep inscription shadow.
 */
export function ProjectCard({ deliverable: d, maxTech = 4, wide = false, index = 0, className }: ProjectCardProps) {
  const githubLink = d.links?.find((l) => l.type === 'github');
  const demoLink = d.links?.find((l) => l.type === 'demo');
  const numeral = String(index + 1).padStart(2, '0');
  const spotRef = useSpotlight<HTMLDivElement>();

  return (
    <div
      ref={spotRef}
      className={cn(
        'stone-card work-card group relative isolate flex flex-col overflow-hidden rounded-[16px]',
        wide ? 'min-h-[24rem]' : 'aspect-[4/5]',
        className,
      )}
    >
      <CardField slug={d.id} />
      {/* deep inscription shadow over the lower stone (AA for ink + carved title) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%]"
        style={{ background: INSCRIPTION }}
      />

      <div className={cn('relative z-10 flex flex-1 flex-col p-7 md:p-9')}>
        {/* lit top — foil-stamped numeral + Featured seal */}
        <div className="flex items-start justify-between gap-4">
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
          {d.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-[#f6edda]/18 bg-[#1c0f06]/55 px-2.5 py-1 font-mono text-meta uppercase tracking-label text-[#f6edda]/85 backdrop-blur-sm">
              <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full" style={{ background: FOIL }} />
              Featured
            </span>
          )}
        </div>

        {/* the inscription — carved into the shadowed lower stone */}
        <div className={cn('mt-auto flex flex-col gap-4', wide && 'max-w-[640px]')}>
          <p className="flex items-center gap-2 font-mono text-meta uppercase tracking-label text-[#d6c8ae]">
            <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full" style={{ background: FOIL }} />
            {d.role} · {d.year}
          </p>
          <h3
            className="stone-carve font-serif font-light leading-[1.05]"
            style={{ fontSize: wide ? 'clamp(2.6rem, 3.7vw, 3.9rem)' : 'clamp(1.95rem, 2.7vw, 2.55rem)' }}
          >
            <Link
              href={`/work/${d.id}/`}
              aria-label={`${d.title} — ${d.role}, ${d.year}`}
              className="rounded-sm transition-opacity duration-fast ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6edda]"
            >
              {d.title}
            </Link>
          </h3>

          <span aria-hidden="true" className="block h-0.5 w-12 rounded-full" style={{ background: FOIL }} />

          <p
            className="font-sans font-light text-body-sm leading-[1.65] text-[#e7dcc6] text-pretty"
            style={{ display: '-webkit-box', WebkitLineClamp: wide ? 4 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {d.summary}
          </p>

          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {d.tech.slice(0, maxTech).map((t) => (
              <li key={t} className="font-mono text-meta uppercase tracking-label text-[#c8bba2]">
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#f6edda]/12 pt-4">
            <Link
              href={`/work/${d.id}/`}
              aria-label={`Read case study for ${d.title}`}
              className="inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-[#ecb87f] transition-all duration-fast ease-out hover:translate-x-1 hover:text-[#f5cf9a] focus-visible:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ecb87f]"
            >
              View project <span aria-hidden="true">→</span>
            </Link>
            {demoLink && (
              <a
                href={demoLink.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open live demo for ${d.title} (opens in new tab)`}
                className="ml-auto inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-[#c8bba2] transition-colors duration-fast ease-out hover:text-[#ece1c9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ecb87f]"
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
                  'inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-[#c8bba2] transition-colors duration-fast ease-out hover:text-[#ece1c9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ecb87f]',
                  !demoLink && 'ml-auto',
                )}
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
