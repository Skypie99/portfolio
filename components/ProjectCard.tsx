import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import type { Deliverable } from '@/lib/schema';

type ProjectCardProps = {
  deliverable: Deliverable;
  /**
   * Max number of tech pills to render. Default 3 — keeps the card calm and
   * the rows even. The detail page surfaces the full list.
   */
  maxTech?: number;
  /**
   * Cycle 23: wider hero ratio for the featured row-spanning card on /work.
   * Default cards use 3:2 (curated index feel); wide cards use 16:9 (more
   * cinematic for the showcase slot).
   */
  wide?: boolean;
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
  wide = false,
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
          block shows through with the title typography behind it.

          Dani §3.3 hover: border deepens to pebble, image scales 1.02
          over --dur-slow --ease-out. group-hover/group-focus-visible
          drive both from the parent <a>.work-card. */}
      <div
        className={cn(
          'relative w-full mb-6',
          // Cycle 23: 3:2 for the index reads as curated;
          // 16:9 for the featured row-spanner reads as cinematic.
          wide ? 'aspect-[16/9]' : 'aspect-[3/2]',
          'bg-blush border border-border-decorative overflow-hidden',
          'flex items-center justify-center',
          'transition-colors duration-base ease-out',
          'group-hover:border-pebble group-focus-visible:border-pebble',
        )}
      >
        {/* Explicit width/height — Alex F-C4-3. Layout space is
            already reserved by the aspect-* container; these attributes
            give the browser an intrinsic ratio hint so it never has to
            wait for the bitmap before painting. Cycle 23: matches the
            wide vs default ratio above. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={d.heroImage.src}
          alt={d.heroImage.alt}
          width={wide ? 1280 : 900}
          height={wide ? 720 : 600}
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            'transition-transform duration-slow ease-out',
            'group-hover:scale-[1.02] group-focus-visible:scale-[1.02]',
          )}
          loading="lazy"
        />
        {/* Cycle 26: elevated placeholder overlay. A tiny terracotta dot
            + DM Mono eyebrow above the Cormorant title turns the empty
            well into an intentional editorial card (instead of "image
            failed to load"). Disappears once real images replace the
            cream blocks. aria-hidden — the alt attribute carries
            semantics for screen readers. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center"
        >
          <span className="inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-umber/70">
            <span className="inline-block w-1 h-1 rounded-full bg-terracotta" />
            {d.role}
          </span>
          <span className="font-serif font-light text-[1.5rem] text-umber leading-tight">
            {d.title}
          </span>
        </div>
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

      {/* Title — h3 per Alex F-C4-2 so the heading rotor reads
          h1 (page) → h2 (section, may be sr-only) → h3 (card title).
          The visual size/weight is unchanged. */}
      <h3 className="font-serif font-normal text-[1.75rem] text-near-black leading-tight mb-2 group-hover:text-accent-text group-focus-visible:text-accent-text transition-colors duration-fast ease-out">
        {d.title}
      </h3>

      {/* Role + Year metadata */}
      <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
        {d.role} · {d.year}
      </p>

      {/* Summary */}
      <p className="font-sans font-light text-body text-charcoal leading-[1.65] mb-4 max-w-[540px]">
        {d.summary}
      </p>

      {/* Tech pills — Dani §3.8 via shared TagPill primitive. */}
      <ul className="flex flex-wrap gap-2 mb-5">
        {d.tech.slice(0, maxTech).map((t) => (
          <li key={t}>
            <TagPill>{t}</TagPill>
          </li>
        ))}
      </ul>

      {/* Explicit "View work →" CTA — makes the card's action unambiguous
          even without hover state. Inherits group-hover color from the
          parent <a>'s transition for visual consistency. */}
      <span className="inline-flex items-center gap-1 font-mono text-meta tracking-label uppercase text-accent-text transition-transform duration-fast ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1">
        View work
        <span aria-hidden="true">{'→'}</span>
      </span>
    </a>
  );
}
