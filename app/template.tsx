import type { ReactNode } from 'react';

/**
 * Route template — pass-through (view-transitions 2026-06-05).
 *
 * Route-change motion now lives in the native View Transitions layer
 * (components/ViewTransitions.tsx + the ::view-transition-* block in
 * globals.css), which gives a TRUE old→new cross-dissolve. That superseded the
 * old enter-only `.page-enter` fade this template used to apply, so the template
 * is now a transparent pass-through.
 *
 * Why keep the file at all: Next's App Router re-mounts template.tsx on every
 * navigation. Leaving it as a no-op wrapper documents that route-transition
 * concerns are intentionally handled elsewhere, and keeps the seam available if
 * a future per-route wrapper is ever needed.
 *
 * The homepage exemption (so the locked GSAP cinematic is never layered under a
 * transition) and the reduced-motion / no-JS fallbacks all live in the View
 * Transitions layer now, not here.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
