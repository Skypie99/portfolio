import { cn } from '@/lib/cn';
import type { Deliverable } from '@/lib/schema';

type ProjectCardProps = {
  deliverable: Deliverable;
  /**
   * Max number of tech pills to render. Default 3 — keeps the card calm and
   * the rows even. The detail page surfaces the full list.
   */
  maxTech?: number;
  className?: string;
};

/**
 * ProjectCard — single deliverable as an editorial card.
 *
 * Reused on /work (F-04) and anywhere else a deliverable surfaces visually
 * (e.g. the "What I'm working on" block on /about). Extracted from the
 * previous inline /work markup so the two pages share one source of truth
 * and the hover/focus rules stay in lockstep.
 *
 * Born accessible:
 *  - Whole card is a single <a> with an `aria-label` summarising destination
 *    per Alex §4.4 (link text meaningful out of context).
 *  - Hover lift (`.work-card`) mirrors :focus-visible per Alex §6.2 so
 *    keyboard users get the same affordance as mouse users.
 *  - Image carries the deliverable's alt text exactly (Alex §4.1); the
 *    cream-tinted fallback block uses the title as decorative typography
 *    (`aria-hidden`) so the alt is the sole accessible name.
 *
 * Server-friendly: no client state, no client effects. Renders identically
 * on /work (Server Component) and any future page that imports it.
 */
export function ProjectCard({
  deliverable: d,
  maxTech = 3,
  className,
}: ProjectCardProps) {
  return (
    <a
      href={`/work/${d.id}/`}
      className={cn(
        'work-card group block',
        // Alex F-C4-1 fix: removed `focus:outline-none` so the global
        // 2px Terracotta `:focus-visible` outline fires alongside the
        // hover/focus lift. WCAG 2.4.13 needs a real focus affordance,
        // not motion alone.
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
        className,
      )}
      aria-label={`${d.title} — ${d.role}, ${d.year}`}
    >
      {/* Hero image / placeholder block. The <img> sits above an
          aria-hidden decorative title; if the image 404s, the cream
          block shows through with the title typography behind it. */}
      <div
        className={cn(
          'relative w-full aspect-[4/3] mb-6',
          'bg-blush border border-border-decorative overflow-hidden',
          'flex items-center justify-center',
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={d.heroImage.src}
          alt={d.heroImage.alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <span
          aria-hidden="true"
          className="font-serif font-light text-[1.5rem] text-umber px-4 text-center"
        >
          {d.title}
        </span>
      </div>

      {/* Featured tag */}
      {d.featured && (
        <p className="font-mono text-meta tracking-label uppercase text-accent-text mb-2 inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block w-2 h-2 rounded-full bg-terracotta"
          />
          Featured
        </p>
      )}

      {/* Title */}
      <h2 className="font-serif font-normal text-[1.75rem] text-near-black leading-tight mb-2 group-hover:text-accent-text transition-colors duration-fast ease-out">
        {d.title}
      </h2>

      {/* Role + Year metadata */}
      <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
        {d.role} · {d.year}
      </p>

      {/* Summary */}
      <p className="font-sans font-light text-body text-charcoal leading-[1.65] mb-4 max-w-[540px]">
        {d.summary}
      </p>

      {/* Tech pills */}
      <ul className="flex flex-wrap gap-2">
        {d.tech.slice(0, maxTech).map((t) => (
          <li
            key={t}
            className="inline-flex items-center px-3 py-1 rounded-pill bg-sand text-umber font-mono text-meta tracking-label uppercase"
          >
            {t}
          </li>
        ))}
      </ul>
    </a>
  );
}
