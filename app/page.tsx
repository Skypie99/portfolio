import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { CinematicDesert } from '@/components/cinematic/CinematicDesert';
import { ContactEmail } from '@/components/ContactEmail';
import { ContentReveal } from '@/components/ContentReveal';
import { CountUpStat } from '@/components/CountUpStat';
import { Hero } from '@/components/Hero';
import { HeroImageSettle } from '@/components/HeroSettle';
import { IntroScrollCue } from '@/components/IntroScrollCue';
import { IntroSkip } from '@/components/IntroSkip';
import { LitWindows } from '@/components/LitWindows';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Plate } from '@/components/Plate';
import { HeroProductReveal } from '@/components/ProductReveal';
import { RailInert } from '@/components/RailInert';
import { Reveal } from '@/components/Reveal';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { RunwayIdentityRelease } from '@/components/RunwayIdentityRelease';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getCertificates, getDeliverables, getProfile } from '@/lib/content';
import { heroMedia } from '@/lib/media';
import { OG_CARD } from '@/lib/og';
import { signatureFor } from '@/lib/signature';

/**
 * TA-11 (truth audit 2026-07-31) — the homepage's share card, restated here
 * and not in app/layout.tsx, because for the `/` segment the opengraph-image
 * FILE CONVENTION outranks a layout-level `images` entry (it does not outrank a
 * page-level one). Without this, `/` — the most-shared URL on the site — kept
 * emitting the extensionless card path that GitHub Pages serves as
 * `application/octet-stream`. See lib/og.ts.
 *
 * A page-level `openGraph` REPLACES the layout's wholesale rather than merging
 * (the same rule behind TA-10), so url / siteName / locale / title /
 * description are restated verbatim from app/layout.tsx — no new copy. The
 * static-integrity suite pins them against this page's own <title> and meta
 * description so the two declarations cannot drift apart unnoticed.
 */
export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description =
    'Sky Halisky is an AI builder crafting accessible, privacy-first tools from the Okanagan Valley, BC. Creator of Flagstone, the Prompt Library, and more.';
  return {
    openGraph: {
      type: 'website',
      url: 'https://skypistudio.com',
      siteName: `${profile.name} — AI Portfolio`,
      locale: 'en_CA',
      title: `${profile.name} — AI Portfolio`,
      description,
      images: [OG_CARD],
    },
  };
}

/**
 * Single-scroll homepage. Server Component — all content at build time, zero
 * client JS except Hero + HamburgerNav + AppMockup (client animation).
 *
 * Section order (all anchor-linked from the hamburger nav):
 *  #hero          — Hero (F-01)
 *  #work          — All deliverables (five)
 *  #process       — Discover / Build / Ship
 *  #about         — Bio
 *  #certificates  — Credential list
 *  #contact       — Mailto CTA
 *
 * Dani wave5 homepage polish:
 *  - Section headers get terracotta left-border accent for visual hierarchy
 *  - Contact section uses peach-cream bg for warm closing
 *  - Contact section adds eyebrow label + email address display
 *  - Process/Certificates alternate to bg-warm-white for rhythm
 */
export default function HomePage() {
  const profile = getProfile();
  const deliverables = getDeliverables();
  const certificates = getCertificates();

  /** The flagship — the ONE deliverable carrying `featured: true` (the
   *  featured-slot invariant; DeliverableSchema keeps it at exactly one).
   *  Read by slot, never by index, so re-ordering deliverables.json can't
   *  silently promote a different project into the room. */
  const flagship = deliverables.find((d) => d.featured);
  /** Everything the flagship room does NOT already carry. */
  const rest = deliverables.filter((d) => d !== flagship);

  /**
   * The work index (C3) — the page's canonical five-project list, flagship
   * first so its row can cross-reference the room above it. Built from
   * `flagship` + `rest` rather than from deliverables order, so a re-ordered
   * deliverables.json can never put the room and row 01 out of step.
   *
   * `lit` is the datum the retired showcase chips used to carry, and the row
   * list is now where it lives: it is what LitWindows reads (see the strip at
   * the foot of this file). Four of five — Dashboard has never had a chip, and
   * is the window that stays dark. Changing a `lit` here changes the horizon.
   */
  const workIndex = [flagship, ...rest].filter((d): d is NonNullable<typeof d> => Boolean(d)).map((d, i) => ({
    d,
    numeral: String(i + 1).padStart(2, '0'),
    href: `/work/${d.id}/`,
    isFlagship: d === flagship,
    lit: d.id !== 'dashboard',
  }));

  /** Showcase stat chips — hardcoded per spec. L3-09: each chip is now a quiet
   *  door to the proof it names (project chips → their case study, the a11y chip
   *  → the /accessibility/ statement) — same composition, only the system's own
   *  link affordances added. */
  const showcaseChips = [
    {
      stat: '2,900+',
      label: 'tests passing',
      project: 'Flagstone',
      href: '/work/flagstone/',
      tags: ['Mobile', 'WCAG AA', 'Open source'],
    },
    {
      stat: '15',
      label: 'AI agents',
      project: 'Claude Corp',
      href: '/work/claude-corp/',
      // 0183678 (F7-resolved): 'MCP' was unbacked — not demonstrable in any
      // linked repo. 'Open source' holds (Claude_Corp carries a real LICENSE).
      tags: ['Open source', 'Real commits'],
    },
    {
      stat: '100%',
      label: 'static',
      project: 'Prompt Library',
      href: '/work/prompt-library/',
      tags: ['No backend', 'Browser-only'],
    },
    {
      stat: '56',
      label: 'command cards',
      project: 'Ghost Code',
      href: '/work/ghost-code/',
      tags: ['Vanilla JS', 'Zero deps'],
    },
    {
      stat: '2.2 AA',
      // Sky-ratified 2026-07-13 (T10 W4-02): 'the bar I build to' replaces 'WCAG
      // conformance' — "conformance" is a WCAG term for a MET standard, which overclaimed
      // vs the /accessibility/ statement ("self-assessed, not certified; not a badge I
      // have been given"); this echoes that page's own words ("AA is the bar I design and
      // build against").
      label: 'the bar I build to',
      project: 'Born accessible',
      href: '/accessibility/',
      tags: ['Screen-reader', '44pt targets', 'Reduced-motion'],
    },
  ] as const;

  /** Each stat number takes a different desert hue — a teal + orange spread. */
  const STAT_EMBER = ['ember', 'ember-teal', 'ember-gold', 'ember-moss'];

  return (
    <>
      {/* ── Identity mark — holds the top-left through the wordless runway so
          who-this-is registers at first paint (L1-01 / S17). Fixed sibling of
          the intro, never a child of it; the locked intro is untouched. ── */}
      <RunwayIdentity name="Sky Halisky" roleLabel="AI Builder" />
      {/* The retirement lives HERE, not inside RunwayIdentity, because it is a
          client component and a static import would ship it to every route that
          mounts the mark -- proven in the built chunks, not assumed (UP-38). */}
      <RunwayIdentityRelease />

      {/* ── Cinematic intro — 2.5D GSAP camera-push desert (placeholder phase) ─ */}
      <CinematicDesert />

      {/* Chrome guard: rail is inert while the pinned stage fully obscures it
          (skip link → hero CTA stays the top-of-page keyboard journey). */}
      <RailInert />

      {/* T6/W2-01: the scroll IS the skip — a whisper wayfinding cue INSIDE the
          pinned intro, a fixed sibling of the film (never a child). Retires when
          the content below arrives; the locked intro is untouched. */}
      <IntroScrollCue />
      {/* P2-6 (Phase B): a real, clickable escape from the pinned film for
          pointer/touch visitors — the sr-only SkipLink already covers
          keyboard. Fixed sibling, never a child of the cinematic. */}
      <IntroSkip />

      <ContentReveal>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div id="hero">
        <Hero
          name="Sky Halisky"
          positioning="Building accessible, AI-native product. Open to thoughtful product collaborations."
          avatarSrc="/images/headshot.jpg"
          avatarAlt="Sky Halisky"
          eyebrow="Portfolio — 2026"
          heading="An accessibility map. A multi-agent system. A web-based prompt library."
          subhead="Five projects built, all five on the open web. One heading to the App Store. Accessibility first, built for everyone."
          ctaLabel="See the work."
          ctaHref="#work"
        />
      </div>

      {/* ── Live Projects Showcase Strip ──────────────────────────────── */}
      <section
        id="showcase"
        className={cn(
          'relative isolate overflow-hidden',
          // SP-4: ascending — 80px below lg (py-20 = 5rem) → 96px at lg
          // (py-24 = 6rem). Honest scale (§7.4): the numeral now tracks the
          // rendered size, so the ascent reads straight off the class.
          'px-gutter py-20 lg:py-24',
          'world-surface-cool',
          'border-t border-cool-soft/40',
        )}
      >
        {/* layered golden-hour depth — far tier, drifts on scroll, static under RM */}
        <ParallaxWash depth="far" tone="teal" />
        <div className="relative z-10 max-w-content mx-auto">
          <Reveal variant="scene">
            {/* Section label */}
            <p className="font-mono text-label text-accent-ink uppercase tracking-label mb-3 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              Shipped
            </p>
            {/* Heading */}
            <h2 className="font-serif font-light text-step-4 ember mb-3 max-w-measure-heading leading-heading text-balance">
              Built, shipped, and open.
            </h2>
            <p className="font-sans font-light text-body text-ink-muted mb-24 max-w-measure-lead text-pretty">
              Real products on the open internet. Each one accessible by design.
            </p>
          </Reveal>

          {/* Stat grid — ONE column below 480, 2-up to lg, then the 3×2
              vertical-rule layout for editorial weight.
              UP-23 (ui-polish 2026-08-01): at 375 the 2-up cell left a 106px
              text box, so chips folded inside their pills (OPEN/SOURCE,
              44PT/TARGETS), mono labels broke (TESTS/PASSING) and the serif
              link wrapped mid-name — the page's one genuinely cheap moment.
              The measured fold threshold is ~435px, so the collapse alone
              covers the whole failing band and the phase's second prescription
              (whitespace-nowrap on the pills) is a measured no-op above it —
              deliberately NOT shipped, because TagPill is shared and a global
              nowrap overflows ProjectCard at 320 and /work/claude-corp/ at 768
              on "Multi-agent orchestration". Every width >=480 is byte-identical.
              Nothing needed re-drawing for the 1-col case: the hairlines are
              `gap-px` over the container's own background, which is
              axis-agnostic — 2 horizontal seams + 1 vertical at 375 become 5
              horizontal seams and none vertical, by the same mechanism.
              This string is TWINNED with components/A11yReceipts.tsx, whose
              comment records it as "home's showcase grammar verbatim" — the two
              must move together or that claim goes false at mobile. */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-px bg-cool-soft/30 border border-cool-soft/50 rounded-lg overflow-hidden shadow-md">
            {showcaseChips.map(({ stat, label, project, href, tags }, i) => {
              // C-22: split off the LAST word so it + the arrow can be bound in a
              // whitespace-nowrap span — a soft-wrap opportunity sits before the
              // inline-block arrow at 375 and NBSP can't suppress it. Earlier words
              // still wrap. head keeps its trailing space.
              const lastSpace = project.lastIndexOf(' ');
              const head = lastSpace === -1 ? '' : project.slice(0, lastSpace + 1);
              const tail = lastSpace === -1 ? project : project.slice(lastSpace + 1);
              return (
              <Reveal
                key={project}
                // MO-4: cap the stagger (site idiom, work/[slug]/page.tsx:42-44)
                index={Math.min(i, 4)}
                variant="depth"
                className={cn(
                  // C-22: reclaim base cell width (p-8→p-6) so the tag pills fit
                  // their ~90px box at 375 without folding; md+ keeps p-7.
                  'group relative flex flex-col bg-surface-mid p-6 md:p-7',
                  // An odd trailing chip spans its 2-col / 3-col (lg+) row so no
                  // bare grid cell shows through. With five chips the grid is a
                  // clean 3×2 and `odd:` self-disables on its own.
                  // UP-23: gated at min-[480px] so it cannot fire in the 1-col
                  // band. Inert today (6 chips = even), but an item spanning 2
                  // columns in a 1-col grid ADDS an implicit second column
                  // (CSS Grid §8.5), so a future 7th chip would silently make
                  // the phone band a lopsided 2-up. Zero pixels while even.
                  'min-[480px]:last:odd:col-span-2 lg:last:odd:col-span-1',
                  // L3-09: the whole chip is a quiet door — hover AND focus-within
                  // warm the surface (the site's glass-card focus idiom), so a
                  // keyboard visitor sees the same lift a pointer does.
                  'transition-colors duration-base ease-out hover:bg-surface focus-within:bg-surface',
                )}
              >
                <CountUpStat
                  value={stat}
                  emberClass={STAT_EMBER[i % STAT_EMBER.length]}
                  label={label}
                />
                <p className="font-mono text-label text-sage-text uppercase tracking-label mb-4">
                  {label}
                </p>
                {/* L3-09: project name is the chip's link; a stretched ::after
                    makes the entire cell a tap target without changing a pixel of
                    the composition. → is the site's internal-nav grammar. */}
                <p className="font-serif text-prose text-ink mb-3">
                  <Link
                    href={href}
                    aria-label={`${project} — ${stat} ${label}`}
                    className="rounded-sm transition-colors duration-fast ease-out after:absolute after:inset-0 after:content-[''] group-hover:text-accent-text focus-visible:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                  >
                    {head}
                    {/* C-22: last word + arrow bound so the → never strands. */}
                    <span className="whitespace-nowrap">
                      {tail}
                      <span
                        aria-hidden="true"
                        className="ml-1.5 inline-block text-accent-text opacity-70 transition-transform duration-base ease-gh-glide group-hover:translate-x-0.5"
                      >
                        {'→'}
                      </span>
                    </span>
                  </Link>
                </p>
                {/* UP-47 (ui-polish 2026-08-01): deliberately NOT bottom-anchored.
                    The cell's slack is set by its grid row's tallest cell and is
                    CONSERVED either way — `mt-auto` only chose to park it ABOVE the
                    chips, which made a lone chip row sit level with its neighbours'
                    SECOND row. `mt-1` over the link's own `mb-3` puts the chips a
                    flat 16px under their link in every cell (flex-item margins do
                    not collapse), which is the design authority's stated target; the
                    slack then falls BELOW, trading a ragged interior bottom for a
                    level top — the phase file pre-accepts exactly that. Cost, stated
                    because it is real: +4px per grid row of section height (+8px at
                    lg, +12px on phones). Magnitude correction for the record: the
                    audit's "~80px dead band" is a deviceScaleFactor-2 IMAGE-pixel
                    reading of a 43.39 CSS px gap; the true max anywhere is 55.44px,
                    and the gap is already 0 at 320/480/640/768 — so this item is a
                    no-op at those widths, and with UP-23's collapse in front of it a
                    no-op at every width below 480. The three card components keep
                    their own recorded mt-auto; this is the stat grid only. */}
                <ul className="flex flex-wrap gap-1.5 mt-1" aria-label={`Tags for ${project}`}>
                  {tags.map((tag) => (
                    <li key={tag}>
                      <TagPill>{tag}</TagPill>
                    </li>
                  ))}
                </ul>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── The Flagship Room ─────────────────────────────────────────
          C2 (THE ROOM Phase C · board 01, panes A + C). The homepage's ONE
          loud moment. Flagstone used to hold the featured slot in a grid of
          five cards; it now has a room, immediately after the hero, so the
          first thing past the film is a real artifact with a human claim
          attached to it.

          The plate is A15's `Plate` reading `d.heroPlate` — the SAME
          component and the SAME data /work/flagstone/ renders, so the three
          mono lines are word-identical to the case study BY CONSTRUCTION,
          not by a copy anyone has to keep in sync. Register note: the
          concept board drew plate line 2 as serif italic; the shipped
          component's mono line wins, because the case study's own comment
          rules that plate "Mono register, NEVER quotation-styled" and
          word-identical has to mean look-identical too.

          Desktop: words in the left column (header · plate), then status,
          the one pull-line and the door beneath them; the capture rides the
          right column across all three rows on its own signature-hue plinth
          (224 150 90, lib/signature.ts).
          375 (pane C): plate-first — words before pixels — then the
          full-bleed capture, then the status. The pull-line drops below lg:
          it lives on the case page, and the phone arrival is about what the
          artifact IS, not about the essay.

          NOT here, deliberately: a second `2,900+` receipt. The brief's C2
          list asks for one, but C4 sends that exact datum to the hero strip
          and pane A draws the room without it — printing the site's biggest
          number twice inside two bands is the disease this phase treats.
          Surfaced as a 🔴 in the close-out rather than decided silently. */}
      {flagship && (
        <section
          id="flagship"
          className={cn(
            'relative isolate overflow-hidden',
            'px-gutter',
            'py-24 lg:py-32',
            'world-surface-alt',
            'border-t border-border-decorative',
          )}
        >
          <ParallaxWash depth="far" />
          <div className="relative z-10 max-w-content mx-auto">
            <div
              className={cn(
                'grid grid-cols-1 gap-y-10',
                'lg:grid-cols-[1.15fr_0.85fr] lg:gap-x-16 lg:items-center',
              )}
            >
              {/* The left column is ONE box at lg and `display: contents`
                  below it — the house idiom from app/work/[slug]/page.tsx,
                  and the reason it is here rather than three row-placed grid
                  items: a capture spanning three auto tracks has its
                  intrinsic height distributed ACROSS them (CSS Grid §12.5),
                  which inflated the header→plate→status gaps to ~100px
                  (measured, 1440). As one flex column it is content-sized and
                  `items-center` seats it against the capture, while `contents`
                  lets the capture slot BETWEEN the plate and the status at 375
                  (board 01, pane C) without re-parenting anything. */}
              <div className="contents lg:flex lg:flex-col lg:gap-8">
                {/* 1 · the header. Same eyebrow+rule grammar as every other
                    band, and the eyebrow IS the rail's label for this anchor
                    (lib/sectionNav.ts, guard T2 — byte-for-byte). */}
                <Reveal
                  variant="scene"
                  className="order-1 flex flex-col pl-4 border-l-2 border-terracotta"
                >
                  <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
                    <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                    Featured — the flagship
                  </p>
                  <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
                    {flagship.title}
                  </h2>
                </Reveal>

                {/* 2 · the museum plate — the human claim, before any pixels. */}
                {flagship.heroPlate && (
                  <Reveal
                    variant="depth"
                    index={0}
                    className="order-2"
                  >
                    <Plate
                      claim={flagship.heroPlate.severity}
                      caption={flagship.heroPlate.caption}
                      placeDate={flagship.heroPlate.provenance}
                      sig={signatureFor(flagship.id)}
                    />
                  </Reveal>
                )}

                {/* 4 · status, the one pull-line, the door. (The numbers are
                    VISUAL order — 3, the capture, is a sibling of this wrapper
                    and slots in above at 375.) */}
                <Reveal
                  variant="depth"
                  index={2}
                  className="order-4 flex flex-col items-start gap-5"
                >
                  <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                    Status{' '}
                    <span aria-hidden="true">—</span>{' '}
                    <span className="text-cool-deep normal-case tracking-normal">{flagship.status}</span>
                  </p>
                  {/* The one pull-line, quoted from the case study's own
                      `What went wrong`. Below lg it is not rendered at all
                      (pane C) — the sentence is not lost, it is one tap away in
                      the essay this band links to. */}
                  <blockquote className="hidden lg:block pull-quote pl-3 font-serif font-light italic text-step-1 text-ink-muted leading-[1.45] max-w-[44ch] text-balance">
                    It had unit tests. They passed.
                    <cite className="not-italic block mt-2 font-mono text-meta tracking-label uppercase text-text-meta">
                      from What went wrong
                    </cite>
                  </blockquote>
                  <Link
                    href={`/work/${flagship.id}/`}
                    className="link-draw inline-flex items-center gap-2 px-1 py-4 -mx-1 -my-4 font-mono text-label tracking-label uppercase text-accent-text"
                  >
                    Read the case study
                    <span aria-hidden="true">{'→'}</span>
                  </Link>
                </Reveal>
              </div>

              {/* 3 · the capture, device-true, on the signature-hue plinth.
                  No bordered well and no earth gradient (pane A's `.phonewell`
                  is the phone standing in the room's own light, not a framed
                  picture) — the aspect box exists only because a `bare`
                  HeroProductReveal positions its frame absolutely and needs a
                  sized, relative parent.
                  `eager={false}` overrides the hero-context default: this well
                  sits a full band below the fold on the homepage, so an eager
                  fetchpriority=high here would compete with the real LCP. */}
              <Reveal
                variant="depth"
                index={1}
                className="order-3 lg:order-none"
              >
                <HeroImageSettle className="group relative w-full aspect-[4/5] overflow-hidden flex items-center justify-center">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={
                      {
                        '--pr-sig': signatureFor(flagship.id),
                        background:
                          'radial-gradient(58% 52% at 50% 56%, rgb(var(--pr-sig) / 0.22), rgb(var(--pr-sig) / 0.07) 58%, transparent 78%)',
                      } as CSSProperties
                    }
                  />
                  <HeroProductReveal
                    slug={flagship.id}
                    title={flagship.title}
                    eyebrow={flagship.role}
                    media={heroMedia(flagship)}
                    eager={false}
                  />
                </HeroImageSettle>
                {/* Dated from content/showcase.manifest.json (map-overview,
                    phone, projectSha 5ab3f0c4, capturedAt 2026-07-31) — the
                    manifest is deliberately NOT read at runtime
                    (lib/showcaseWire.ts), so the date is transcribed here the
                    same way FlagstoneTestReceipt transcribes its run date.
                    The THEME is not named: the capture is a light/dark twin
                    pair and ThemedShowcase swaps it with the site, so naming
                    one would go false in the other. */}
                <p className="mt-4 text-center font-mono text-meta tracking-label uppercase text-text-meta">
                  Real capture · map-overview · captured{' '}
                  <time dateTime="2026-07-31">2026-07-31</time>
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ── Work — Luxury cards with app mockups ─────────────────────── */}
      <section
        id="work"
        className={cn(
          'relative isolate',
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface',
          'border-t border-border-decorative',
        )}
      >
        {/* soft wash so the liquid-glass cards have something to refract —
            a warm golden glow + a whisper of cool blue (decorative, static) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'radial-gradient(40% 44% at 20% 26%, rgb(255 212 158 / 0.18), transparent 62%), radial-gradient(44% 48% at 86% 82%, rgb(150 188 214 / 0.18), transparent 64%)',
          }}
        />
        <div className="max-w-content mx-auto">
          {/* Dani wave5: terracotta left-border accent on section headers.
              U3 (A-03): corridor air tightened one spacing step (mb-24 → mb-20)
              — the walk read the heading→gallery stretch as dead air. */}
          <Reveal variant="scene" className="mb-20 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              The Work
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
              A handful of things, made with intention.
            </h2>
          </Reveal>

          {/* C3 — the index. Five liquid-glass cards became five quiet
              status-bearing rows: numeral · title · one line · status · year.
              The full cards did not die, they moved: /work/ keeps its
              promenade, untouched, and this band stops being the second of
              three places the homepage names the same five projects.

              Row 01 is the flagship, and its status cell is the cross-
              reference back up to the room rather than a repeat of the status
              the room already prints in full.

              ROWS AT EVERY WIDTH. Below lg the status+year wrapper is a
              wrapping baseline line under the title; at lg `lg:contents`
              dissolves it so status and year become columns of the row's own
              flex track. Nothing is truncated and nothing scrolls sideways at
              any width — the row simply grows taller when the copy needs it. */}
          <ol className="flex flex-col">
            {workIndex.map(({ d, numeral, href, isFlagship }, i) => (
              <li
                key={d.id}
                className="group border-t border-border-decorative last:border-b"
              >
                {/* MO-4: cap the stagger (site idiom Math.min(i, 4)). */}
                <Reveal
                  index={Math.min(i, 4)}
                  variant="depth"
                  className="flex items-baseline gap-4 lg:gap-6 py-6"
                >
                  <span
                    aria-hidden="true"
                    className="w-8 lg:w-12 shrink-0 font-serif font-light text-step-1 leading-none tabular-nums text-ink/30 transition-colors duration-base ease-out group-hover:text-ink/45"
                  >
                    {numeral}
                  </span>
                  <div className="min-w-0 flex-1 flex flex-col lg:flex-row lg:items-baseline lg:gap-8">
                    <div className="min-w-0 lg:flex-[1.6] flex flex-col gap-1.5">
                      <h3 className="font-serif font-light text-step-1 leading-heading text-ink">
                        <Link
                          href={href}
                          className="rounded-sm transition-colors duration-fast ease-out hover:text-accent-text focus-visible:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                        >
                          {d.title}
                        </Link>
                      </h3>
                      <p className="font-sans font-light text-body-sm leading-body text-ink-muted text-pretty">
                        {d.summary}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:mt-0 lg:contents">
                      <p className="lg:flex-1 font-mono text-meta tracking-label uppercase text-text-meta text-pretty">
                        {isFlagship ? (
                          <Link
                            href="#flagship"
                            aria-label={`${d.title} — the flagship room, above`}
                            className="rounded-sm transition-colors duration-fast ease-out text-accent-text hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                          >
                            Featured — above
                            <span aria-hidden="true" className="ml-1.5">{'↑'}</span>
                          </Link>
                        ) : (
                          d.status
                        )}
                      </p>
                      <p className="shrink-0 lg:w-16 lg:text-right font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
                        {d.year}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── How the work gets made ───────────────────────────────────
          Truth pass 2026-08-21. The site named five products and a 15-role
          agent system as a sixth project, and left the reader to work out the
          relationship between them. Every card said "Solo builder". A reader
          who took that literally formed an expectation a technical screen would
          break; a reader who suspected AI got no account of how the work is
          directed, which is the more unflattering inference of the two.

          Sits between the work and the method: the reader has just seen what
          was built, and asks how, before being told the three steps.

          Prose, not NumberedSteps — this is an account, and the numbered-step
          furniture below already owns that grammar. Every claim here is
          checkable against the Constitution (~/.claude/CONSTITUTION.md) or the
          decision logs, including the two that qualify themselves: the Art. 17
          merge carve-out and the prompt-level limit. Those two ARE the section
          — an ungated version of this copy would be the same unfalsifiable
          claim the page is replacing. */}
      <section
        id="how-i-work"
        className={cn(
          'relative isolate overflow-hidden',
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface',
          'border-t border-border-decorative',
        )}
      >
        <ParallaxWash depth="far" />
        <div className="relative z-10 max-w-content mx-auto">
          <Reveal variant="scene" className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              How the work gets made
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
              I direct AI agents, and I built the system that keeps them honest.
            </h2>
          </Reveal>

          <div className="max-w-measure-wide flex flex-col gap-6 font-sans font-light text-body leading-[1.7] text-ink-muted text-pretty">
            <Reveal index={0} variant="depth" as="p">
              The projects above were implemented by AI agents working inside a
              governance system I designed: fifteen roles with explicit domain
              boundaries, and a written constitution that outranks any
              individual role or prompt. The agents do the implementation, the
              tests, and most of the diagnosis. I set the problem, make the
              architectural calls, and gate what lands.
            </Reveal>
            <Reveal index={1} variant="depth" as="p">
              The constraints are what make the output reviewable. Database
              migrations are files with a rollback, never applied changes — no
              agent has written to a production database. None handles
              credentials, and none sends anything outside the repository.
              Exactly one of the fifteen may message me; the rest write to files
              I read on my own schedule. Merges to{' '}
              <code className="font-mono text-body-sm">main</code> are mine,
              with one narrow gated exception I granted to a single project.
            </Reveal>
            <Reveal index={2} variant="depth" as="p">
              Here is the system working. An agent fixing something unrelated
              added two background-location permission strings to{' '}
              <code className="font-mono text-body-sm">app.json</code>. The
              privacy role blocked it: the app uses no background-location APIs,
              so declaring them would invite an App Store 5.1.1 rejection and
              ask for a permission the product does not need. Both keys were
              removed; neither reached{' '}
              <code className="font-mono text-body-sm">main</code>.
            </Reveal>
            <Reveal index={3} variant="depth" as="p">
              And here is what it hands back. A review found that anonymous
              reports skipped a content filter that signed-in reports run. It
              was written up and deliberately left unpatched, because deciding
              what to filter on a submit form is a moderation policy, not a bug
              fix. It waited for me instead of being quietly patched, and the
              filter runs on both paths now.
            </Reveal>
            <Reveal index={4} variant="depth" as="p">
              The honest limit: these fences are prompt-level, not
              sandbox-level. It is one person{'\u2019'}s system, tested across
              one person{'\u2019'}s projects, and some of the governance
              overhead does not pay for itself.
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section
        id="about"
        className={cn(
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface',
          'border-t border-border-decorative',
          'relative overflow-hidden',
        )}
      >
        {/* Golden-hour scroll-depth — far tier, holds static under reduced motion */}
        <ParallaxWash depth="far" />
        <div className="relative z-10 max-w-content mx-auto">
          <Reveal variant="scene" className="mb-24 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              A Brief Account
            </p>
            {/* C-23: max-w-measure-heading (was max-w-2xl, Phase A) matches the five
                sibling section H2s (:151/:261/:313/:424/:518) — the About head was the
                lone one off the shared 672px grid. Byte-identical render; restores the
                grid so future copy can't drift. */}
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
              The work is careful. The record is honest.
            </h2>
          </Reveal>

          <Reveal variant="depth" className="max-w-measure flex flex-col gap-8">
            {/* Pull-quote accent — editorial tone-setter */}
            {/* leading-[1.45]: a per-quote tuned value, not a token candidate —
                the sibling pull-quote on /about carries its own tuned 1.4. */}
            <blockquote className="pull-quote nums-oldstyle pl-3 font-serif font-light italic text-step-2 text-ink leading-[1.45] text-balance">
              One careful deliverable beats a dozen rough ones.
            </blockquote>
            <span aria-hidden="true" className="rule-ember block h-px w-32" />

            <p className="font-sans font-light text-step-1 text-ink leading-[1.6] text-pretty">
              Most of what I make starts with a problem worth solving. I prefer
              small, exact software to large, approximate software. I work from
              {' '}{profile.location}, mostly on AI tooling, accessibility
              infrastructure, and the systems that make a product feel calm.
            </p>
            <p className="font-sans font-light text-prose text-ink-muted text-pretty">
              I keep a written record of how each thing was made. The
              documentation is part of the deliverable, not an afterthought.
            </p>
            <Link
              href="/about/"
              className="link-draw inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-ink mt-2 self-start"
            >
              The full account
              <span aria-hidden="true">{'→'}</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Certificates ─────────────────────────────────────────────── */}
      <section
        id="certificates"
        className={cn(
          'relative isolate overflow-hidden',
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface-alt',
          'border-t border-border-decorative',
        )}
      >
        {/* golden-hour light continuity (wow 2026-06-04) — the only homepage
            scroll section that lacked a warm wash; the sun is now in every room.
            far tier, drifts on scroll, static under reduced motion. */}
        <ParallaxWash depth="far" />
        <div className="relative z-10 max-w-content mx-auto">
          <Reveal variant="scene" className="mb-24 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              Credentials
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
              Credentials, earned in order.
            </h2>
          </Reveal>

          {/* divide-y preserved on the <ul>; Reveal wraps each li's inner
              content so the divider border lives on the <li>, not the wrapper. */}
          <ul className="flex flex-col divide-y divide-stone/70">
            {certificates.map((c, i) => (
              <li key={c.id} className="py-12 first:pt-0 last:pb-0 group">
                {/* MO-4: cap the stagger so a fold-edge row never holds at
                    opacity 0 after an anchor jump (site idiom Math.min(i, 4)). */}
                <Reveal index={Math.min(i, 4)} variant="depth">
                  <div className="flex flex-col lg:flex-row lg:items-baseline gap-2 lg:gap-24 transition-transform duration-base ease-out group-hover:translate-x-1">
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta lg:w-40 shrink-0">
                      {c.issuer}
                    </p>
                    <div className="flex-1 flex flex-col gap-1">
                      <h3 className="font-serif font-normal text-step-2 text-ink leading-tight nums-lining transition-colors duration-fast ease-out group-hover:text-accent-text">
                        {c.title}
                      </h3>
                      <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                        {new Date(c.issuedDate).toLocaleDateString('en-CA', {
                          year: 'numeric',
                          month: 'long',
                        })}
                        {c.expiresDate && (
                          <>
                            {' '}· expires{' '}
                            {new Date(c.expiresDate).toLocaleDateString('en-CA', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </>
                        )}
                      </p>
                    </div>
                    <Link
                      href={c.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      // CO-8: the new-tab cue lives in the aria-label, which
                      // overrides children for the accessible name (the rich
                      // credential title is kept). No sr-only "(opens in new tab)"
                      // span: with an explicit label it never reaches the name, yet
                      // axe counts it as visible text → label-content-name-mismatch.
                      aria-label={`View credential: ${c.title} from ${c.issuer} (opens in new tab)`}
                      /* L5-07: px/py + negative margins lift the tap box with
                         zero layout shift. F7-1 (a11y 07-31): py-1 gave ~23px;
                         py-[15px] reached the house 44 floor at 44.39px.
                         Phase A (A9, gate-driven): the approved system-sheet
                         board calls this exact "15px oddball" out by name as
                         a --space-4 (16px) migration; py-4 lands at ~46px,
                         still comfortably past the floor, with 1px more room
                         each side than the original hand-tuned value — a
                         reachable-through-tokens value, not a precision
                         regression. Measured room to the nearest interactive
                         neighbour is 123px (1280) / 170px (375), so the
                         grown box still collides with nothing. */
                      className="px-1 py-4 -mx-1 -my-4 font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-1 transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1 shrink-0"
                    >
                      View
                      {/* CO-8: ↗ external-link glyph (was the internal →) */}
                      <span aria-hidden="true">{'↗'}</span>
                    </Link>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          {/* C-81: a real page-door to the dedicated credentials room — the
              hand-drawn badges live there, not in this text digest. Internal →
              grammar (↗ is reserved for external), padded tap box (L5-07). */}
          <Reveal className="mt-16">
            <Link
              href="/certificates/"
              // Phase A (A9, gate-driven): same py-[15px] -> py-4 migration as
              // the "View" link above — the approved board names this exact
              // 15px value as a --space-4 oddball.
              className="group inline-flex items-center gap-1.5 px-1 py-4 -mx-1 -my-4 rounded-sm font-mono text-meta tracking-label uppercase text-accent-text transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              See the credential badges
              <span aria-hidden="true">{'→'}</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section
        id="contact"
        className={cn(
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface-cool-pale',
          'border-t border-cool-soft/50',
          'relative overflow-hidden',
        )}
      >
        {/* Signature moment #2 — ambient golden-hour drift: a single warm light
            field on an ultra-slow autonomous loop, echoing the landing's sun at
            rest. CSS/compositor-only; freezes to a static glow under reduced
            motion. Uses --rgb-gold/--rgb-accent-soft so it flips in dark mode. */}
        <div
          aria-hidden="true"
          className="ambient-drift pointer-events-none absolute -inset-[25%] z-0"
          style={{
            background:
              'radial-gradient(55% 50% at 50% 38%, rgb(var(--rgb-gold) / 0.22), rgb(var(--rgb-accent-soft) / 0.10) 46%, transparent 70%)',
            willChange: 'transform',
          }}
        />
        {/* Reveal wraps only the content div; the ambient-drift div above is left as-is */}
        <div className="relative z-10 max-w-content mx-auto flex flex-col items-start gap-12">
          <Reveal variant="scene" className="flex flex-col items-start gap-12">
            <p className="font-mono text-label tracking-label uppercase text-accent-ink flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              Let’s talk
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading">
              Have something worth building?
              <br />
              Let’s talk about it.
            </h2>
          </Reveal>
          <Reveal index={1}>
            {/* Bot-safe mailto — the address is assembled at runtime (matches the
                /contact page), so it never sits raw in the static HTML for scrapers.
                Shows "Email {address}" to humans after hydration. */}
            <ContactEmail />
          </Reveal>
        </div>
      </section>

      </ContentReveal>

      {/* The lit windows (R4/BP6 · P01) — the door's night reveal, bound to the
          showcase strip's own "five live" claim (one source with the hero
          sentence; DECISIONS §S). Height-0 row → zero layout, CLS 0.
          OUTSIDE <ContentReveal> on purpose (batch-skeptic HIGH): the reveal
          wrapper's persistent inline transform creates a stacking context that
          let the footer paint AND hit-test above the windows on desktop —
          out here the row joins the root stacking context and z-index wins.
          The component only consumes the :root --day-night var, so nothing
          else changes. */}
      <LitWindows
        deliverables={deliverables}
        litHrefs={showcaseChips.map((c) => c.href)}
      />
    </>
  );
}
