import { AppMockup } from '@/components/AppMockup';
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

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-blush border border-stone rounded-lg overflow-hidden',
        'transition-[transform,box-shadow,border-color] duration-base ease-out',
        'hover:-translate-y-1 hover:shadow-soft hover:border-pebble',
        'focus-within:border-pebble',
        wide ? 'md:flex-row md:min-h-[420px]' : 'min-h-[520px]',
        className,
      )}
    >
      {/* ── Mockup area ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex items-center justify-center',
          'bg-gradient-to-br from-warm-white via-blush to-peach-cream/60',
          wide ? 'md:w-1/2 py-12 px-8' : 'py-8 px-6',
        )}
        aria-hidden="true"
      >
        {/* Featured badge */}
        {d.featured && (
          <span
            className={cn(
              'absolute top-4 left-4',
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
              'absolute top-4 right-4',
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
        <AppMockup
          slug={d.id as 'accessmap' | 'claude-corp' | 'prompt-library' | 'mutual-mesh'}
          className={wide ? 'scale-110' : ''}
        />
      </div>

      {/* ── Content area ────────────────────────────────────────────── */}
      <div className={cn('p-6 md:p-8 flex flex-col gap-3 flex-1', wide && 'md:w-1/2 md:justify-center')}>
        {/* Eyebrow */}
        <p className="font-mono text-meta tracking-label uppercase text-sage-text flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-1 rounded-full bg-stone-strong" />
          {d.role} · {d.year}
        </p>

        {/* Title — navigable link is the heading */}
        <h3
          className="font-serif font-normal leading-[1.1] text-near-black"
          style={{ fontSize: wide ? '2.25rem' : '1.75rem', letterSpacing: '-0.015em' }}
        >
          <a
            href={`/work/${d.id}/`}
            aria-label={`${d.title} — ${d.role}, ${d.year}`}
            className={cn(
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
              'transition-colors duration-fast ease-out',
              'group-hover:text-accent-text',
            )}
          >
            {d.title}
          </a>
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

        {/* CTA row */}
        <div className="mt-auto pt-5 flex items-center gap-5 border-t border-stone/60">
          <a
            href={`/work/${d.id}/`}
            className={cn(
              'inline-flex items-center gap-1.5',
              'font-mono text-meta tracking-label uppercase text-accent-text',
              'transition-transform duration-fast ease-out',
              'hover:translate-x-1 focus-visible:translate-x-1',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
            )}
            aria-label={`Read case study for ${d.title}`}
          >
            Case study <span aria-hidden="true">→</span>
          </a>
          <span aria-hidden="true" className="text-stone">·</span>
          {demoLink && (
            <a
              href={demoLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1.5',
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
                'inline-flex items-center gap-1.5',
                'font-mono text-meta tracking-label uppercase text-sage-text',
                'transition-colors duration-fast ease-out hover:text-charcoal',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
              )}
              aria-label={`View ${d.title} source on GitHub (opens in new tab)`}
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
