'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tiny dependency-free motion hooks (Phase 6 perf).
 *
 * The homepage reveal + count-up moments are simple enough to drive with
 * IntersectionObserver + CSS transitions + rAF — so they don't pull
 * framer-motion's `useInView`/`animate` into the homepage's First Load JS.
 * Both hooks are SSR-safe (start in the static/final-safe state) and the
 * count/reveal CSS is gated on `prefers-reduced-motion` elsewhere.
 */

/**
 * Motion constants mirroring the CSS tokens in app/globals.css — the single
 * source for Framer Motion call sites, which can't read CSS custom properties.
 * Kept in sync with globals.css deliberately (polish 2026-06-18).
 */
export const MOTION = {
  /** --dur-slow: 520ms */
  DUR_SLOW: 0.52,
  /** --stagger-scene: 120ms */
  STAGGER_SCENE: 0.12,
  /** --ease-entrance: cubic-bezier(0.16, 1, 0.3, 1) — expo-out "arriving" curve */
  EASE_ENTRANCE: [0.16, 1, 0.3, 1] as const,
} as const;

/** Returns `[ref, inView]`; `inView` flips true once when the element first
 *  enters the viewport, then the observer disconnects (one-shot).
 *
 *  U3 (A-03) — the default arming line sits ~a fifth of a viewport BELOW the
 *  fold (positive bottom rootMargin, viewport-proportional), so reveals are
 *  painted when the eyes land at flick speed instead of fading under the
 *  reader. Consumers: Reveal (cell/section choreography) and CountUpStat
 *  (which inherits the pre-arm by DECISIONS #2 option (i): at flick the count
 *  is armed just ahead of entry and still performs; at stroll it settles to a
 *  number at rest — the RM/no-JS rest state). Keep in sync by eye with
 *  Reveal's hash-arrival seating band (components/Reveal.tsx, U4). */
export function useInViewOnce<T extends Element = HTMLElement>(
  rootMargin = '0px 0px 20% 0px',
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true); // no IO support → just show
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView] as const;
}

/** Tracks `prefers-reduced-motion: reduce`. SSR-safe (starts false; resolves
 *  on mount), so server render + first paint never assume reduced. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // matchMedia is absent in some environments (older embedded webviews, jsdom
    // under test). Treat that as "no preference" rather than throwing.
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/* ────────────────────────────────────────────────────────────────────
 * useParallax — scroll-linked depth drift (motion-polish 2026-06-03).
 *
 * One shared rAF + one IntersectionObserver for ALL parallax elements on
 * the page (no per-element scroll listeners). Reads are batched, then
 * writes — a single `translate3d` per element, so it stays on the
 * compositor at 60fps. A frame only runs on scroll / resize / visibility
 * change (rAF-throttled), so there's zero work while idle.
 *
 * `depth` is the fraction of the element's distance-from-viewport-center
 * applied as counter-movement (see --parallax-far/mid/near in
 * MOTION_SYSTEM.md): far = 0.04, mid = 0.08, near = 0.14. Larger = closer.
 *
 * Reduced motion: the element is never registered and no transform is ever
 * written. Attach ONLY to decorative (aria-hidden) layers or hero imagery
 * inside an overflow-clipped, slightly-oversized frame — never the
 * cinematic intro or the homepage hero.
 * ──────────────────────────────────────────────────────────────────── */

type ParallaxEntry = { depth: number; lastShift: number };

let pxRegistry: Map<HTMLElement, ParallaxEntry> | null = null;
let pxActive: Set<HTMLElement> | null = null;
let pxObserver: IntersectionObserver | null = null;
let pxRaf = 0;

function pxFrame() {
  pxRaf = 0;
  if (!pxRegistry || !pxActive) return;
  const vpCenter = window.innerHeight / 2;
  // READ pass — gather target shifts (getBoundingClientRect reflects the
  // current transform, so subtract the last shift to recover layout center).
  const writes: Array<[HTMLElement, number]> = [];
  for (const el of pxActive) {
    const entry = pxRegistry.get(el);
    if (!entry) continue;
    const rect = el.getBoundingClientRect();
    const baseCenter = rect.top + rect.height / 2 - entry.lastShift;
    writes.push([el, (baseCenter - vpCenter) * entry.depth]);
  }
  // WRITE pass — apply transforms together (no interleaved layout thrash).
  for (const [el, shift] of writes) {
    const entry = pxRegistry.get(el);
    if (!entry) continue;
    entry.lastShift = shift;
    el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
  }
}

function pxSchedule() {
  if (pxRaf) return;
  pxRaf = requestAnimationFrame(pxFrame);
}

function pxEnsureGlobals() {
  if (pxRegistry) return;
  pxRegistry = new Map();
  pxActive = new Set();
  pxObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) pxActive!.add(el);
        else pxActive!.delete(el);
      }
      pxSchedule();
    },
    // Engage a little before the element enters so it's already positioned.
    { rootMargin: '20% 0px 20% 0px' },
  );
  window.addEventListener('scroll', pxSchedule, { passive: true });
  window.addEventListener('resize', pxSchedule);
}

/** Returns a ref to attach to the layer you want to parallax. */
export function useParallax<T extends HTMLElement = HTMLDivElement>(depth = 0.08) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return; // RM: never register, never transform.
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    pxEnsureGlobals();
    pxRegistry!.set(el, { depth, lastShift: 0 });
    pxObserver!.observe(el);
    pxSchedule();
    return () => {
      pxObserver?.unobserve(el);
      pxRegistry?.delete(el);
      pxActive?.delete(el);
      el.style.transform = '';
    };
  }, [depth, reduced]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────
 * useSpotlight — a soft light that follows the cursor across a card
 * (premium cards, 2026-06-03). rAF-throttled pointermove sets `--mx`/`--my`
 * (cursor 0–100%) and `--hover` (0/1) on the element; the `.glow-card` CSS
 * consumes them. RM → no-op. SSR/jsdom-safe (guards window/matchMedia);
 * fine-pointer (hover) devices only.
 * ──────────────────────────────────────────────────────────────────── */
export function useSpotlight<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let pending: { x: number; y: number } | null = null;
    // Lagged caustic position (--cx/--cy, 0–100%): eases toward the pointer
    // while hovering and back to center (50/50) on leave, so CardField's warm
    // pool TRAILS the sharp ::after specular like a deeper light — the "one
    // sun" read. We lerp in rAF rather than via a CSS transition because
    // transitions don't fire on var()-driven transforms. Self-terminating:
    // the loop stops once the pool has caught up (or settled home).
    let cx = 50, cy = 50, tx = 50, ty = 50, settle = 0;
    const tick = () => {
      settle = 0;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.setProperty('--cx', `${cx.toFixed(2)}%`);
      el.style.setProperty('--cy', `${cy.toFixed(2)}%`);
      if (Math.abs(tx - cx) > 0.04 || Math.abs(ty - cy) > 0.04) settle = requestAnimationFrame(tick);
    };
    const kick = () => { if (!settle) settle = requestAnimationFrame(tick); };
    const apply = () => {
      raf = 0;
      if (!pending) return;
      const r = el.getBoundingClientRect();
      const mx = ((pending.x - r.left) / r.width) * 100;
      const my = ((pending.y - r.top) / r.height) * 100;
      el.style.setProperty('--mx', `${mx.toFixed(1)}%`);
      el.style.setProperty('--my', `${my.toFixed(1)}%`);
      tx = mx; ty = my; kick(); // steer the lagged pool toward the cursor
    };
    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onEnter = () => el.style.setProperty('--hover', '1');
    const onLeave = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      el.style.setProperty('--hover', '0');
      tx = 50; ty = 50; kick(); // ease the caustic home
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (settle) cancelAnimationFrame(settle);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────
 * useMagnetic — a small, capped cursor-pull on a primary CTA (organic-pass
 * 2026-06-03, signature move #4). On pointermove over the element it writes a
 * damped translate3d TOWARD the cursor (offset from the element's center ×
 * `strength`, clamped to ±`max` px); on leave it clears the transform so the
 * element eases home — the spring/catch-up comes from the element's own
 * `transition: transform …` (Button's transform transition). rAF-throttled,
 * compositor-only (one translate3d). Fine-pointer (hover) devices only; RM →
 * no-op. Built to mirror useSpotlight exactly. SSR/jsdom-safe.
 * ──────────────────────────────────────────────────────────────────── */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.22, max = 6) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let pending: { x: number; y: number } | null = null;
    const apply = () => {
      raf = 0;
      if (!pending) return;
      const r = el.getBoundingClientRect();
      const dx = pending.x - (r.left + r.width / 2);
      const dy = pending.y - (r.top + r.height / 2);
      const tx = Math.max(-max, Math.min(max, dx * strength));
      const ty = Math.max(-max, Math.min(max, dy * strength));
      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      pending = null;
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.style.transform = '';
    };
  }, [reduced, strength, max]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────
 * useScrollProgress — page scroll fraction (0→1) as a CSS variable
 * (high-end polish 2026-06-03). Sets `--scroll-progress` on <html> via
 * ONE rAF-throttled scroll listener, so consumers can drive a
 * compositor-only `transform: scaleY(var(--scroll-progress))` (e.g. the
 * sidebar progress hairline) with ZERO React re-renders. Reduced motion →
 * no-op (the var stays unset → indicator collapses to 0). SSR-safe.
 * ──────────────────────────────────────────────────────────────────── */
export function useScrollProgress() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    const root = document.documentElement;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const max = root.scrollHeight - window.innerHeight;
      const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      root.style.setProperty('--scroll-progress', f.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.style.removeProperty('--scroll-progress');
    };
  }, [reduced]);
}

/* ────────────────────────────────────────────────────────────────────
 * useDayNight — the continuous-world arc (Direction A, 2026-06-05). Sets
 * `--day-night` (0→1) on <html> via ONE rAF-throttled scroll listener, so the
 * persistent WorldBackdrop can re-grade golden → dusk → night on the compositor
 * (opacity/transform crossfades) with ZERO React re-renders.
 *
 * Remapped so the arc BEGINS where the post-intro content hands off: on the
 * homepage the start is the top of `.cinematic-content-reveal` (i.e. the instant
 * the locked 680vh intro finishes and the golden cliff hands off → day-night 0 =
 * full golden); on routes without the intro the arc runs from the page top. End
 * is the FOOTER THRESHOLD — the scrollY at which the footer's top hairline meets
 * the viewport bottom (footerTop − innerHeight), so full night + the flagship
 * ending (alpenglow / last-coal ember) peak while the footer crests INTO view,
 * witnessed at the door, not behind the opaque footer at absolute max scroll
 * (Z5/SE-2). getBoundingClientRect()+scrollY is read each frame so a late layout
 * (the GSAP pin-spacer, images) can't desync the anchor. The mapping stays linear
 * and theme-invariant — only the input domain's END moved.
 *
 * Reduced motion → no-op (the var stays unset; the world rests at a
 * theme-appropriate static state via `var(--day-night, var(--day-night-rest))`).
 * SSR-safe. Mirrors useScrollProgress exactly.
 * ──────────────────────────────────────────────────────────────────── */
export function useDayNight() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    const root = document.documentElement;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const anchor = document.querySelector('.cinematic-content-reveal');
      const start = anchor
        ? anchor.getBoundingClientRect().top + window.scrollY
        : 0;
      // End at the footer THRESHOLD, not the document bottom: the scrollY at which
      // the footer's top hairline meets the viewport bottom (Z5/SE-2). So full
      // night + the threshold ember (.footer-threshold) reach peak while the footer
      // crests INTO view — witnessed at the door — instead of completing behind the
      // opaque footer at absolute max scroll. Measured each frame (getBoundingClientRect
      // + scrollY, mirroring `start`) so a late layout can't desync it. Same linear,
      // theme-invariant mapping — only the input domain's END moves.
      const footer = document.querySelector('footer');
      const footerTop = footer
        ? footer.getBoundingClientRect().top + window.scrollY
        : root.scrollHeight;
      const end = footerTop - window.innerHeight;
      const span = end - start;
      const dn = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - start) / span)) : 0;
      root.style.setProperty('--day-night', dn.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.style.removeProperty('--day-night');
    };
  }, [reduced]);
}

/* ────────────────────────────────────────────────────────────────────
 * useActiveSection — scroll-spy (high-end polish 2026-06-03). Returns the
 * id of the section currently crossing the viewport's middle band, for
 * nav active-state highlighting. ONE IntersectionObserver over the given
 * ids; React state updates ONLY when the active section CHANGES (no
 * per-frame churn). Not motion → runs under reduced motion too. SSR-safe
 * (starts ''). Pass a STABLE ids array (module constant) to avoid
 * re-subscribing each render.
 * ──────────────────────────────────────────────────────────────────── */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('');
  const key = ids.join(',');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || typeof document === 'undefined') return;
    const els = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (!els.length) return;

    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) ratios.set(e.target.id, e.intersectionRatio);
          else ratios.delete(e.target.id);
        }
        let best = '';
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio >= bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));

    // C-31: the IntersectionObserver only derives the active id from SCROLL
    // position, so on a TOC click or a fresh deep-link the aria-current lags
    // behind (or points at the wrong section) until the reader scrolls. Seed the
    // active id from the URL hash on mount and on every hashchange — TOC-anchor
    // clicks, deep-links, and back/forward all fire it — so aria-current names
    // the landed section immediately; the observer then keeps it honest as the
    // reader moves.
    const idSet = new Set(key.split(','));
    const seedFromHash = () => {
      const id = window.location.hash.slice(1);
      if (id && idSet.has(id)) setActive(id);
    };
    seedFromHash();
    window.addEventListener('hashchange', seedFromHash);

    return () => {
      io.disconnect();
      window.removeEventListener('hashchange', seedFromHash);
    };
  }, [key]);

  return active;
}
