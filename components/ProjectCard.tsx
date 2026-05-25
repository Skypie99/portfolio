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
 * Replaces the hero image placeholder with a pure CSS/SVG AppMockup
 * component that previews each project's actual UI. No external images.
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
        'transition-all duration-base ease-out',
        'hover:-translate-y-1 hover:shadow-soft hover:border-pebble',
        'focus-within:border-pebble',
        'min-h-[520px]',
        className,
      )}
    >
      {/* ── Mockup area (top ~55% of card) ──────────────────────────── */}
      <div
        className={cn(
          'relative flex items-center justify-center',
          'bg-gradient-to-b from-warm-white to-blush',
          wide ? 'py-10 px-8' : 'py-8 px-6',
        )}
        aria-hidden="true"
      >
        {/* Featured badge */}
        {d.featured && (
          <span
            className={cn(
              'absolute top-3 left-4',
              'font-mono text-meta tracking-label uppercase',
              'bg-peach-cream text-accent-text',
              'px-2.5 py-0.5 rounded-pill',
              'border border-sand',
            )}
          >
            Featured
          </span>
        )}
        <AppMockup
          slug={d.id as 'accessmap' | 'claude-corp' | 'prompt-library' | 'mutual-mesh'}
          className={wide ? 'scale-110' : ''}
        />
      </div>

      {/* ── Content area (bottom ~45% of card) ──────────────────────── */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        {/* Eyebrow */}
        <p className="font-mono text-meta tracking-label uppercase text-sage-text">
          {d.role} · {d.year}
        </p>

        {/* Title — navigable link is the heading */}
        <h3 className="font-serif font-normal leading-tight text-near-black" style={{ fontSize: '1.75rem' }}>
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
          className="font-sans font-light text-body-sm text-charcoal leading-relaxed"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
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
        <div className="mt-auto flex items-center gap-4 pt-2">
          <a
            href={`/work/${d.id}/`}
            className={cn(
              'inline-flex items-center gap-1',
              'font-mono text-meta tracking-label uppercase text-accent-text',
              'transition-transform duration-fast ease-out',
              'hover:translate-x-1 focus-visible:translate-x-1',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
            )}
            aria-label={`Read case study for ${d.title}`}
          >
            View case study <span aria-hidden="true">→</span>
          </a>
          {demoLink && (
            <a
              href={demoLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1',
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
                'inline-flex items-center gap-1',
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

