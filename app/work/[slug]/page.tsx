import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CaseStudyCard } from '@/components/CaseStudyCard';
import { MagneticButton } from '@/components/MagneticButton';
import { HeroImageSettle, HeroTitleSettle } from '@/components/HeroSettle';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Reveal } from '@/components/Reveal';
import { TactileMedia } from '@/components/TactileMedia';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';
import { INLINE_CODE_CLASS, smartPunctuation } from '@/lib/markdown';

function parseInline(text: string): React.ReactNode[] {
  // Split on **bold**, *italic*, and `code`, preserving delimiters. Smart
  // punctuation applies to prose + emphasis, never inside `code`.
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-near-black">{smartPunctuation(part.slice(2, -2))}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className={INLINE_CODE_CLASS}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{smartPunctuation(part.slice(1, -1))}</em>;
    return smartPunctuation(part);
  });
}

function renderMarkdown(markdown: string): React.ReactNode[] {
  const blocks = markdown.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  let firstPara = true;
  return blocks.map((block, i) => {
    const key = `b-${i}`;
    if (block.startsWith('## '))
      return (
        <h2 key={key} className="font-serif font-light text-[clamp(1.5rem,3vw,2rem)] text-near-black leading-[1.1] mt-12 mb-4 first:mt-0" style={{ letterSpacing: '-0.01em' }}>
          {block.slice(3)}
        </h2>
      );
    if (block.startsWith('### '))
      return (
        <h3 key={key} className="font-serif font-light text-[clamp(1.25rem,2.5vw,1.5rem)] text-near-black leading-[1.15] mt-8 mb-3" style={{ letterSpacing: '-0.01em' }}>
          {block.slice(4)}
        </h3>
      );
    const dropCap = firstPara;
    firstPara = false;
    return (
      <p
        key={key}
        className={`font-sans font-light text-prose text-charcoal leading-[1.75] text-pretty nums-oldstyle${dropCap ? ' drop-cap' : ''}`}
      >
        {parseInline(block)}
      </p>
    );
  });
}

type RouteParams = { slug: string };

type CaseStudyCategory = 'accessmap' | 'claude-corp' | 'prompt-library' | 'pacman' | 'mutual';

function toCategory(id: string): CaseStudyCategory {
  const map: Record<string, CaseStudyCategory> = {
    'accessmap': 'accessmap',
    'claude-corp': 'claude-corp',
    'prompt-library': 'prompt-library',
    'pacman-code-trainer': 'pacman',
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

export function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Metadata {
  const d = getDeliverables().find((x) => x.id === params.slug);
  if (!d) {
    return { title: 'Work — not found' };
  }
  return {
    title: `${d.title} — Selected Work`,
    description: d.summary,
    openGraph: {
      type: 'article',
      title: `${d.title} — Sky Halisky`,
      description: d.summary,
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: d.title }],
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
 * Server Component. Layout: hero image (top on mobile, left on md+),
 * details on the right. Sections per spec:
 *   1. Back-link "← All work"
 *   2. Hero image / cream-tinted fallback
 *   3. Title + summary + role/year + tech pills (left), links list (right)
 *   4. Optional Gallery (if `gallery` array non-empty)
 *   5. mailto CTA at bottom
 *
 * Per Alex §4.5, external links open in new tab with rel="noopener noreferrer"
 * AND an sr-only "(opens in new tab)" cue.
 */
export default function WorkDetailPage({ params }: { params: RouteParams }) {
  const allDeliverables = getDeliverables();
  const deliverable = allDeliverables.find((d) => d.id === params.slug);
  if (!deliverable) {
    notFound();
  }
  const profile = getProfile();
  const d = deliverable;
  // "Other work" — up to 2 sibling deliverables, prefer same-year + non-self.
  // Cheap quiet recommendation; no algorithm, just neighbours.
  const others = allDeliverables.filter((x) => x.id !== d.id).slice(0, 2);

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
            url: `https://www.skypistudio.com/work/${d.id}/`,
            author: {
              '@type': 'Person',
              name: 'Sky Halisky',
              url: 'https://www.skypistudio.com',
            },
          }),
        }}
      />
      {/* Breadcrumb — Cycle 19. Editorial 'Work / <Title>' pattern, DM Mono
          uppercase 11px. Only 'Work' is a link (with link-draw underline-
          draw hover). Current slug is plain text — you're already there.
          aria-label declares the nav landmark for screen readers. */}
      <section className="px-gutter pt-24 lg:pt-32 bg-cream">
        <div className="max-w-content mx-auto">
          <nav aria-label="Breadcrumb">
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
              <li aria-current="page" className="text-near-black">
                {d.title}
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Main content — hero left, details right */}
      <section className="px-gutter py-24 lg:py-32 bg-cream">
        <div className="max-w-content mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Hero image / fallback block — HeroImageSettle wraps the whole
                well so the settle animation is the grid child itself. All
                existing classes preserved on the wrapper. */}
            <HeroImageSettle className="group relative w-full aspect-[4/5] bg-gradient-to-br from-earth to-earth-deep border border-border-decorative overflow-hidden flex items-center justify-center order-1 md:order-1 shadow-[inset_0_-34px_50px_-38px_rgba(60,32,18,0.32)]">
              {/* Warm top-light — single source from above (lit-well depth) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_85%_at_50%_-15%,rgba(255,241,217,0.46),transparent_62%)] dark:bg-[radial-gradient(125%_85%_at_50%_-15%,rgba(255,221,176,0.10),transparent_62%)]"
              />
              {/* Alex F-C4-3: explicit dimensions for the 4:5 hero. */}
              {/* Peter: not LCP on mobile (below fold initially), lazy-load safe */}
              {/* tactile-pass: photo leans in on hover + drifts gently on scroll */}
              <TactileMedia
                src={d.heroImage.src}
                alt={d.heroImage.alt}
                width={800}
                height={1000}
                depth={0.06}
              />
              {/* Cycle 26: elevated placeholder overlay matches ProjectCard. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
              >
                <span className="inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-umber/70">
                  <span className="inline-block w-1 h-1 rounded-full bg-terracotta" />
                  {d.role}
                </span>
                <span className="font-serif font-light text-step-3 text-umber leading-tight">
                  {d.title}
                </span>
              </div>
            </HeroImageSettle>

            {/* Details column */}
            <div className="flex flex-col gap-8 order-2 md:order-2 md:sticky md:top-12">
              {d.featured && (
                <p className="font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-2 rounded-full bg-terracotta"
                  />
                  Featured
                </p>
              )}

              {/* HeroTitleSettle: carves in after the image (delay 150ms),
                  tightening letter-spacing from 0.12em to -0.02em. */}
              <HeroTitleSettle
                className="font-serif font-light text-display leading-[1.05] ember text-balance"
              >
                {d.title}
              </HeroTitleSettle>

              <p className="font-sans font-light text-prose text-charcoal leading-[1.65] text-pretty">
                {d.summary}
              </p>

              {/* Role / Year */}
              <dl className="grid grid-cols-2 gap-6 border-t border-border-decorative pt-6">
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

              {/* Links list */}
              {d.links && d.links.length > 0 && (
                <div className="border-t border-border-decorative pt-6">
                  <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
                    Links
                  </p>
                  <ul className="flex flex-col gap-2">
                    {d.links.map((l, i) => (
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
                <div className="border-t border-border-decorative pt-6">
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
      </section>

      {/* Case study body — rendered only when body content exists */}
      {d.body && (
        <section className="px-gutter py-24 lg:py-32 bg-warm-white border-t border-border-decorative relative overflow-hidden">
          {/* Golden-hour scroll-depth behind the case-study prose */}
          <ParallaxWash depth="far" />
          <div className="relative z-10 max-w-content mx-auto">
            <Reveal variant="scene">
              <article aria-label={`${d.title} case study`} className="max-w-measure-wide flex flex-col gap-6">
                {renderMarkdown(d.body)}
              </article>
            </Reveal>
          </div>
        </section>
      )}

      {/* Optional gallery */}
      {d.gallery && d.gallery.length > 0 && (
        <section className="px-gutter py-24 lg:py-32 bg-cream border-t border-border-decorative">
          <div className="max-w-content mx-auto">
            <Reveal variant="scene">
              <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
                Gallery
              </p>
              <h2 className="font-serif font-light text-step-4 text-near-black mb-12 max-w-2xl leading-tight">
                A closer look.
              </h2>
            </Reveal>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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
            'px-gutter py-24 lg:py-32',
            // Dani wave4: warm-white for section variety between cream main and gallery.
            'bg-warm-white border-t border-border-decorative',
          )}
        >
          <div className="max-w-content mx-auto">
            <Reveal variant="scene">
              <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
                More work
              </p>
              <h2 className="font-serif font-light text-step-4 text-near-black max-w-2xl leading-tight mb-12">
                Continue reading.
              </h2>
            </Reveal>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {others.map((o, i) => (
                <Reveal key={o.id} index={i} as="li">
                  <CaseStudyCard
                    title={o.title}
                    category={toCategory(o.id)}
                    description={o.summary}
                    href={`/work/${o.id}/`}
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
          'px-gutter py-24 lg:py-32',
          'bg-cream border-t border-border-decorative',
        )}
      >
        <Reveal className="max-w-content mx-auto flex flex-col items-start gap-8">
          <h2 className="font-serif font-light text-step-4 text-near-black max-w-2xl leading-tight">
            Have something like this?
            <br />
            Write to me.
          </h2>
          <MagneticButton
            href={`mailto:${profile.contactEmail}?subject=About ${encodeURIComponent(d.title)}`}
          >
            Write to me.
          </MagneticButton>
        </Reveal>
      </section>
    </>
  );
}
