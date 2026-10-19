import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactEmail } from '@/components/ContactEmail';
import { EditorialPlate, EditorialRise } from '@/components/EditorialPlate';
import { PLATFORM_LABELS } from '@/components/Footer';
import { SettleHeading } from '@/components/HeroSettle';
import { HorizonRule } from '@/components/HorizonRule';
import { IdentityLines } from '@/components/IdentityLines';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import { getProfile } from '@/lib/content';
import { canonicalFor } from '@/lib/metadata';
import { OG_CARD } from '@/lib/og';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description =
    'Write to Skyler Halisky, senior technical-support specialist in the Okanagan Valley, British Columbia.';
  return {
    title: `Contact: ${profile.name}`,
    description,
    alternates: {
      canonical: canonicalFor('/contact/'),
    },
    // TA-10 (truth audit 2026-07-31): see /certificates — same inheritance
    // defect. Without its own block this route unfurled as the homepage, which
    // is the one page a recruiter sharing a contact link does NOT mean to send.
    // siteName + locale restated (a leaf openGraph replaces the root's, W0-04).
    // Strings are this page's OWN existing title/description — no new copy.
    openGraph: {
      type: 'website',
      url: '/contact/',
      siteName: 'Skyler Halisky: Senior Technical Support',
      locale: 'en_CA',
      title: `Contact: ${profile.name}`,
      description,
      images: [OG_CARD],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Contact: ${profile.name}`,
      description,
    },
  };
}

/** Editorial split from xl — see app/about/page.tsx for the full note. The
 *  contact spread is an even 6 / 6 so the calling card has room for the full
 *  "Email {address}" pill at 1280 without decking its label (C-70). */
const SPLIT = 'xl:grid xl:grid-cols-12 xl:gap-x-12 xl:items-start';
const SPLIT_HEAD = 'mb-12 xl:mb-0 xl:col-span-5';
const SPLIT_BODY = 'xl:col-span-7';

/**
 * /contact — F-08. Minimal mailto-only page (Sky decided no form this cycle).
 *
 * Server Component. Primary CTA opens the user{'s} mail client with a
 * pre-filled subject. Optional secondary list of socials reads from
 * profile.json so it stays in sync with the Sidebar / Footer.
 *
 * Per Alex §4.5: every external link gets target=_blank, rel=noopener
 * noreferrer, AND an sr-only "(opens in new tab)" cue.
 *
 * Fable about + contact creative implementation (2026-10-18): the invitation
 * becomes a calling card — the same EditorialPlate the About page opens with,
 * carrying the name, the identity lines, the drawn horizon, the SAME
 * ContactEmail button (runtime-assembled mailto, untouched) and the SAME
 * LinkedIn pointer. The card is placed directly after the title in DOM
 * order, so on phones the primary action rises INTO the first screen
 * (it sat ~550px down before) and the three paragraphs follow it; from xl
 * the card sits beside the title and prose. No copy was rewritten.
 */
export default function ContactPage() {
  const profile = getProfile();
  const linkedin = profile.socials.find((s) => s.platform === 'linkedin');

  return (
    <>
      {/* UP-38's mobile brand chip is not mounted on this route any more: the
          calling card below signs the first screen with the same strings, and
          mounting both would double-sign it (see app/about/page.tsx). */}
      {/* Page header + primary CTA */}
      <section data-band-anchor className="relative isolate overflow-hidden px-gutter py-24 lg:py-32 world-surface">
        {/* golden-hour light continuity — the invitation reads warm, matching
            every other showcase header (work, certificates). RM → static. */}
        <ParallaxWash depth="far" />
        <div className={cn('relative z-10 max-w-content mx-auto', SPLIT)}>
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2 xl:col-span-6 xl:col-start-1 xl:row-start-1">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Let’s talk
          </p>
          <SettleHeading
            className="font-serif font-light text-display ember max-w-measure-heading mb-12 text-balance xl:col-span-6 xl:col-start-1 xl:row-start-2"
          >
            Write to me.
          </SettleHeading>

          {/* The calling card. The ContactEmail component is mounted exactly
              as before (bot-safe runtime mailto; /contact/ fallback and the
              noscript socials line before hydration), only its frame moved. */}
          <EditorialPlate
            arrival="mount"
            className="mb-12 max-w-lg xl:mb-0 xl:max-w-none xl:col-span-6 xl:col-start-7 xl:row-start-2 xl:row-span-2 xl:self-start"
          >
            <IdentityLines name={profile.name} location={profile.location} arrival="mount" />
            <HorizonRule arrival="mount" className="my-6 w-full" />
            <EditorialRise timing="late">
              <ContactEmail />

              {/* L3-03: the quiet career-document pointer — employer-safe wording,
                  deliberately NOT a résumé PDF (Sky's quiet-search stance). */}
              {linkedin && (
                <p className="mt-8 font-mono text-meta tracking-label uppercase">
                  <a
                    href={linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw text-ink hover:text-accent-text transition-colors duration-fast ease-out inline-flex items-center gap-1.5"
                  >
                    <span>Full history on LinkedIn</span>
                    {/* UP-11: the ↗ takes its label's colour (C-78). This is the
                        same link as Footer.tsx's About-column pointer, so it moves
                        with it — leaving it muted here would have made one link
                        render two ways. */}
                    <span aria-hidden="true">{'↗'}</span>
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </p>
              )}
            </EditorialRise>
          </EditorialPlate>

          <div className="xl:col-span-6 xl:col-start-1 xl:row-start-3">
            <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead mb-4 text-pretty">
              Accessible technology, built with care. Thoughtful product
              collaborations. Learning out loud, one project at a time. I read
              every message that comes through.
            </p>
            <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead mb-4 text-pretty">
              Open to senior support roles, and to professional conversations.
            </p>
            <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead text-pretty">
              The socials below also work, for everything else.
            </p>
          </div>
        </div>
      </section>

      {/* Socials — Cycle 27 / SP-2: warm-white + a true continuation top
          padding so "Elsewhere" crests the fold; the hairline border-t carries
          the handoff. Top pad renders ≈64/80px (arbitrary rem dodges the
          inverted spacing namespace; §7.4 refactor will rename the plumbing). */}
      {profile.socials.length > 0 && (
        <section
          className={cn(
            // L3-07: trailing pad mirrors the section's own top (16/20) instead
            // of the full 24/32 band — a two-link list doesn't earn a showcase
            // close, and the closer grammar below still carries the air.
            'px-gutter pt-16 lg:pt-20 pb-16 lg:pb-20',
            'world-surface border-t border-border-decorative',
          )}
        >
          <div className={cn('max-w-content mx-auto', SPLIT)}>
            <Reveal variant="scene" className={SPLIT_HEAD}>
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                Elsewhere
              </p>
              <h2 className="font-serif font-light text-step-4 ember max-w-measure-heading leading-heading text-balance">
                Find me in other quiet corners.
              </h2>
              <HorizonRule arrival="reveal" className="mt-8 w-24" />
            </Reveal>

            {/* UP-48 (ui-polish 2026-08-01): no measure cap on this grid — the
                removed max-w-2xl left a 424px void that read as an empty third
                slot. From xl the grid now owns the right seven columns of the
                split; below lg it is one column and the cap never bound. */}
            <ul className={cn('grid grid-cols-1 lg:grid-cols-2 gap-8', SPLIT_BODY)}>
              {profile.socials.map((s, i) => (
                <li key={s.url} className="group border-t border-border-decorative pt-4">
                  <Reveal index={i} variant="depth">
                    {/* C-69: keyboard parity — the cell glides on a focused link
                        (group-has :focus-visible), not hover alone. */}
                    <div className="transition-transform duration-base ease-gh-glide group-hover:translate-x-1 group-has-[:focus-visible]:translate-x-1">
                      {/* C-74: map the schema-locked lowercase enum to its proper
                          label so AT hears "GitHub"/"LinkedIn", not "github"/
                          "linkedin" (CSS uppercase keeps the visual unchanged). */}
                      <p className="font-mono text-meta tracking-label uppercase text-sage-text mb-1">
                        {PLATFORM_LABELS[s.platform] ?? s.platform}
                      </p>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw font-sans text-body text-accent-text inline-flex items-center gap-2"
                      >
                        <span>{s.handle}</span>
                        <span aria-hidden="true">{'↗'}</span>
                        <span className="sr-only">(opens in new tab)</span>
                      </a>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Back link — SP-3 unified closer grammar: hairline border-t + ~72px
          symmetric (py-18). world-surface-alt alternates off the socials'
          world-surface above. §7.4 refactor will rename the plumbing. */}
      <section
        className={cn(
          'px-gutter py-18',
          'world-surface-alt border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <Link
            href="/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-ink hover:text-accent-text focus-visible:text-accent-text transition-colors duration-fast ease-out"
          >
            {/* C-69: keyboard visitors get the same arrow glide + ink shift as hover. */}
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1 group-focus-visible:-translate-x-1">{'←'}</span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
