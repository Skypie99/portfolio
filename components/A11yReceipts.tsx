import { Fragment } from 'react';

import { CountUpStat } from '@/components/CountUpStat';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import { smartPunctuation } from '@/lib/markdown';
import type { A11yReceipts as A11yReceiptsData } from '@/lib/schema';

/** Home's stat-figure rotation (app/page.tsx STAT_EMBER) — the receipts strip
 *  speaks the exact same grammar, so the same ember cycle applies. */
const STAT_EMBER = ['ember', 'ember-teal', 'ember-gold', 'ember-moss'];

/**
 * MethodSegment (UP-14c, ui-polish 2026-08-01) — one "· …" clause of the method
 * line, structured so the line can break ONLY between whole words.
 *
 * Two rules, both zero-copy (the visible characters are byte-identical; spans
 * are structure):
 *  1. Every word is its own `whitespace-nowrap` span, with the SPACES left
 *     outside them so they stay the only break opportunities. A hyphenated
 *     token is the only kind that could split at all — `overflow-wrap` is
 *     `normal`, so an unhyphenated word has no interior break opportunity —
 *     and this is what stops "COLOR-/CONTRAST" and "SCROLL-/SETTLED".
 *  2. The "·" is bonded INTO the span of the word that follows it, so the
 *     separator always leads its own clause and can never strand alone at the
 *     start of a line. Before this, it trailed on one break and led on another.
 *
 * The audit prescribed nowrap on each whole ·-SEGMENT. That was measured and
 * REJECTED: "· label-content-name-mismatch + color-contrast on" sets 390.8px
 * against a 311px column at 375 and 256px at 320, so it would have traded a
 * wrap defect for a hard horizontal overflow — breaking this phase's own
 * zero-overflow rail. The widest unbreakable unit this ships instead is
 * "· label-content-name-mismatch" at 231.3px, which clears 320 with ~25px to
 * spare. `lib/schema.ts` caps a method string at 90 chars but does not cap a
 * single TOKEN, so a future 90-character hyphenated word would overflow; the
 * longest today is 27 chars / ~215px.
 *
 * K5 (THE ROOM Phase J, 2026-08-26) — THAT ARITHMETIC WAS ONLY EVER DONE AT
 * 100% TEXT. Phase J's element-level zoom census (the first non-vacuous 200%
 * measurement this repo has taken — `documentElement.scrollWidth` cannot fail
 * here, see J_zoom200-census.mjs) found 151.6px of this line clipped and
 * UNREACHABLE at 375px with 200% root text, both themes: the same 231.3px unit
 * is ~462px once text doubles, and `overflow-x: clip` cuts rather than scrolls.
 *
 * The nowrap now lives in `.method-seg` (app/globals.css), which releases it
 * inside a CONTAINER QUERY measured in `em`. Two dead ends were tried and
 * rejected first, both recorded so nobody re-walks them:
 *   · a Tailwind `max-[16em]:` variant — this project's `screens` config mixes
 *     units, so Tailwind refuses to generate `min-*`/`max-*` arbitrary variants
 *     at all and says so in a build warning. The class silently never existed.
 *   · a plain `@media (max-width: …em)` — `em` in a MEDIA query resolves against
 *     the browser's initial font size, not the root font-size, so it cannot see
 *     text scaling at all. It would have looked right and done nothing.
 * `em` inside a `@container` query resolves against the CONTAINER's own font
 * size, which is the thing that scales. That is the only one of the three that
 * responds to the actual failure condition — and Phase J's census re-run proves
 * it: 2 crossings before, 0 after.
 */
function MethodSegment({ children }: { children: React.ReactNode }) {
  const words = typeof children === 'string' ? children.split(' ') : null;
  return (
    <>
      {' '}
      <span className="method-seg">
        <span aria-hidden="true">·</span> {words ? words[0] : children}
      </span>
      {words?.slice(1).map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {' '}
          <span className="method-seg">{word}</span>
        </Fragment>
      ))}
    </>
  );
}

/**
 * A11yReceipts — the dated receipts strip on /accessibility/ (S6 / L6-02
 * enhancement, Treatment A).
 *
 * Publishes MEASURED numbers from a real verification run in the home
 * showcase's stat-chip grammar: the same 3×2 gap-px grid, surface cells, mono
 * labels, and CountUpStat figures (the L6-05 sr-only mechanism — the animated
 * figure is aria-hidden; AT hears only the final value). Honest framing is
 * structural: "measured", the run date, and a link to the evidence JSON anyone
 * can re-run — never "enforced every build" (there is no CI gate yet).
 *
 * Placement contract: the strip sits BEFORE the "What I have not done"
 * section, so the page keeps its honest last word (PROTECT #8).
 */
export function A11yReceipts({ data, className }: { data: A11yReceiptsData; className?: string }) {
  return (
    <div className={className}>
      <Reveal variant="scene">
        {/* The eyebrow is the strip's heading — it joins the statement's h2
            outline so heading-nav users land on the receipts, not past them. */}
        <h2 id="receipts" className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2 scroll-mt-24">
          <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          Measured, not claimed
        </h2>
        {/* J2 (Phase J, 2026-08-26) — both dates on this strip render inside a
            real <time>. H1 wrapped the site's dates component by component from
            a list written before this strip was re-examined, so these two were
            the last bare ones on an app route. The rendered characters are
            byte-identical: this page's statement copy is byte-frozen (PROTECT),
            and only the element around the date changed. */}
        <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead mb-12 text-pretty">
          Real numbers from a real run — measured{' '}
          <time dateTime={data.measuredDate}>{data.measuredDate}</time>, method below. Not a
          live gate yet; a snapshot you can re-run.
        </p>
      </Reveal>

      {/* 3×2 receipts grid.
          ⚠ THE TWIN IS GONE (THE ROOM Phase C / C4, 2026-08-25): this grid used
          to be "home's showcase grammar verbatim", and the paired comment in
          app/page.tsx said the two container strings must move together. The
          homepage's stat-chip band has been retired into three `Receipt`s, so
          there is nothing left to stay byte-identical WITH — this grid is now
          the only page that speaks this grammar, and it owns it outright. The
          rendered output here is unchanged; only the claim below is corrected.
          Everything from here down is the ORIGINAL reasoning, kept because it
          is still why this grid is shaped the way it is:
          UP-29 / UP-23 (ui-polish 2026-08-01): BOTH grids collapsed to one column
          below 480px. At 375 the 2-col cell's 90px content box drove three
          of the six mono labels to three lines and split "reduced-motion" at its
          own hyphen; at 320 the label, the sub and the "0.003" figure all
          overflowed their padding box (invisibly — they ate the right padding
          rather than crossing an edge, which is why the audit's overflow probe
          read zero).
          Phase A (A10): the cell padding had drifted from the twin claim above —
          app/page.tsx's C-22 reclaimed base cell width (p-8 -> p-6) so its tag
          pills fit their ~90px box at 375, but this grid was never given the
          same fix and stayed at p-8. Restored to p-6 md:p-7. The twin it was
          matched to no longer exists; the value stays because p-6 is what the
          375 reasoning above needs, not because anything is being mirrored. */}
      {/* G2 (THE ROOM Phase G) — the method pair. Six figures share ONE method
          line, and it sits directly beneath them, so the grid and that line are
          the instrument: land on any figure and the door to the evidence draws
          itself. An UNSTYLED wrapper on purpose — `.method-pair` declares no
          layout, and a plain block box around two block-level siblings with no
          margins of its own leaves the rendered box tree unchanged (verified
          against the pre-phase out/ capture, byte-identical but for the two
          class hooks). */}
      <div className="method-pair">
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-px bg-cool-soft/30 border border-cool-soft/50 rounded-lg overflow-hidden shadow-md">
          {data.receipts.map((r, i) => (
            <Reveal
              key={r.label}
              index={Math.min(i, 4)}
              variant="depth"
              className={cn('flex flex-col bg-surface-mid p-6 md:p-7', 'group')}
            >
              <CountUpStat value={r.value} emberClass={STAT_EMBER[i % STAT_EMBER.length]} label={r.label} />
              {/* W5-02: CountUpStat's sr-only name is already "{value} {label}", so
                  this visible caption would make AT hear the label a second time.
                  aria-hidden keeps the caption on screen while the sr-only name stays
                  the single canonical announcement (the figure above is aria-hidden too). */}
              <p aria-hidden="true" className="font-mono text-label text-sage-text uppercase tracking-label mb-2">
                {r.label}
              </p>
              {/* curly-the-estate (luxe Wave 1): the sub is authored prose, not a
                  code specimen, so it takes the house apostrophe like every other
                  prose surface — "the portfolio's own suite" was the last straight
                  U+0027 rendering from content JSON. Mono TYPEFACE is not a mono
                  CONTEXT: `code` spans keep their literal glyphs via
                  INLINE_CODE_CLASS and never route through this transform. */}
              <p className="font-mono text-meta text-text-meta">{smartPunctuation(r.sub)}</p>
            </Reveal>
          ))}
        </div>

        {/* Method line — the receipt's fine print + the evidence artifact.
            UP-14(c) (ui-polish 2026-08-01): this line now breaks BETWEEN words
            only — never inside a compound token, and never leaving a "·" adrift
            at the start of a line. See MethodSegment for the mechanism and for
            why the audit's per-SEGMENT nowrap was measured and rejected. */}
        <p className="method-line mt-6 font-mono text-meta tracking-label uppercase text-text-meta leading-loose">
          Measured <time dateTime={data.measuredDate}>{data.measuredDate}</time>
          <MethodSegment>
            <a
              href={data.evidencePath}
              className="link-draw method-draw text-accent-text hover:text-accent-text"
            >
              Evidence JSON
            </a>
          </MethodSegment>
          {data.method.map((m) => (
            <MethodSegment key={m}>{m}</MethodSegment>
          ))}
        </p>
      </div>
    </div>
  );
}
