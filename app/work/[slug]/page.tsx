import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';

import { Button } from '@/components/Button';
import { CaseStudyCard } from '@/components/CaseStudyCard';
import { ContactEmail } from '@/components/ContactEmail';
import { HeroImageSettle, HeroTitleSettle } from '@/components/HeroSettle';
import { ParallaxWash } from '@/components/ParallaxWash';
import { HeroProductReveal, ShotProductReveal } from '@/components/ProductReveal';
import { Reveal } from '@/components/Reveal';
import { TactileMedia } from '@/components/TactileMedia';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { INLINE_CODE_CLASS, smartPunctuation } from '@/lib/markdown';
import { getDeliverables } from '@/lib/content';
import { ThemedHeroPreload } from '@/components/ThemedHeroPreload';
import { cardMedia, heroMedia, heroPreloadLink, heroPreloadLinks } from '@/lib/media';
import { OG_CARD } from '@/lib/og';
import { frameForSlug, signatureFor } from '@/lib/signature';
import { renderMarkdownProse } from '@/components/MarkdownProse';

type RouteParams = { slug: string };

type CaseStudyCategory = 'flagstone' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost' | 'mutual';

function toCategory(id: string): CaseStudyCategory {
  const map: Record<string, CaseStudyCategory> = {
    'flagstone': 'flagstone',
    'claude-corp': 'claude-corp',
    'dashboard': 'dashboard',
    'prompt-library': 'prompt-library',
    'ghost-code': 'ghost',
    'mutual-mesh': 'mutual',
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
 * Distinct from the /accessibility 325 strip (PROTECT-36/37), which stays
 * untouched.
 * Exported for its test; a non-reserved export the router ignores.
 */
export function FlagstoneTestReceipt() {
  return (
    <section className="px-gutter py-12 lg:py-16 world-surface border-t border-border-decorative">
      <div className="max-w-content mx-auto">
        <p className="max-w-measure-wide font-mono text-meta tracking-label uppercase text-text-meta leading-loose">
          2,971 tests passing
          <span aria-hidden="true"> · </span>{' '}
          <a
            href="#flagstone-test-count-method"
            className="link-draw text-accent-text hover:text-accent-text"
          >
            measured 2026-08-16, method
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
          reported 204 suites, 2,971 passing, 32 todo, 0 failing. The homepage
          chip says 2,900+ because the suite grows most weeks. (Separate from the
          portfolio{'’'}s own measured 325 on the accessibility page.)
        </p>
      </div>
    </section>
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
    return { title: 'Work — not found' };
  }
  return {
    // L1-03: the browser-tab title adopts the identity string this page's own
    // og:title already carries (below) — signed tabs, not anonymous inventory
    // labels, on the exact pages recruiters get deep-linked to.
    title: `${d.title} — Sky Halisky`,
    description: d.summary,
    openGraph: {
      type: 'article',
      // W0-04: Next.js shallow-merges openGraph per top-level key, so this leaf
      // route's object REPLACES the root layout's openGraph wholesale — url,
      // siteName and locale must be restated here or they silently drop from
      // every /work/* share. url is the route's OWN (resolved against
      // metadataBase), never the root's homepage url.
      url: `/work/${slug}/`,
      siteName: 'Sky Halisky — AI Portfolio',
      locale: 'en_CA',
      title: `${d.title} — Sky Halisky`,
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
      title: `${d.title} — Sky Halisky`,
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
  const otherLinks = d.links?.filter((l) => l.type !== 'demo') ?? [];
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

  return (
    <>
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
              name: 'Sky Halisky',
              url: 'https://skypistudio.com',
            },
          }),
        }}
      />
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
                  className="link-draw inline-block text-text-meta"
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
          {/* UP-31 (ui-polish 2026-08-01): `lg:grid-rows-[auto_1fr]` pairs with the
              details column's `lg:row-start-1 lg:row-span-2` below. Without a
              FLEXIBLE row 2 the span alone only halves the defect — CSS Grid
              §12.5 distributes a spanning item's intrinsic contribution equally
              across the auto tracks it crosses, so row 1 would inflate 560 →
              698.5px and the plate would still hang 186.50px low (measured).
              A spanning item is excluded from that distribution when it crosses
              a track with a flexible max sizing function, so `1fr` on row 2 lets
              row 1 collapse to the well and the plate sits at the grid's own
              gap-y-12. Gated on d.heroPlate so the other five deliverables emit
              a byte-identical class string, honouring the promise at :318. */}
          <div
            className={cn(
              'grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-50 items-start',
              d.heroPlate && 'lg:grid-rows-[auto_1fr]',
            )}
          >
            {/* L5-01: hero image well. On phones + tablets it rides BETWEEN the
                title block and the metadata block (order-2) so proof crests the
                first thumb-flick; at lg it returns to the left column. The
                reserved-aspect class + mount settle stay owned by HeroImageSettle
                → zero CLS.
                L2-03/S15: at lg the STICKY lives here (swapped off the details
                column, classes only — never re-parented): the shorter media well
                now rides along the metadata scan instead of stranding a dead
                quadrant under the frame. Phone-aspect wells (4/5) are taller
                than their columns, so sticky never engages there. */}
            <HeroImageSettle
              className={cn(
                'group relative w-full bg-gradient-to-br from-earth to-earth-deep border border-border-decorative overflow-hidden flex items-center justify-center order-2 lg:order-none lg:sticky lg:top-24 shadow-[inset_0_-34px_50px_-38px_rgba(60,32,18,0.32)]',
                wideHero ? 'aspect-[4/3]' : 'aspect-[4/5]',
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
              {/* Show-the-work: a real screenshot drops into the SAME frame via
                  d.heroShot with zero layout shift. The aspect well (4:5 portrait;
                  4:3 for window/plate real shots) + the mount settle stay owned by
                  HeroImageSettle. */}
              <HeroProductReveal
                slug={d.id}
                title={d.title}
                eyebrow={d.role}
                media={media}
              />
            </HeroImageSettle>

            {/* FT-3/FT-10 — the museum plate. A static mono-meta plate as a plain
                grid sibling directly beneath the hero well (NOT inside the aspect
                box). On phones it follows the well (order-2), above the metadata;
                at lg it is placed at col-1/row-2 — snug beneath flagstone's 4/5
                phone well. UP-31 (ui-polish 2026-08-01) corrects two claims this
                comment used to make: the well is NOT taller than its column (560
                vs 972.30px at 1440) and it DOES ride the sticky, so row 1 was
                being sized by the tall details column and "snug beneath" never
                held — the plate hung 460.30px low at 1440 and 880.08px at 1024.
                The grid now carries lg:grid-rows-[auto_1fr] and the details
                column spans both rows, which collapses row 1 to the well and
                delivers the stated intent: a 48.00px gap, the grid's own
                gap-y-12, identical to what 375 already rendered.
                Data-gated on d.heroPlate → flagstone only; every other
                deliverable renders nothing here and its grid is unchanged. Mono
                register, NEVER quotation-styled (the one pull-quote per essay
                lives in Reflection). It seats the artifact's own severity ledger
                line at reading size and names the place she mapped (the SR-only
                provenance the raster bakes in illegibly). SSR'd static → CLS 0. */}
            {d.heroPlate && (
              <div
                className="order-2 lg:order-none lg:col-start-1 lg:row-start-2 flex flex-col gap-3 max-w-measure-wide"
                /* R4/BP4: the plate borrows the room's own light — --pr-sig
                   scopes the dark-only hairline warmth (pr-plate-lit) below. */
                style={{ '--pr-sig': signatureFor(d.id) } as CSSProperties}
              >
                <div className="flex flex-col gap-1.5">
                  <p className="pr-plate-lit font-mono text-meta tracking-label uppercase text-accent-text">
                    {d.heroPlate.severity}
                  </p>
                  <p className="font-mono text-body-sm text-near-black leading-snug">
                    {smartPunctuation(d.heroPlate.caption)}
                  </p>
                </div>
                <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                  {d.heroPlate.provenance}
                </p>
              </div>
            )}

            {/* Details — the right column at lg (sticky moved onto the media
                well, L2-03/S15: the TALLER column scrolls free; a sticky here
                could never engage). Below lg the wrapper is display:contents,
                so the title block (order-1) and metadata block (order-3) become
                siblings of the well (order-2) and reorder around it: title
                leads, proof crests the fold, metadata follows (L5-01).
                UP-31: on the plate route this column spans BOTH grid rows, so
                row 1 is sized by the media well instead of by this column — the
                only reason the plate ever hung 460px below the frame it
                annotates. This column's own rect is byte-identical before and
                after (top 200, h 972.30 at 1440); only the plate moves. The
                well's sticky still engages, with its travel reduced from 547.58
                to 412.30px at 1440 — exactly the dead band that was removed. */}
            <div
              className={cn(
                'contents lg:flex lg:flex-col lg:gap-12',
                d.heroPlate && 'lg:row-start-1 lg:row-span-2',
              )}
            >
              {/* Title block — leads on every viewport. Mobile air steps down
                  (L5-04): gap-6 → md:gap-8 → lg:gap-12 (desktop unchanged). */}
              <div className="flex flex-col gap-6 md:gap-8 lg:gap-12 order-1 lg:order-none">
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
                    Sky Halisky
                  </p>
                </div>

                {/* HeroTitleSettle: carves in after the image (delay 150ms),
                    tightening letter-spacing from 0.12em to -0.02em. */}
                <HeroTitleSettle
                  className="font-serif font-light text-display ember text-balance"
                >
                  {d.title}
                </HeroTitleSettle>

                <p className="font-sans font-light text-step-1 text-charcoal text-pretty">
                  {d.summary}
                </p>

                {/* L3-04(b): live-demo pill — sits with the claim it proves. */}
                {demoLink && (
                  <div>
                    <Button
                      href={demoLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                      aria-label={`${demoLink.label} for ${d.title} (opens in new tab)`}
                    >
                      {demoLink.label}
                      <span aria-hidden="true" className="ml-1">{'↗'}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Metadata block — role/year, tech, links, tags. Follows the proof
                  on mobile (order-3); rejoins the details column at lg.
                  L5-03: the md band sets the scan as a designed 2-column ledger
                  (Role/Year spanning · Tech | Links · Tags spanning) instead of
                  the inherited single phone stack. */}
              <div className="flex flex-col gap-12 order-3 lg:order-none md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:gap-8">
                {/* Role / Year */}
                <dl className="grid grid-cols-2 gap-8 border-t border-border-decorative pt-8 md:max-lg:col-span-2">
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
                <div className={cn(otherLinks.length === 0 && 'md:max-lg:col-span-2')}>
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
                  <div className="border-t border-border-decorative pt-8 md:max-lg:border-t-0 md:max-lg:pt-0">
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
                      Links
                    </p>
                    <ul className="flex flex-col gap-2">
                      {otherLinks.map((l, i) => (
                        <Reveal key={l.href} as="li" index={i}>
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group link-draw font-sans text-body text-accent-text inline-flex items-center gap-2"
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
                              className="inline-block transition-transform duration-base ease-gh-glide group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
                  <div className="border-t border-border-decorative pt-8 md:max-lg:col-span-2">
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

      {/* Case study body — rendered only when body content exists */}
      {d.body && (
        <section className="px-gutter py-24 lg:py-32 world-surface-alt border-t border-border-decorative relative overflow-hidden">
          {/* Golden-hour scroll-depth behind the case-study prose */}
          <ParallaxWash depth="far" />
          <div className="relative z-10 max-w-content mx-auto">
            {/* Each block self-reveals in reading order (carve on H2s, depth on
                prose) — see renderMarkdown — so the body has internal cinematic
                choreography instead of one undifferentiated fade. */}
            <article aria-label={`${d.title} case study`} className="max-w-measure-wide flex flex-col gap-8">
              {renderMarkdownProse(d.body, 'case')}
            </article>

            {/* FT-7 — close the essay like an essay. A designed sign-off (never
                content markdown) matched to the essay measure: a hairline, then
                the author + place (unified to the footer's "British Columbia"
                idiom, not "BC"), and exactly ONE internal route — the real footer
                label — closing the long person-route gap at the conviction peak.
                No bio sentence, no availability signal. Reveal holds DOM space by
                opacity (RM / no-JS → full presence) → CLS 0. */}
            <Reveal
              variant="depth"
              className="max-w-measure-wide mt-16 lg:mt-20 flex flex-col gap-5"
            >
              <hr className="w-full border-0 border-t border-border-decorative" />
              <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                — Sky Halisky · Okanagan Valley, British{' '}Columbia
              </p>
              <Link
                href="/about/"
                className="link-draw self-start font-sans text-body-sm text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
              >
                A Brief Account
                <span aria-hidden="true"> →</span>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* T7 / SK-01: the receipt door — one tap from the homepage chip's headline
          number to its proof, on the chip's own destination. Reconciled
          2026-08-16: the exact count and the command that reproduces it (see
          FlagstoneTestReceipt). Flagstone-only. */}
      {d.id === 'flagstone' && <FlagstoneTestReceipt />}

      {/* In-body product shots — Show-the-work 2026-06-04. The section renders
          only once at least one shot carries real media (src or video); until
          then it stays hidden rather than staging empty "designed" wells (W3-01).
          A real screenshot dropping into d.shots[i].src auto-restores it with no
          layout shift (one-line swap — see SHOW_WORK_PLAN.md). The section sits
          in the same warm light (ParallaxWash) as the body. */}
      {d.shots?.some((s) => s.src || s.video) && (
        <section className="relative overflow-hidden px-gutter py-24 lg:py-32 world-surface border-t border-border-decorative">
          <ParallaxWash depth="far" />
          <div className="relative z-10 max-w-content mx-auto">
            <Reveal variant="scene">
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                Inside the build
              </p>
              <h2 className="font-serif font-light text-step-4 text-near-black mb-24 max-w-measure-heading leading-heading text-balance">
                See it in motion.
              </h2>
            </Reveal>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
              {d.shots.map((shot, i) => (
                <Reveal key={shot.alt} index={i} as="li">
                  {/* C-54: bind plate + caption programmatically (figure/figcaption)
                      — the template's signature the flagships inherit. When a caption
                      is present it carries the description, so the plate's alt is
                      emptied to stop AT hearing the scene twice (de-dup alt/caption). */}
                  <figure className="m-0 flex flex-col gap-3">
                    <ShotProductReveal
                      slug={d.id}
                      title={d.title}
                      media={{ src: shot.src, alt: shot.caption ? '' : shot.alt, avif: shot.avif, webp: shot.webp, focal: shot.focal, lqip: shot.lqip, video: shot.video }}
                      className="rounded-2xl border border-border-decorative"
                    />
                    {shot.caption && (
                      <figcaption className="font-sans text-body-sm text-charcoal text-pretty">
                        {smartPunctuation(shot.caption)}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
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

            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
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

      {/* Closing CTA */}
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
    </>
  );
}
