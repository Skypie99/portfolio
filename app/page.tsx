import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

import { CinematicDesert } from '@/components/cinematic/CinematicDesert';
import { ContactEmail } from '@/components/ContactEmail';
import { ContentReveal } from '@/components/ContentReveal';
import { Hero } from '@/components/Hero';
import { HeroImageSettle } from '@/components/HeroSettle';
import { IntroScrollCue } from '@/components/IntroScrollCue';
import { IntroSkip } from '@/components/IntroSkip';
import { LitWindows } from '@/components/LitWindows';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Plate } from '@/components/Plate';
import { HeroProductReveal } from '@/components/ProductReveal';
import { RailInert } from '@/components/RailInert';
import { Receipt } from '@/components/Receipt';
import { Reveal } from '@/components/Reveal';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { RunwayIdentityRelease } from '@/components/RunwayIdentityRelease';
import { cn } from '@/lib/cn';
import { getA11yReceipts, getCertificates, getDeliverables, getProfile, getRounds } from '@/lib/content';
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
      siteName: `${profile.name}: AI Portfolio`,
      locale: 'en_CA',
      title: `${profile.name}: AI Portfolio`,
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

/**
 * H1 (THE ROOM Phase H) — Record band dates. `row.when` mixes real ISO
 * dates (rounds.json / a11y-receipts.json) with the literal status word
 * `'closed'` (the defect row) — wrapping the word in `<time>` would emit an
 * invalid `dateTime`, so only the ISO-shaped values get wrapped.
 */
function renderRecordWhen(when: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(when) ? <time dateTime={when}>{when}</time> : when;
}

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
  /**
   * The three chip figures that belong to a PROJECT rather than to this site
   * (C4's "trivia demotes into the rows that own it"), carried verbatim —
   * `stat + label`, exactly as the retired band said them. The other two chips
   * became instruments: `2,900+ tests passing` is a hero receipt and
   * `2.2 AA — the bar I build to` is a Record row.
   *
   * These are here rather than in deliverables.json because they were never
   * deliverable data: they were the homepage band's own hand-set copy, and
   * moving them into the schema would be inventing a field to hold a claim
   * nobody has re-verified. Dashboard has no entry because it never had a chip.
   */
  const CHIP_NOTE: Record<string, string> = {
    'claude-corp': '15 AI agents',
    'prompt-library': '100% static',
    'ghost-code': '56 command cards',
  };

  const workIndex = [flagship, ...rest].filter((d): d is NonNullable<typeof d> => Boolean(d)).map((d, i) => ({
    d,
    numeral: String(i + 1).padStart(2, '0'),
    href: `/work/${d.id}/`,
    isFlagship: d === flagship,
    lit: d.id !== 'dashboard',
    note: CHIP_NOTE[d.id],
  }));

  /**
   * The hero's three receipts (C4) — what the five stat chips became.
   *
   * The chips were a band of five figures with no dates and no method: the
   * site's biggest numbers, stated. A `Receipt` is the documentary register
   * instead — figure, what it measures, the tier WORD ("measured" = run
   * against this site, "reported" = project-claimed with a method), the date
   * it was true, and a door to the method. Three, curated, in the hero's own
   * column: tests · axe · the calibration round.
   *
   * Every chip datum is conserved; the two that are not receipts moved into
   * the rows and the Record band that own them (see build-reports/C_CLOSEOUT.md
   * for the conservation table). Nothing here is re-authored: `2,900+` and
   * `tests passing` are the chip's own ratified strings, and the axe figure,
   * its method line and its date come straight from content/a11y-receipts.json.
   */
  const a11y = getA11yReceipts();
  const axe = a11y.receipts.find((r) => r.label === 'axe violations');
  const rounds = getRounds();

  /**
   * The calibration receipt reads the ledger rather than restating it, so it
   * stays true through whichever way the open-Round-IV decision goes: while a
   * round is open it prints that round with no date (a row that has not closed
   * has none to give — see Receipt's `date`); once none is open it prints the
   * last one that closed, with its close date.
   */
  const openRound = rounds.find((r) => !r.closed);
  const lastClosedRound = [...rounds].reverse().find((r) => r.closed);
  const calibration = openRound
    ? {
        value: openRound.numeral,
        label: `calibration round, open: ${openRound.counts[0]}`,
        date: undefined as string | undefined,
      }
    : lastClosedRound
      ? {
          value: lastClosedRound.numeral,
          label: `calibration rounds, none open: ${lastClosedRound.counts[0]}`,
          date: lastClosedRound.closed,
        }
      : null;

  /**
   * The Record (C5) — the ledger, most-recent first, one order at every width.
   *
   * What is verified RIGHT NOW: the round that is open, the last defect found
   * and fixed, and the site's own measured numbers with the day they were
   * measured. The bug row is the point — a portfolio that publishes its own
   * defect ledger above the fold — and it is why this band is not a second
   * printing of the hero strip. Deliberately NOT here: the `2,900+` and `0`
   * the hero already headlines two screens up. The hero states the proof; this
   * states the record; restating the same two figures in both would be the
   * disease this phase treats, and /accessibility/#receipts holds all six
   * measured numbers for anyone who wants the rest.
   *
   * `2.2 AA — the bar I build to` re-homes here from the retired chip band.
   * The label is SKY-RATIFIED (2026-07-13, T10 W4-02: it replaced "WCAG
   * conformance", which overclaimed against the /accessibility/ statement) and
   * survives this move byte-for-byte, still pointing at /accessibility/.
   */
  const a11yByLabel = (label: string) => a11y.receipts.find((r) => r.label === label);
  const focusStops = a11yByLabel('focus stops visible');
  const contrastTier = a11yByLabel('measured, both themes');

  const recordRows: {
    key: string;
    figure: string;
    what: ReactNode;
    when?: string;
    open?: boolean;
    tone?: 'defect';
  }[] = [
    ...(calibration
      ? [
          {
            key: 'calibration',
            figure: `Round ${calibration.value}`,
            what: (
              <>
                {openRound ? `${openRound.title}: ${openRound.counts.join(' · ')}` : calibration.label}
                {' · '}
                <Link href="/colophon/#calibration" className="link-draw text-accent-text">
                  the record
                </Link>
              </>
            ),
            when: calibration.date,
            open: Boolean(openRound),
          },
        ]
      : []),
    {
      key: 'defect',
      figure: 'Last defect',
      /* The board's own wording for this row (board 01, pane A), and every
         clause of it is checkable against the case study's `What went wrong`
         — which is where the link goes. The subject is set in the house
         serif italic, the one place this ledger leaves mono. */
      what: (
        <>
          <em className="font-serif italic text-ink">the dead Report button</em>
          {': found by a simulator walk, fixed by one moved closing tag, re-proven by a test that fails against the old arrangement · '}
          <Link href="/work/flagstone/#what-went-wrong" className="link-draw text-accent-text">
            the account
          </Link>
        </>
      ),
      when: 'closed',
      tone: 'defect' as const,
    },
    ...(contrastTier
      ? [
          {
            key: 'contrast',
            figure: '2.2 AA',
            /* SKY-RATIFIED LABEL, moved verbatim from the retired chip band
               (2026-07-13, T10 W4-02). It must not be reworded, and it must
               keep pointing at /accessibility/. */
            what: (
              <>
                {'the bar I build to: '}
                {contrastTier.sub}
                {' · '}
                <Link href="/accessibility/" className="link-draw text-accent-text">
                  the statement
                </Link>
              </>
            ),
            when: a11y.measuredDate,
          },
        ]
      : []),
    ...(focusStops
      ? [
          {
            key: 'focus',
            figure: focusStops.value,
            what: (
              <>
                {`${focusStops.label}: ${focusStops.sub}`}
                {' · '}
                <Link href="/accessibility/#receipts" className="link-draw text-accent-text">
                  evidence
                </Link>
              </>
            ),
            when: a11y.measuredDate,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* ── Identity mark — holds the top-left through the wordless runway so
          who-this-is registers at first paint (L1-01 / S17). Fixed sibling of
          the intro, never a child of it; the locked intro is untouched. ── */}
      <RunwayIdentity name="Sky Halisky" />
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
          positioning="Senior technical-support specialist. I turn recurring user friction into documentation, QA, and the tools that fix it."
          avatarSrc="/images/headshot.jpg"
          avatarAlt="Sky Halisky"
          eyebrow="Portfolio: 2026"
          heading="An accessibility map. A multi-agent system. A web-based prompt library."
          subhead="Five projects built, all five on the open web. One submitted to Apple for App Store review. Accessibility first, built for everyone."
          ctaLabel="See the work."
          ctaHref="#work"
          receipts={
            <div className="mt-16 max-w-[880px]">
              {/* Three receipts, one grid. Individually bordered on their own
                  receipt paper stock rather than the retired chip band's
                  hairline-joined cells: the chips read as one instrument
                  panel, three receipts read as three pieces of evidence,
                  which is the whole point of the change.
                  The 3-up waits until lg, and the reason is the RAIL: from md
                  up the shell spends 280px on the sidebar, so a 768 viewport
                  leaves this column 424px and a `sm:` 3-up measured 131px per
                  cell — an 83px content box, which folded the mono labels and
                  pushed 15px of copy out of its padding box. A media query
                  cannot see the container, so the breakpoint has to be picked
                  from the column width the rail leaves behind. Stacked below
                  lg is board 01 pane C's "no 3-up squeeze" anyway. */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Receipt
                  value="2,900+"
                  label="tests passing: Flagstone"
                  /* "reported": run against the Flagstone repo, not this
                     site. The figure is the chip's own ratified floor
                     (the suite grows most weeks); the exact 2,971 and the
                     command that reproduces it live behind `method`. */
                  tier="reported"
                  date="2026-08-16"
                  methodHref="/work/flagstone/#flagstone-test-count-method"
                />
                {axe && (
                  <Receipt
                    value={axe.value}
                    label={`${axe.label}: ${axe.sub}`}
                    /* "measured": run against THIS site. Figure, method line
                       and date all read from content/a11y-receipts.json, so
                       the next verification run moves this receipt. */
                    tier="measured"
                    date={a11y.measuredDate}
                    methodHref="/accessibility/#receipts"
                    methodLabel="evidence"
                  />
                )}
                {calibration && (
                  <Receipt
                    value={calibration.value}
                    label={calibration.label}
                    tier="reported"
                    date={calibration.date}
                    methodHref="/colophon/#calibration"
                    methodLabel="the record"
                  />
                )}
              </div>
            </div>
          }
        />
      </div>

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
                    Featured: the flagship
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
                    <span aria-hidden="true">: </span>{' '}
                    <span className="text-cool-deep normal-case tracking-normal">{flagship.status}</span>
                  </p>
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
                {/* The supplied submitted-era Explore screenshot has no
                    independently proven capture date. Keep this screenshot-
                    specific label truthful and date-free. */}
                <p className="mt-4 text-center font-mono text-meta tracking-label uppercase text-text-meta">
                  Current product capture · Explore
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
            {workIndex.map(({ d, numeral, href, isFlagship, note }, i) => (
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
                    /* H3 (THE ROOM Phase H): the axe re-audit measured this
                       numeral's rest state at 1.8:1 light / 2.46:1 dark —
                       aria-hidden doesn't exempt VISUALLY-legible text from
                       1.4.3 (only from the AT tree), and at text-step-1
                       (20px normal) it doesn't clear the large-text 3:1
                       floor either. text-ink/30 -> /70 clears 4.5:1 in both
                       themes with real margin (5.13 / 7.70); the hover step
                       moves with it (45 -> 85) so hover still darkens
                       rather than fading. CaseStudyCard's own ghosted
                       numeral (same /30 pattern) is untouched — its larger
                       text-card-numeral size already clears 3:1, confirmed
                       by 0 axe violations on /work and every case page. */
                    className="w-8 lg:w-12 shrink-0 font-serif font-light text-step-1 leading-none tabular-nums text-ink/70 transition-colors duration-base ease-out group-hover:text-ink/85"
                  >
                    {numeral}
                  </span>
                  <div className="min-w-0 flex-1 flex flex-col lg:flex-row lg:items-baseline lg:gap-8">
                    <div className="min-w-0 lg:flex-[1.6] flex flex-col gap-1.5">
                      <h3 className="font-serif font-light text-step-1 leading-heading text-ink">
                        <Link
                          href={href}
                          aria-label={`View ${d.title} project`}
                          className="rounded-sm transition-colors duration-fast ease-out hover:text-accent-text focus-visible:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                        >
                          {d.title}
                        </Link>
                      </h3>
                      <p className="font-sans font-light text-body-sm leading-body text-ink-muted text-pretty">
                        {d.summary}
                      </p>
                      <Link
                        href={href}
                        aria-label={`View project: ${d.title} case study`}
                        tabIndex={-1}
                        className="group inline-flex h-11 w-fit items-center gap-2 rounded-pill border border-border-interactive bg-canvas px-4 font-mono text-label tracking-label uppercase text-ink shadow-soft transition-[background-color,border-color,box-shadow,transform] duration-base ease-out hover:-translate-y-px hover:border-ink-muted hover:bg-blush hover:shadow-soft focus-visible:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                      >
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-terracotta transition-[width,height] duration-base ease-out group-hover:h-2 group-hover:w-2" />
                        View project
                        <span aria-hidden="true">{'→'}</span>
                      </Link>
                    </div>
                    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:mt-0 lg:contents">
                      <div className="lg:flex-1 flex flex-col gap-1.5">
                      <p className="font-mono text-meta tracking-label uppercase text-text-meta text-pretty">
                        {isFlagship ? (
                          <Link
                            href="#flagship"
                            /* H3 (THE ROOM Phase H) — SC 2.5.3 Label in Name
                               + axe label-content-name-mismatch: the old
                               aria-label ("Flagstone — the flagship room,
                               above") shared no words with the visible text
                               ("Featured — above"), a live violation the H3
                               re-audit caught. The accessible name now
                               computes from visible content instead; this
                               row's own title link, immediately before this
                               one, already announces which project. */
                            /* This is the one STANDALONE small link in the
                               band — every other new link on this page is
                               inline in a sentence and takes WCAG 2.5.8's
                               inline exception. Its own box measures 14px
                               tall, so it gets the house 44 floor the way
                               TapTargets.test.tsx says to reach it: a
                               stretched ::after, never padding, because
                               `*:focus-visible` traces the element's own
                               border box and padding would draw a 44px ring
                               around a 14px label. 14 + 15 + 15 = 44.
                               Symmetric is safe HERE (unlike the card action
                               rows the guard was written for): the row's own
                               py-6 leaves 24px of dead band each side, and
                               the nearest other target is the title link
                               32px away horizontally. */
                            className="relative rounded-sm transition-colors duration-fast ease-out text-accent-text hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary after:content-[''] after:absolute after:inset-x-0 after:-top-[15px] after:-bottom-[15px]"
                          >
                            Featured: above
                            <span aria-hidden="true" className="ml-1.5">{'↑'}</span>
                          </Link>
                        ) : (
                          d.status
                        )}
                      </p>
                      {/* The chip's own figure, demoted (C4's conservation
                          rider). Accent register, not the status grey, so it
                          reads as a measured figure rather than a second
                          status — which is what it is. */}
                      {note && (
                        <p className="font-mono text-meta tracking-label uppercase text-accent-text tabular-nums">
                          {note}
                        </p>
                      )}
                      </div>
                      <p className="shrink-0 lg:w-16 lg:text-right font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
                        <time dateTime={String(d.year)}>{d.year}</time>
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── The Record ────────────────────────────────────────────────
          C5 (board 01, pane A). A designed ledger of what is verified right
          now, sitting one band below the work rather than at the foot of the
          page — the most distinctive thing here is the LAST ROW: a portfolio
          that publishes its own defect ledger, in the open, above the fold.

          Order is most-recent first, and it is ONE order at every width: the
          round that is open, the defect that closed, then the measured numbers
          with the day they were measured. Desktop reads as three columns —
          figure · what was checked · when. Below lg each row stacks into three
          lines rather than compressing into a table; a table is what this is
          NOT (pane C), because a 375 reader wants the sentence, not a grid.

          Rows are read from content/rounds.json and content/a11y-receipts.json,
          so the band restates nothing: close Round IV and open Round V in the
          ledger and this row follows, with no edit here. */}
      <section
        id="record"
        className={cn(
          'relative isolate overflow-hidden',
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface-cool',
          'border-t border-cool-soft/40',
        )}
      >
        <ParallaxWash depth="far" tone="teal" />
        <div className="relative z-10 max-w-content mx-auto">
          <Reveal variant="scene" className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              The Record
            </p>
            {/* The h2 earns its place by naming the row no other portfolio
                has. Its first draft, "Measured, not claimed.", was the only
                FRAGMENT among six full-sentence H2s on this page, and it
                restated — more weakly — "The record is honest." from the band
                two below it. It was also already /accessibility/'s own section
                heading (A11yReceipts), which is untouched and keeps it.
                Note for whoever edits next: "everything here is dated" was
                considered and rejected as false — two of the four rows carry a
                STATE (open, closed), not a date. */}
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
              The last thing I got wrong is in here too.
            </h2>
          </Reveal>

          {/* role="list" IS load-bearing: Tailwind preflight sets
              list-style:none on every ul, which is the condition that makes
              Safari/VoiceOver drop list semantics — same reasoning, and the
              same one-line lint exemption, as CalibrationRecord. */}
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ul role="list" className="flex flex-col max-w-[880px]">
            {recordRows.map((row, i) => (
              <li
                key={row.key}
                className="border-t border-receipt-rule/30 first:border-t-0 first:pt-0 py-5 last:pb-0"
              >
                <Reveal
                  index={Math.min(i, 4)}
                  variant="depth"
                  className="flex flex-col gap-1.5 lg:flex-row lg:items-baseline lg:gap-x-6 lg:gap-y-0"
                >
                  <span
                    className={cn(
                      'shrink-0 lg:w-40 font-mono font-medium text-body-sm tabular-nums',
                      row.tone === 'defect' ? 'text-cool-deep' : 'text-accent-text',
                    )}
                  >
                    {row.figure}
                  </span>
                  <span className="min-w-0 lg:flex-1 font-sans font-light text-body-sm leading-body text-ink-muted text-pretty">
                    {row.what}
                  </span>
                  <span className="shrink-0 lg:ml-auto font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
                    {row.open ? (
                      <>
                        <span aria-hidden="true" className="mr-2 inline-block h-1 w-1 rounded-full bg-terracotta align-middle" />
                        open
                      </>
                    ) : (
                      row.when && renderRecordWhen(row.when)
                    )}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
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
              migrations are files with a rollback, never applied changes: no
              agent applies one to production, or sends anything outside the
              repository, without my explicit authorization under a narrow,
              mechanically gated exception. None handles credentials.
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

            {/* Credentials, demoted (C6). The band this replaces spent an
                eyebrow, a display H2 and nine dated rows — 1,741px at 1440 —
                on a list that already has a dedicated page, with the
                hand-drawn badges the homepage digest never showed.
                Nothing is rewritten: the line IS the retired band's own H2
                ("Credentials, earned in order."), the count is read from
                content/certificates.json so it cannot drift from the page it
                points at, and the door keeps the band's existing CTA string.
                A band became a sentence. */}
            <p className="font-sans font-light text-body-sm leading-body text-ink-muted text-pretty">
              Credentials, earned in order: {certificates.length} of them, with issuers and
              dates.{' '}
              <Link href="/certificates/" className="link-draw text-accent-text">
                See the credential badges
                <span aria-hidden="true" className="ml-1">{'→'}</span>
              </Link>
            </p>
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

      {/* The lit windows (R4/BP6 · P01) — the door's night reveal. Its lit map
          was bound to the showcase strip's hrefs; C4 retired that strip, so the
          binding moved DOWN to the work index — the surviving list of the five,
          which this page actually renders (`workIndex[].lit`, declared beside
          the rows). Same four lit, same one dark, byte-identical output; what
          changed is which visible list it can never drift from.
          Height-0 row → zero layout, CLS 0.
          OUTSIDE <ContentReveal> on purpose (batch-skeptic HIGH): the reveal
          wrapper's persistent inline transform creates a stacking context that
          let the footer paint AND hit-test above the windows on desktop —
          out here the row joins the root stacking context and z-index wins.
          The component only consumes the :root --day-night var, so nothing
          else changes. */}
      <LitWindows
        deliverables={deliverables}
        litHrefs={workIndex.filter((r) => r.lit).map((r) => r.href)}
      />
    </>
  );
}
