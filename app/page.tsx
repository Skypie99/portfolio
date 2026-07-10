import Link from 'next/link';

import { CinematicDesert } from '@/components/cinematic/CinematicDesert';
import { ContactEmail } from '@/components/ContactEmail';
import { ContentReveal } from '@/components/ContentReveal';
import { CountUpStat } from '@/components/CountUpStat';
import { Hero } from '@/components/Hero';
import { NumberedStep } from '@/components/NumberedStep';
import { ParallaxWash } from '@/components/ParallaxWash';
import { ProjectCard } from '@/components/ProjectCard';
import { RailInert } from '@/components/RailInert';
import { Reveal } from '@/components/Reveal';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getCertificates, getDeliverables, getProfile } from '@/lib/content';

/**
 * Single-scroll homepage. Server Component — all content at build time, zero
 * client JS except Hero + HamburgerNav + AppMockup (client animation).
 *
 * Section order (all anchor-linked from the hamburger nav):
 *  #hero          — Hero (F-01)
 *  #work          — All deliverables (six)
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

  /** Showcase stat chips — hardcoded per spec. L3-09: each chip is now a quiet
   *  door to the proof it names (project chips → their case study, the a11y chip
   *  → the /accessibility/ statement) — same composition, only the system's own
   *  link affordances added. */
  const showcaseChips = [
    {
      stat: '1,680',
      label: 'tests passing',
      project: 'AccessMap',
      href: '/work/accessmap/',
      tags: ['Mobile', 'WCAG AA', 'Open source'],
    },
    {
      stat: '15',
      label: 'AI agents',
      project: 'Claude Corp',
      href: '/work/claude-corp/',
      tags: ['MCP', 'Real commits'],
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
      stat: '0',
      label: 'addresses stored',
      project: 'Mutual Mesh',
      href: '/work/mutual-mesh/',
      tags: ['Privacy-first', 'Invite-only', 'EXIF-strip'],
    },
    {
      stat: '2.2 AA',
      label: 'WCAG conformance',
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
      <RunwayIdentity name="Sky Halisky" roleLabel="AI developer" />

      {/* ── Cinematic intro — 2.5D GSAP camera-push desert (placeholder phase) ─ */}
      <CinematicDesert />

      {/* Chrome guard: rail is inert while the pinned stage fully obscures it
          (skip link → hero CTA stays the top-of-page keyboard journey). */}
      <RailInert />

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
          subhead="Six projects built, five live on the open web. Accessibility first, built for everyone."
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
          'border-t border-wa-teal-soft/40',
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
            <h2 className="font-serif font-light text-step-4 ember mb-3 max-w-2xl leading-[1.1] text-balance">
              Built, shipped, and open.
            </h2>
            <p className="font-sans font-light text-body text-charcoal mb-24 max-w-[540px] text-pretty">
              Real products on the open internet. Each one accessible by design.
            </p>
          </Reveal>

          {/* 3×2 stat grid — vertical-rule layout for editorial weight */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-wa-teal-soft/30 border border-wa-teal-soft/50 rounded-lg overflow-hidden shadow-md">
            {showcaseChips.map(({ stat, label, project, href, tags }, i) => (
              <Reveal
                key={project}
                // MO-4: cap the stagger (site idiom, work/[slug]/page.tsx:42-44)
                index={Math.min(i, 4)}
                variant="depth"
                className={cn(
                  'group relative flex flex-col bg-surface-mid p-8 md:p-7',
                  // An odd trailing chip spans its 2-col (mobile) / 3-col (md+)
                  // row so no bare grid cell shows through. With six chips the
                  // grid is a clean 3×2 and `odd:` self-disables on its own.
                  'last:odd:col-span-2 lg:last:odd:col-span-1',
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
                <p className="font-serif text-prose text-near-black mb-3">
                  <Link
                    href={href}
                    aria-label={`${project} — ${stat} ${label}`}
                    className="rounded-sm transition-colors duration-fast ease-out after:absolute after:inset-0 after:content-[''] group-hover:text-accent-text focus-visible:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                  >
                    {project}
                  </Link>
                  <span
                    aria-hidden="true"
                    className="ml-1.5 inline-block text-accent-text opacity-70 transition-transform duration-base ease-gh-glide group-hover:translate-x-0.5"
                  >
                    {'→'}
                  </span>
                </p>
                <ul className="flex flex-wrap gap-1.5 mt-auto" aria-label={`Tags for ${project}`}>
                  {tags.map((tag) => (
                    <li key={tag}>
                      <TagPill>{tag}</TagPill>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
          {/* Dani wave5: terracotta left-border accent on section headers */}
          <Reveal variant="scene" className="mb-24 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              The Work
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
              A handful of things, made with intention.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured card — full width, col-span preserved via className */}
            {deliverables[0] && (
              <Reveal variant="depth" className="lg:col-span-2" index={0}>
                <ProjectCard deliverable={deliverables[0]} wide index={0} />
              </Reveal>
            )}
            {/* Remaining cards in the 2-col grid. An odd trailing card spans
                the full row in the featured horizontal layout (the variant
                proven full-width two rows up) so it bookends the grid instead
                of dangling beside an empty cell. Self-disables at even counts. */}
            {deliverables.slice(1).map((d, i, rest) => {
              const lone = i === rest.length - 1 && rest.length % 2 === 1;
              return (
                <Reveal
                  key={d.id}
                  index={i + 1}
                  variant="depth"
                  className={lone ? 'lg:col-span-2' : undefined}
                >
                  <ProjectCard deliverable={d} index={i + 1} wide={lone} />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────── */}
      <section
        id="process"
        className={cn(
          'relative isolate overflow-hidden',
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface-alt',
          'border-t border-border-decorative',
        )}
      >
        {/* layered golden-hour depth behind the method panel — far tier, RM-static */}
        <ParallaxWash depth="far" />
        <div className="relative z-10 max-w-content mx-auto">
          <Reveal variant="scene" className="mb-24 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              Method
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-[1.1] text-balance">
              Three quiet steps, repeated carefully.
            </h2>
          </Reveal>

          {/* Warm-white panel — hairline rules between steps.
              Each NumberedStep staggered 80ms apart (index * 0.08s in Reveal). */}
          <div className="bg-surface-mid rounded-lg p-12 md:p-24 border border-stone dark:border-line-strong/75 space-y-12 shadow-lg dark:shadow-md">
            <Reveal index={0} variant="depth">
              <NumberedStep
                number="01"
                title="Discover"
                body="Start with the smallest honest version of the problem. The people who will live with the thing know more than the ones who will fund it."
                highlight
              />
            </Reveal>
            <div aria-hidden="true" className="rule-ember" />
            <Reveal index={1} variant="depth">
              <NumberedStep
                number="02"
                title="Build"
                body="One slice at a time. Type-safe, accessible from the first line, no shortcuts that leave people out."
                highlight
              />
            </Reveal>
            <div aria-hidden="true" className="rule-ember" />
            <Reveal index={2} variant="depth">
              <NumberedStep
                number="03"
                title="Ship & stay curious"
                body="Get it into the world, notice what's not working and what could be, and keep refining until it earns its place. The work speaks for itself."
                highlight
              />
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
            <h2 className="font-serif font-light text-step-4 ember leading-[1.1] text-balance">
              The work is careful. The record is honest.
            </h2>
          </Reveal>

          <Reveal variant="depth" className="max-w-measure flex flex-col gap-8">
            {/* Pull-quote accent — editorial tone-setter */}
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
            <p className="font-sans font-light text-prose text-charcoal leading-[1.65] text-pretty">
              I keep a written record of how each thing was made. The
              documentation is part of the deliverable, not an afterthought.
            </p>
            <Link
              href="/about/"
              className="link-draw inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black mt-2 self-start"
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
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-[1.1] text-balance">
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
                      <h3 className="font-serif font-normal text-step-2 text-near-black leading-tight nums-lining transition-colors duration-fast ease-out group-hover:text-accent-text">
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
                      /* L5-07: px/py-1 + negative margins lift the tap box
                         (~23px) with zero layout shift. */
                      className="px-1 py-1 -mx-1 -my-1 font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-1 transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1 shrink-0"
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
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section
        id="contact"
        className={cn(
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface-cool-pale',
          'border-t border-wa-teal-soft/50',
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
              Let&apos;s talk
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
              Have something worth building?
              <br />
              Let&apos;s talk about it.
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
    </>
  );
}
