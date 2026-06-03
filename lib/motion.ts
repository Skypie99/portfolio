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

/** Returns `[ref, inView]`; `inView` flips true once when the element first
 *  enters the viewport, then the observer disconnects (one-shot). */
export function useInViewOnce<T extends Element = HTMLElement>(
  rootMargin = '0px 0px -80px 0px',
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
    const apply = () => {
      raf = 0;
      if (!pending) return;
      const r = el.getBoundingClientRect();
      const px = (pending.x - r.left) / r.width;
      const py = (pending.y - r.top) / r.height;
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      // unitless [-1,1] light-direction source for the carved-stone relief (--lx/--ly)
      el.style.setProperty('--mxn', ((px - 0.5) * 2).toFixed(3));
      el.style.setProperty('--myn', ((py - 0.5) * 2).toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onEnter = () => el.style.setProperty('--hover', '1');
    const onLeave = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      el.style.setProperty('--hover', '0');
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return ref;
}
