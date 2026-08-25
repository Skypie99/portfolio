import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidElement } from 'react';

import { CaseStudyCard } from '@/components/CaseStudyCard';
import { SettleHeading } from '@/components/HeroSettle';
import { renderMarkdownProse } from '@/components/MarkdownProse';
import { Reveal } from '@/components/Reveal';
import { TagPill } from '@/components/TagPill';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { cn } from '@/lib/cn';
import { getAllBlogPostSlugs, getBlogPosts, getDeliverables, getProfile } from '@/lib/content';
import { bindSeparatorDash, bindSoloLetters } from '@/lib/markdown';
import { cardMedia } from '@/lib/media';
import { OG_CARD } from '@/lib/og';
import type { BlogPost } from '@/lib/schema';

type RouteParams = { slug: string };

type CaseStudyCategory = 'flagstone' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost';

/** id → CaseStudyCard category (mirrors app/work/[slug]/page.tsx). */
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
 * ProseFigure (L3-06 / S12) — one product figure in the essay, in a reserved-aspect
 * well so it costs zero CLS, shipped through the site's AVIF/WebP <picture> +
 * inline-LQIP grammar (mirrors ProductReveal's StaticShot). Page-level, not coupled
 * into the shared renderer — the page splices it in at the figure's `afterHeading`.
 */
function ProseFigure({ figure }: { figure: NonNullable<BlogPost['figure']> }) {
  const ratio = figure.width && figure.height ? `${figure.width} / ${figure.height}` : '1315 / 713';
  return (
    <figure className="my-2 flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-md border border-border-decorative"
        style={{ aspectRatio: ratio }}
      >
        {figure.lqip && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${figure.lqip}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
        <picture>
          {figure.avif && <source type="image/avif" srcSet={figure.avif} />}
          {figure.webp && <source type="image/webp" srcSet={figure.webp} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={figure.src}
            alt={figure.alt}
            width={figure.width}
            height={figure.height}
            loading="lazy"
            decoding="async"
            className="relative h-full w-full object-cover"
          />
        </picture>
      </div>
      {figure.caption && (
        /* UP-14(a) (ui-polish 2026-08-01): text-pretty — UI_SYSTEM §Micro-typo
           ("text-pretty on body"). The caption is 86 uppercase mono characters
           against a 60ch measure, so the greedy break stranded "FLAG." alone on
           its own line at 1440. pretty pulls one word down; the line COUNT is
           unchanged, so the block height is unchanged and CLS stays 0. It is a
           no-op below ~700px, where the caption already sets three lines ending
           "BARRIER FLAG.". balance was rejected: it is defined for headings and
           would compress this to a centred-rag label against a 650px measure. */
        <figcaption className="font-mono text-meta tracking-label uppercase text-text-meta text-pretty">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * DatedStatusNote (T11 / SK-02) — a dated snapshot stamp spliced above a
 * time-bound status claim, so a weeks-old "in TestFlight / review pending"
 * reads as "here's where this stood on {date}," not a live present-tense
 * promise the redeploying site keeps re-vouching for. Reuses the post
 * byline's <time> grammar (below) and the receipts strip's "as of {date}"
 * snapshot phrasing. Page-level, like ProseFigure — never coupled into the
 * shared renderer; the page splices it in at the "What's next" seam.
 * Exported for the seam/format test; a non-reserved export the router ignores.
 */
export function DatedStatusNote({ date }: { date: string }) {
  return (
    <p className="font-mono text-meta tracking-label uppercase text-text-meta">
      Status as of{' '}
      <time dateTime={date} className="tabular-nums">
        {new Date(date + 'T12:00:00').toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>
    </p>
  );
}

/**
 * Static export needs every dynamic route enumerated at build time.
 * We include ALL slugs (even drafts) so Next.js can generate the static file.
 * Draft slugs resolve to notFound() at render time via getBlogPosts() filter.
 */
export function generateStaticParams(): RouteParams[] {
  return getAllBlogPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPosts().find((p) => p.id === slug);
  if (!post) return { title: 'Post not found' };
  const profile = getProfile();
  return {
    title: `${post.title} — ${profile.name}`,
    description: post.summary,
    openGraph: {
      type: 'article',
      // TA-10: a leaf openGraph REPLACES the root's wholesale (W0-04) — url,
      // siteName and locale restated so they survive on this route's share.
      // url is the POST's own, never the root's homepage url.
      url: `/blog/${slug}/`,
      siteName: 'Sky Halisky — AI Portfolio',
      locale: 'en_CA',
      title: `${post.title} — ${profile.name}`,
      description: post.summary,
      publishedTime: post.publishedDate,
      images: [{ ...OG_CARD, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — ${profile.name}`,
      description: post.summary,
    },
    // C-93: feed autodiscovery — the essay advertises the Notes feeds so a reader
    // or crawler finds them from the post itself.
    alternates: {
      types: {
        'application/feed+json': '/feed.json',
        'application/rss+xml': '/feed.xml',
      },
    },
  };
}

/**
 * /blog/[slug] — individual blog post page.
 *
 * Server Component. Static at build time via generateStaticParams.
 * Layout: post header (title, date, reading time, tags) → prose body → back link.
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = getBlogPosts().find((p) => p.id === slug);
  if (!post) notFound();
  const profile = getProfile();

  const renderedContent = renderMarkdownProse(post.content, 'blog');

  // S12: splice the product figure in at its seam (the block after the matching
  // `## <heading>` id) without coupling the shared renderer — the figure is a
  // page-level element. Falls back to the end of the prose if the heading moves.
  const content = [...renderedContent];
  if (post.figure) {
    const fig = <ProseFigure key="blog-figure" figure={post.figure} />;
    const seam = post.figure.afterHeading
      ? content.findIndex(
          (el) => isValidElement(el) && (el.props as { id?: string }).id === post.figure!.afterHeading,
        )
      : -1;
    if (seam >= 0) content.splice(seam + 1, 0, fig);
    else content.push(fig);
  }

  // T11 / SK-02: date the forward-looking status so a frozen "TestFlight is
  // live / review is pending" reads as a snapshot ("Status as of {date}"),
  // not a live promise the redeploying site keeps re-vouching for. Independent
  // splice pass — findIndex runs against the current array, so it's correct
  // regardless of the figure spliced above. Page-level, never coupled into the
  // shared renderer.
  const statusSeam = content.findIndex(
    (el) => isValidElement(el) && (el.props as { id?: string }).id === 'what-s-next',
  );
  if (statusSeam >= 0) {
    content.splice(statusSeam + 1, 0, <DatedStatusNote key="blog-status-date" date={post.publishedDate} />);
  }

  // S12: the post hands off to its case study at the close instead of dead-ending.
  const related = post.relatedDeliverable
    ? getDeliverables().find((d) => d.id === post.relatedDeliverable)
    : undefined;

  return (
    <>
      {/* UP-38: the mobile brand chip. Measured, this route rendered ZERO
          identity -- visible OR in the a11y tree -- before the footer at
          320/375/414. Same mark home's runway uses; hidden from md up, where
          the rail starts signing. */}
      <RunwayIdentity variant="page" />
      {/* C-94: BlogPosting JSON-LD names the author at the crawler layer (mirrors
          the Person schema in the root layout + the CreativeWork on case studies),
          quietly serving the byline signal on a shared link. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.summary,
            datePublished: post.publishedDate,
            keywords: post.tags.join(', '),
            author: { '@type': 'Person', name: profile.name, url: 'https://skypistudio.com' },
            publisher: { '@type': 'Person', name: profile.name },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://skypistudio.com/blog/${post.id}/`,
            },
          }),
        }}
      />
      {/* Post header */}
      <section className="px-gutter pt-24 lg:pt-32 pb-24 world-surface">
        <div className="max-w-content mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-24">
            <ol className="flex items-center gap-2 font-mono text-meta tracking-label uppercase text-text-meta">
              <li className="shrink-0">
                <Link href="/blog/" className="link-draw inline-block text-text-meta">
                  Notes
                </Link>
              </li>
              <li aria-hidden="true" className="shrink-0 text-stone dark:text-stone-strong">{'/'}</li>
              <li aria-current="page" className="text-ink truncate min-w-0 max-w-[240px] lg:max-w-[420px] xl:max-w-[560px]">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <time
              dateTime={post.publishedDate}
              className="font-mono text-meta tracking-label uppercase text-text-meta tabular-nums"
            >
              {new Date(post.publishedDate + 'T12:00:00').toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span aria-hidden="true" className="font-mono text-meta text-stone-strong">·</span>
            <span className="font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
              {post.readingTimeMinutes} min read
            </span>
          </div>

          {/* Title — L5-05: at md the sidebar (hidden md:flex) narrows the
              column, but --fs-display's 5vw term reads the full viewport and
              skyscrapers the title. Step the tier down to step-5 across the md
              band; the full display size returns at lg where the column is wide.
              Call-site only — the shared --fs-display token (10 titles) is untouched.
              UP-13 (ui-polish 2026-08-01) was investigated here and deliberately NOT
              BUILT — see DECISIONS §P `P5-UP-13-TIER`. The defect is real (at 375 the
              5vw term yields 44.35px into a 311px measure and this 64-character title
              sets in six lines, block 279px ≈ 34% of an 812px viewport) but the
              audit's mechanism is not: the clamp's min term never binds at 375
              (44.35 > 44), so "step the lower bound down" is inert, and the proposed
              34–36px region measures WORSE than today at 35 and 36px (4 lines) with
              only the exact 34px edge reaching 3 lines at 99% box fill. The audit's
              second symptom, "a hanging em-dash", is not a defect at all —
              bindSeparatorDash (lib/markdown.ts, TY-6) NBSP-welds the dash to the
              word before it precisely so a line can never START with one, and line 2
              ending "Flagstone —" is that rule working. The one form that cures 375
              (`text-step-3 sm:…`) costs a +84.3% size step across 639→640, the
              estate's first TYPOGRAPHIC `sm:` (the only two `sm:` uses today are
              layout), and a tracking mismatch: `.settle-heading` (built CSS offset
              43925) outranks `.text-step-3` (20824) at equal specificity, so the
              heading would render step-3's size at display-tier tracking. Sky's call. */}
          <SettleHeading
            className="font-serif font-light text-display md:text-step-5 lg:text-display ember max-w-measure-heading mb-16 text-balance"
          >
            {bindSeparatorDash(bindSoloLetters(post.title))}
          </SettleHeading>

          {/* Summary */}
          <p className="font-sans font-light text-step-1 text-ink-muted max-w-measure-wide text-pretty mb-16">
            {bindSeparatorDash(post.summary)}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <TagPill>{tag}</TagPill>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Prose body */}
      <section
        className={cn(
          'px-gutter',
          'py-32 lg:py-50',
          'world-surface-alt',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* Each block self-reveals in reading order (carve on H2s, depth on
              prose) via the shared renderMarkdownProse — Notes inherits the
              case-study choreography (Z7/CO-6). No outer scene Reveal; the
              .reveal floors in globals.css carry the RM / no-JS rest state. */}
          <article
            aria-label={post.title}
            className="max-w-measure-wide flex flex-col gap-8"
          >
            {content}
          </article>
        </div>
      </section>

      {/* Closer — S12: the essay hands off to its case study (the site's own
          "Continue reading." grammar) instead of dead-ending; the "All posts"
          return stays beneath. world-surface alternates off the -alt prose. */}
      <section className="px-gutter py-24 lg:py-32 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          {related && (
            <Reveal variant="scene" className="mb-16">
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                Keep reading
              </p>
              <h2 className="font-serif font-light text-step-4 text-ink max-w-measure-heading leading-heading mb-12 text-balance">
                Continue reading.
              </h2>
              {/* One deliberate handoff — a single-column max-width so it reads as
                  one card, not a 2-col grid with a missing pair (avoids L3-08). */}
              <ul className="max-w-xl">
                <li>
                  <CaseStudyCard
                    title={related.title}
                    category={toCategory(related.id)}
                    description={related.summary}
                    href={`/work/${related.id}/`}
                    media={cardMedia(related)}
                    links={related.links}
                  />
                </li>
              </ul>
            </Reveal>
          )}
          <Link
            href="/blog/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-ink hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1">{'←'}</span>
            All posts
          </Link>
        </div>
      </section>
    </>
  );
}
