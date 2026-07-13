import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import ReactDOM from 'react-dom';

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
import { getDeliverables } from '@/lib/content';
import { cardMedia, heroMedia, heroPreloadLink } from '@/lib/media';
import { frameForSlug, signatureFor } from '@/lib/signature';
import { renderMarkdownProse } from '@/components/MarkdownProse';

type RouteParams = { slug: string };

type CaseStudyCategory = 'accessmap' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost' | 'mutual';

function toCategory(id: string): CaseStudyCategory {
  const map: Record<string, CaseStudyCategory> = {
    'accessmap': 'accessmap',
    'claude-corp': 'claude-corp',
    'dashboard': 'dashboard',
    'prompt-library': 'prompt-library',
    'ghost-code': 'ghost',
    'mutual-mesh': 'mutual',
  };
  return map[id] ?? 'accessmap';
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
      // FT-1/W0-01/02: the share unfurl now deposits the WORK — the deliverable's
      // own card image (accessmap → the "No ramp · SEVERITY 4 · VERIFIED" flag)
      // instead of the generic wordmark plate, resolved absolute via metadataBase.
      // alt stays d.title, which the real artifact finally makes true. Falls back
      // to the global plate for any deliverable without a card image.
      images: [
        d.cardImage?.src
          ? { url: d.cardImage.src, width: d.cardImage.width, height: d.cardImage.height, alt: d.title }
          : { url: '/opengraph-image', width: 1200, height: 630, alt: d.title },
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
  // L7-02: preload the case-study hero's AVIF (its LCP element). heroPreloadLink
  // returns null unless an optimized sibling is declared, so a placeholder-only or
  // raw-PNG hero is never preloaded — no whale in the <head>.
  const heroPreload = heroPreloadLink(d);
  if (heroPreload) {
    ReactDOM.preload(heroPreload.href, {
      as: heroPreload.as,
      type: heroPreload.type,
      fetchPriority: heroPreload.fetchPriority,
    });
  }

  return (
    <>
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
            <ol className="inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-text-meta">
              <li>
                <Link
                  href="/work/"
                  className="link-draw inline-block text-text-meta"
                >
                  The Work
                </Link>
              </li>
              <li aria-hidden="true" className="text-stone">
                {'/'}
              </li>
              <li aria-current="page" className="text-near-black truncate max-w-[240px] lg:max-w-[420px] xl:max-w-[560px]">
                {d.title}
              </li>
            </ol>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-50 items-start">
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
                at lg it is placed at col-1/row-2 — snug beneath accessmap's tall
                4/5 phone well (taller than its column, so it does not ride the
                sticky). Data-gated on d.heroPlate → accessmap only; every other
                deliverable renders nothing here and its grid is unchanged. Mono
                register, NEVER quotation-styled (the one pull-quote per essay
                lives in Reflection). It seats the artifact's own severity ledger
                line at reading size and names the place she mapped (the SR-only
                provenance the raster bakes in illegibly). SSR'd static → CLS 0. */}
            {d.heroPlate && (
              <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-2 flex flex-col gap-3 max-w-measure-wide">
                <div className="flex flex-col gap-1.5">
                  <p className="font-mono text-meta tracking-label uppercase text-accent-text">
                    {d.heroPlate.severity}
                  </p>
                  <p className="font-mono text-body-sm text-near-black leading-snug">
                    {d.heroPlate.caption}
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
                leads, proof crests the fold, metadata follows (L5-01). */}
            <div className="contents lg:flex lg:flex-col lg:gap-12">
              {/* Title block — leads on every viewport. Mobile air steps down
                  (L5-04): gap-6 → md:gap-8 → lg:gap-12 (desktop unchanged). */}
              <div className="flex flex-col gap-6 md:gap-8 lg:gap-12 order-1 lg:order-none">
                {/* FEATURED + role share ONE line at base (L5-04's two-chip void);
                    lg:contents reverts them to today's two stacked children. */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:contents">
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

                {/* Tech pills */}
                <div>
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
                            <span className="font-mono text-meta tracking-label uppercase text-text-meta mr-2">
                              {l.type}
                            </span>
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
          </div>
        </section>
      )}

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
              <h2 className="font-serif font-light text-step-4 text-near-black mb-24 max-w-2xl leading-tight">
                See it in motion.
              </h2>
            </Reveal>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
              {d.shots.map((shot, i) => (
                <Reveal key={shot.alt} index={i} as="li" className="flex flex-col gap-3">
                  <ShotProductReveal
                    slug={d.id}
                    title={d.title}
                    media={{ src: shot.src, alt: shot.alt, avif: shot.avif, webp: shot.webp, focal: shot.focal, lqip: shot.lqip, video: shot.video }}
                    className="rounded-2xl border border-border-decorative"
                  />
                  {shot.caption && (
                    <p className="font-sans text-body-sm text-charcoal leading-[1.6]">
                      {shot.caption}
                    </p>
                  )}
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
              <h2 className="font-serif font-light text-step-4 text-near-black mb-24 max-w-2xl leading-tight">
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
                    <p className="font-sans text-body-sm text-charcoal leading-[1.6]">
                      {img.caption}
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
              <h2 className="font-serif font-light text-step-4 text-near-black max-w-2xl leading-tight mb-24">
                Continue reading.
              </h2>
            </Reveal>

            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
              {others.map((o, i) => (
                <Reveal key={o.id} index={i} as="li">
                  <CaseStudyCard
                    title={o.title}
                    category={toCategory(o.id)}
                    description={o.summary}
                    href={`/work/${o.id}/`}
                    media={cardMedia(o)}
                    links={o.links}
                    index={allDeliverables.findIndex((x) => x.id === o.id)}
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
          <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
            Have something like this?
            <br />
            Write to me.
          </h2>
          {/* Bot-safe mailto (assembled at runtime) — carries a per-project
              subject so replies stay threaded; matches /contact + home + about. */}
          <ContactEmail subject={`About ${d.title}`} />
        </Reveal>
      </section>
    </>
  );
}
