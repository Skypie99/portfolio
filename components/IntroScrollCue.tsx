'use client';

import { useEffect, useRef } from 'react';

/**
 * IntroScrollCue — the whisper-weight scroll-continuation cue [T6 / W2-01].
 *
 * The locked cinematic runs a long pinned scrub with zero orientation inside
 * it: a first-timer can't tell the scroll IS the skip, or that there's a
 * destination below the film. This surfaces the SAME "Scroll" affordance the
 * Hero already uses one viewport later (components/Hero.tsx) INSIDE the intro,
 * at the same weight and grammar — the only honest lever inside the locked-film
 * fence (the film's imagery, timing, and 380vh budget are untouched).
 *
 * COMMENT-TRUTH (ui-polish UP-39): this docblock said "the SAME 'Scroll ↓'
 * affordance" and that went stale when the 2026-07-19 work-of-art pass replaced
 * the ↓ with the drawn chevron below. The WORD is shared; the glyph deliberately
 * is not, and neither is the colour (this cue is bone over the theme-invariant
 * film, the Hero's arrow is text-cool on a themed surface). MOTION_SYSTEM §15
 * already treats them as two objects, and it reconciled a sibling stale claim in
 * this same component once before ("0.9" described the Hero's cue, not this one).
 *
 * It is a fixed SIBLING of <CinematicDesert/>, never a child — it does not
 * touch components/cinematic/** or the T3-owned observers. Decorative
 * orientation, not a link: no href, aria-hidden, pointer-events:none, no tab
 * stop — the sr-only skip-link stays the sole keyboard truth through the intro.
 *
 * Retirement reuses the exact geometry RailInert / RunwayIdentityRelease trust
 * — one IntersectionObserver on the post-intro content wrapper
 * (`.cinematic-content-reveal`); once it arrives the cue fades out (CSS on
 * [data-cue-done]). Without this a fixed cue would float over every section
 * below the intro forever (a permanent nag, not a whisper). Two guards mirror
 * that pattern: the top-open rootMargin ('100000px 0px 0px 0px') so the resting
 * page bottom never un-retires it, and the strict intersectionRatio > 0 gate so
 * the reduced-motion static frame's ratio-0 mount can't retire it before it is
 * ever seen. Not gated on `.cdesert-stage`: under RM the intro is a single
 * static frame and the cue must still retire once content scrolls in.
 *
 * The cue is in the static HTML at first paint; degrades to "cue stays visible"
 * without JS (the rest-visible floor) — benign, it never blocks anything
 * (aria-hidden, pointer-events:none). CLS: fixed node, opacity/visibility
 * transitions only → 0.
 */
export function IntroScrollCue() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const content = document.querySelector('.cinematic-content-reveal');
    const el = ref.current;
    if (!content || !el) return;

    // U2 (A-02) — retire early for MOTION USERS ONLY. The cue's lowest pixel
    // sits ~20px above the viewport bottom, so arriving content covers it
    // within 1–2 frames at flick velocity: no honest fade can finish after the
    // 0px edge-touch. A +100% bottom margin fires the fade one viewport ahead
    // (≥230ms of travel at ≤3.5k px/s ≥ the 180ms fast-register fade). MUST
    // stay RM-gated: the RM static frame mounts `.cinematic-content-reveal` at
    // the 0px edge-touch, where ANY positive bottom margin reports ratio > 0
    // at mount and would retire the cue before the RM visitor ever sees it —
    // RM keeps the byte-original C-20 geometry, where the C-21 ratio-0 gate
    // still bites. matchMedia guarded for jsdom / old webviews (absent →
    // conservative original geometry), the lib/motion.ts house pattern.
    const motionOK =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.toggleAttribute(
          'data-cue-done',
          entry.isIntersecting && entry.intersectionRatio > 0,
        );
      },
      {
        // C-22 (2026-08-06) — THE LADDER IS WHAT MAKES THE C-21 GATE REACHABLE.
        // With a single `0` threshold the observer fires only on the 0-crossing.
        // Under reduced motion the static frame mounts `.cinematic-content-reveal`
        // AT the 0px edge-touch (measured: its top is exactly viewport-bottom,
        // isIntersecting true, ratio 0), so the crossing has already happened at
        // mount and every later scroll only GROWS the ratio — which crosses
        // nothing. The callback never ran again, the `ratio > 0` gate was never
        // re-evaluated, and the cue never retired: 0 of 246 samples retired under
        // reduce vs 220 of 246 under no-preference. The C-21 guard, written to
        // stop a premature retirement under RM, is precisely what made
        // retirement IMPOSSIBLE under RM.
        // Extra stops give the ratio something to cross so the gate is asked
        // again. They are deliberately tiny and multiple: intersectionRatio is
        // relative to the TARGET's height, and this target is ~9,567px against a
        // 900px viewport, so it tops out at ~0.099 — a lone 0.5 or 0.1 stop would
        // never be reached, and a lone 0.01 would go marginal if the page grew.
        // Motion behaviour is unchanged: it already retires on the 0-crossing,
        // and the later stops only re-assert the same true.
        threshold: [0, 0.001, 0.01, 0.05],
        rootMargin: motionOK
          ? '100000px 0px 100% 0px' // C-20 top-open + the U2 early-fire margin
          : '100000px 0px 0px 0px', // byte-original geometry (RM / no-matchMedia)
      },
    );
    io.observe(content);

    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="intro-scroll-cue">
      <span className="intro-scroll-cue-glyph inline-flex flex-col items-center gap-1.5 font-mono text-meta tracking-label uppercase">
        <span>Scroll</span>
        {/* drawn chevron (art pass) — optical, not typographic. Ratified
            2026-07-19 (Sky-directed work-of-art pass, 1393d40) and recorded in
            MOTION_SYSTEM §15: "cue warms cool-sage → bone with a drawn chevron".
            KEEP IT.

            COMMENT-TRUTH (ui-polish UP-39): the old justification here —
            "same 1rem line box as the font glyph it replaces → zero layout
            shift" — is MEASURABLY FALSE, and is corrected rather than deleted
            so the decision keeps its reason and the reason keeps its numbers.
            An <svg> is a REPLACED inline element sized by its own width/height
            attrs (12), so `leading-none`'s 16px line box never applies to it:
            this span measures 12.000 x 12.000 where the ↓ it replaced measures
            12.141 x 16.000 (byte-identical class list, injected-clone control,
            identical at all 19 widths 320–2560, confirmed by a second
            independent rig). Restoring the arrow would GROW the cue root
            52.094 → 56.094px, +4.000px (+7.68%). The swap is cheap and
            reversible, but it is not free in either direction.

            UP-39's premise was also refuted at the same time: the audit calls
            these "two glyph styles within one viewport", but under real motion
            the two cues are NEVER co-visible — 0 of 246 samples across both
            themes at 375/768/1440, because this cue retires before the Hero's
            arrow can enter the viewport (the Hero's ↓ sits 1045–1422px below
            the content wrapper's own top edge, on a 900px viewport). */}
        <span className="text-body leading-none">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M2.5 4.5 L6 8 L9.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </div>
  );
}
