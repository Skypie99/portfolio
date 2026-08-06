import type { Metadata } from 'next';
import Link from 'next/link';

import { CalibrationRecord } from '@/components/CalibrationRecord';
import { SettleHeading } from '@/components/HeroSettle';
import { renderMarkdownProse } from '@/components/MarkdownProse';
import { cn } from '@/lib/cn';
import { getColophon, getProfile, getRounds } from '@/lib/content';
import { bindSeparatorDash, bindSoloLetters } from '@/lib/markdown';
import { OG_CARD } from '@/lib/og';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description =
    'How this site was made — the stack, the type, the golden-hour world, and the quiet systems behind it.';
  return {
    title: `Colophon — ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      // TA-10: a leaf openGraph REPLACES the root's wholesale (W0-04) — url,
      // siteName and locale restated so they survive on this route's share.
      url: '/colophon/',
      siteName: 'Sky Halisky — AI Portfolio',
      locale: 'en_CA',
      title: `Colophon — ${profile.name}`,
      description,
      images: [OG_CARD],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Colophon — ${profile.name}`,
      description,
    },
  };
}

/**
 * The three typefaces, shown in their own faces — a live specimen of the type
 * system the prose describes. Uses only existing token classes (font-serif /
 * font-sans / font-mono, the ember crown gradient, ink/meta tokens) — no new
 * system, no inline styles, no new colors. Each specimen is captioned with its
 * family + role as real text, so it reads for screen-reader and no-colour users
 * too (the specimen never carries meaning by appearance alone).
 */
const TYPE_SPECIMENS: { sample: string; sampleClass: string; family: string; role: string }[] = [
  {
    sample: 'Built with intention',
    sampleClass: 'font-serif font-light text-step-4 ember',
    family: 'Cormorant Garamond',
    role: 'serif crowns',
  },
  {
    sample: 'Calm, readable body text — kept light so long-form never tires the eye.',
    // C-88: the block is titled "the type, set live" — the 'body' specimen must
    // render at the real long-form body size (text-prose, 17px), not the lead
    // tier (text-step-1, 20px) it was mistakenly set at.
    sampleClass: 'font-sans font-light text-prose text-charcoal',
    family: 'DM Sans',
    role: 'body',
  },
  {
    sample: 'LABELS & METADATA',
    // UP-42 (ui-polish 2026-08-01) — the row read as a paste error: measured, its
    // specimen and its caption rendered at the SAME ink token (rgb(84,100,93)
    // light / rgb(159,176,169) dark) one pixel apart (12px over 11px, size ratio
    // 1.091 against rows 1-2's 1.545 and 3.551). The ink is the half that was
    // free, and it is the half that carries the collapse: near-black against the
    // caption's ink-meta separates specimen from caption by weight rather than by
    // size. Paint-sampled against the real translucent world-surface behind it
    // (glyphs painted transparent, occlusion-checked points): 5.31-5.36:1 ->
    // 11.40-11.82:1 light, 7.13-7.29:1 -> 12.00-13.72:1 dark, against a 4.5 bar.
    // NOT a new pair - the h2 26px above this list already paints --rgb-ink on
    // this same section, as does the closer link two sections down.
    //
    // The audit's other half - a "real display step, ~18-22px" - is NOT taken,
    // and this is a Sky fork, not an oversight. Two recorded intents block it.
    // (1) C-88 immediately above records, for THIS array, that a specimen renders
    // at its face's REAL working size; measured, 180 of the estate's 182 font-mono
    // call sites set 11-12px (the lone 24px one is NumberedStep's numeral, not a
    // label). (2) Sky's byte-locked prose one section ABOVE this block - the "##
    // The type" copy this specimen exists to demonstrate - says DM Mono "handles
    // the small uppercase labels and the metadata"; at 19px the "small" specimen
    // would out-size the body specimen (17px) and invert the page's own
    // descending 39 / 17 / 12 order. Both forms are captured in receipts/p8/.
    sampleClass: 'font-mono text-label tracking-label uppercase text-near-black',
    family: 'DM Mono',
    role: 'labels & metadata',
  },
];

/**
 * /colophon — F-§8.2. The site documenting itself: stack, type, the day→night
 * world, the quiet design systems, and the build process.
 *
 * Server Component, fully static. Reuses the established long-form chrome
 * (eyebrow + SettleHeading header → renderMarkdownProse body → closer), the
 * same idiom as /about, /accessibility, and /blog/[slug]. Body copy lives in
 * lib/content.getColophon(). Adds one live type-specimen section built from
 * existing tokens. Inherits world / skip link / <main> / footer from the layout.
 */
export default function ColophonPage() {
  const colophon = getColophon();
  const rendered = renderMarkdownProse(colophon, 'blog');
  const rounds = getRounds();

  return (
    <>
      {/* Page header — eyebrow + display title + summary (matches /about, /accessibility) */}
      <section data-band-anchor className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta"
            />
            Colophon
          </p>
          <SettleHeading className="font-serif font-light text-display ember max-w-3xl mb-16 text-balance">
            {bindSeparatorDash(bindSoloLetters('How this was made.'))}
          </SettleHeading>
          <p className="font-sans font-light text-step-1 text-charcoal max-w-measure-wide text-pretty">
            The stack, the type, the world, and the quiet systems behind it.
          </p>
        </div>
      </section>

      {/* Body prose — shared long-form renderer; .reveal floors carry the
          reduced-motion / no-JS rest state. */}
      <section
        className={cn(
          'px-gutter',
          'py-32 lg:py-50',
          'world-surface-alt',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <article
            aria-label="Colophon"
            className="max-w-measure-wide flex flex-col gap-8"
          >
            {rendered}
          </article>
        </div>
      </section>

      {/* Live type specimen — the type system shown in its own faces. */}
      <section className="px-gutter py-32 lg:py-50 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <h2 id="type-specimen" className="font-serif font-light text-prose-h2 text-near-black mb-12 scroll-mt-24">
            The type, set live
          </h2>
          <ul className="flex flex-col gap-12 max-w-measure-wide">
            {TYPE_SPECIMENS.map((t) => (
              <li key={t.family} className="flex flex-col gap-3 border-t border-border-decorative pt-8 first:border-t-0 first:pt-0">
                <p className={t.sampleClass}>{t.sample}</p>
                <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                  {t.family} <span aria-hidden="true">·</span> {t.role}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The calibration record (R4/BP7 · P02) — after the specimens, before
          the closer: the rounds ledger on the alternating surface. Data =
          content/rounds.json (build-gated, append-only). */}
      <CalibrationRecord rounds={rounds} />

      {/* Closer — cross-link to the accessibility statement, plus back home.
          R4/BP7 surface flip (the pitch's one DISPLACES): the calibration
          section above now holds world-surface-alt, so the closer flips to
          world-surface — the world-surface alternation stays true — and
          adopts the full py-32 lg:py-50 rhythm. */}
      <section className="px-gutter py-32 lg:py-50 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto flex flex-col items-start gap-8">
          <Link
            href="/accessibility/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            Read the accessibility statement
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-base ease-gh-glide group-hover:translate-x-1"
            >
              {'→'}
            </span>
          </Link>
          <Link
            href="/"
            /* C-89: match the padded-tap idiom the accessibility-statement closer
               above already carries (px/py + cancelling negative margins → a ≥24px
               box, zero layout shift). C-69-family: keyboard focus gets the same
               ink shift + arrow glide as hover. */
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-text-meta hover:text-accent-text focus-visible:text-accent-text transition-colors duration-fast ease-out"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
            >
              {'←'}
            </span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
