import Link from 'next/link';

import { CardImage, type CardAccent } from '@/components/CardImage';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import type { Deliverable } from '@/lib/schema';

type ProjectCardProps = {
  deliverable: Deliverable;
  /**
   * Max number of tech pills to render. Default 4.
   */
  maxTech?: number;
  /**
   * Wide (featured) card — full-width span, larger mockup area, featured badge.
   */
  wide?: boolean;
  className?: string;
};

/**
 * ProjectCard — luxury editorial card with live app mockup.
 *
 * 2026-05-27 polish:
 *  - Refined hover (border + shadow elevation + 4px lift, no scale)
 *  - "Live" indicator dot when the deliverable has a demo link
 *  - Cleaner CTA row — case study primary, demo + GitHub demoted to icons
 *  - Wide cards lay out mockup + content side-by-side on md+
 *
 * Accessibility:
 *  - Card wraps title + role + summary as the accessible name via aria-label.
 *  - Mockup is aria-hidden — decorative only.
 *  - Focus-visible outline fires on the card link (2px terracotta).
 *  - Demo link opens in a new tab with rel="noopener noreferrer".
 */
export function ProjectCard({
  deliverable: d,
  maxTech = 4,
  wide = false,
  className,
}: ProjectCardProps) {
  const githubLink = d.links?.find((l) => l.type === 'github');
  const demoLink = d.links?.find((l) => l.type === 'demo');

  // Per-project signature colour — a curated teal+orange spread so the work
  // set reads as a spectrum, not five identical terracotta cards.
  const ACCENT: Record<string, { border: string; dot: string; accent: CardAccent }> = {
    'accessmap':           { border: 'border-l-terracotta', dot: 'bg-terracotta', accent: 'terracotta' },
    'claude-corp':         { border: 'border-l-lagoon',     dot: 'bg-lagoon',     accent: 'lagoon' },
    'prompt-library':      { border: 'border-l-gold',       dot: 'bg-gold',       accent: 'gold' },
    'pacman-code-trainer': { border: 'border-l-emerald',    dot: 'bg-emerald',    accent: 'emerald' },
    'mutual-mesh':         { border: 'border-l-caramel',    dot: 'bg-caramel',    accent: 'caramel' },
  };
  const a = ACCENT[d.id] ?? ACCENT['accessmap'];

  return (
    <div
      className={cn(
        'work-card group block',
        // Alex F-C4-1: focus-visible outline alongside hover/focus lift.
        // Shamus wave2: border-l-4 + border-l-terracotta = editorial left accent.
        'bg-warm-white border border-stone border-l-4 rounded-md',
        a.border,
        'shadow-lg',
        // overflow-hidden lets the image sit edge-to-edge with rounded card corners
        'overflow-hidden',
        'transition-all duration-280 ease-out',
        'hover:bg-[var(--card-bg-hover)] hover:border-[var(--card-border-hover)] hover:shadow-xl hover:-translate-y-1',
        'active:translate-y-0 active:shadow-lg',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta focus-visible:rounded-sm',
        // Wide featured card: side-by-side on md+, image fills left half.
        wide && 'md:flex md:flex-row md:items-stretch',
        className,
      )}
    >
      {/* ── Image area — framed product illustration in the shared premium
          "lit-well" material (screenshot-ready). Badges overlay the frame. ── */}
      <div className={cn('relative', wide ? 'w-full md:w-1/2 md:self-stretch' : 'w-full')}>
        <CardImage
          src={d.heroImage.src}
          alt={d.heroImage.alt}
          accent={a.accent}
          className={cn(
            wide ? 'aspect-[4/3] md:h-full md:aspect-auto' : 'aspect-[3/2] border-b border-stone',
          )}
        />
        {/* Featured badge */}
        {d.featured && (
          <span
            className={cn(
              'absolute top-4 left-4 z-10',
              'font-mono text-meta tracking-label uppercase',
              'bg-cream text-accent-text',
              'px-2.5 py-1 rounded-pill',
              'border border-sand shadow-soft',
              'inline-flex items-center gap-1.5',
            )}
          >
            <span className="inline-block w-1 h-1 rounded-full bg-terracotta" />
            Featured
          </span>
        )}
        {/* Live indicator — only when a demo link exists */}
        {demoLink && (
          <span
            className={cn(
              'absolute top-4 right-4 z-10',
              'font-mono text-meta tracking-label uppercase text-sage-text',
              'bg-cream/80 backdrop-blur-sm',
              'px-2.5 py-1 rounded-pill',
              'border border-stone/60',
              'inline-flex items-center gap-1.5',
            )}
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="hero-status-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-terracotta" />
            </span>
            Live
          </span>
        )}
      </div>

      {/* ── Content area — owns its padding since card no longer has p-6 ── */}
      <div className={cn('p-6 flex flex-col gap-3 flex-1', wide && 'md:p-8 md:justify-center')}>
        {/* Eyebrow */}
        <p className="font-mono text-meta tracking-label uppercase text-sage-text flex items-center gap-2">
          <span aria-hidden="true" className={cn('inline-block w-1 h-1 rounded-full', a.dot)} />
          {d.role} · {d.year}
        </p>

        {/* Title — navigable link is the heading */}
        <h3
          className={cn('font-serif font-normal leading-[1.1] text-near-black', wide ? 'text-step-4' : 'text-step-3')}
          style={{ letterSpacing: '-0.015em' }}
        >
          <Link
            href={`/work/${d.id}/`}
            aria-label={`${d.title} — ${d.role}, ${d.year}`}
            className={cn(
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
              'transition-colors duration-fast ease-out',
              'group-hover:text-accent-text',
            )}
          >
            {d.title}
          </Link>
        </h3>

        {/* Summary */}
        <p
          className="font-sans font-light text-body-sm text-charcoal leading-[1.65] text-pretty"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: wide ? 4 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {d.summary}
        </p>

        {/* Tech pills */}
        <ul className="flex flex-wrap gap-2 mt-1">
          {d.tech.slice(0, maxTech).map((t) => (
            <li key={t}>
              <TagPill>{t}</TagPill>
            </li>
          ))}
        </ul>

        {/* CTA row — Case study is primary (left); Live demo + GitHub are
            secondary, pushed to the right as a quiet cluster. */}
        <div className="mt-auto pt-5 flex flex-wrap items-center border-t border-stone/60">
          <Link
            href={`/work/${d.id}/`}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap',
              'font-mono text-meta tracking-label uppercase text-accent-text',
              'transition-transform duration-fast ease-out',
              'hover:translate-x-1 focus-visible:translate-x-1',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
            )}
            aria-label={`Read case study for ${d.title}`}
          >
            Case study <span aria-hidden="true">→</span>
          </Link>
          {(demoLink || githubLink) && (
            <span className="flex items-center gap-4 ml-auto">
              {demoLink && (
                <a
                  href={demoLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center gap-1.5 whitespace-nowrap',
                    'font-mono text-meta tracking-label uppercase text-sage-text',
                    'transition-colors duration-fast ease-out hover:text-charcoal',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
                  )}
                  aria-label={`Open live demo for ${d.title} (opens in new tab)`}
                >
                  Live demo <span aria-hidden="true">↗</span>
                </a>
              )}
              {githubLink && (
                <a
                  href={githubLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center gap-1.5 whitespace-nowrap',
                    'font-mono text-meta tracking-label uppercase text-sage-text',
                    'transition-colors duration-fast ease-out hover:text-charcoal',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
                  )}
                  aria-label={`View ${d.title} source on GitHub (opens in new tab)`}
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
