import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '@/components/Button';
import { CaseShowcase } from '@/components/CaseShowcase';
import { CaseStudyCard } from '@/components/CaseStudyCard';
import { ContactEmail } from '@/components/ContactEmail';
import { HeroImageSettle, HeroTitleSettle } from '@/components/HeroSettle';
import { ParallaxWash } from '@/components/ParallaxWash';
import { HeroProductReveal, ShotProductReveal } from '@/components/ProductReveal';
import { Plate } from '@/components/Plate';
import { ProofArrival } from '@/components/ProofArrival';
import { ShowcaseHeroCaption, ShowcaseHeroMedia } from '@/components/ShowcaseHero';
import { Reveal } from '@/components/Reveal';
import { TactileMedia } from '@/components/TactileMedia';
import { TagPill } from '@/components/TagPill';
import { caseShowcaseFor } from '@/lib/caseShowcase';
import { cn } from '@/lib/cn';
import { INLINE_CODE_CLASS, smartPunctuation } from '@/lib/markdown';
import { getDeliverables } from '@/lib/content';
import { ThemedHeroPreload } from '@/components/ThemedHeroPreload';
import { cardMedia, heroMedia, heroPreloadLink, heroPreloadLinks } from '@/lib/media';
import { canonicalFor } from '@/lib/metadata';
import { OG_CARD } from '@/lib/og';
import { frameForSlug, signatureFor } from '@/lib/signature';
import { CASE_PROSE_P_CLASS, parseInline, renderMarkdownProse } from '@/components/MarkdownProse';
import type { Deliverable } from '@/lib/schema';

type RouteParams = { slug: string };

type CaseStudyCategory = 'flagstone' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost';

function toCategory(id: string): CaseStudyCategory {
  const map: Record<string, CaseStudyCategory> = {
    'flagstone': 'flagstone',
    'claude-corp': 'claude-corp',
    'dashboard': 'dashboard',
    'prompt-library': 'prompt-library',
    'ghost-code': 'ghost',
  };
  return map[id] ?? 'flagstone';
}

/**
 * FlagstoneTestReceipt (T7 / SK-01) — the receipted count. The scaffold this
 * replaced shipped a TKTK placeholder; it is now reconciled.
 *
 * The homepage chip's "2,900+ tests passing" is the site's biggest number, so it
 * links here, where the exact figure is pinned to a dated run a stranger can
 * repeat. Measured 2026-08-16 from a fresh anonymous clone of the public repo:
 * 204 suites, 2,971 passing, 32 todo, 0 failing. The chip states a floor because
 * the suite grows most weeks; this strip states the exact figure and the date it
 * was true. Nothing here fabricates a CI URL or a receipts artifact: the claim
 * is reproducible by command, and the in-page anchor is real and build-valid.
 * Distinct from the /accessibility 763 strip (PROTECT-36/37, refreshed H3),
 * which stays untouched by this route's own count.
 * Exported for its test; a non-reserved export the router ignores.
 *
 * NOT a `<Receipt>` (components/Receipt.tsx), despite sharing the same
 * evidence idea (figure · tier/date · method door) — reviewed for
 * consolidation in THE ROOM's Phase H follow-up dedup pass (2026-08-25) and
 * kept separate on purpose. Receipt is a three-line bordered card built for
 * the homepage's grouped hero stats; this strip is one flowing meta line
 * plus a full paragraph of run instructions and the exact suite breakdown —
 * the reproduction steps a stranger actually needs, which Receipt has no
 * slot for. Forcing this into Receipt would mean either dropping that
 * paragraph (a real loss) or growing Receipt a prose slot none of its other
 * three call sites need. If Receipt ever grows a body/description slot for
 * an unrelated reason, revisit — don't force it for this alone.
 */
export function FlagstoneTestReceipt() {
  return (
    <section className="px-gutter py-12 lg:py-16 world-surface border-t border-border-decorative">
      <div className="max-w-content mx-auto">
        {/* G2 (THE ROOM Phase G): the figure and its method already share this
            one line, so the line IS the method pair — hovering "2,971 tests
            passing" draws the underline on the door to the command that
            reproduces it. The link stays ordinary always-visible text. */}
        <p className="method-pair max-w-measure-wide font-mono text-meta tracking-label uppercase text-text-meta leading-loose">
          2,971 tests passing
          <span aria-hidden="true"> · </span>{' '}
          <a
            href="#flagstone-test-count-method"
            className="link-draw method-draw text-accent-text hover:text-accent-text"
          >
            measured <time dateTime="2026-08-16">2026-08-16</time>, method
          </a>
        </p>
        {/* leading-[1.7]: a singular tuned value on this mono meta caption —
            coincides numerically, but not semantically, with the sans-body
            leading-[1.7] on the homepage's "how I work" essay. */}
        <p
          id="flagstone-test-count-method"
          className="scroll-mt-24 mt-2 max-w-measure-wide font-mono text-meta text-text-meta leading-[1.7]"
        >
          Run from a fresh clone of the public repo, not a local best case:{' '}
          <code className={INLINE_CODE_CLASS}>npm ci</code> then{' '}
          <code className={INLINE_CODE_CLASS}>npx jest --ci -w 3</code>. That run
          reported 204 suites, 2,971 passing, 32 todo, 0 failing. The suite has
          grown since; this receipt states the exact figure and the date it was
          true. (Separate from the portfolio{'’'}s own measured 763 on the
          accessibility page.)
        </p>
      </div>
    </section>
  );
}

/**
 * THE ROOM/Phase D — Flagstone-only case-study body staging (D3–D6). The
 * body markdown itself is byte-frozen (14_PROTECTION_MANIFEST); everything
 * below changes HOW it is chunked for rendering and what non-markdown
 * furniture rides alongside three of its sections. Every other deliverable
 * keeps the single `renderMarkdownProse(d.body, 'case')` call this file
 * used before this phase — untouched, byte-identical output.
 */

/** Splits a case-study body at its `## ` boundaries. Pure read-time string
 *  slicing — content/deliverables.json's stored body is never mutated. */
function splitBodyIntoSections(body: string): { heading: string; content: string }[] {
  return body
    .split(/\n(?=## )/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = /^## (.+?)\n([\s\S]*)$/.exec(part);
      return m ? { heading: m[1].trim(), content: m[2].trim() } : { heading: '', content: part };
    });
}

/**
 * D6 — "My role"'s three bold leads (**Mine.** / **The agents'.** / **What I
 * check.**) become mono sideheads: a small uppercase label above the
 * paragraph instead of an inline bold run. Zero copy change — the same
 * words, the same paragraph text, run through the SAME parseInline used
 * everywhere else; only the container swaps from an inline <strong> to a
 * standalone label. A paragraph without a bold lead (none currently lack
 * one) falls through to the ordinary treatment rather than silently
 * dropping text.
 */
function renderRoleSection(content: string): ReactNode {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="contents">
      {paragraphs.map((p, i) => {
        const lead = /^\*\*([^*]+)\*\*\s*([\s\S]*)$/.exec(p);
        if (!lead) {
          return (
            <Reveal key={`role-${i}`} as="p" variant="depth" index={i} className={CASE_PROSE_P_CLASS}>
              {parseInline(p)}
            </Reveal>
          );
        }
        return (
          <Reveal key={`role-${i}`} as="div" variant="depth" index={i} className="flex flex-col gap-2">
            <p className="font-mono text-meta tracking-label uppercase text-accent-ink">
              {smartPunctuation(lead[1])}
            </p>
            <p className={CASE_PROSE_P_CLASS}>{parseInline(lead[2])}</p>
          </Reveal>
        );
      })}
    </div>
  );
}

/**
 * D5 — ONE inline SVG for "The approach": a report forks into two
 * independent database write paths (signed / anonymous), both enforced by
 * Postgres Row Level Security. Token-coloured geometry (rounded rects +
 * rules; the two paths take the accent token, everything else neutral ink)
 * — no illustration. aria-hidden: the diagram restates in geometry what the
 * visible figcaption already states in full sentences, so the figcaption —
 * reachable in normal reading order — is the real text alternative, never
 * crammed into an <img alt>.
 */
function FlagstoneApproachDiagram() {
  return (
    <figure className="max-w-measure-wide m-0 flex flex-col gap-4">
      <svg
        viewBox="0 0 560 210"
        width="560"
        height="210"
        aria-hidden="true"
        className="h-auto w-full max-w-[420px]"
      >
        <rect x="190" y="10" width="180" height="44" rx="8" className="fill-none stroke-ink" strokeWidth="1.5" />
        <text x="280" y="37" textAnchor="middle" className="fill-ink font-mono text-[12px]">
          Report submitted
        </text>

        <path d="M280,54 L280,72 L120,72 L120,90" className="fill-none stroke-ink-meta" strokeWidth="1.25" />
        <path d="M280,54 L280,72 L440,72 L440,90" className="fill-none stroke-ink-meta" strokeWidth="1.25" />

        <rect x="30" y="92" width="180" height="44" rx="8" className="fill-accent-ink/[0.08] stroke-accent-ink" strokeWidth="1.5" />
        <text x="120" y="119" textAnchor="middle" className="fill-ink font-mono text-[11px]">
          Signed write path
        </text>

        <rect x="350" y="92" width="180" height="44" rx="8" className="fill-accent-ink/[0.08] stroke-accent-ink" strokeWidth="1.5" />
        <text x="440" y="119" textAnchor="middle" className="fill-ink font-mono text-[11px]">
          Anonymous write path
        </text>

        <path d="M120,136 L120,154 L280,154 L280,172" className="fill-none stroke-ink-meta" strokeWidth="1.25" />
        <path d="M440,136 L440,154 L280,154 L280,172" className="fill-none stroke-ink-meta" strokeWidth="1.25" />

        <rect x="150" y="174" width="260" height="30" rx="6" className="fill-ink/[0.05] stroke-ink" strokeWidth="1.5" />
        <text x="280" y="194" textAnchor="middle" className="fill-ink font-mono text-[11px]">
          Postgres · Row Level Security
        </text>
      </svg>
      <figcaption className="font-sans text-body-sm text-charcoal text-pretty">
        Two write paths, not one path with an <code className={INLINE_CODE_CLASS}>anonymous</code> flag
        on it: a signed-in report and an anonymous report reach Postgres through separate code, and Row
        Level Security enforces both. A flag is a value a later read can forget to check; a second path
        cannot be entered by accident.
      </figcaption>
    </figure>
  );
}

/** Flagstone Version A (owner decision 2026-10-18) — the three proof
 *  subjects, in shot order, for the numbered mono labels above each window.
 *  Presentation copy, not content data: the captions stay in
 *  deliverables.json. The separator is the site's middot, never an em dash
 *  (recruiter-copy-truth bans em dashes on every rendered route). */
const FLAGSTONE_PROOF_SUBJECTS: readonly string[] = [
  'Reporting flow, in motion.',
  'Report a barrier.',
  'Community review.',
];

/** Verified git fact for the three "current" Flagstone captures: they
 *  entered the repository on 2026-09-01 (the two stills in 1cfb4b1, the
 *  clip in a4584fd), outside the capture factory, so the showcase manifest
 *  holds no capture date for them. The provenance line states the
 *  repository date and says the capture date is not recorded; it never
 *  invents one. */
const FLAGSTONE_PROOF_PROVENANCE = { addedDate: '2026-09-01', commit: '1cfb4b1' } as const;

/** Ties D5/D6 to their sections; every section not named below renders
 *  through the ordinary path, chunk-for-chunk equivalent to the single-call
 *  renderer (dropCapEligible keeps the drop cap on the ARTICLE's true
 *  opening paragraph only — see renderMarkdownProse's option doc).
 *
 *  Exported for app/__tests__/flagstone-proof-row.test.tsx only (the page
 *  itself is a heavy async server component; the proof block renders alone). */
export function CaseProof({ d }: { d: Deliverable }) {
  if (!d.shots?.some((shot) => shot.src || shot.video)) return null;
  // W4-04.N3 — a SOLITARY STATIC proof capture (exactly one shot, no video)
  // is the case's only evidence. At lg it spans the full article column
  // (~652px, the --measure-wide band) instead of one ~300px grid track
  // beside an empty partner track, so the 1600x1000 source rewards normal-
  // scale inspection. Gallery exceptions keep their existing presentation:
  // dashboard's pair and ghost-code's portrait video (still-first) retain
  // the two-column / portrait treatments; Flagstone has its own row below.
  const solitaryStatic = d.shots.length === 1 && !d.shots.some((shot) => Boolean(shot.video));
  /* Flagstone Version A (owner decision 2026-10-18) — three equal thin-frame
     windows (17:20, 1px line, 8px radius) in ONE row at lg+: 3 × 340px with
     24px gaps = 1068px, numbered mono labels above, a thin warm caption rule
     below, one provenance line. Below lg the three stack in reading order
     (label → window → caption), capped at 340px wide. The row escapes the
     60ch article measure through the bounded `.proof-breakout` width in
     globals.css (a container-query width, never a negative margin or a vw
     unit), left-aligned to the article's own edge. Window 01 keeps the VE04
     arrival edge and lifecycle exactly (ProofArrival + .proof-arrival-edge);
     its clip is click-to-play (`autoplay: false` in deliverables.json). */
  const isFlagstoneRow = d.id === 'flagstone';
  const ListTag: 'ol' | 'ul' = isFlagstoneRow ? 'ol' : 'ul';
  return (
    <div
      className={cn('my-8 lg:my-12', isFlagstoneRow && 'proof-breakout')}
      aria-label={`${d.title} product evidence`}
    >
      {/* Release 3 contrast (2026-10-19), Flagstone's row only. Rendered
          worst cases over the case-study world: light ink-meta labels and
          provenance 4.47:1, dark ink-muted caption 3.98:1, dark accent-ink
          kicker 4.28:1. Light labels/provenance take ink-muted (≈5.7:1);
          dark caption and kicker take ink (≈6.1–6.5:1). */}
      <p
        className={cn(
          'font-mono text-label tracking-label uppercase text-accent-ink mb-6',
          isFlagstoneRow && 'dark:text-ink',
        )}
      >
        Inside the build
      </p>
      {/* W4-04.VE03 — the solitary proof as one quiet chapter: the label,
          heading and hairline share the figure's column edge, and the rule
          names where the evidence starts (same hairline idiom as the case
          sign-off). DESKTOP ONLY (lg+): phone keeps its exact baseline
          spacing and no rule (R-DS F1). Decorative, so hidden from the a11y
          tree (R-DS F2). Gallery/video sections keep the plain spacing. */}
      <h3
        className={cn(
          'font-serif font-light text-step-2 text-near-black mb-8',
          solitaryStatic && 'lg:mb-6',
        )}
      >
        {d.shots.some((shot) => Boolean(shot.video)) ? 'See it in motion.' : 'A closer look.'}
      </h3>
      {solitaryStatic && <hr aria-hidden="true" className="hidden lg:block w-full border-0 border-t border-border-decorative lg:mb-6" />}
      <ListTag
        className={cn(
          isFlagstoneRow
            ? 'proof-row grid grid-cols-[minmax(0,340px)] gap-x-6 gap-y-10 lg:grid-cols-[repeat(3,minmax(0,340px))]'
            : 'grid grid-cols-1 lg:grid-cols-2 gap-12',
          d.id === 'ghost-code' && 'lg:grid-cols-1',
          solitaryStatic && 'lg:grid-cols-1',
        )}
      >
        {d.shots.map((shot, i) => {
          /* W4-06 VE04/M1 — the one authorized instance: the Flagstone first
             proof. Its generic reveal entrance is disabled (skip → settled at
             once) and only its decorative frame edge carries the one-time
             arrival beat (ProofArrival + .proof-arrival-edge). Every other
             shot keeps the shared reveal verbatim. */
          const isFirstProofArrival = d.id === 'flagstone' && i === 0;
          const windowNumber = String(i + 1).padStart(2, '0');
          const subject = isFlagstoneRow ? FLAGSTONE_PROOF_SUBJECTS[i] : undefined;
          return (
            <Reveal key={shot.alt} index={i} as="li" skip={isFirstProofArrival}>
              <ProofArrival enabled={isFirstProofArrival}>
                <figure
                  className="m-0 flex flex-col gap-3"
                  data-proof-window={isFlagstoneRow ? windowNumber : undefined}
                >
                  {isFlagstoneRow && (
                    <p className="font-mono text-label tracking-label uppercase text-ink-muted dark:text-ink">
                      {windowNumber}
                      {subject && <> · {subject}</>}
                    </p>
                  )}
                  <ShotProductReveal
                    slug={d.id}
                    title={d.title}
                    media={{
                      src: shot.src,
                      alt: shot.caption ? '' : shot.alt,
                      avif: shot.avif,
                      webp: shot.webp,
                      focal: shot.focal,
                      lqip: shot.lqip,
                      video: shot.video,
                      dark: shot.dark,
                      matte: shot.matte,
                      precropped: d.id === 'flagstone' && Boolean(shot.src?.includes('-current.phone')),
                    }}
                    className={cn(
                      'border border-border-decorative',
                      isFlagstoneRow ? 'rounded-md aspect-[17/20]' : 'rounded-lg',
                      d.id === 'ghost-code' && shot.video && 'aspect-[390/844] w-full max-w-[390px] mx-auto',
                      isFirstProofArrival && 'proof-arrival-edge',
                    )}
                  />
                  {shot.caption && (
                    <figcaption
                      className={cn(
                        'font-sans text-body-sm text-charcoal text-pretty',
                        isFlagstoneRow && 'border-t border-accent-ink/35 pt-2.5 dark:text-ink',
                      )}
                    >
                      {smartPunctuation(shot.caption)}
                      {shot.capturedDate && (
                        <span className="mt-1 block font-mono text-meta tracking-label uppercase text-text-meta">
                          captured{' '}<time dateTime={shot.capturedDate}>{shot.capturedDate}</time>
                          {shot.commit && <> · {shot.commit}</>}
                        </span>
                      )}
                    </figcaption>
                  )}
                </figure>
              </ProofArrival>
            </Reveal>
          );
        })}
      </ListTag>
      {isFlagstoneRow && (
        <p className="mt-2 font-mono text-meta tracking-label uppercase text-ink-muted dark:text-ink">
          Current Flagstone build · captures in this repository since{' '}
          <time dateTime={FLAGSTONE_PROOF_PROVENANCE.addedDate}>{FLAGSTONE_PROOF_PROVENANCE.addedDate}</time>
          {' '}(<span className="normal-case">{FLAGSTONE_PROOF_PROVENANCE.commit}</span>) · capture dates not recorded
        </p>
      )}
    </div>
  );
}

function renderFlagstoneBody(d: Deliverable): ReactNode {
  const sections = splitBodyIntoSections(d.body!);
  return sections.map((s, i) => {
    if (s.heading === 'My role') {
      return (
        <div key={s.heading} className="contents">
          {renderMarkdownProse(`## ${s.heading}`, 'case')}
          {renderRoleSection(s.content)}
        </div>
      );
    }
    if (s.heading === 'The approach') {
      const [opening, ...remaining] = s.content.split(/\n{2,}/);
      return (
        <div key={s.heading} className="contents">
          {renderMarkdownProse(`## ${s.heading}\n\n${opening}`, 'case')}
          <CaseProof d={d} />
          {renderMarkdownProse(remaining.join('\n\n'), 'case', { dropCapEligible: false })}
          <FlagstoneApproachDiagram />
        </div>
      );
    }
    const blocks = renderMarkdownProse(`## ${s.heading}\n\n${s.content}`, 'case', {
      dropCapEligible: i === 0,
    });
    return (
      <div key={s.heading} className="contents">
        {blocks}
      </div>
    );
  });
}

/** `proof: false` (Release 5, 2026-10-20) renders every section through the
 *  ordinary path: the four showcase case studies exhibit their captures in
 *  the CaseShowcase chapter between the title band and the essay, so the
 *  in-essay CaseProof block would show the same evidence twice. Flagstone
 *  and any deliverable without a showcase spec keep the proof block here. */
function renderCaseBody(d: Deliverable, { proof = true }: { proof?: boolean } = {}): ReactNode {
  const proofSection = d.id === 'dashboard' ? 'What shipped' : 'The approach';
  return splitBodyIntoSections(d.body!).map((s, i) => {
    if (!proof || s.heading !== proofSection) {
      return <div key={s.heading} className="contents">{renderMarkdownProse(`## ${s.heading}\n\n${s.content}`, 'case', { dropCapEligible: i === 0 })}</div>;
    }
    const [opening, ...remaining] = s.content.split(/\n{2,}/);
    return (
      <div key={s.heading} className="contents">
        {renderMarkdownProse(`## ${s.heading}\n\n${opening}`, 'case', { dropCapEligible: i === 0 })}
        <CaseProof d={d} />
        {remaining.length > 0 && renderMarkdownProse(remaining.join('\n\n'), 'case', { dropCapEligible: false })}
      </div>
    );
  });
}

/**
 * D3 — the case-study sign-off (FT-7), extracted so it can render in either
 * of two positions: right after the essay (every deliverable but Flagstone,
 * unchanged from before this phase) or after the Receipt (Flagstone — D3
 * moves the page's hardest number before the reader is shown the door).
 * Markup/copy byte-identical to what this file rendered inline before.
 */
function CaseStudySignOff() {
  return (
    <Reveal variant="depth" className="max-w-measure-wide mt-16 lg:mt-20 flex flex-col gap-5">
      <hr className="w-full border-0 border-t border-border-decorative" />
      <p className="font-mono text-meta tracking-label uppercase text-text-meta">
        Skyler Halisky · Okanagan Valley, British{' '}Columbia
      </p>
      <Link
        href="/about/"
        className="link-draw self-start font-sans text-body-sm text-near-black [@media(hover:hover)]:hover:text-accent-text transition-colors duration-fast ease-out"
      >
        A Brief Account
        <span aria-hidden="true"> →</span>
      </Link>
    </Reveal>
  );
}

/**
 * Static export needs every dynamic route enumerated at build time.
 * `output: 'export'` + `generateStaticParams` = each slug becomes its own
 * /work/<slug>/index.html on disk.
 */
export function generateStaticParams(): RouteParams[] {
  return getDeliverables().map((d) => ({ slug: d.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = getDeliverables().find((x) => x.id === slug);
  if (!d) {
    return { title: 'Work: not found' };
  }
  return {
    // L1-03: the browser-tab title adopts the identity string this page's own
    // og:title already carries (below) — signed tabs, not anonymous inventory
    // labels, on the exact pages recruiters get deep-linked to.
    title: `${d.title}: Skyler Halisky`,
    description: d.summary,
    alternates: {
      canonical: canonicalFor(`/work/${slug}/`),
    },
    openGraph: {
      type: 'article',
      // W0-04: Next.js shallow-merges openGraph per top-level key, so this leaf
      // route's object REPLACES the root layout's openGraph wholesale — url,
      // siteName and locale must be restated here or they silently drop from
      // every /work/* share. url is the route's OWN (resolved against
      // metadataBase), never the root's homepage url.
      url: `/work/${slug}/`,
      siteName: 'Skyler Halisky: Senior Technical Support',
      locale: 'en_CA',
      title: `${d.title}: Skyler Halisky`,
      description: d.summary,
      // FT-1/W0-01/02: the share unfurl deposits the WORK, resolved absolute via
      // metadataBase. Precedence (showcase/theme-sync): the dedicated ogCard —
      // a 1200×630 JPG cut from the DARK master (W0-05: dark survives white
      // LinkedIn feeds; unfurl fetchers are format-conservative, so never the
      // on-site WebP/AVIF pair) — then the legacy card raster, then the global
      // plate. alt stays d.title, which the real artifact makes true.
      images: [
        d.ogCard
          ? { url: d.ogCard, width: 1200, height: 630, alt: d.title }
          : d.cardImage?.src
            ? { url: d.cardImage.src, width: d.cardImage.width, height: d.cardImage.height, alt: d.title }
            : { ...OG_CARD, alt: d.title },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${d.title}: Skyler Halisky`,
      description: d.summary,
    },
  };
}

/**
 * /work/[slug] — F-05. Editorial deliverable detail.
 *
 * Server Component. Layout: title → hero image → metadata below lg (L5-01
 * proof-first order; the metadata scan is a 2-column ledger in the md band,
 * L5-03), image left + sticky / details right at lg. Sections per spec:
 *   1. Back-link "← All work"
 *   2. Hero image / cream-tinted fallback
 *   3. Title + summary + role/year + tech pills (left), links list (right)
 *   4. Optional Gallery (if `gallery` array non-empty)
 *   5. mailto CTA at bottom
 *
 * Per Alex §4.5, external links open in new tab with rel="noopener noreferrer"
 * AND an sr-only "(opens in new tab)" cue.
 */
export default async function WorkDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const allDeliverables = getDeliverables();
  const deliverable = allDeliverables.find((d) => d.id === slug);
  if (!deliverable) {
    notFound();
  }
  const d = deliverable;
  // "Other work" — the two catalogue neighbours, WRAPPING, so every study hands
  // off to a different pair and all six deliverables are recommended somewhere.
  // Still no algorithm — just neighbours, now actually circulating.
  const n = allDeliverables.length;
  const selfIndex = allDeliverables.findIndex((x) => x.id === d.id);
  const others =
    n > 1
      ? [allDeliverables[(selfIndex + 1) % n], allDeliverables[(selfIndex + 2) % n]].filter(
          (x, i, arr) => x.id !== d.id && arr.findIndex((y) => y.id === x.id) === i,
        )
      : [];
  // Hero well aspect is data-known at build: portrait 4/5 suits phone media
  // and the designed empty states; landscape REAL shots (window/plate frames)
  // were letterboxing in it — they get a 4/3 well so the screenshot presents
  // at its proper scale. Static class either way → zero CLS.
  const media = heroMedia(d);
  const wideHero = Boolean(media.src) && frameForSlug(d.id) !== 'phone';
  // L3-04(b): the strongest proof — "click the live thing" — is promoted out of
  // the below-fold LINKS list into a primary pill in the hero details column. The
  // remaining links (GitHub, write-ups) keep the list; the demo no longer doubles.
  const demoLink = d.links?.find((l) => l.type === 'demo');
  // P1.A (2026-09-17): 'appstore' joins 'demo' as a PROMOTED link. Flagstone
  // shipped on 2026-09-15, and the shipped binary is at least as strong a proof
  // as the running web build, so it sits beside it rather than in the below-fold
  // Links list. Excluded from `otherLinks` for the same reason 'demo' is: a
  // promoted link that also stayed in the list would render twice.
  const appStoreLink = d.links?.find((l) => l.type === 'appstore');
  const otherLinks =
    d.links?.filter((l) => l.type !== 'demo' && l.type !== 'appstore') ?? [];
  // L7-02 / C-03: preload the case-study hero's AVIF (its LCP element) as a JSX
  // <link> hoisted into THIS page's <head> — NOT via ReactDOM.preload(). The
  // imperative preload is emitted as an RSC flight hint Next applies even when the
  // route is only PREFETCHED, so hovering/viewporting the home grid injected all
  // six work heroes at fetchpriority=high into the home (and every other) route's
  // head — stealing bandwidth from that page's own LCP (the C-03 spillover). A
  // rendered <link> only lands in the head when this route actually renders, so
  // "featured opens warm" survives (in the built page AND on real navigation)
  // without the cross-route leak. heroPreloadLink returns null unless an optimized
  // sibling is declared, so a placeholder-only or raw-PNG hero is never preloaded.
  // Themed heroes (showcase/theme-sync) swap the static link for a tiny inline
  // script that preloads ONLY the active theme's variant — the theme-blind link
  // would waste the wrong AVIF for half the visitors. Single-theme heroes keep
  // the exact link below, byte-identically.
  const themedPreloads = heroPreloadLinks(d);
  const heroPreload = themedPreloads ? null : heroPreloadLink(d);

  /* Release 5 project showcases (2026-10-20) — prompt-library, claude-corp,
     ghost-code and dashboard carry a presentation spec (lib/caseShowcase.ts)
     that mounts the CaseShowcase evidence chapter between the title band and
     the essay and retires the in-essay CaseProof block for those four routes.
     Flagstone and every deliverable without a spec render byte-identically. */
  const showcase = caseShowcaseFor(d.id);
  /* The showcase hero (ghost-code, dashboard): the first impression is a
     desktop screen, so the well spans the content column at the capture's
     own aspect under a compact title block, with the phone-composed capture
     standing in below md and the metadata ledger laid out beneath the well.
     Every other route keeps the shared two-column hero. */
  const showcaseHero = showcase?.hero;

  /* Flagstone first proof (2026-10-19) — the phone hero is a capture-fitted
     exhibit. A previous mobile audit measured the real Explore screenshot at
     ~156px wide inside the 329px figure at 393 (the 9/19 frame took 90% of a
     4/5 well's height, so the phone was 53% of the column and letterboxed its
     19.5:9 capture by 3–6px top and bottom). Three treatments were rendered on
     the real page (qa-reports/flagstone-first-proof-20261019/): a ~200px, a
     ~220px and a ~240px screenshot. 220 was selected — the card, photo, button
     and nav read as components while the golden-hour stage still breathes;
     240 crowded the well for a marginal gain. Mechanism, Flagstone only:
       • frameWidth sizes the device frame by WIDTH (72% of the well below sm,
         today's 53% proportion from sm, 58% from lg) and its screen holds the
         capture's own 1290×2803 aspect, so the frame's height follows the
         image and nothing letterboxes (ProductReveal `frameWidth`).
       • the well reserves the height that frame needs: 5/8 below sm (526px at
         393, +115px over the old 4/5 well), the unchanged 4/5 from sm, and 3/4
         from lg, where the details column is taller anyway so the page gains
         no height. Static classes → zero CLS, as before.
     Every other deliverable keeps the shared placement byte-identically. */
  const stoneExhibit = d.id === 'flagstone';
  const heroWell = (
    <HeroImageSettle
      className={cn(
        'group relative w-full bg-gradient-to-br from-earth to-earth-deep border border-border-decorative overflow-hidden flex items-center justify-center',
        // Grid-item order (L5-01) only when the well IS the grid item. Inside
        // the plate's <figure> the figure carries order-2 and the well must
        // keep DOM order, or flex `order` would seat it below its caption.
        !d.heroPlate && 'order-2 lg:order-none',
        'shadow-[inset_0_-34px_50px_-38px_rgba(60,32,18,0.32)]',
        d.id !== 'flagstone' && 'lg:sticky lg:top-24',
        wideHero
          ? showcaseHero
            ? 'aspect-[5/8] sm:aspect-[4/5] md:aspect-[16/10]'
            : 'aspect-[4/3]'
          : stoneExhibit ? 'aspect-[5/8] sm:aspect-[4/5] lg:aspect-[3/4]' : 'aspect-[4/5]',
        // Keep the in-flow well as the absolute layers' containing block.
        // A static well depended on the entrance transform for containment,
        // so reduced motion let the capture escape over the title and action.
        showcaseHero && 'lg:relative lg:top-auto lg:order-2',
      )}
    >
      {/* S15: the plinth glow pool — the project's signature hue pooling
          under the framed product so the travelling well reads lit, not
          stranded. Decorative, absolute (zero CLS), rides with the well. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={
          {
            '--pr-sig': signatureFor(d.id),
            background:
              'radial-gradient(58% 52% at 50% 56%, rgb(var(--pr-sig) / 0.22), rgb(var(--pr-sig) / 0.07) 58%, transparent 78%)',
          } as CSSProperties
        }
      />
      {/* Selected artwork or an authentic hero screenshot occupies the
          same reserved frame. The visible label distinguishes artwork
          from the retained product captures. */}
      {showcaseHero ? (
        <ShowcaseHeroMedia slug={d.id} hero={showcaseHero} />
      ) : (
        <HeroProductReveal
          slug={d.id}
          title={d.title}
          eyebrow={d.role}
          media={media}
          liftClassName={d.id === 'flagstone' ? 'pr-stone-settle' : undefined}
          frameWidth={stoneExhibit ? 'w-[72%] sm:w-[53%] lg:w-[58%]' : undefined}
        />
      )}
      {d.heroArtwork && (
        <span className="absolute right-2 top-2 z-20 rounded border border-[#C8C8B8] bg-[#FAF8F1] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#20302C] dark:border-[#708175] dark:bg-[#202925] dark:text-[#ECEAE0]">
          {d.heroArtwork.label}
        </span>
      )}
    </HeroImageSettle>
  );

  return (
    <>
      {/* Cook Out P8 (final acceptance): this inline JSON-LD script is
          deliberately the segment's FIRST rendered node. Next's post-navigation
          scroll handler (layout-router handlePotentialScroll) starts at the
          segment's first DOM node and walks nextElementSibling until it finds a
          visible box before scrolling to top. React 19 hoists the preload
          <link> below into <head>, so with the link first the walk ran through
          head-only siblings, hit null, and gave up: every arrival at
          /work/flagstone/ from a scrolled page kept the old offset (reproduced
          at 375, 768 and 1440, both themes, reduced motion, no view
          transitions). The four themed routes never showed it because their
          ThemedHeroPreload is a body-level <script>. A body script is skipped
          as a zero-rect node and its next sibling is the first section, so the
          handler scrolls. Order-only change; the head output is identical.
          Guarded by lib/__tests__/case-study-arrival-top.test.ts. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: d.title,
            description: d.summary,
            url: `https://skypistudio.com/work/${d.id}/`,
            author: {
              '@type': 'Person',
              name: 'Skyler Halisky',
              url: 'https://skypistudio.com',
            },
          }),
        }}
      />
      {themedPreloads && <ThemedHeroPreload links={themedPreloads} />}
      {heroPreload && (
        <link
          rel="preload"
          as={heroPreload.as}
          href={heroPreload.href}
          type={heroPreload.type}
          fetchPriority={heroPreload.fetchPriority}
        />
      )}
      {/* Main content — breadcrumb leads (404 model), then hero + details.
          Cycle 19 breadcrumb 'The Work / <Title>': only 'The Work' links; the
          current slug is plain text (aria-current). Relocated INTO the content
          section (Z6b/HI-2, mirroring app/not-found.tsx) so the page's NAME leads
          instead of a full empty breadcrumb section pushing the hero below the
          fold. Grammar + aria byte-identical to the prior standalone section. */}
      <section className="px-gutter py-16 md:py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <nav aria-label="Breadcrumb" className="mb-8 md:mb-12">
            <ol className="flex items-center gap-2 font-mono text-meta tracking-label uppercase text-text-meta">
              <li className="shrink-0">
                <Link
                  href="/work/"
                  className="link-draw inline-block text-text-meta [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:inline-flex [@media(pointer:coarse)]:items-center"
                >
                  The Work
                </Link>
              </li>
              {/* C-61: text-stone computes ~1:1 on the dark world-surface — the
                  crumb lost its path between two floating labels. Lift to
                  stone-strong in dark for the same faint-hairline the light theme
                  keeps (decorative parity, not an a11y gate). */}
              <li aria-hidden="true" className="shrink-0 text-stone dark:text-stone-strong">
                {'/'}
              </li>
              <li aria-current="page" className="text-near-black truncate min-w-0 max-w-[240px] lg:max-w-[420px] xl:max-w-[560px]">
                {d.title}
              </li>
            </ol>
          </nav>
          {/* The exhibit grid. When a deliverable carries a heroPlate (today:
              Flagstone) the well and its museum plate render as ONE <figure>
              below, so the plate is the figure's <figcaption> for assistive
              tech and sits a fixed gap under the frame at every width. That
              retires UP-31's `lg:grid-rows-[auto_1fr]` + `lg:row-span-2`
              machinery (ui-polish 2026-08-01), which existed only to seat a
              plate that was a SEPARATE grid item: CSS Grid §12.5 would size row
              1 by the tall details column and hang the plate 186.50px low. The
              figure is auto-placed into col 1 exactly like the bare well was,
              so the other five deliverables emit a byte-identical grid. */}
          <div
            className={cn(
              'grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-50 items-start',
              showcaseHero && 'lg:grid-cols-1 lg:gap-x-0 lg:gap-y-10',
            )}
          >
            {/* L5-01: hero image well. On phones + tablets it rides BETWEEN the
                title block and the metadata block (order-2) so proof crests the
                first thumb-flick; at lg it returns to the left column. The
                reserved-aspect class + mount settle stay owned by HeroImageSettle
                → zero CLS. The well's JSX is `heroWell` (built above the return,
                beside the media it renders) so it can sit inside the plate's
                figure or stand alone without being written twice.
                L2-03/S15: at lg the STICKY lives here for the other case studies.
                Flagstone is intentionally normal-flow: its phone well staying
                pinned while the title and metadata moved made the hero read as
                two disconnected scroll planes. */}
            {d.heroPlate ? (
              /* FT-3/FT-10 — the museum plate, now the figure's own caption. A
                 static mono-meta plate directly beneath the hero well (NOT inside
                 the aspect box). Mono register, NEVER quotation-styled (the one
                 pull-quote per essay lives in Reflection). It seats the
                 artifact's own severity ledger line at reading size and names the
                 place she mapped (the SR-only provenance the raster bakes in
                 illegibly). SSR'd static → CLS 0.
                 Flagstone first proof (2026-10-19): below lg the plate sits 28px
                 (gap-7) under the frame so the caption reads as the figure's own
                 label rather than the next stacked block (the 48px grid gap had
                 left it equidistant from the frame and from the metadata
                 hairline); at lg the gap stays the grid's 48px (gap-12), the
                 measured UP-31 position, so the desktop composition is unchanged.
                 R4/BP4: the plate borrows the room's own light — --pr-sig scopes
                 the dark-only hairline warmth (pr-plate-lit) inside Plate, the
                 same component the homepage Flagship Room renders (app/page.tsx),
                 so the two stay word-identical by construction. */
              <figure className="order-2 lg:order-none m-0 flex flex-col gap-7 lg:gap-12">
                {heroWell}
                <Plate
                  as="figcaption"
                  claim={d.heroPlate.severity}
                  caption={d.heroPlate.caption}
                  placeDate={d.heroPlate.provenance}
                  sig={signatureFor(d.id)}
                />
              </figure>
            ) : (
              heroWell
            )}
            {showcaseHero && <ShowcaseHeroCaption hero={showcaseHero} className="order-2 -mt-6 lg:order-2" />}

            {/* Details — the right column at lg (sticky moved onto the media
                well, L2-03/S15: the TALLER column scrolls free; a sticky here
                could never engage). Below lg the wrapper is display:contents,
                so the title block (order-1) and metadata block (order-3) become
                siblings of the figure/well (order-2) and reorder around it:
                title leads, proof crests the fold, metadata follows (L5-01).
                This column no longer spans two grid rows (UP-31): the plate is
                inside the figure, so a single row is sized by this column and
                the figure simply sits at the top of col 1 (items-start) — the
                same positions as before, with one grid row instead of two. */}
            <div className={showcaseHero ? 'contents' : 'contents lg:flex lg:flex-col lg:gap-12'}>
              {/* Title block — leads on every viewport. Mobile air steps down
                  (L5-04): gap-6 → md:gap-8 → lg:gap-12 (desktop unchanged).
                  Release 5 showcase hero: at lg the block is a twelve-column
                  grid, identity (kicker, title, summary) on seven columns and
                  the actions (hero caption, pills) on five, seated to the
                  same baseline, so the well can start inside the first fold. */}
              <div
                className={
                  showcaseHero
                    ? 'flex flex-col gap-6 md:gap-8 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-12 lg:gap-y-0 order-1'
                    : 'flex flex-col gap-6 md:gap-8 lg:gap-12 order-1 lg:order-none'
                }
              >
                <div className={showcaseHero ? 'contents lg:col-span-7 lg:flex lg:flex-col lg:gap-8' : 'contents'}>
                {/* FEATURED + role share ONE line at base (L5-04's two-chip void).
                    UP-32 (ui-polish 2026-08-01) extends that to EVERY width by
                    dropping the `lg:contents` this line used to carry, which had
                    left desktop stacking two lone kickers 48px apart above the
                    title. That token was a BLAST-RADIUS device, not a design
                    ruling: P2-B's own result records it as "`lg:contents` keeps
                    desktop 1440 byte-identical" and "the `lg:contents`
                    restructure holds desktop by construction", and P3 repeats
                    "preserved by construction (class move, never re-parent)".
                    L5-04 itself measured 375 only and named this exact remedy —
                    "letting the two chips share a line".
                    NO interpunct separator: both kickers already carry their own
                    coloured dot (and below md the byline chip joins them on this
                    same row), so a "·" would add a third mark in a third hue.
                    The dots are untouched — DECISIONS §P P4-UP-27-DOTS is an OPEN
                    Sky fork about the dot logic on this exact page.
                    Renders two kickers on flagstone ONLY (schema: exactly one
                    `featured`); the other five slugs have a single visible child
                    here at lg, where contents-vs-flex is a measured no-op. */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {d.featured && (
                    <p className="font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-block w-2 h-2 rounded-full bg-terracotta"
                      />
                      Featured
                    </p>
                  )}

                  {/* §5.4 — per-project signature: the role opens with its own
                      --pr-sig hue. Only the decorative dot takes the color. */}
                  <p
                    className="font-mono text-meta tracking-label uppercase text-accent-ink inline-flex items-center gap-2"
                    style={{ '--pr-sig': signatureFor(d.id) } as CSSProperties}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: 'rgb(var(--pr-sig))' }}
                    />
                    {d.role}
                  </p>

                  {/* FT-2/W3-02: below md the page is otherwise nameless until
                      the footer wordmark far down the scroll — sign the arrival
                      with a byline chip so the 375 stranger meets WHO in first
                      paint. Scoped md:hidden: the sidebar rail signs from md=768
                      up, so this shows ONLY on the <768 stranger view; the wrapper
                      is lg:contents, so the chip carries its OWN md:hidden. Static
                      (above HeroTitleSettle) — HeroSettle stays 2 animated
                      elements. The terracotta sun-dot is the Footer author mark. */}
                  <p className="md:hidden font-mono text-meta tracking-label uppercase text-text-meta inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta"
                    />
                    Skyler Halisky
                  </p>
                </div>

                {/* HeroTitleSettle: carves in after the image (delay 150ms),
                    tightening letter-spacing from 0.12em to -0.02em. */}
                <HeroTitleSettle
                  className={cn(
                    'font-serif font-light text-display ember text-balance',
                    d.id === 'flagstone' && 'leading-[1.15]',
                  )}
                >
                  {d.title}
                </HeroTitleSettle>

                <p className="font-sans font-light text-step-1 text-charcoal text-pretty">
                  {d.summary}
                </p>
                </div>

                <div className={showcaseHero ? 'contents lg:col-span-5 lg:flex lg:flex-col lg:items-start lg:gap-8 lg:pb-1' : 'contents'}>
                {d.heroCaption && (
                  <div className="border-l-2 border-terracotta pl-4 flex flex-col gap-1" aria-label="Hero caption">
                    <p className="font-mono text-meta tracking-label uppercase text-accent-ink">{d.heroCaption.eyebrow}</p>
                    <p className="font-sans text-body-sm text-charcoal">{d.heroCaption.line}</p>
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta">{d.heroCaption.currency}</p>
                  </div>
                )}

                {/* L3-04(b): live-demo pill — sits with the claim it proves.
                    P1.A: the App Store pill joins it as a peer when the
                    deliverable has one.

                    MEASURED, so nobody re-derives it: the pair STACKS at every
                    current breakpoint, and that is the details column's measure
                    talking, not a missing class. Button is `w-full md:w-auto`,
                    so below md both go full-width (equal, aligned, no two-up
                    squeeze at 320/375/393). From md up they are auto-width at
                    169px and 290.8px, needing 475.9px with the 16px gap — and
                    this column is 424px at 768, 240px at 1024, 368px at 1280,
                    448px at 1440 and 460px at 1920. It is never wide enough, so
                    `flex-wrap` resolves them to a stack. The row classes are
                    kept deliberately: they are what should happen if the label
                    or the measure ever changes, and they cost nothing today.
                    Do NOT "fix" the stack by shortening the label (pinned by
                    lib/__tests__/recruiter-copy-truth.test.ts) or by trimming
                    Button's padding (that is a redesign of every pill on the
                    site to win one row here).

                    Both use variant="primary": `ghost` exists in Button but is
                    used nowhere on the site, so reaching for it here would be
                    inventing a second weight class, not adding a link. */}
                {(demoLink || appStoreLink) && (
                  <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                    {demoLink && (
                      <Button
                        href={demoLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="primary"
                        aria-label={`${demoLink.label} for ${d.title} (opens in new tab)`}
                        /* Astra Ultra 01: the destination labels ("Read system
                           overview") are longer than "Live demo", and where the
                           details column is narrow (1024, phones) the label
                           wraps to two lines. Flex then squeezed the signature
                           dot (8px rest measured 6.98px). Holding the dot at
                           its own size keeps rest 8 / hover 10 / press 6
                           exactly as Button defines them. Layout only; Button
                           itself is untouched. */
                        className="[&>.rounded-full]:shrink-0"
                      >
                        {demoLink.label}
                        <span aria-hidden="true" className="ml-1">{'↗'}</span>
                      </Button>
                    )}
                    {appStoreLink && (
                      <Button
                        href={appStoreLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="primary"
                        aria-label={`${appStoreLink.label} for ${d.title} (opens in new tab)`}
                      >
                        {appStoreLink.label}
                        <span aria-hidden="true" className="ml-1">{'↗'}</span>
                      </Button>
                    )}
                  </div>
                )}
                </div>
              </div>

              {/* Metadata block — role/year, tech, links, tags. Follows the proof
                  on mobile (order-3); rejoins the details column at lg.
                  L5-03: the md band sets the scan as a designed 2-column ledger
                  (Role/Year spanning · Tech | Links · Tags spanning) instead of
                  the inherited single phone stack. */}
              <div
                className={cn(
                  'flex flex-col gap-12 order-3 lg:order-none md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:gap-8',
                  // Release 5 showcase hero: one ledger row under the well at lg.
                  showcaseHero && 'lg:order-3 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-0',
                )}
              >
                {/* Role / Year */}
                <dl className={cn('grid grid-cols-2 gap-8 border-t border-border-decorative pt-8 md:max-lg:col-span-2', showcaseHero && 'lg:col-span-5')}>
                  {/* Status leads the ledger (truth pass 2026-08-21) and spans
                      both columns. It is not a third peer of Role/Year: it is
                      the one line that tells a reader whether this thing has
                      users, and until it existed the page let them assume. It
                      is deliberately NOT in the kicker row above — that row's
                      own comment records an OPEN Sky fork on its dot logic
                      (DECISIONS §P P4-UP-27-DOTS) and already warns against a
                      third mark in a third hue. */}
                  <div className="col-span-2">
                    <dt className="font-mono text-meta tracking-label uppercase text-text-meta mb-1">
                      Status
                    </dt>
                    <dd className="font-sans text-body text-near-black">
                      {d.status}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-meta tracking-label uppercase text-text-meta mb-1">
                      Role
                    </dt>
                    <dd className="font-sans text-body text-near-black">
                      {d.role}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-meta tracking-label uppercase text-text-meta mb-1">
                      Year
                    </dt>
                    <dd className="font-sans text-body text-near-black">
                      {d.year}
                    </dd>
                  </div>
                </dl>

                {/* Tech pills — C-52: some deliverables carry no non-demo link,
                    so at 768 Tech otherwise sits in a half-column beside empty
                    air. When there are no other links, span both ledger columns
                    so the row reads as intended. (Was "dashboard is the only
                    one"; claude-corp joined it in the truth pass 2026-08-21,
                    when its "GitHub" link — which pointed at the marketing site
                    the Live demo link already covers — was removed. The
                    behaviour is data-driven, so it needed no code change; the
                    comment did.) */}
                <div
                  className={cn(
                    otherLinks.length === 0 && 'md:max-lg:col-span-2',
                    showcaseHero && 'lg:col-span-3 lg:border-t lg:border-border-decorative lg:pt-8',
                  )}
                >
                  <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
                    Tech
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {d.tech.map((t) => (
                      <li key={t}>
                        <TagPill>{t}</TagPill>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Links list — the demo is promoted to the pill above (L3-04),
                    so only the remaining links (GitHub, write-ups) show here.
                    In the md ledger it sits beside Tech, hairline dropped so the
                    two column tops align. */}
                {otherLinks.length > 0 && (
                  <div className={cn('border-t border-border-decorative pt-8 md:max-lg:border-t-0 md:max-lg:pt-0', showcaseHero && 'lg:col-span-2')}>
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
                      Links
                    </p>
                    <ul className="flex flex-col gap-2">
                      {otherLinks.map((l, i) => (
                        <Reveal key={l.href} as="li" index={i}>
                          {/* K6 (THE ROOM Phase J) — `inline-flex` never wraps
                              (flex-wrap's initial value is nowrap) and an
                              inline-level box is sized by its content, not by
                              its parent, so a long label + the ↗ laid out as one
                              unbreakable line. Measured: "Real commits
                              (AccessMap) ↗" was 280px at 100% (fits 375) and
                              345px at 200%, running 34.4px past the viewport
                              where `overflow-x: clip` cut the arrow off
                              entirely. `max-w-full` constrains it to the row so
                              the label wraps normally; `flex-wrap` keeps the
                              arrow from being orphaned onto a line of its own.
                              Zero effect at any width where the link already
                              fits — which is every width at 100% text. */}
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group link-draw font-sans text-body text-accent-text inline-flex flex-wrap items-center gap-2 max-w-full"
                          >
                            {/* C-17/W5-03: the mono type-eyebrow adds info only
                                when the category differs from the name — for
                                github (type "github" == label "GitHub") it just
                                stutters "GITHUB GitHub". Suppress it when they
                                match; aria-hidden otherwise so AT hears the label
                                once (the category is decoration). */}
                            {l.type.toLowerCase() !== l.label.toLowerCase() && (
                              <span
                                aria-hidden="true"
                                className="font-mono text-meta tracking-label uppercase text-text-meta mr-2"
                              >
                                {l.type}
                              </span>
                            )}
                            <span>{l.label}</span>
                            <span
                              aria-hidden="true"
                              className="inline-block transition-transform duration-base ease-gh-glide [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:-translate-y-0.5"
                            >
                              {'↗'}
                            </span>
                            <span className="sr-only">(opens in new tab)</span>
                          </a>
                        </Reveal>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {d.tags.length > 0 && (
                  <div className={cn('border-t border-border-decorative pt-8 md:max-lg:col-span-2', showcaseHero && 'lg:col-span-2')}>
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
                      Tags
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {d.tags.map((tag) => (
                        <li key={tag}>
                          <TagPill>{tag}</TagPill>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Release 5 (2026-10-20): the evidence chapter, the four showcase
          routes only — see lib/caseShowcase.ts. */}
      {showcase && <CaseShowcase d={d} spec={showcase} />}

      {/* Case study body — rendered only when body content exists */}
      {d.body && (
        <section className="px-gutter py-24 lg:py-32 world-surface-alt border-t border-border-decorative relative overflow-hidden">
          {/* Golden-hour scroll-depth behind the case-study prose */}
          <ParallaxWash depth="far" />
          {/* Flagstone Version A: the content column is the inline-size
              container the proof row's bounded breakout measures against
              (`.proof-breakout-root` / `.proof-breakout`, globals.css). */}
          <div className={cn('relative z-10 max-w-content mx-auto', d.id === 'flagstone' && 'proof-breakout-root')}>
            {/* Each block self-reveals in reading order (carve on H2s, depth on
                prose) — see renderMarkdown — so the body has internal cinematic
                choreography instead of one undifferentiated fade. */}
            <article
              aria-label={`${d.title} case study`}
              className={cn(
                'max-w-measure-wide flex flex-col gap-8',
                d.id === 'flagstone' && 'tablet-prose-measure',
              )}
            >
              {d.id === 'flagstone' ? renderFlagstoneBody(d) : renderCaseBody(d, { proof: !showcase })}
            </article>

            {/* FT-7 — close the essay like an essay. A designed sign-off (never
                content markdown) matched to the essay measure: a hairline, then
                the author + place (unified to the footer's "British Columbia"
                idiom, not "BC"), and exactly ONE internal route — the real footer
                label — closing the long person-route gap at the conviction peak.
                No bio sentence, no availability signal. Reveal holds DOM space by
                opacity (RM / no-JS → full presence) → CLS 0. */}
            {d.id !== 'flagstone' && (
            <Reveal
              variant="depth"
              className="max-w-measure-wide mt-16 lg:mt-20 flex flex-col gap-5"
            >
              <hr className="w-full border-0 border-t border-border-decorative" />
              <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                Skyler Halisky · Okanagan Valley, British{' '}Columbia
              </p>
              <Link
                href="/about/"
                className="link-draw self-start font-sans text-body-sm text-near-black [@media(hover:hover)]:hover:text-accent-text transition-colors duration-fast ease-out"
              >
                A Brief Account
                <span aria-hidden="true"> →</span>
              </Link>
            </Reveal>
            )}
          </div>
        </section>
      )}

      {/* T7 / SK-01: the receipt door — one tap from the homepage chip's headline
          number to its proof, on the chip's own destination. Reconciled
          2026-08-16: the exact count and the command that reproduces it (see
          FlagstoneTestReceipt). Flagstone-only.
          D3/Phase D: the sign-off now follows it (proof before farewell) — same
          markup as every other deliverable keeps right after its essay, just
          the later of its two possible positions. */}
      {d.id === 'flagstone' && (
        <>
          <FlagstoneTestReceipt />
          <section className="px-gutter py-12 lg:py-16 world-surface border-t border-border-decorative">
            <div className="max-w-content mx-auto">
              <CaseStudySignOff />
            </div>
          </section>
        </>
      )}

      {/* Optional gallery */}
      {d.gallery && d.gallery.length > 0 && (
        <section className="relative overflow-hidden px-gutter py-24 lg:py-32 world-surface border-t border-border-decorative">
          {/* golden-hour light continuity (wow 2026-06-04) — the gallery sits in
              the same warm field as the case-study body above it. RM → static. */}
          <ParallaxWash depth="far" />
          <div className="relative z-10 max-w-content mx-auto">
            <Reveal variant="scene">
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                Gallery
              </p>
              <h2 className="font-serif font-light text-step-4 text-near-black mb-24 max-w-measure-heading leading-heading text-balance">
                A closer look.
              </h2>
            </Reveal>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
              {d.gallery.map((img, i) => (
                <Reveal key={img.src} index={i} as="li" className="flex flex-col gap-3">
                  <div className="group relative w-full aspect-[4/3] bg-gradient-to-br from-earth to-earth-deep border border-border-decorative overflow-hidden flex items-center justify-center shadow-[inset_0_-34px_50px_-38px_rgba(60,32,18,0.32)]">
                    {/* Warm top-light — single source from above (lit-well depth) */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_85%_at_50%_-15%,rgba(255,241,217,0.46),transparent_62%)] dark:bg-[radial-gradient(125%_85%_at_50%_-15%,rgba(255,221,176,0.10),transparent_62%)]"
                    />
                    {/* Alex F-C4-3: explicit dimensions for the 4:3 gallery. */}
                    {/* tactile-pass: leans in on hover + drifts gently on scroll */}
                    <TactileMedia src={img.src} alt={img.alt} width={800} height={600} />
                    {/* Cycle 26: gallery placeholder. Tighter overlay (no
                        eyebrow) since the caption below carries context. */}
                    <span
                      aria-hidden="true"
                      className="font-serif font-light text-step-1 text-umber px-4 text-center"
                    >
                      {d.title}
                    </span>
                  </div>
                  {img.caption && (
                    <p className="font-sans text-body-sm text-charcoal">
                      {smartPunctuation(img.caption)}
                    </p>
                  )}
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Contact invitation before the final related-project cards */}
      <section
        className={cn(
          'relative overflow-hidden',
          'px-gutter py-24 lg:py-32',
          'world-surface border-t border-border-decorative',
        )}
      >
        {/* ambient golden-hour drift echo (wow 2026-06-04, C5) — the homepage
            contact's "sun at rest" recurs on every CTA entry, so the invitation
            reads warm everywhere. CSS/compositor-only; static under reduced motion. */}
        <div
          aria-hidden="true"
          className="ambient-drift pointer-events-none absolute -inset-[25%] z-0"
          style={{
            background:
              'radial-gradient(55% 50% at 50% 38%, rgb(var(--rgb-gold) / 0.22), rgb(var(--rgb-accent-soft) / 0.10) 46%, transparent 70%)',
            willChange: 'transform',
          }}
        />
        <Reveal variant="scene" className="relative z-10 max-w-content mx-auto flex flex-col items-start gap-12">
          {/* UP-12 (ui-polish 2026-08-01): text-balance — UI_SYSTEM §Micro-typo
              ("text-balance on headings"), which this heading was missing while
              the page's own H1 already carried it. At 375 the pre-<br> segment
              set "Have something like / this?" — a 66.39px orphan at the
              conversion moment of all six project pages. Chromium balances each
              forced-break segment independently, so the <br> is no obstacle:
              237.28 / 127.63, with "Write to me." untouched at 184.36.
              Measured no-op at 320, 360 and every width ≥480 (1440 is
              byte-identical); it fires only in the 375–437 band. Block height
              146.48px before and after → CLS 0. No nbsp was needed, so no copy
              byte moves and the sanctioned presentation-entity exception went
              unused. Note the h2 is a fit-content flex item under items-start
              (capped by max-content at 373.44px), not container-bound — which is
              why max-w-measure-heading (was max-w-2xl) never binds here and why
              1440 is safe. Zero colour
              TOKENS move, but the re-flow does slide "this?" along the fixed
              .ember ramp (t 0.136 → 0.318: rgb +2,+6,+8 light / −4,−6,−4 dark),
              so the both-theme captures show a hue delta with no new pair. */}
          <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
            Have something like this?
            <br />
            Write to me.
          </h2>
          {/* Bot-safe mailto (assembled at runtime) — carries a per-project
              subject so replies stay threaded; matches /contact + home + about. */}
          <ContactEmail subject={`About ${d.title}`} dotColor={`rgb(${signatureFor(d.id)})`} />
        </Reveal>
      </section>
      {/* Other work — CaseStudyCard replaces the simpler inline link cards */}
      {others.length > 0 && (
        <section
          className={cn(
            'relative overflow-hidden',
            'px-gutter py-24 lg:py-32',
            // Dani wave4: warm-white for section variety between cream main and gallery.
            'world-surface-alt border-t border-border-decorative',
          )}
        >
          {/* golden-hour light continuity — the glass cards sit in warm light, not a bare field. */}
          <ParallaxWash depth="far" />
          <div className="relative z-10 max-w-content mx-auto">
            <Reveal variant="scene">
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                More work
              </p>
              <h2 className="font-serif font-light text-step-4 text-near-black max-w-measure-heading leading-heading mb-24 text-balance">
                Continue reading.
              </h2>
            </Reveal>

            <ul className="related-work-grid grid grid-cols-1 gap-12 lg:gap-24">
              {others.map((o, i) => (
                <Reveal key={o.id} index={i} as="li">
                  {/* UP-33: h-full fills the stretched 2-up row so both card feet line up — it activates the card's own mt-auto footer; tailwind-merge keeps min-h-[22rem]. */}
                  <CaseStudyCard
                    title={o.title}
                    category={toCategory(o.id)}
                    description={o.summary}
                    href={`/work/${o.id}/`}
                    media={cardMedia(o)}
                    links={o.links}
                    index={allDeliverables.findIndex((x) => x.id === o.id)}
                    className="h-full"
                  />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

    </>
  );
}
