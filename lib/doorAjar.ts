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
 * module adds NO listener of its own (the pitch's zero-new-listeners budget).
 *
 * Release: PRESENT-UNTIL-NEXT-NAV, universally — no timer, no fade; the
 * reduced-motion experience and the motion experience are the same
 * first-class design by construction (FT-9's "persists … not a
 * flash-and-vanish" semantic).
 */

/** Pages that show the work cards (trailing-slash tolerant). */
const CARD_PAGES = new Set(['/', '/work']);

let departedRoom: string | null = null;

/** Called by the interceptor at click time, before it navigates. */
export function recordDeparture(fromPathname: string, toPathname: string): void {
  const room = /^\/work\/([^/]+)\/?$/.exec(fromPathname);
  departedRoom = room && CARD_PAGES.has(normalize(toPathname)) ? room[1] : null;
}

/**
 * Called on ROUTE COMMIT (the interceptor's pathname effect). Clears any
 * stale mark, then marks the departed room's card link(s) when the committed
 * page shows them. Consumes the memory: a refresh — or any later arrival —
 * shows nothing, which is the in-memory truth the pitch promises.
 */
export function applyDoorAjar(pathname: string): void {
  for (const el of Array.from(document.querySelectorAll('[data-door-ajar]'))) {
    el.removeAttribute('data-door-ajar');
  }
  if (!departedRoom || !CARD_PAGES.has(normalize(pathname))) {
    departedRoom = null;
    return;
  }
  const links = document.querySelectorAll(`a[href="/work/${departedRoom}/"]`);
  for (const a of Array.from(links)) {
    a.setAttribute('data-door-ajar', '');
  }
  departedRoom = null;
}

/** Test seam only — the module keeps no other reset path on purpose. */
export function _resetDoorAjarForTests(): void {
  departedRoom = null;
}

function normalize(pathname: string): string {
  if (pathname === '' || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}
