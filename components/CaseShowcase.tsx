import type { CSSProperties } from 'react';

import { HorizonRule } from '@/components/HorizonRule';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Reveal } from '@/components/Reveal';
import { ThemedMotion } from '@/components/ThemedMotion';
import { ThemedShowcase } from '@/components/ThemedShowcase';
import { cn } from '@/lib/cn';
import type { ShowcaseExhibit, ShowcaseImage, ShowcaseProvenance, ShowcaseSpec } from '@/lib/caseShowcase';
import { slugify } from '@/lib/markdown';
import type { Deliverable } from '@/lib/schema';
import { signatureFor } from '@/lib/signature';

import styles from './caseShowcase.module.css';

/**
 * CaseShowcase — the evidence chapter of a Release 5 project showcase
 * (2026-10-20): /work/prompt-library/, /work/claude-corp/, /work/ghost-code/
 * and /work/dashboard/ mount it between the title band and the essay.
 *
 * One chapter, read in order: a kicker and heading, then a numbered sequence
 * of exhibits, each a whole capture, a labelled detail of one, or a ledger
 * typeset from the case study's own prose, shown at a size where the
 * product's own text can be read, with a one-line caption and the capture's
 * provenance. Desktop and phone are separate compositions: an exhibit may
 * carry a desktop capture and a phone-composed one, or exist at one width
 * only, and exactly one variant is laid out per width (the other has no box,
 * so its image never loads and its alt never reaches the accessibility
 * tree). Numbering follows the sequence each width actually shows.
 *
 * Server Component. The entrance is the shared Reveal primitive (depth
 * variant, stepped) plus one quiet beat of its own: the plinth light under
 * each plane blooms after the plane lands (caseShowcase.module.css). Reduced
 * motion, no-JS and print rest on the complete composition from first paint;
 * the markup never carries a hidden state.
 */

/* Release 3 measured these on the same world surface (qa-reports/release3-
   final-20261019): light ink-meta 4.47:1 and dark ink-muted 3.98:1 at worst,
   so labels, captions and provenance take ink-muted in light and ink in
   dark, and the kicker takes accent-ink in light and ink in dark. */
const LABEL_CLASS = 'font-mono text-label tracking-label uppercase text-ink-muted dark:text-ink';
const META_CLASS = 'font-mono text-meta tracking-label uppercase text-ink-muted dark:text-ink';
const CAPTION_CLASS = 'font-sans text-body-sm text-ink-muted dark:text-ink text-pretty';

const pad = (n: number) => String(n).padStart(2, '0');

function Provenance({ p, className }: { p: ShowcaseProvenance; className?: string }) {
  return (
    <span className={cn('block', META_CLASS, className)}>
      {p.detail ? 'Detail of the capture from ' : 'Captured '}
      <time dateTime={p.capturedDate}>{p.capturedDate}</time>
      {' · '}
      <span className="normal-case">{p.commit}</span>
      {' · '}
      {p.scene}
      {p.note && <> · {p.note}</>}
    </span>
  );
}

/** One capture in the clean float chrome (`.ts-float`, the site-wide
 *  showcase chrome), its box fixed to the file's own aspect so nothing is
 *  cropped or letterboxed. Light and dark twins swap with the theme inside
 *  the site's own dissolve (ThemedShowcase). */
function Plane({ image, className }: { image: ShowcaseImage; className?: string }) {
  const portrait = image.height > image.width;
  return (
    <div
      className={cn('ts-float relative w-full', portrait && 'mx-auto max-w-[300px]', className)}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <ThemedShowcase
        light={{ src: image.src, avif: image.avif, webp: image.webp }}
        dark={image.dark}
        alt={image.alt}
        fit="cover"
      />
    </div>
  );
}

/** The deliverable's own still-first clip (content/deliverables.json
 *  `shots[i].video`, with its dark twin), in the float chrome at the clip's
 *  own aspect. ThemedMotion keeps the contract: poster first, `autoplay:
 *  false` honoured, a visible 44px Play control, native controls without
 *  JavaScript, nothing plays on viewport entry or on a theme flip. */
function Clip({ d, clip }: { d: Deliverable; clip: NonNullable<ShowcaseExhibit['clip']> }) {
  const shot = d.shots?.[clip.shotIndex];
  const video = shot?.video;
  if (!shot || !video) return null;
  return (
    <div
      className="ts-float relative w-full"
      style={{ aspectRatio: `${clip.width} / ${clip.height}` }}
      data-showcase-clip={clip.shotIndex}
    >
      <ThemedMotion
        light={{ mp4: video.mp4, webm: video.webm, poster: video.poster, lqip: shot.lqip }}
        dark={shot.dark?.video ? { ...shot.dark.video, lqip: shot.dark.lqip } : undefined}
        matte={shot.matte}
        alt={video.alt}
        captions={video.captions}
        fit="contain"
        autoplay={video.autoplay !== false}
      />
    </div>
  );
}

/** A ledger typeset from the case study: numbered rows of decision, holder
 *  and one sentence. Type on the band, never a plane, so it cannot be read
 *  as a screen of the application. */
function Ledger({ rows }: { rows: NonNullable<ShowcaseExhibit['rows']> }) {
  return (
    <ol className="flex flex-col border-t border-border-decorative">
      {rows.map((row, i) => (
        <li
          key={row.title}
          className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-border-decorative py-6 md:grid-cols-[3rem_minmax(0,16rem)_minmax(0,1fr)] md:gap-x-8 lg:py-7"
        >
          <span className={cn(META_CLASS, 'pt-1.5')}>{pad(i + 1)}</span>
          <div className="flex flex-col gap-1">
            <h3 className="font-serif font-light text-step-2 text-ink leading-heading">{row.title}</h3>
            <p className="font-mono text-meta tracking-label uppercase text-accent-ink dark:text-ink">{row.holder}</p>
          </div>
          <p className="col-start-2 font-sans text-body text-ink-muted dark:text-ink text-pretty md:col-start-3">{row.text}</p>
        </li>
      ))}
    </ol>
  );
}

function Exhibit({
  d,
  exhibit,
  index,
  desktopNumber,
  phoneNumber,
  sig,
}: {
  d: Deliverable;
  exhibit: ShowcaseExhibit;
  index: number;
  /** The exhibit's number in the sequence each width lays out; 0 = not shown there. */
  desktopNumber: number;
  phoneNumber: number;
  sig: string;
}) {
  const isLedger = exhibit.kind === 'ledger';
  const isClip = exhibit.kind === 'clip';
  const everyWidth = isLedger || isClip;
  const both = Boolean(exhibit.desktop && exhibit.phone);
  const widthClass = !everyWidth && !exhibit.phone ? 'hidden md:block' : !everyWidth && !exhibit.desktop ? 'md:hidden' : undefined;
  const aside = exhibit.layout === 'aside';
  const number =
    desktopNumber === phoneNumber ? (
      pad(desktopNumber)
    ) : (
      <>
        {desktopNumber > 0 && <span className="hidden md:inline">{pad(desktopNumber)}</span>}
        {phoneNumber > 0 && <span className="md:hidden">{pad(phoneNumber)}</span>}
      </>
    );
  return (
    <Reveal
      as="li"
      variant="depth"
      index={Math.min(index, 3)}
      className={cn('m-0', widthClass, exhibit.layout === 'inset' && 'lg:ml-[8.333%] lg:w-11/12')}
    >
      <figure
        className={cn('m-0 flex flex-col gap-4', aside && 'lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-12 lg:gap-y-4')}
        data-showcase-exhibit={exhibit.id}
        data-showcase-kind={exhibit.kind}
        style={{ '--pr-sig': sig } as CSSProperties}
      >
        <p className={cn(LABEL_CLASS, aside && 'lg:col-span-12')}>
          {number}
          {' · '}
          {both && exhibit.phoneLabel ? (
            <>
              <span className="hidden md:inline">{exhibit.label}</span>
              <span className="md:hidden">{exhibit.phoneLabel}</span>
            </>
          ) : (
            exhibit.label
          )}
        </p>
        {isLedger ? (
          <Ledger rows={exhibit.rows!} />
        ) : isClip ? (
          <div className={cn(styles.plane, 'relative mx-auto w-full max-w-[300px] sm:max-w-[360px]', aside && 'lg:col-span-4 lg:mx-0')}>
            <span aria-hidden="true" className={styles.plinth} />
            <Clip d={d} clip={exhibit.clip!} />
          </div>
        ) : (
          <div className={cn(styles.plane, 'relative', aside && 'lg:col-span-4')}>
            <span aria-hidden="true" className={styles.plinth} />
            {exhibit.desktop && <Plane image={exhibit.desktop} className={both ? 'hidden md:block' : undefined} />}
            {exhibit.phone && <Plane image={exhibit.phone} className={both ? 'md:hidden' : undefined} />}
          </div>
        )}
        <figcaption className={cn('flex max-w-measure-wide flex-col gap-2', aside && 'lg:col-span-8')}>
          <HorizonRule arrival="reveal" className="w-16" />
          <p className={cn(CAPTION_CLASS, both && exhibit.phoneCaption && 'hidden md:block')}>{exhibit.caption}</p>
          {both && exhibit.phoneCaption && <p className={cn(CAPTION_CLASS, 'md:hidden')}>{exhibit.phoneCaption}</p>}
          {isLedger ? (
            <span className={cn('block', META_CLASS)}>Typeset from this case study · not an application capture</span>
          ) : (
            <>
              {/* One provenance line per laid-out variant: the phone capture
                  may be a different, differently dated capture. */}
              {exhibit.provenance && (
                <Provenance p={exhibit.provenance} className={both && exhibit.phoneProvenance ? 'hidden md:block' : undefined} />
              )}
              {both && exhibit.phoneProvenance && <Provenance p={exhibit.phoneProvenance} className="md:hidden" />}
            </>
          )}
        </figcaption>
      </figure>
    </Reveal>
  );
}

/** Numbers per width: an exhibit laid out only on desktop or only on a phone
 *  must not leave a gap in the other sequence. */
function numbering(exhibits: ShowcaseExhibit[]): { desktop: number[]; phone: number[] } {
  let d = 0;
  let p = 0;
  const desktop: number[] = [];
  const phone: number[] = [];
  for (const ex of exhibits) {
    const every = ex.kind === 'ledger' || ex.kind === 'clip';
    const onDesktop = every || Boolean(ex.desktop);
    const onPhone = every || Boolean(ex.phone);
    desktop.push(onDesktop ? ++d : 0);
    phone.push(onPhone ? ++p : 0);
  }
  return { desktop, phone };
}

export function CaseShowcase({ d, spec }: { d: Deliverable; spec: ShowcaseSpec }) {
  const sig = signatureFor(d.id);
  const headingId = slugify(spec.heading) || 'inside-the-build';
  const numbers = numbering(spec.exhibits);
  return (
    <section
      className="relative overflow-hidden px-gutter py-20 lg:py-28 world-surface-alt border-t border-border-decorative"
      data-case-showcase={d.id}
      aria-labelledby={headingId}
    >
      {/* golden-hour light continuity: the chapter sits in the same warm
          field as the essay below it. Decorative; static under reduced motion. */}
      <ParallaxWash depth="far" />
      <div className="relative z-10 max-w-content mx-auto">
        <Reveal variant="scene" className="flex flex-col gap-4">
          <p
            className="flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-ink dark:text-ink"
            style={{ '--pr-sig': sig } as CSSProperties}
          >
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'rgb(var(--pr-sig))' }} />
            Inside the build
          </p>
          {/* The chapter's h2 carries an id, so the rail's "On this page"
              index lists it ahead of the essay's own sections. */}
          <h2
            id={headingId}
            className="font-serif font-light text-step-4 text-ink max-w-measure-heading leading-heading text-balance scroll-mt-24"
          >
            {spec.heading}
          </h2>
          {spec.standfirst && (
            <p className="font-sans font-light text-step-1 text-ink-muted max-w-measure-lead text-pretty">{spec.standfirst}</p>
          )}
        </Reveal>

        <ol className="mt-12 flex flex-col gap-14 lg:mt-16 lg:gap-20">
          {spec.exhibits.map((exhibit, i) => (
            <Exhibit
              key={exhibit.id}
              d={d}
              exhibit={exhibit}
              index={i}
              desktopNumber={numbers.desktop[i]}
              phoneNumber={numbers.phone[i]}
              sig={sig}
            />
          ))}
        </ol>

        {spec.doorway && (
          <Reveal variant="depth" className="mt-12 lg:mt-16">
            {/* The owner-approved invitation, on the destination it names.
                Same grammar as the ledger's external links; the box itself
                meets the 44px floor, so no neighbour can overlap it. */}
            <a
              href={spec.doorway.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group link-draw inline-flex min-h-[44px] items-center gap-2 font-sans text-body text-accent-text"
            >
              <span>{spec.doorway.label}</span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-base ease-gh-glide [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:-translate-y-0.5"
              >
                {'↗'}
              </span>
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
