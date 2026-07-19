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
          className="font-serif font-light text-prose-h2 text-near-black mb-3 scroll-mt-24"
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
                className="font-serif font-light text-step-1 leading-none text-near-black/75 w-10 shrink-0"
              >
                {r.numeral}
              </span>
              <span className="sr-only">{`Round ${r.numeral}`}</span>
              <span className="font-mono text-label tracking-label uppercase text-near-black">
                {r.title}
              </span>
              {r.closed ? (
                <span className="font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
                  {r.closed}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-accent-text">
                  <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-terracotta" />
                  open
                </span>
              )}
              <span className="basis-full font-mono text-meta tracking-label uppercase text-text-meta leading-relaxed">
                {r.counts.join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
