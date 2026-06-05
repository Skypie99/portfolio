'use client';

import { useDayNight } from '@/lib/motion';

/**
 * WorldBackdrop — the persistent, scroll-evolving golden-hour → night desert that
 * the whole post-intro site travels through (Direction A, "One continuous world").
 *
 * Mounted ONCE in app/layout.tsx, behind everything (position:fixed; z-index:-1;
 * aria-hidden; pointer-events:none). The locked GSAP intro (opaque, z 50 while
 * pinned) sits on top of it on the homepage, so the world is only revealed once the
 * intro hands off; the now-translucent content panels then scroll OVER this fixed
 * world, so the page literally travels through it.
 *
 * One CSS var, `--day-night` (0 golden → 0.5 dusk → 1 night), drives the whole
 * arc: a base DUSK sky with a DAY sky crossfading out (0→0.5) and a NIGHT sky
 * crossfading in (0.5→1), a sun that lowers + dims, and a warm horizon line that
 * fades with the light. Everything is compositor-only (opacity/transform).
 *
 * `useDayNight()` sets the var on scroll; under reduced motion / no-JS it stays
 * unset and the world rests at a theme-appropriate static state
 * (`--day-night-rest`: light → golden, dark → night). The per-theme sky tokens
 * flip with `html.dark`, so light mode is the DAYLIGHT half of the world and dark
 * mode is the NIGHT half — the day→night scroll arc plays within each (the
 * light→dark transition, expressed cinematically). See CONTINUOUS_WORLD_PLAN.md.
 */
export function WorldBackdrop() {
  useDayNight();

  return (
    <div aria-hidden="true" className="world-backdrop">
      <div className="world-sky world-sky--dusk" />
      <div className="world-sky world-sky--day" />
      <div className="world-sky world-sky--night" />
      <div className="world-sun" />
      <div className="world-horizon" />
    </div>
  );
}
