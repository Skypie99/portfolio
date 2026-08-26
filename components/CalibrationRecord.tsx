import { Fragment } from 'react';

import { LedgerRow } from '@/components/LedgerRow';
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
            <LedgerRow
              key={r.numeral}
              numeral={r.numeral}
              title={r.title}
              date={r.closed}
              open={!r.closed}
              numeralLabel="Round"
              // The residual 35.84px LEFT-edge spread on the open chip is not
              // rag: it is the chip being narrower than a 10-char tabular date
              // (79.75 - 43.91), which is correct for a right-aligned value
              // column. Row IV's height settles to 85.67px, matching
              // structurally identical row II. Both measured under LedgerRow's
              // own ml-auto/items-baseline choices (see its UP-43(b)/(c)
              // comments) — this component no longer keeps its own copy.
              after={
                /* UP-43(a): one nowrap span per "·"-delimited stat, with the "·"
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
                    interior "·" would overflow 320. */
                <span className="basis-full font-mono text-meta tracking-label uppercase text-text-meta leading-relaxed">
                  {r.counts.flatMap((c) => c.split(' · ')).map((seg, i) => (
                    <Fragment key={`${seg}-${i}`}>
                      {i > 0 && ' '}
                      <span className="whitespace-nowrap">{i > 0 ? `· ${seg}` : seg}</span>
                    </Fragment>
                  ))}
                </span>
              }
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
