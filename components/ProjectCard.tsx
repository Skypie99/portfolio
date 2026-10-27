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
        'glass-card work-card group relative isolate flex flex-col overflow-hidden rounded-card',
        wide ? 'lg:flex-row min-h-[22rem]' : 'min-h-[22rem]',
        className,
      )}
    >
      <CardField slug={d.id} featured={d.featured} />

      {/* Show-the-work 2026-06-04: a cinematic product band crowns the card.
          Ships the real capture from content/deliverables.json (d.heroShot /
          d.cardImage / d.mobileCardImage); the original swap guide is
          docs/history/SHOW_WORK_PLAN.md. Decorative — the inscription below
          carries the title/links, so all text stays on glass (AA preserved). */}
      <CardProductReveal
        slug={d.id}
        title={d.title}
        media={cardMedia(d)}
        className={cn(
          'shrink-0 border-b border-[rgb(var(--rgb-ink)/0.08)]',
          // Lead card: a horizontal banner — the image takes the left half and
          // stretches to the card's height; mobile keeps the stacked 16:10 band.
          wide && 'lg:w-1/2 lg:self-stretch lg:aspect-auto lg:border-b-0 lg:border-r',
        )}
      />

      <div className="relative z-10 flex flex-1 flex-col p-7 md:p-9">
        {/* open top glass — ghosted numeral + Featured seal */}
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className="font-serif font-light text-card-numeral leading-none tabular-nums text-ink/30 origin-top-left transition duration-slow ease-gh-glide [@media(hover:hover)]:group-hover:text-ink/45 [@media(hover:hover)]:motion-safe:group-hover:scale-[1.04] group-focus-within:text-ink/45 motion-safe:group-focus-within:scale-[1.04]"
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
        <div className="mt-auto flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-2 font-mono text-meta uppercase tracking-label text-text-meta">
              <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-terracotta" />
              {d.role} · {d.year}
            </p>
            {/* Status (truth pass 2026-08-21) — its OWN line, not appended to
                the role/year kicker, which is already at its length ceiling at
                320. No dot: the kicker above owns the row's one terracotta mark,
                and a second mark here would read as a second field of equal
                weight. Un-uppercased and normal-case against the kicker's
                tracking-label caps, so the two lines stay distinguishable at a
                glance. Every deliverable carries one (schema-required), so all
                cards gain the same line and the mt-auto equal-height inscription
                is preserved. */}
            <p className="font-mono text-meta text-text-meta">{d.status}</p>
            <h3
              className="font-serif font-light text-card-title text-ink"
            >
              <Link
                href={`/work/${d.id}/`}
                aria-label={`${d.title}: ${d.role}, ${d.year}`}
                /* The door ajar (R4/BP2): the card's ONE opt-in mark hook —
                   lib/doorAjar marks only [data-door-target], never bare
                   hrefs (the stretched-link chips must stay unpositioned). */
                data-door-target={`/work/${d.id}/`}
                /* Phase A (A11): was outline-offset-4 — see CaseStudyCard's
                   identical title-link fix for the reasoning. */
                className="tactile-link rounded-sm transition-colors duration-fast ease-out [@media(hover:hover)]:hover:text-accent-text focus-visible:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
              >
                {d.title}
              </Link>
            </h3>
            <span aria-hidden="true" className="block h-px w-24 rounded-full bg-gradient-to-r from-[rgb(var(--rgb-accent)/0.65)] via-[rgb(var(--rgb-accent)/0.3)] to-transparent origin-left transition-transform duration-slow ease-gh-glide [@media(hover:hover)]:motion-safe:group-hover:scale-x-125 motion-safe:group-focus-within:scale-x-125" />
          </div>

          <div className="flex flex-col gap-6">
            {/* TY-2: no line clamp — the schema's 160-char summary cap is the
                fence; equal card heights come from the inscription's mt-auto,
                never from amputating the sentence with an ellipsis. */}
            <p className="font-sans font-light text-body-sm leading-body text-ink-muted text-pretty">
              {d.summary}
            </p>

            <ul className="flex flex-wrap gap-2">
              {d.tech.slice(0, maxTech).map((t) => (
                <li key={t}>
                  <TagPill>{t}</TagPill>
                </li>
              ))}
            </ul>

            {/* L5-07: each action link carries px/py-1 with compensating
                negative margins — the border box is ~23px, exactly the gap-y-2
                wrap pitch, so wrapped rows abut without overlap while layout
                and wrap rhythm stay byte-identical. That pitch is load-bearing:
                KEEP the py-1/-my-1 pair.

                UP-02 / F7-2 (ui-polish 2026-08-01): 23px is under the house 44
                floor, and the row's own 8px inter-line gap is already fully
                spent by the pair above — every extra pixel has to come from
                OUTSIDE the row. So the hit area is lifted by a one-sided
                stretched ::after (the L3-09 recipe, app/page.tsx:237), not by
                more padding:
                  · leading link  → the overlay reaches UP into the dead band
                    above the hairline rule (nothing interactive there);
                  · trailing group → its overlays reach DOWN into the card's own
                    bottom padding.
                Wrapped, the two extensions move APART instead of colliding;
                unwrapped, they are separated horizontally by 16–218px. Either
                way: 44.391px effective, zero overlaps (measured).

                Padding was the obvious fix and is WRONG here: `*:focus-visible`
                (globals.css:422) traces each element's own border box, so
                growing it would draw a 44px ring around a 15px label and
                straddle the hairline. The ::after leaves the border box — and
                therefore the ring — exactly where it was. Measurements:
                build-plan/receipts/p2/. */}
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[rgb(var(--rgb-ink)/0.1)] pt-4">
              <Link
                href={`/work/${d.id}/`}
                /* SC 2.5.3 Label in Name: the accessible name must contain the
                   visible label ("View project") so speech-input users can act
                   on what they see. Extra context follows the visible words. */
                aria-label={`View project: ${d.title} case study`}
                /* Cook Out P2 · Part B: the title link above already spends one
                   tab stop on this exact href — CaseStudyCard's C-55 fix,
                   applied here too. tabIndex={-1} drops the redundant SECOND
                   keyboard stop while keeping this a real, clickable,
                   SR-rotor-visible link (NOT aria-hidden, NOT a whole-card link). */
                tabIndex={-1}
                className="tactile-link relative px-1 py-1 -mx-1 -my-1 after:absolute after:inset-x-0 after:-top-[21px] after:bottom-0 after:content-[''] inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-accent-text transition-transform duration-base ease-gh-glide [@media(hover:hover)]:hover:translate-x-1 focus-visible:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
              >
                View project <span aria-hidden="true">→</span>
              </Link>
              {(demoLink || githubLink) && (
                /* Grouped so the external links wrap as ONE unit on narrow
                   cards — previously GitHub orphaned alone onto a second
                   line at 390px. Desktop is pixel-identical: the group is
                   right-aligned via ml-auto and the internal gap-x-6 matches
                   the parent gap that used to separate Live/GitHub.

                   Astra Ultra 01: the demo link now carries its full
                   destination ("Play Ghost Code"), so where the card is too
                   narrow for both, the group wraps and the two links stack
                   whole instead of breaking a label mid-phrase, still
                   right-aligned (justify-end) as the single line is. gap-y-8 is
                   the stacked pitch the one-sided ::after needs: each box
                   reaches 4px into the gap (-my-1) and the upper link's
                   overlay reaches 21px down, so 32 - 8 = 24px >= 21px keeps
                   the two touch targets apart. Under large text a single
                   word ("SYNTHETIC") can outgrow a phone card, so the group
                   may shrink to the row (min-w-0, max-w-full) and its
                   inherited overflow-wrap breaks that word rather than
                   pushing it past the card edge; at normal text sizes it
                   never acts. Classes on the links themselves are
                   untouched. */
                <span className="ml-auto min-w-0 max-w-full flex flex-wrap items-center justify-end gap-x-6 gap-y-8 [overflow-wrap:anywhere]">
                  {demoLink && (
                    <a
                      href={demoLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${demoLink.label} for ${d.title} (opens in new tab)`}
                      className="tactile-link relative px-1 py-1 -mx-1 -my-1 after:absolute after:inset-x-0 after:top-0 after:-bottom-[21px] after:content-[''] inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out [@media(hover:hover)]:hover:text-ink focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                    >
                      {/* The full destination label from content ("Open web app",
                          "Play Ghost Code"), which already begins with its verb, so
                          the accessible name leads with the same words (SC 2.5.3). */}
                      {demoLink.label} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {githubLink && (
                    <a
                      href={githubLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${d.title} source on GitHub (opens in new tab)`}
                      className="tactile-link relative px-1 py-1 -mx-1 -my-1 after:absolute after:inset-x-0 after:top-0 after:-bottom-[21px] after:content-[''] inline-flex items-center gap-1.5 rounded-sm font-mono text-meta uppercase tracking-label text-text-meta transition-colors duration-fast ease-out [@media(hover:hover)]:hover:text-ink focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
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
    </div>
  );
}
