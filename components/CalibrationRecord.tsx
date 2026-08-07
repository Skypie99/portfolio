import { Fragment } from 'react';

import type { Round } from '@/lib/schema';

/**
 * The calibration record (R4/BP7 · P02) — the AI-mastery flagship: a
 * lab-style card of the site's audit rounds, counts and gates ONLY. The
 * visitor realizes the site is maintained under measurement; the
 * realization is the moment — nothing here explains or promotes (the §4
 * disclosure fence: no agent names, no report paths, no system vocabulary;
 * every number is outside-verifiable or plainly attested).
 *
 * Data = content/rounds.json (receipts pattern, append-only, build-gated —
 * a bad row fails the build). One close-date semantic per row. The open
 * round wears the terracotta dot. Static server HTML: zero JS, zero
 * images, space held → CLS 0. RM-first-class by construction — the
 * artifact IS the RM experience.
 *
 * SKY-EDIT: every row string lives in content/rounds.json; the two literals
 * below (heading + method line) are hers to reword (DECISIONS §S).
 */

const HEADING = 'Calibration record';
const METHOD_LINE = 'Ledger counts attested · axe and CLS re-runnable';

export function CalibrationRecord({ rounds }: { rounds: Round[] }) {
  return (
    <section className="px-gutter py-32 lg:py-50 world-surface-alt border-t border-border-decorative">
      <div className="max-w-content mx-auto">
        <h2
          id="calibration"
          className="font-serif font-light text-prose-h2 text-ink mb-3 scroll-mt-24"
        >
          {HEADING}
        </h2>
        <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-12">
          {METHOD_LINE}
        </p>
        {/* role="list" IS load-bearing here (batch-skeptic corrected the first
            build's premise): Tailwind preflight sets list-style:none on every
            ul, which is exactly the condition that makes Safari/VoiceOver drop
            list semantics — the pitch's blocking a11y REQUIRE stands, so the
            lint rule is disabled for this one line. Device-verifiable on the
            standing VoiceOver session. */}
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="flex flex-col max-w-measure-wide">
          {rounds.map((r) => (
            <li
              key={r.numeral}
              className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5 border-t border-border-decorative py-5 first:border-t-0 first:pt-0"
            >
              <span
                aria-hidden="true"
                className="font-serif font-light text-step-1 leading-none text-ink/75 w-10 shrink-0"
              >
                {r.numeral}
              </span>
              <span className="sr-only">{`Round ${r.numeral}`}</span>
              <span className="font-mono text-label tracking-label uppercase text-ink">
                {r.title}
              </span>
              {/* UP-43(b): ml-auto lands every status on the row rule's own right
                  edge, so the dates read as a ledger column instead of trailing
                  the keyword at a different x per row (right-edge spread 44.55px
                  -> 0.00 at every width). Chosen over a fixed keyword column,
                  which reads equally clean today but is destroyed by one longer
                  title — measured with a synthetic 130.5px title, the fixed
                  column's spread reopens to 30.66-66.50px while ml-auto holds
                  0.00 through the schema's own 24-char maximum. Same house idiom
                  as ProjectCard/CaseStudyCard's trailing action group. The
                  residual 35.84px LEFT-edge spread is not rag: it is the open
                  chip being narrower than a 10-char tabular date (79.75 - 43.91),
                  which is correct for a right-aligned value column. */}
              {r.closed ? (
                <span className="ml-auto font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
                  {r.closed}
                </span>
              ) : (
                /* UP-43(c): items-baseline, not items-center. Under items-center no
                   flex item participates in baseline alignment, so per CSS Flexbox
                   §8.5 this chip's first baseline is synthesised from its STARTMOST
                   item — the dot, which has no line boxes and falls back to its
                   border-box bottom. The row's own items-baseline then pinned the
                   DOT's bottom to the row baseline and let the text hang 1.31px
                   below it (measured 1.31-1.32px at every width, both themes; the
                   audit read this as "~3px ABOVE", which is the sign inverted and
                   the magnitude doubled by a deviceScaleFactor-2 capture).
                   items-baseline makes the chip's own text the baseline it offers,
                   so the text lands at 0.00 and the dot does not move — measured
                   0.00px on both axes in 28 of 28 reads. Row IV's height also
                   settles to 85.67px, matching structurally identical row II.
                   Do NOT reach for align-middle: that utility is not in the built
                   stylesheet and would be a silent no-op. */
                <span className="ml-auto inline-flex items-baseline gap-2 font-mono text-meta tracking-label uppercase text-accent-text">
                  <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-terracotta" />
                  open
                </span>
              )}
              {/* UP-43(a): one nowrap span per "·"-delimited stat, with the "·"
                  bonded to the segment that FOLLOWS it and the spaces left
                  OUTSIDE the spans as the only break opportunities — so a line
                  can break at a separator but never inside a stat, and a "·" can
                  never strand at the start of a line. Measured: segments split
                  across lines 28 -> 0, with the rendered line COUNT unchanged in
                  every frame, so it buys the fix at zero added height.
                  flatMap(split) is exactly join(' · ').split(' · '), so the
                  rendered characters are identical — content/rounds.json is
                  untouched and so is every byte it holds.
                  Deliberately NO aria-hidden on the "·", which is where this
                  departs from A11yReceipts' MethodSegment: that component INVENTS
                  its separators, whereas half of these are Sky's own bytes inside
                  a rounds.json string ("53 findings · 53 accounted"). Hiding them
                  would delete her characters from the accessible reading.
                  LIMIT worth knowing: at 320 the measure is 256px, so an
                  unbreakable "· <stat>" must stay under ~32 characters. The
                  longest today is "· axe 0 violations" at 143.56px, 112.44px of
                  headroom; lib/schema.ts caps a counts ENTRY at 64 chars but does
                  not cap a separator-free run, so a future 64-char stat with no
                  interior "·" would overflow 320. */}
              <span className="basis-full font-mono text-meta tracking-label uppercase text-text-meta leading-relaxed">
                {r.counts.flatMap((c) => c.split(' · ')).map((seg, i) => (
                  <Fragment key={`${seg}-${i}`}>
                    {i > 0 && ' '}
                    <span className="whitespace-nowrap">{i > 0 ? `· ${seg}` : seg}</span>
                  </Fragment>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
