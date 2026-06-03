import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { cn } from '@/lib/cn';
import type { Deliverable } from '@/lib/schema';

type ProjectCardProps = {
  deliverable: Deliverable;
  /** Max number of tech labels to render. Default 4. */
  maxTech?: number;
  /** Wide (featured) card — field + caption side-by-side on md+. */
  wide?: boolean;
  /** Editorial index for the corner numeral ("01", "02"…). Default 0. */
  index?: number;
  className?: string;
};

/**
 * ProjectCard — v2 bold-editorial card.
 *
 * No illustration: a golden-hour <CardField> carries an index numeral + the
 * oversized serif title (cream over the field's deep pool, AA-safe), and a clean
 * high-contrast caption below/beside holds the summary, a de-rainbowed tech line,
 * and a single CTA. Deep ink on a surface that contrasts the section background.
 *
 * Accessibility: the title is an <h3> wrapping a link whose aria-label is
 * "<title> — <role>, <year>"; a separate case-study link + demo/github links carry
 * their own labels; the field layers are aria-hidden. Focus-visible rings throughout.
 */
export function ProjectCard({
  deliverable: d,
  maxTech = 4,
  wide = false,
  index = 0,
  className,
}: ProjectCardProps) {
  const githubLink = d.links?.find((l) => l.type === 'github');
  const demoLink = d.links?.find((l) => l.type === 'demo');
  const numeral = String(index + 1).padStart(2, '0');

  return (
    <div
      className={cn(
        'work-card group relative flex flex-col overflow-hidden rounded-lg',
        // surface contrasts both section bgs (cream / warm-white) in both modes
        'bg-surface border border-line shadow-xl',
        'transition-all duration-280 ease-out hover:-translate-y-1 hover:border-pebble',
        wide && 'md:flex-row md:items-stretch',
        className,
      )}
    >
      {/* ── Golden-hour field — editorial type overlaid ──────────────── */}
      <CardField
        slug={d.id}
        className={cn(wide ? 'aspect-[4/3] md:aspect-auto md:w-[58%] md:min-h-[26rem]' : 'aspect-[4/5]')}
      >
        {/* index numeral — deep umber, reads as a watermark on the luminous sky */}
        <span
          aria-hidden="true"
          className="absolute left-6 top-5 font-serif font-light leading-none text-[#3A1C0C]/35"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}
        >
          {numeral}
        </span>

        {/* featured badge — dark glassy pill (works over the bright sky) */}
        {d.featured && (
          <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-pill border border-[#FAF8F1]/20 bg-[#2A1206]/45 px-2.5 py-1 font-mono text-meta uppercase tracking-label text-[#FAF8F1] backdrop-blur-sm">
            <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-[rgb(var(--rgb-gold))]" />
            Featured
          </span>
        )}

        {/* role · year + title, anchored over the deep bottom pool */}
        <div className="mt-auto px-6 pb-6 md:px-8 md:pb-8">
          <p className="mb-2 flex items-center gap-2 font-mono text-meta uppercase tracking-label text-[#FAF8F1]/75">
            <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-[rgb(var(--rgb-gold))]" />
            {d.role} · {d.year}
          </p>
          <h3
            className="font-serif font-light leading-[1.04] text-[#FAF8F1]"
            style={{
              letterSpacing: '-0.02em',
              fontSize: wide ? 'clamp(2.4rem, 3.4vw, 3.4rem)' : 'clamp(1.75rem, 2.4vw, 2.3rem)',
            }}
          >
            <Link
              href={`/work/${d.id}/`}
              aria-label={`${d.title} — ${d.role}, ${d.year}`}
              className="rounded-sm transition-opacity duration-fast ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF8F1]"
            >
              {d.title}
            </Link>
          </h3>
        </div>
      </CardField>

      {/* ── Caption — deep ink on surface ────────────────────────────── */}
      <div className={cn('flex flex-col gap-5 p-6 md:p-7', wide && 'md:w-[42%] md:justify-center')}>
        <p
          className="font-sans font-light text-body-sm leading-[1.6] text-charcoal text-pretty"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: wide ? 4 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {d.summary}
        </p>

        {/* tech — disciplined, monochrome (no pastel rainbow) */}
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {d.tech.slice(0, maxTech).map((t) => (
            <li key={t} className="font-mono text-meta uppercase tracking-label text-text-meta">
              {t}
            </li>
          ))}
        </ul>

        {/* CTA row */}
        <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
          <Link
            href={`/work/${d.id}/`}
            aria-label={`Read case study for ${d.title}`}
            className="inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-accent-text transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          >
            View project <span aria-hidden="true">→</span>
          </Link>
          {demoLink && (
            <a
              href={demoLink.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open live demo for ${d.title} (opens in new tab)`}
              className="ml-auto inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out hover:text-near-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
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
                'inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out hover:text-near-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
                !demoLink && 'ml-auto',
              )}
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
