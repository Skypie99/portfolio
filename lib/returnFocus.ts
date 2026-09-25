/**
 * The return seat (W4-02 · N1) — the work list keeps the reader's chair.
 *
 * A keyboard reader who activates a Home #work row link (Enter fires the
 * same click the pointer fires, just synthesized — `detail === 0`) and then
 * presses history Back is currently reseated on `<main>` (RouteFocus's
 * forward-arrival orientation), so their NEXT Tab lands on the first
 * tabbable inside main — the hero CTA, ~2700px up the page — tearing them
 * out of the list they were reading (demonstrated: B-EV-236…239).
 *
 * This module is the ~dozen-line seam that lets Back reseat them instead:
 * the shipped click interceptor records, IN MEMORY ONLY (same design fence
 * as the Door Ajar — "No analytics. No cookies." stays exactly true), the
 * opt-in work-row link a KEYBOARD activation departed from; RouteFocus,
 * the focus owner, consults it on every route commit and — only for a
 * POPSTATE arrival back at the recorded origin — asks for that link so it
 * can take the seat `<main>` would otherwise take.
 *
 * Scope fences, deliberately narrow:
 *  - OPT-IN only: nothing is ever recorded unless the anchor carries
 *    `data-return-focus` (the Home #work row title links render it — one
 *    per row). /work/ wall cards, case-page links, nav links: unrecorded,
 *    unchanged behavior.
 *  - KEYBOARD only restores. A pointer departure records `keyboard: false`
 *    and a later Back keeps today's focus-to-main orientation — the mouse
 *    reader never lost their place, and an indiscriminate restore could
 *    only surprise them. (Keyboard is detected as the activation's
 *    `detail === 0` — what Enter and AT-synthesized clicks fire; a pointer
 *    reports its click count instead. An exotic AT that activates as a
 *    pointer keeps today's behavior: degrades, never breaks.)
 *  - HISTORY-RETURN only restores: a popstate arrival back at the recorded
 *    origin — browser Back, browser Forward returning to that entry, the
 *    iOS edge-swipe. A PUSH arrival (every click the interceptor takes
 *    over) keeps focus-to-main exactly as shipped: orientation is
 *    information — a fresh arrival starts at the top of main, a RETURN
 *    resumes where the chair was. (Back and Forward are both popstate by
 *    construction; the record describes the entry, not the button.)
 *  - In-memory only, single departure slot, consumed-or-superseded:
 *    a refresh, a hard load, or any new tab/URL entry starts with no
 *    memory — the honest no-record state, never an invented one.
 *
 * Listener budget (the Door Ajar's pitch): this module installs NO listener
 * of its own. The popstate flag is flipped by RouteFocus's own listener (the
 * focus owner observes history), and cleared by the interceptor the instant
 * it takes over a click (a taken-over click is a PUSH by construction).
 * Every in-document pathname-changing push in this codebase IS an
 * interceptor take-over — ViewTransitions is the sole router.push caller —
 * so a real push can never be misread as a pop; and the archive island
 * unmounts RouteFocus entirely, where the flag is simply never set.
 */

/** A recorded keyboard/pointer departure from a page that shows its rows. */
type ReturnSeat = {
  /** Normalized pathname of the page the opt-in link lives on. */
  origin: string;
  /** Normalized destination pathname of the recorded activation. */
  dest: string;
  /** The anchor's `data-return-focus` value — the selector to reseat on. */
  href: string;
  /** Whether the activation was keyboard/AT-synthesized (`detail === 0`). */
  keyboard: boolean;
};

let seat: ReturnSeat | null = null;

/** Set by RouteFocus's popstate listener; cleared by the interceptor's push. */
let popArrival = false;

/**
 * Called by the interceptor on EVERY taken-over activation of an opt-in
 * (`data-return-focus`) anchor — keyboard AND pointer, on every degrade
 * branch (presence, not motion). A pointer activation still OVERWRITES any
 * earlier keyboard record from the same page: the latest departure is the
 * truthful memory of how that page was last left. Non-opt-in activations
 * never touch the record (their pages are out of scope, and a case page's
 * "The Work" hop must not erase the Home row's chair).
 */
export function recordReturnFocus(
  anchor: Element,
  fromPathname: string,
  toPathname: string,
  keyboard: boolean,
): void {
  const href = anchor.getAttribute('data-return-focus');
  if (!href) return;
  seat = { origin: normalize(fromPathname), dest: normalize(toPathname), href, keyboard };
}

/** RouteFocus's popstate listener — a history traversal is in flight. */
export function notePopstate(): void {
  popArrival = true;
}

/** The interceptor's take-over — this commit will be a PUSH, not a pop. */
export function notePushNavigation(): void {
  popArrival = false;
}

/**
 * Called by RouteFocus on ROUTE COMMIT, BEFORE it would focus `<main>`.
 * Returns the anchor to reseat on when this commit is a popstate arrival
 * back at the recorded origin AND the departure was keyboard-activated AND
 * the link is still present and rendered — else null, and the caller keeps
 * today's focus-to-main behavior untouched. Also retires a record the user
 * has moved past: a PUSH from the recorded origin to anywhere other than
 * its recorded destination means a NEW activation superseded the chair.
 */
export function resolveArrivalFocus(
  previousPathname: string,
  arrivalPathname: string,
): HTMLAnchorElement | null {
  const wasPop = popArrival;
  popArrival = false; // consumed on every commit — pop or push
  const recorded = seat;
  if (!recorded) return null;
  if (wasPop && normalize(arrivalPathname) === recorded.origin) {
    if (!recorded.keyboard) return null;
    return findRowLink(recorded.href);
  }
  if (
    !wasPop &&
    normalize(previousPathname) === recorded.origin &&
    normalize(arrivalPathname) !== recorded.dest
  ) {
    seat = null; // superseded by a newer activation from the same page
  }
  return null;
}

/**
 * Find the recorded row link on the (just-restored) page. Rendered-ness is
 * required — an unrendered link cannot take a seat — but opacity is NOT
 * (the work rows are Reveal curtains: opacity/transform, never display, so
 * a row still fading in is already seated correctly). The selector value is
 * quote-guarded (site-controlled paths today; the guard keeps a future
 * exotic value a miss, not a SyntaxError).
 */
function findRowLink(href: string): HTMLAnchorElement | null {
  const value = href.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const el = document.querySelector<HTMLAnchorElement>(
    `a[data-return-focus="${value}"]`,
  );
  if (!el) return null;
  if (typeof el.checkVisibility === 'function') {
    return el.checkVisibility() ? el : null;
  }
  return el.getClientRects().length > 0 ? el : null;
}

/** Test seam only — the module keeps no other reset path on purpose. */
export function _resetReturnFocusForTests(): void {
  seat = null;
  popArrival = false;
}

function normalize(pathname: string): string {
  if (pathname === '' || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}
