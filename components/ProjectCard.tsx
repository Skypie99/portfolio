'use client';

import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { CardProductReveal } from '@/components/ProductReveal';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { cardMedia } from '@/lib/media';
import { useSpotlight } from '@/lib/motion';
import type { Deliverable } from '@/lib/schema';

type ProjectCardProps = {
  deliverable: Deliverable;
  /** Max number of tech labels to render. Default 4. */
  maxTech?: number;
  /** Wide (featured) panel — the inscription splits into two columns on md+. */
  wide?: boolean;
  /** Editorial index for the ghosted numeral ("01", "02"…). Default 0. */
  index?: number;
  className?: string;
};

/**
 * ProjectCard — a liquid-glass panel (liquid-glass 2026-06-03). Minimal, light,
 * expensive: a translucent frosted card floating over the warm page with a bright
 * refractive rim + a cursor-follow specular (.glass-card). A ghosted serif numeral
 * and an optional Featured seal sit on the open top glass; the inscription
 * (role·year, title, summary, tech, CTA) is set in the site's flipping ink tokens
 * along the bottom — crisp and AA in both light + dark.
 *
 * A11y: the <h3> wraps a <Link aria-label="<title> — <role>, <year>">; the
 * case-study + demo/github links carry their own labels; the glass/caustic layers
 * are aria-hidden. Focus-visible rings throughout.
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
        'glass-card work-card group relative isolate flex flex-col overflow-hidden rounded-[22px]',
        wide ? 'md:flex-row min-h-[22rem]' : 'min-h-[22rem]',
        className,
      )}
    >
      <CardField slug={d.id} featured={d.featured} />

      {/* Show-the-work 2026-06-04: a cinematic product band crowns the card.
          Placeholder now (golden-hour world); a real screenshot drops in via
          d.heroShot — see SHOW_WORK_PLAN.md. Decorative — the inscription below
          carries the title/links, so all text stays on glass (AA preserved). */}
      <CardProductReveal
        slug={d.id}
        title={d.title}
        media={cardMedia(d)}
        className={cn(
          'shrink-0 border-b border-[rgb(var(--rgb-ink)/0.08)]',
          // Lead card: a horizontal banner — the image takes the left half and
          // stretches to the card's height; mobile keeps the stacked 16:10 band.
          wide && 'md:w-1/2 md:self-stretch md:aspect-auto md:border-b-0 md:border-r',
        )}
      />

      <div className="relative z-10 flex flex-1 flex-col p-7 md:p-9">
        {/* open top glass — ghosted numeral + Featured seal */}
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className="font-serif font-light leading-none text-near-black/15 transition-colors duration-slow ease-gh-glide group-hover:text-near-black/25"
            style={{ fontSize: 'clamp(2.6rem, 5vw, 3.6rem)', letterSpacing: '-0.02em' }}
          >
            {numeral}
          </span>
          {d.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-[rgb(var(--rgb-ink)/0.12)] bg-[rgb(var(--rgb-surface)/0.55)] px-2.5 py-1 font-mono text-meta uppercase tracking-label text-accent-text backdrop-blur-md">
              <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-terracotta" />
              Featured
            </span>
          )}
        </div>

        {/* the inscription — bottom-anchored (lead + normal cards share this) */}
        <div className="mt-auto flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-2 font-mono text-meta uppercase tracking-label text-text-meta">
              <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-terracotta" />
              {d.role} · {d.year}
            </p>
            <h3
              className="font-serif font-light leading-[1.05] text-near-black"
              style={{
                letterSpacing: '-0.022em',
                fontSize: 'clamp(1.85rem, 2.6vw, 2.4rem)',
              }}
            >
              <Link
                href={`/work/${d.id}/`}
                aria-label={`${d.title} — ${d.role}, ${d.year}`}
                className="rounded-sm transition-colors duration-fast ease-out hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
              >
                {d.title}
              </Link>
            </h3>
            <span aria-hidden="true" className="block h-px w-12 rounded-full bg-gradient-to-r from-[rgb(var(--rgb-accent)/0.65)] via-[rgb(var(--rgb-accent)/0.3)] to-transparent origin-left transition-transform duration-slow ease-gh-glide group-hover:scale-x-125" />
          </div>

          <div className="flex flex-col gap-5">
            <p
              className="font-sans font-light text-body-sm leading-[1.65] text-charcoal text-pretty"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {d.summary}
            </p>

            <ul className="flex flex-wrap gap-2">
              {d.tech.slice(0, maxTech).map((t) => (
                <li key={t}>
                  <TagPill>{t}</TagPill>
                </li>
              ))}
            </ul>

            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[rgb(var(--rgb-ink)/0.1)] pt-4">
              <Link
                href={`/work/${d.id}/`}
                aria-label={`Read case study for ${d.title}`}
                className="inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-accent-text transition-transform duration-base ease-gh-glide hover:translate-x-1 focus-visible:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
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
      </div>
    </div>
  );
}
