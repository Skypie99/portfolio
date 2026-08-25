'use client';

import { useEffect, useState } from 'react';

import { CaseStudyCard } from '@/components/CaseStudyCard';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Reveal } from '@/components/Reveal';
import { cardMedia } from '@/lib/media';
import type { Deliverable } from '@/lib/schema';

type Category = 'flagstone' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost';

function toCategory(id: string): Category {
  const map: Record<string, Category> = {
    'flagstone': 'flagstone',
    'claude-corp': 'claude-corp',
    'dashboard': 'dashboard',
    'prompt-library': 'prompt-library',
    'ghost-code': 'ghost',
  };
  return map[id] ?? 'flagstone';
}

/**
 * The gallery wall (R4/BP9 · P03) — /work/ re-hung as a promenade: filters
 * retired (the §S-delegated PROTECT-63-adjacent ruling; re-entry path if the
 * collection grows past ~10 = a quiet curator's index), every work full-width
 * in alternating plates, walked 01→06. THE ALTERNATION RULE: row 01 anchors
 * image-LEFT and is exempt from parity (the frontispiece); alternation begins
 * at 02 image-left and flips each row after (03 right, 04 left, 05 right,
 * 06 left). The catalog numbers the cards already carry become what they
 * always wanted to be: numbers on a hung sequence.
 *
 * Framer-motion leaves this route entirely (the round's one NEGATIVE-cost
 * move); the Reveal depth cascade and glass hover stay — nothing new moves,
 * and RM visitors get the identical hung sequence (reveal floors
 * rest-visible per the house contract).
 *
 * THE C-25 SURVIVOR (the pitch's own gate): the shipped `work:seen` session
 * entrance-skip lives on — a gallery already walked should BE there on
 * return, not re-perform its entrance mid-scroll-restore. The filter memory
 * (`work:filter`) retires with the filters; the seen-skip is the surviving
 * half, and `data-wall-seen` marks it for tests.
 *
 * The curator's-line slot is intentionally EMPTY: its words are Sky's
 * (NEEDS-SKY-COPY) — no element ships rather than a placeholder voice.
 */
export function GalleryWall({ deliverables }: { deliverables: Deliverable[] }) {
  const [skipMotion, setSkipMotion] = useState(false);

  // Row 01 = the featured work, MECHANICALLY (batch-skeptic catch): the
  // exactly-one-featured invariant picks who hangs first — never JSON order
  // coincidence. The rest keep their catalog order behind it.
  const featured = deliverables.find((d) => d.featured);
  const hung = featured
    ? [featured, ...deliverables.filter((d) => d !== featured)]
    : deliverables;

  useEffect(() => {
    try {
      if (sessionStorage.getItem('work:seen') === '1') setSkipMotion(true);
      sessionStorage.setItem('work:seen', '1');
    } catch {
      /* sessionStorage unavailable — keep the entrance */
    }
  }, []);

  return (
    <div className="relative isolate" data-wall-seen={skipMotion ? '' : undefined}>
      {/* drifting golden-hour wash — its own clipped layer so the -inset
          oversize never clips the cards' hover-lift or shadows. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <ParallaxWash depth="far" />
      </div>
      {/* soft wash so the liquid-glass plates have something to refract. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(38% 36% at 18% 22%, rgb(255 212 158 / 0.17), transparent 62%), radial-gradient(46% 44% at 88% 88%, rgb(150 188 214 / 0.18), transparent 64%)',
        }}
      />

      {/* The promenade. Inter-row air = gap-20 lg:gap-24 — capped against the
          tail-depth budget (check 10's gate: plate-06's start depth measured
          old-vs-new at 1440 and 375; receipts/bp9). */}
      <ul className="flex flex-col gap-20 lg:gap-24">
        {hung.map((d, i) => {
          // Row 01 = frontispiece (image-left, parity-exempt); 02 left, then
          // alternate: 03 right, 04 left, 05 right, 06 left.
          //
          // THE DOUBLED LEFT AT 01+02 IS THE DESIGN, NOT AN OFF-BY-ONE. Recorded
          // here with its authority because a later audit (ui-polish UP-41) read
          // it as "the zig-zag starts one row late" and proposed flipping 02.
          // R4/P03's pitch specs the hang verbatim: "THE ALTERNATION RULE: row 01
          // (the featured work) anchors the wall image-left and is exempt from
          // parity — it is the frontispiece; alternation begins at 02
          // (image-left) and flips each row after (03 image-right, 04 left, 05
          // right, 06 left)." The exemption is not incidental: P03's own
          // adversarial pass ADDED it ("the alternation rule defined incl. the
          // featured row-01 exemption", pitch.md SKEPTIC RECORD).
          // Measured live at 1440, two independent paths agreeing: L L R L R L.
          // Below lg there is no alternation to start — the md band's own
          // horizontal grammar hangs every card media-left — so the question
          // only exists at lg+.
          const side: 'left' | 'right' = i === 0 ? 'left' : i % 2 === 1 ? 'left' : 'right';
          return (
            <li key={d.id}>
              <Reveal variant="depth" index={Math.min(i, 3)} skip={skipMotion}>
                <CaseStudyCard
                  title={d.title}
                  category={toCategory(d.id)}
                  description={d.summary}
                  href={`/work/${d.id}/`}
                  media={cardMedia(d)}
                  links={d.links}
                  index={i}
                  wide
                  mediaSide={side}
                />
              </Reveal>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
