import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactEmail } from '@/components/ContactEmail';
import { EditorialPlate, EditorialPortrait, EditorialRise } from '@/components/EditorialPlate';
import { SettleHeading } from '@/components/HeroSettle';
import { HorizonRule } from '@/components/HorizonRule';
import { IdentityLines } from '@/components/IdentityLines';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import { getCertificates, getDeliverables, getProfile } from '@/lib/content';
import { canonicalFor } from '@/lib/metadata';
import { OG_CARD } from '@/lib/og';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = 'Skyler Halisky. Senior technical-support specialist. Okanagan Valley, British Columbia.';
  return {
    title: `About: ${profile.name}`,
    description,
    alternates: {
      canonical: canonicalFor('/about/'),
    },
    openGraph: {
      type: 'website',
      // TA-10: a leaf openGraph REPLACES the root's wholesale (W0-04) — url,
      // siteName and locale restated so they survive on this route's share.
      url: '/about/',
      siteName: 'Skyler Halisky: Senior Technical Support',
      locale: 'en_CA',
      title: `About: ${profile.name}`,
      description,
      images: [OG_CARD],
    },
    twitter: {
      card: 'summary_large_image',
      title: `About: ${profile.name}`,
      description,
    },
  };
}

/**
 * Editorial split (Fable about + contact, 2026-10-18). From xl the content
 * column becomes a 12-column spread: a section header sits left (5 columns)
 * with its drawn horizon, and the prose answers on the right (7 columns), so
 * the desktop reads as an editorial page instead of a single stacked measure
 * with half the frame empty. Below xl everything stacks in DOM order, which
 * is also the reading order. Pure layout: no copy moves between sections.
 */
const SPLIT = 'xl:grid xl:grid-cols-12 xl:gap-x-12 xl:items-start';
const SPLIT_HEAD = 'mb-12 xl:mb-0 xl:col-span-5';
const SPLIT_BODY = 'xl:col-span-7';

/**
 * /about — F-07. Sky's story. The #method band defers to the front page's
 * canonical #how-i-work account (L4, 2026-08-26) rather than paraphrasing it;
 * it no longer uses <NumberedStep />, which stays live on / and /colophon.
 * After it, a "What I'm working on" block surfaces up to 3 deliverables
 * — the featured one first, then year-desc — linked into /work/[slug].
 * Restrained ffern-style copy — short sentences, no fluff.
 *
 * Server Component. The story paragraphs below are finalized copy in Sky's
 * voice; the copy can be swapped at any time without touching the layout.
 * Generous line-height (1.65) per Dani §3.
 *
 * Fable about + contact creative implementation (2026-10-18): the opening
 * band gains the person — an EditorialPlate carrying the public portrait,
 * the identity lines the runway chip already publishes, a drawn horizon and
 * the record (project + credential counts read from content, never typed).
 * Every story paragraph, heading, eyebrow and section id is byte-identical
 * to the previous build; only composition and motion changed.
 */
export default function AboutPage() {
  const profile = getProfile();
  // Up to 3 most recent deliverables — featured first if present, otherwise
  // year-desc ordering from getDeliverables(). Quiet list, no images.
  const allDeliverables = getDeliverables();
  const certificates = getCertificates();
  const featuredFirst = (() => {
    const f = allDeliverables.find((d) => d.featured);
    const rest = allDeliverables.filter((d) => !d.featured);
    return f ? [f, ...rest] : rest;
  })();
  const recent = featuredFirst.slice(0, 3);

  return (
    <>
      {/* UP-38's mobile brand chip (RunwayIdentity variant="page") is NOT
          mounted on this route any more. It existed because this page rendered
          zero identity before the footer at phone widths; the opening plate
          below now signs the page in the first screen — portrait, name and the
          same two role lines the chip carried — and mounting both would
          double-sign the first screen (the exact condition UP-38 avoided at
          md+). Revert = re-add the two mounts. */}
      {/* UP-10: the four in-page section bands below carry ids so the rail's
          "On this page" index can point at THIS page's sections instead of the
          homepage's. Attribute-only — every heading string, class and band is
          untouched. The id vocabulary matches home's (one terse word per
          section, on the <section> itself); the map that consumes them lives in
          lib/sectionNav.ts and a guard asserts each one still exists.
          This opening band is NOT one of them: `data-band-anchor` marks it as
          the route's title band (home's `div#hero` analogue, which the rail has
          always omitted), and its eyebrow "A Brief Account" is the name the
          Footer and HamburgerNav give to this whole PAGE — indexing it would
          put the page inside its own table of contents. */}
      {/* Page header — the opening spread. DOM order (also the reading and
          phone order): eyebrow, plate, title, story. From xl the plate moves
          beside the title into the right four columns, its top edge on the
          title's row, and the account runs down the left past it. Focus order
          follows DOM order: the plate's two links come after the eyebrow and
          before the title, where the plate sits in every layout. */}
      <section data-band-anchor className="px-gutter py-24 lg:py-32 world-surface">
        <div className={cn('max-w-content mx-auto', SPLIT)}>
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2 xl:col-span-8 xl:col-start-1 xl:row-start-1">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            A Brief Account
          </p>

          {/* The person. Portrait = the same public headshot the homepage
              nameplate uses (320px source, shown at 80 / 96 / 160px so it stays
              1:1 or better on 2x and 3x screens). The record counts are read
              from content so they cannot drift from the pages they open. */}
          <EditorialPlate
            arrival="mount"
            className="mt-2 mb-10 max-w-lg xl:my-0 xl:max-w-none xl:col-span-4 xl:col-start-9 xl:row-start-2 xl:row-span-2 xl:self-start"
          >
            <div className="flex items-start gap-5 xl:flex-col xl:gap-6">
              <EditorialPortrait
                src="/images/headshot.jpg"
                alt={profile.name}
                size={160}
                arrival="mount"
                className="h-20 w-20 shrink-0 sm:h-24 sm:w-24 xl:h-40 xl:w-40"
              />
              <IdentityLines name={profile.name} location={profile.location} arrival="mount" />
            </div>
            <HorizonRule arrival="mount" className="mt-5 w-full" />
            {/* The record: what the person has put on the public record, as
                links into the pages that hold it. Hit areas reach 44px via the
                estate's one-sided stretched ::after (UI_SYSTEM.md tap-target
                recipe) — the ring and the line box stay the text's own. */}
            {/* Rises last (after the name, the lines and the horizon's first
                beat) so the choreography reads in document order. */}
            <EditorialRise timing="late">
              <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-meta tracking-label uppercase text-text-meta">
                <Link
                  href="/work/"
                  className="link-draw relative text-accent-text after:absolute after:inset-x-0 after:-top-[14px] after:-bottom-[16px] after:content-['']"
                >
                  {allDeliverables.length} projects
                </Link>
                {/* The separator leads its clause (UI_SYSTEM.md wrap discipline #4):
                    bonded to the second link so a 320px wrap never strands it. */}
                <span className="whitespace-nowrap">
                  <span aria-hidden="true">·</span>{' '}
                  <Link
                    href="/certificates/"
                    className="link-draw relative text-accent-text after:absolute after:inset-x-0 after:-top-[14px] after:-bottom-[16px] after:content-['']"
                  >
                    {certificates.length} credentials
                  </Link>
                </span>
              </p>
            </EditorialRise>
          </EditorialPlate>

          <SettleHeading
            className="font-serif font-light text-display ember max-w-measure-heading mb-16 text-balance xl:col-span-8 xl:col-start-1 xl:row-start-2"
          >
            Support is the work and inspiration, building tools to solve problems and reduce friction.
          </SettleHeading>

          {/* Story paragraphs */}
          <div className="max-w-measure-lead flex flex-col gap-8 xl:col-span-8 xl:col-start-1 xl:row-start-3">
            <p className="font-sans font-light text-step-1 text-ink-muted text-pretty">
              I am Skyler Halisky.
            </p>
            <p className="font-sans font-light text-step-1 text-ink-muted text-pretty">
              By day, I’m a senior technical-support specialist: the escalation
              point for enterprise accounts, and I train and coach teammates. I
              came to software through problems I wanted to solve. Most of them
              involved accessibility: tools that should have been better but weren’t.
              I decided to make some that were.
            </p>

            {/* Pull-quote — editorial accent, carries the thesis */}
            {/* leading-[1.4]: a per-quote tuned value, not a token candidate —
                the sibling pull-quote on the homepage carries its own tuned 1.45. */}
            <blockquote className="pull-quote nums-oldstyle pl-3 font-serif font-light text-step-2 text-ink leading-[1.4] text-balance">
              {/* C-49: text-balance preferred the hyphen break "add-/on." at 375.
                  A nowrap span keeps the pivot compound whole (identical block
                  height at every width → CLS 0). */}
              Accessibility is not an <span className="whitespace-nowrap">add-on.</span> It is where you begin.
            </blockquote>
            <span aria-hidden="true" className="rule-ember block h-px w-32" />

            <p className="font-sans font-light text-prose text-ink-muted text-pretty">
              I work from {profile.location}. Mostly on AI-assisted tooling,
              accessibility infrastructure, and community software. I prefer
              learning in public.
            </p>
            <p className="font-sans font-light text-prose text-ink-muted text-pretty">
              I keep a written record of how each thing was made. The documentation
              is part of the deliverable, not an afterthought.
            </p>
            <p className="font-sans font-light text-prose text-ink-muted text-pretty">
              Right now: an accessibility map. A multi-agent system that ships real
              commits. A local-first prompt manager. A command-line trainer.
              All of them documented in the open.
            </p>
          </div>
        </div>
      </section>

      {/* How I work — Cycle 17: Dani §3.6 strict refit. */}
      <section
        id="method"
        className={cn(
          'px-gutter py-24 lg:py-32',
          // Dani wave4: alternating rhythm — warm-white
          'world-surface-alt border-t border-border-decorative',
          'relative overflow-hidden',
        )}
      >
        {/* Golden-hour scroll-depth (teal, to harmonise with the panel) */}
        <ParallaxWash depth="far" tone="teal" />
        <div className={cn('relative z-10 max-w-content mx-auto', SPLIT)}>
          <Reveal variant="scene" className={SPLIT_HEAD}>
            <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              Method
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
              How the work gets made is written down once.
            </h2>
            <HorizonRule arrival="reveal" className="mt-8 w-24" />
          </Reveal>

          {/* L4 / C7 (THE ROOM) — this band used to carry three NumberedSteps
              titled "Three quiet steps, repeated carefully." They were a
              generic paraphrase of the canonical account on the front page's
              #how-i-work band, which is byte-frozen and the real one. Three
              competing accounts of the same thing is the hierarchy problem
              this program spent eleven phases treating, so the band defers
              instead of restating.

              Phase C drafted this and deliberately did NOT apply it — "draft
              it and surface it; do not silently rewrite Sky's prose." Sky
              picked Draft A on 2026-08-26.

              The eyebrow stays "Method": it is the rail's byte-exact label for
              /about/#method (section-nav-anchors T2 checks it), so changing it
              would need its own sectionNav migration. The section id is
              untouched for the same reason. */}
          <div className={cn('bg-wash-cool border border-cool-soft/50 rounded-lg p-10 md:p-14', SPLIT_BODY)}>
            <Reveal index={0} className="flex flex-col gap-8">
              <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead text-pretty">
                There is one account of my method on this site, and it is on the
                front page: the governance system the agents work inside, the
                constraints that make the output reviewable, a case where the
                system blocked something it should have, and the limit I have
                not solved.
              </p>
              <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead text-pretty">
                I would rather it exist once, accurately, than three times in
                three shortened forms.
              </p>
              <Link
                href="/#how-i-work"
                className="link-draw group inline-flex items-center gap-2 self-start font-mono text-label tracking-label uppercase text-accent-text"
              >
                Read how the work gets made
                <span aria-hidden="true" className="transition-transform duration-fast ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What I care about */}
      <section
        id="principles"
        className={cn(
          'px-gutter py-24 lg:py-32',
          'world-surface border-t border-border-decorative',
        )}
      >
        <div className={cn('max-w-content mx-auto', SPLIT)}>
          <Reveal variant="scene" className={SPLIT_HEAD}>
            <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              Principles
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
              Accessibility. Privacy. No shortcuts.
            </h2>
            <HorizonRule arrival="reveal" className="mt-8 w-24" />
          </Reveal>

          <Reveal variant="depth" className={cn('max-w-measure-lead flex flex-col gap-8', SPLIT_BODY)}>
            <p className="font-sans font-light text-body text-ink-muted text-pretty">
              Flagstone is built and tested against WCAG 2.2 AA, with the methods and
              limitations documented in its case study. Flagstone exists because disabled people
              deserve navigation tools designed for them, not adapted for them.
            </p>
            <p className="font-sans font-light text-body text-ink-muted text-pretty">
              The user’s data is theirs. Prompt Library stores everything
              locally: no backend of mine, no account, no telemetry. Runs go
              directly from the browser to Anthropic with the user’s own key;
              nothing passes through a server I control. If the data is not
              necessary, do not collect it.
            </p>
            <p className="font-sans font-light text-body text-ink-muted text-pretty">
              I would rather take longer and do it correctly than ship fast and
              apologise. This is not a principle from a book. It came from
              shipping things that were not ready.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What I'm learning */}
      <section
        id="currently"
        className={cn(
          'px-gutter py-24 lg:py-32',
          // Dani wave4: alternating — warm-white
          'world-surface-alt border-t border-border-decorative',
        )}
      >
        <div className={cn('max-w-content mx-auto', SPLIT)}>
          <Reveal variant="scene" className={SPLIT_HEAD}>
            <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              Currently
            </p>
            {/* SKY-EDITABLE (P1 item 3) — reframed honest-but-confident: leads
                with the posture of building-in-the-open rather than "beginner",
                the receipts already prove the competence. Swap this one line to
                taste. Alternatives on the table:
                  A. "Still learning out loud. Shipping anyway."
                  C. "Self-taught, shipping in public. Getting better on purpose."
                Original: "Still a beginner. Getting better on purpose." */}
            <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
              Learning in public. Shipping on purpose.
            </h2>
            <HorizonRule arrival="reveal" className="mt-8 w-24" />
          </Reveal>

          <Reveal variant="depth" className={cn('max-w-measure-lead flex flex-col gap-8', SPLIT_BODY)}>
            <p className="font-sans font-light text-body text-ink-muted text-pretty">
              I am not a trained software engineer. I came to coding through
              building: I had ideas I wanted to exist. That is still how this
              works.
            </p>
            <p className="font-sans font-light text-body text-ink-muted text-pretty">
              Right now: TypeScript, React Native, and multi-agent systems that
              stay inside their rules when I am not watching. Each project
              teaches something the last one did not.
            </p>
            <p className="font-sans font-light text-body text-ink-muted text-pretty">
              The work I am aimed at is senior technical and product support:
              escalation, support tooling, support operations. Adjacent to it,
              and evidenced by the projects above: QA, accessibility, and
              privacy-aware systems work.
            </p>
            <p className="font-sans font-light text-body text-ink-muted text-pretty">
              I am looking for collaborators and clients who read the
              documentation, ask good questions, and care how things turn out.
              Write to me if that sounds like you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What I'm working on */}
      {recent.length > 0 && (
        <section
          id="work"
          className={cn(
            'px-gutter py-24 lg:py-32',
            'world-surface border-t border-border-decorative',
          )}
        >
          <div className={cn('max-w-content mx-auto', SPLIT)}>
            <Reveal variant="scene" className={SPLIT_HEAD}>
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                The Work
              </p>
              <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
                A handful of things.
              </h2>
              <HorizonRule arrival="reveal" className="mt-8 w-24" />
            </Reveal>

            <div className={SPLIT_BODY}>
              <ul className="flex flex-col gap-12 max-w-3xl">
                {recent.map((d, i) => (
                  <li
                    key={d.id}
                    className="border-t border-border-decorative pt-8"
                  >
                    <Reveal index={i}>
                      <Link
                        href={`/work/${d.id}/`}
                        /* label-content-name-mismatch: this card link wraps role · year,
                           title, summary, status and "View project", so a concise
                           "Read about <title>" name would omit most of the visible
                           text. Name from content instead (the arrow is aria-hidden)
                           — AT hears the full card. */
                        className="group flex flex-col gap-2 text-ink hover:text-accent-text transition-[color,transform] duration-base ease-gh-glide hover:translate-x-0.5"
                      >
                        <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                          {d.role} · {d.year}
                        </p>
                        <h3 className="font-serif font-normal text-step-2 leading-tight">
                          {d.title}
                        </h3>
                        <p className="font-sans font-light text-body text-ink-muted max-w-measure-lead text-pretty">
                          {d.summary}
                        </p>
                        {/* The project's own status line (content/deliverables.json,
                            Sky's protected wording), rendered exactly as ProjectCard
                            renders it: the account now shows where each thing
                            stands, not only that it exists. */}
                        <p className="font-mono text-meta text-text-meta">{d.status}</p>
                        <span className="font-mono text-meta tracking-label uppercase text-accent-text mt-2 inline-flex items-center gap-1 transition-transform duration-fast ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1">
                          {/* Cook Out P2 · Part B: "View project" is the locked
                              recruiter-facing internal-case-study vocabulary
                              (was "Continue"). */}
                          View project
                          <span aria-hidden="true">{'→'}</span>
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>

              <div className="mt-16">
                <Link
                  href="/work/"
                  className="group inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  All the work
                  <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:translate-x-1 group-focus-visible:translate-x-1">{'→'}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-gutter py-24 lg:py-32 world-surface border-t border-border-decorative">
        <Reveal className="max-w-content mx-auto flex flex-col items-start gap-12">
          <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading">
            Want to work together?
            <br />
            Let{'’'}s talk.
          </h2>
          {/* Bot-safe mailto (assembled at runtime) — matches /contact + home. */}
          <ContactEmail />

          <Link
            href="/"
            className="group mt-12 px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-ink hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1 group-focus-visible:-translate-x-1">{'←'}</span>
            Back to home
          </Link>
        </Reveal>
      </section>
    </>
  );
}
