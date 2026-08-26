'use client';

import Link from 'next/link';

import { CardField } from '@/components/CardField';
import { CardProductReveal, type ProductRevealMedia } from '@/components/ProductReveal';
import { cn } from '@/lib/cn';
import { useSpotlight } from '@/lib/motion';
import type { Deliverable } from '@/lib/schema';
import { frameForSlug } from '@/lib/signature';

type CaseStudyCardProps = {
  title: string;
  category: 'flagstone' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost';
  description: string;
  href: string;
  /** THE ROOM/Phase E (E2) — the deliverable's own protected status string,
   *  rendered exactly as ProjectCard renders `d.status`: un-uppercased,
   *  same classes, no reword. Omit to render nothing (existing callers that
   *  don't pass it are unaffected). */
  status?: string;
  /** THE ROOM/Phase E (E2) — ISO date the live link was last confirmed to
   *  resolve (an HTTP check; see DeliverableSchema.verifiedDate). Renders
   *  only when `status` is also present. */
  verifiedDate?: string;
  /** Product media for the band (Show-the-work 2026-06-04). Omit → the
   *  golden-hour placeholder; pass `{ src }` to drop in a real screenshot. */
  media?: ProductRevealMedia;
  /** The deliverable's links (L3-04): surfaces the LIVE ↗ / GITHUB ↗ quick
   *  links on the card so no proof path dead-ends — the featured card's grammar. */
  links?: Deliverable['links'];
  /** Editorial index for the ghosted numeral. Default 0. */
  index?: number;
  /** The gallery wall (R4/BP9 · P03): every work full-width — the md-band
   *  anatomy generalized to lg+. Well ratio picked per frame (the shipped
   *  anatomies): portrait phone frames take 2/5, window/plate take 1/2 —
   *  portrait media never force-cropped. */
  wide?: boolean;
  /** Which side the media well hangs on at lg (the wall's alternation). */
  mediaSide?: 'left' | 'right';
  className?: string;
};

/**
 * CaseStudyCard — a liquid-glass panel. Mirrors ProjectCard's language: a ghosted
 * serif numeral on the open top glass, then the title, a fine accent rule, a
 * one-line description, and a footer action row — "Read more →" plus LIVE ↗ /
 * GITHUB ↗ quick links (L3-04: the featured card's grammar, so a live demo is one
 * tap from the grid, not buried inside the case study). Ink tokens, AA in both
 * modes. A cursor-follow specular glides across the frosted surface (useSpotlight
 * → --mx/--my). The card is no longer one whole link — the title and each action
 * are their own focus targets (no nested anchors).
 */
export function CaseStudyCard({ title, category, description, href, status, verifiedDate, media, links, index = 0, wide = false, mediaSide = 'left', className }: CaseStudyCardProps) {
  const numeral = String(index + 1).padStart(2, '0');
  const githubLink = links?.find((l) => l.type === 'github');
  const demoLink = links?.find((l) => l.type === 'demo');
  const spotRef = useSpotlight<HTMLDivElement>();
  // The wall's well ratio per frame (R4/BP9): portrait phone frames 2/5,
  // window/plate 1/2 — the two shipped anatomies, picked per work.
  const wellClass = frameForSlug(category) === 'phone' ? 'lg:w-2/5' : 'lg:w-1/2';

  return (
    <div
      ref={spotRef}
      data-category={category}
      className={cn(
        'glass-card case-study-card group relative isolate flex min-h-[22rem] flex-col overflow-hidden rounded-card',
        // L5-03: the md band (sidebar-narrowed ~424px column) reads as a
        // horizontal media-thumb row — the ProjectCard wide grammar applied at
        // tablet — instead of an inherited ~560px phone stack. lg untouched.
        'md:max-lg:min-h-0 md:max-lg:flex-row',
        // The gallery wall (R4/BP9): the same horizontal grammar at lg+,
        // alternation via flex-row-reverse on right-hung rows.
        wide && 'lg:min-h-0 lg:flex-row',
        wide && mediaSide === 'right' && 'lg:flex-row-reverse',
        className,
      )}
    >
      <CardField slug={category} />

      {/* Show-the-work 2026-06-04: cinematic product band (placeholder now).
          L5-03 md band: the band takes the left 2/5 and stretches to the row's
          height (aspect released) — mirrors ProjectCard's wide treatment. */}
      <CardProductReveal
        slug={category}
        title={title}
        media={media ?? { alt: title }}
        className={cn(
          'shrink-0 border-b border-[rgb(var(--rgb-ink)/0.08)] md:max-lg:w-2/5 md:max-lg:self-stretch md:max-lg:aspect-auto md:max-lg:border-b-0 md:max-lg:border-r',
          wide && cn('lg:self-stretch lg:aspect-auto lg:border-b-0', wellClass),
          wide && (mediaSide === 'right' ? 'lg:border-l' : 'lg:border-r'),
        )}
      />

      <div className="relative z-10 flex flex-1 flex-col p-7 md:max-lg:p-8 lg:p-12">
        <span
          aria-hidden="true"
          className="font-serif font-light text-card-numeral leading-none tabular-nums text-ink/30 origin-top-left transition duration-slow ease-gh-glide group-hover:text-ink/45 motion-safe:group-hover:scale-[1.04]"
        >
          {numeral}
        </span>

        <div className="mt-auto flex flex-col gap-4">
          {/* THE ROOM/Phase E (E2): /work/ rendered only the summary, less
              than the homepage cards (ProjectCard:102 shows d.status). Same
              classes as that line, verbatim — un-uppercased, same tier, so
              status reads as its own field rather than shouting a kicker.
              verifiedDate is new to this card entirely: a second, equally
              quiet line, only when status is present. */}
          {status && (
            <div className="flex flex-col gap-1">
              <p className="font-mono text-meta text-text-meta">{status}</p>
              {verifiedDate && (
                <p className="font-mono text-meta text-text-meta">{`Verified ${verifiedDate}`}</p>
              )}
            </div>
          )}
          <h3 className="font-serif font-light text-card-title text-ink">
            <Link
              href={href}
              aria-label={`${title} — read the case study`}
              /* The door ajar (R4/BP2): the card's ONE opt-in mark hook (see
                 ProjectCard) — one bar per card, beside the title, FT-9's
                 placement. */
              data-door-target={href}
              /* Phase A (A11): was outline-offset-4, the one card-title link off
                 the site's single 2px ring offset — no comment justified the wider
                 gap, and the title sits 16px (gap-4) from the rule below either
                 way, so 2px vs 4px changes nothing about collision. Unified. */
              className="rounded-sm transition-colors duration-fast ease-out hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              {title}
            </Link>
          </h3>
          <span aria-hidden="true" className="block h-px w-24 rounded-full bg-gradient-to-r from-[rgb(var(--rgb-accent)/0.65)] via-[rgb(var(--rgb-accent)/0.3)] to-transparent origin-left transition-transform duration-slow ease-gh-glide group-hover:scale-x-125" />
          {/* C-14: no line-clamp — the summaries are Sky's own written receipt
              sentences ("vanilla JS, zero dependencies", "zero cloud, instant
              runs."); clamping amputated them on the work grid. Un-clamped they
              stand at their natural height (a build-time change → CLS 0). */}
          <p className="font-sans font-light text-body-sm leading-body text-ink-muted text-pretty">
            {description}
          </p>

          {/* Footer action row (L3-04) — the featured card's proven grammar:
              case-study link + LIVE ↗ / GITHUB ↗ grouped so they wrap as one
              unit on narrow cards. */}
          {/* L5-07: action links carry px/py-1 + negative margins — the border
              box is ~23px (the gap-y-2 wrap pitch) with zero layout shift. That
              pitch is load-bearing: KEEP the py-1/-my-1 pair.

              UP-02 / F7-2 (ui-polish 2026-08-01): the hit area is lifted to
              44.391px by a one-sided stretched ::after (the L3-09 recipe) —
              leading link UP into the dead band above the rule, trailing group
              DOWN into the card's foot — because the row's 8px inter-line gap
              is already fully spent, so extra pixels must come from outside the
              row. Identical grammar to ProjectCard's action row; the long-form
              rationale (including why padding is the WRONG mechanism here — it
              would drag the focus ring with it) lives there. */}
          <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[rgb(var(--rgb-ink)/0.1)] pt-4">
            <Link
              href={href}
              /* SC 2.5.3 Label in Name: the visible words lead the accessible name. */
              aria-label={`Read more — ${title} case study`}
              /* C-55: the title link above already spends one tab stop on this exact
                 href — two stops per neighbour card is the only redundancy in the
                 journey. tabIndex={-1} drops the SECOND keyboard stop while keeping
                 this a real, clickable, SR-rotor-visible link (NOT aria-hidden, NOT a
                 whole-card link). One stop per neighbour card, both names preserved. */
              tabIndex={-1}
              className="relative px-1 py-1 -mx-1 -my-1 after:absolute after:inset-x-0 after:-top-[21px] after:bottom-0 after:content-[''] inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-accent-text transition-transform duration-base ease-gh-glide hover:translate-x-1 focus-visible:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              Read more <span aria-hidden="true">→</span>
            </Link>
            {(demoLink || githubLink) && (
              <span className="ml-auto flex items-center gap-x-6">
                {demoLink && (
                  <a
                    href={demoLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${demoLink.label.toLowerCase()} for ${title} (opens in new tab)`}
                    className="relative px-1 py-1 -mx-1 -my-1 after:absolute after:inset-x-0 after:top-0 after:-bottom-[21px] after:content-[''] inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                  >
                    {/* label-derived: "Live" for live products, "Demo" for
                        not-yet-live ones (e.g. Mutual Mesh) */}
                    {demoLink.label.split(' ')[0]} <span aria-hidden="true">↗</span>
                  </a>
                )}
                {githubLink && (
                  <a
                    href={githubLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${title} source on GitHub (opens in new tab)`}
                    className="relative px-1 py-1 -mx-1 -my-1 after:absolute after:inset-x-0 after:top-0 after:-bottom-[21px] after:content-[''] inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                  >
                    GitHub <span aria-hidden="true">↗</span>
                  </a>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
