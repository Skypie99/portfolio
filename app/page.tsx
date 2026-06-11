import Link from 'next/link';

import { CinematicDesert } from '@/components/cinematic/CinematicDesert';
import { ContactEmail } from '@/components/ContactEmail';
import { ContentReveal } from '@/components/ContentReveal';
import { CountUpStat } from '@/components/CountUpStat';
import { Hero } from '@/components/Hero';
import { Icon } from '@/components/Icon';
import { NumberedStep } from '@/components/NumberedStep';
import { ParallaxWash } from '@/components/ParallaxWash';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';
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

  /** Showcase stat chips — hardcoded per spec */
  const showcaseChips = [
    {
      stat: '1,680',
      label: 'tests passing',
      project: 'AccessMap',
      tags: ['Mobile', 'WCAG AA', 'Open source'],
    },
    {
      stat: '15',
      label: 'AI agents',
      project: 'Claude Corp',
      tags: ['MCP', 'Real commits'],
    },
    {
      stat: '100%',
      label: 'static',
      project: 'Prompt Library',
      tags: ['No backend', 'Browser-only'],
    },
    {
      stat: '56',
      label: 'command cards',
      project: 'Ghost Code',
      tags: ['Vanilla JS', 'Zero deps'],
    },
    {
      stat: '0',
      label: 'addresses stored',
      project: 'Mutual Mesh',
      tags: ['Privacy-first', 'Invite-only', 'EXIF-strip'],
    },
    {
      stat: '2.2 AA',
      label: 'WCAG conformance',
      project: 'Born accessible',
      tags: ['Screen-reader', '44pt targets', 'Reduced-motion'],
    },
  ] as const;

  /** Each stat number takes a different desert hue — a teal + orange spread. */
  const STAT_EMBER = ['ember', 'ember-teal', 'ember-gold', 'ember-moss'];

  return (
    <>
      {/* ── Cinematic intro — 2.5D GSAP camera-push desert (placeholder phase) ─ */}
      <CinematicDesert />

      <ContentReveal>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div id="hero">
        <Hero
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
            <p className="font-mono text-label text-sage-text uppercase tracking-label mb-3 flex items-center gap-2">
              <Icon name="live" className="w-3.5 h-3.5 text-terracotta" />
              Shipped
            </p>
            {/* Heading */}
            <h2 className="font-serif font-light text-step-4 ember mb-3 max-w-2xl leading-[1.1] text-balance">
              Built, shipped, and open.
            </h2>
            <p className="font-sans font-light text-body text-charcoal mb-12 max-w-[540px] text-pretty">
              Real products on the open internet. Each one accessible by design.
            </p>
          </Reveal>

          {/* 3×2 stat grid — vertical-rule layout for editorial weight */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-px bg-wa-teal-soft/30 border border-wa-teal-soft/50 rounded-lg overflow-hidden shadow-md">
            {showcaseChips.map(({ stat, label, project, tags }, i) => (
              <Reveal
                key={project}
                index={i}
                variant="depth"
                className={cn(
                  'group flex flex-col bg-surface-mid p-6 md:p-7',
                  // An odd trailing chip spans its 2-col (mobile) / 3-col (md+)
                  // row so no bare grid cell shows through. With six chips the
                  // grid is a clean 3×2 and `odd:` self-disables on its own.
                  'last:odd:col-span-2 lg:last:odd:col-span-1',
                  'transition-colors duration-base ease-out hover:bg-surface',
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
                <p className="font-serif text-prose text-near-black mb-3">{project}</p>
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
          <Reveal variant="scene" className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <Icon name="work" className="w-3.5 h-3.5 text-terracotta" />
              The Work
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
              A handful of things, made with intention.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Featured card — full width, col-span preserved via className */}
            {deliverables[0] && (
              <Reveal className="md:col-span-2" index={0}>
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
                  className={lone ? 'md:col-span-2' : undefined}
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
          <Reveal variant="scene" className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <Icon name="method" className="w-3.5 h-3.5 text-terracotta" />
              Method
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-[1.1] text-balance">
              Three quiet steps, repeated carefully.
            </h2>
          </Reveal>

          {/* Warm-white panel — hairline rules between steps.
              Each NumberedStep staggered 80ms apart (index * 0.08s in Reveal).
              AnimatedStepList not used: it lacks the `highlight` prop and
              manages its own dividers inside an <ol>, which would require
              restructuring the existing divider elements between steps. */}
          <div className="bg-surface-mid rounded-lg p-8 md:p-12 border border-stone dark:border-line-strong/75 space-y-8 shadow-lg dark:shadow-md">
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
          <Reveal variant="scene" className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <Icon name="about" className="w-3.5 h-3.5 text-terracotta" />
              A Brief Account
            </p>
            <h2 className="font-serif font-light text-step-4 ember leading-[1.1] text-balance">
              The work is careful. The record is honest.
            </h2>
          </Reveal>

          <Reveal variant="depth" className="max-w-measure flex flex-col gap-6">
            {/* Pull-quote accent — editorial tone-setter */}
            <blockquote className="pull-quote nums-oldstyle pl-3 font-serif font-light italic text-step-2 text-ink leading-[1.45] text-balance">
              One careful deliverable beats a dozen rough ones.
            </blockquote>
            <span aria-hidden="true" className="rule-ember block h-px w-16" />

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
          <Reveal variant="scene" className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink mb-4">
              <Icon name="credentials" className="w-3.5 h-3.5 text-terracotta" />
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
              <li key={c.id} className="py-8 first:pt-0 last:pb-0 group">
                <Reveal index={i} variant="depth">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 transition-transform duration-base ease-out group-hover:translate-x-1">
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta md:w-40 shrink-0">
                      {c.issuer}
                    </p>
                    <div className="flex-1 flex flex-col gap-1">
                      <h3 className="font-serif font-normal text-step-2 text-near-black leading-tight transition-colors duration-fast ease-out group-hover:text-accent-text">
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
                      aria-label={`View credential: ${c.title} from ${c.issuer}`}
                      className="font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-1 transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1 shrink-0"
                    >
                      View
                      <span aria-hidden="true">{'→'}</span>
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
        <Reveal className="relative z-10 max-w-content mx-auto flex flex-col items-start gap-8">
          <p className="font-mono text-label tracking-label uppercase text-wa-teal-deep flex items-center gap-2">
            <Icon name="contact" className="w-3.5 h-3.5 text-terracotta" />
            Correspond
          </p>
          <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
            Have something worth building?
            <br />
            Let&apos;s talk about it.
          </h2>
          {/* Bot-safe mailto — the address is assembled at runtime (matches the
              /contact page), so it never sits raw in the static HTML for scrapers.
              Shows "Email {address}" to humans after hydration. */}
          <ContactEmail />
        </Reveal>
      </section>
      </ContentReveal>
    </>
  );
}
