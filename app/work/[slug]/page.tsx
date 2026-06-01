import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/Button';
import { CaseStudyCard } from '@/components/CaseStudyCard';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-near-black">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderMarkdown(markdown: string): React.ReactNode[] {
  const blocks = markdown.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
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
    return (
      <p key={key} className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.75] text-pretty">
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
            {/* Hero image / fallback block */}
            <div className="relative w-full aspect-[4/5] bg-blush border border-border-decorative overflow-hidden flex items-center justify-center order-1 md:order-1">
              {/* Alex F-C4-3: explicit dimensions for the 4:5 hero. */}
              {/* Peter: not LCP on mobile (below fold initially), lazy-load safe */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.heroImage.src}
                alt={d.heroImage.alt}
                width={800}
                height={1000}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
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
                <span className="font-serif font-light text-[2rem] text-umber leading-tight">
                  {d.title}
                </span>
              </div>
            </div>

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

              <h1
                className="font-serif font-light text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] text-near-black text-balance"
                style={{ letterSpacing: '-0.02em' }}
              >
                {d.title}
              </h1>

              <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] text-pretty">
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
                    {d.links.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-draw font-sans text-body text-accent-text inline-flex items-center gap-2"
                        >
                          <span className="font-mono text-meta tracking-label uppercase text-text-meta mr-2">
                            {l.type}
                          </span>
                          <span>{l.label}</span>
                          <span aria-hidden="true">{'↗'}</span>
                          <span className="sr-only">(opens in new tab)</span>
                        </a>
                      </li>
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
                      <li
                        key={tag}
                        className="font-mono text-meta tracking-label uppercase text-sage-text"
                      >
                        #{tag}
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
        <section className="px-gutter py-24 lg:py-32 bg-warm-white border-t border-border-decorative">
          <div className="max-w-content mx-auto">
            <article aria-label={`${d.title} case study`} className="max-w-[720px] flex flex-col gap-6">
              {renderMarkdown(d.body)}
            </article>
          </div>
        </section>
      )}

      {/* Optional gallery */}
      {d.gallery && d.gallery.length > 0 && (
        <section className="reveal-on-scroll px-gutter py-24 lg:py-32 bg-blush border-t border-border-decorative">
          <div className="max-w-content mx-auto">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              Gallery
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black mb-12 max-w-2xl leading-tight">
              A closer look.
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {d.gallery.map((img) => (
                <li key={img.src} className="flex flex-col gap-3">
                  <div className="relative w-full aspect-[4/3] bg-peach-cream border border-border-decorative overflow-hidden flex items-center justify-center">
                    {/* Alex F-C4-3: explicit dimensions for the 4:3 gallery. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      width={800}
                      height={600}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Cycle 26: gallery placeholder. Tighter overlay (no
                        eyebrow) since the caption below carries context. */}
                    <span
                      aria-hidden="true"
                      className="font-serif font-light text-[1.25rem] text-umber px-4 text-center"
                    >
                      {d.title}
                    </span>
                  </div>
                  {img.caption && (
                    <p className="font-sans text-body-sm text-charcoal leading-[1.6]">
                      {img.caption}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Other work — CaseStudyCard replaces the simpler inline link cards */}
      {others.length > 0 && (
        <section
          className={cn(
            'reveal-on-scroll',
            'px-gutter py-24 lg:py-32',
            // Dani wave4: warm-white for section variety between cream main and gallery.
            'bg-warm-white border-t border-border-decorative',
          )}
        >
          <div className="max-w-content mx-auto">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              More work
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight mb-12">
              Continue reading.
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {others.map((o) => (
                <li key={o.id}>
                  <CaseStudyCard
                    title={o.title}
                    category={toCategory(o.id)}
                    imageUrl={o.heroImage.src}
                    imageAlt={o.heroImage.alt}
                    description={o.summary}
                    href={`/work/${o.id}/`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section
        className={cn(
          'reveal-on-scroll',
          'px-gutter py-24 lg:py-32',
          'bg-cream border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto flex flex-col items-start gap-8">
          <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
            Have something like this?
            <br />
            Write to me.
          </h2>
          <Button
            href={`mailto:${profile.contactEmail}?subject=About ${encodeURIComponent(d.title)}`}
          >
            Write to me.
          </Button>
        </div>
      </section>
    </>
  );
}
