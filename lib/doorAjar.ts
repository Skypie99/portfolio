/**
 * The Door Ajar (R4/BP2 · P08) — the house remembers the room you just left.
 *
 * IN-MEMORY ONLY, by design fence (the "No analytics. No cookies." postmark
 * stays exactly true): nothing is persisted — no storage, no cookie, no
 * server state. The shipped click interceptor already holds both routes at
 * navigation time; this module is the ~dozen-line seam it shares with the
 * enfilade's direction infrastructure (BP1).
 *
 * Trigger: a click-navigation FROM a case-study room TO a page that shows
 * its card ('/' and '/work/'). Click-returns only — browser Back and the
 * iOS edge-swipe are popstate events the interceptor never sees, and this
 * module adds NO listener of its own (the pitch's zero-new-listeners
 * budget). The recorded DESTINATION is checked at commit time, so a click
 * that never commits cannot leak its mark onto a later popstate arrival
 * (skeptic-caught hardening).
 *
 * Marking is OPT-IN: only elements carrying data-door-target (the card
 * TITLE links render it — one per card) are ever marked. Never bare
 * href-matching (skeptic-caught: positioning an arbitrary matched anchor
 * re-parents stretched-link ::after overlays — the home showcase chips'
 * whole-cell tap target must never collapse), and one bar per card is the
 * pitch's singular grammar.
 *
 * Release: PRESENT-UNTIL-NEXT-NAV, universally — no timer, no fade; the
 * reduced-motion experience and the motion experience are the same
 * first-class design by construction (FT-9's "persists … not a
 * flash-and-vanish" semantic). Known quiet degrade (accepted): the /work/
 * tag filter remounts its cards (AnimatePresence keyed exit/re-entry), and
 * a remounted card loses the imperative mark — the visitor has already
 * engaged the grid by then, which is the mark's job done. A future
 * re-render refactor should NOT "fix" this into persistence.
 */

/** Pages that show the work cards (trailing-slash tolerant). */
const CARD_PAGES = new Set(['/', '/work']);

let departure: { room: string; dest: string } | null = null;

/** Called by the interceptor at click time, before it navigates. */
export function recordDeparture(fromPathname: string, toPathname: string): void {
  const room = /^\/work\/([^/]+)\/?$/.exec(fromPathname);
  const dest = normalize(toPathname);
  departure = room && CARD_PAGES.has(dest) ? { room: room[1], dest } : null;
}

/**
 * Called on ROUTE COMMIT (the interceptor's pathname effect). Clears any
 * stale mark, then — only when the committed pathname IS the recorded
 * destination — marks the departed room's opt-in card hook. Consumes the
 * memory either way: a refresh, a diverted commit, or any later arrival
 * shows nothing, which is the in-memory truth the pitch promises.
 */
export function applyDoorAjar(pathname: string): void {
  for (const el of Array.from(document.querySelectorAll('[data-door-ajar]'))) {
    el.removeAttribute('data-door-ajar');
  }
  const pending = departure;
  departure = null; // consumed on every commit — marking or not
  if (!pending || normalize(pathname) !== pending.dest) return;
  const hooks = document.querySelectorAll(`[data-door-target="/work/${pending.room}/"]`);
  for (const el of Array.from(hooks)) {
    el.setAttribute('data-door-ajar', '');
  }
}

/** Test seam only — the module keeps no other reset path on purpose. */
export function _resetDoorAjarForTests(): void {
  departure = null;
}

function normalize(pathname: string): string {
  if (pathname === '' || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}
