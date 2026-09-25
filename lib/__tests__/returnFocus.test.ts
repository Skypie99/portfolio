/**
 * The return seat (W4-02 · N1) — record/resolve matrix.
 * In-memory only; OPT-IN hooks only (data-return-focus, never bare hrefs);
 * KEYBOARD activations only restore; POPSTATE arrivals only restore; a PUSH
 * from the recorded origin to a different destination retires the record;
 * the popstate flag is consumed on every commit and cleared by a take-over.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  _resetReturnFocusForTests,
  notePopstate,
  notePushNavigation,
  recordReturnFocus,
  resolveArrivalFocus,
} from '@/lib/returnFocus';

function addRowLink(href: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.setAttribute('data-return-focus', href); // the Home #work row opt-in hook
  document.body.appendChild(a);
  return a;
}

function addBareLink(href: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.setAttribute('href', href); // e.g. a /work/ wall card — NO opt-in hook
  document.body.appendChild(a);
  return a;
}

function anchorLike(el: HTMLAnchorElement): Element {
  return el as unknown as Element;
}

beforeEach(() => {
  _resetReturnFocusForTests();
  stubCheckVisibility(true);
});

afterEach(() => {
  restoreCheckVisibility();
  document.body.innerHTML = '';
});

/** jsdom has no checkVisibility (and lays out nothing) — stub the guard. */
function stubCheckVisibility(result: boolean): void {
  Object.defineProperty(HTMLElement.prototype, 'checkVisibility', {
    configurable: true,
    value: () => result,
  });
}

function restoreCheckVisibility(): void {
  delete (HTMLElement.prototype as Partial<Record<'checkVisibility', unknown>>).checkVisibility;
}

describe('returnFocus (record → resolve)', () => {
  it('reseats a keyboard reader on Back: popstate arrival at the recorded origin returns the row link', () => {
    const flagstone = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(flagstone), '/', '/work/flagstone/', true);
    notePopstate(); // history Back
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBe(flagstone);
  });

  it('returns the row link only — never a bare href match (opt-in hooks only)', () => {
    const bare = addBareLink('/work/flagstone/');
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    notePopstate();
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBe(row);
    expect(resolveArrivalFocus('/work/flagstone/', '/')).not.toBe(bare);
  });

  it('keeps focus-to-main for a POINTER departure on Back (keyboard-only restore)', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', false);
    notePopstate();
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBeNull();
  });

  it('keeps focus-to-main for a FORWARD arrival at the origin (popstate-only restore)', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    // no notePopstate: this commit is the interceptor's push (a click-return)
    expect(resolveArrivalFocus('/about/', '/')).toBeNull();
  });

  it('keeps the record across a pop arrival elsewhere — repeated Back/Forward visits still reseat', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    notePopstate();
    expect(resolveArrivalFocus('/', '/about/')).toBeNull(); // Back beyond the origin
    notePopstate();
    expect(resolveArrivalFocus('/about/', '/')).toBe(row); // Forward home again — still seated
  });

  it('retires the record when a PUSH leaves the origin for a different destination (a newer activation supersedes the chair)', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    notePopstate();
    resolveArrivalFocus('/work/flagstone/', '/'); // Back home — seated, record kept
    // the reader mouse-clicks the sidebar to /certificates/ (a push)
    expect(resolveArrivalFocus('/', '/certificates/')).toBeNull();
    notePopstate(); // later Back to the origin — no chair left to take
    expect(resolveArrivalFocus('/certificates/', '/')).toBeNull();
  });

  it('keeps the record on the departure\'s OWN push commit (origin → recorded dest)', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    expect(resolveArrivalFocus('/', '/work/flagstone/')).toBeNull(); // the Enter's own commit
    notePopstate();
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBe(row); // Back still reseats
  });

  it('overwrites: the LATEST keyboard departure is the chair (interrupted navigation)', () => {
    const flagstone = addRowLink('/work/flagstone/');
    const ghost = addRowLink('/work/ghost-code/');
    recordReturnFocus(anchorLike(flagstone), '/', '/work/flagstone/', true);
    recordReturnFocus(anchorLike(ghost), '/', '/work/ghost-code/', true); // rapid second Enter
    expect(resolveArrivalFocus('/', '/work/ghost-code/')).toBeNull();
    notePopstate();
    expect(resolveArrivalFocus('/work/ghost-code/', '/')).toBe(ghost);
    expect(resolveArrivalFocus('/work/ghost-code/', '/')).not.toBe(flagstone);
  });

  it('a pointer activation of the SAME row supersedes an earlier keyboard record', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', false); // later mouse click
    notePopstate();
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBeNull();
  });

  it('a NON-opt-in activation never touches the record (case-page hops must not erase the Home chair)', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    const bare = addBareLink('/work/');
    recordReturnFocus(anchorLike(bare), '/work/flagstone/', '/work/', true); // "The Work" rail hop
    notePopstate();
    expect(resolveArrivalFocus('/work/', '/work/flagstone/')).toBeNull();
    notePopstate();
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBe(row); // still seated
  });

  it('falls back (null) when the recorded link is missing from the restored page', () => {
    recordReturnFocus(anchorLike(addRowLink('/work/flagstone/')), '/', '/work/flagstone/', true);
    document.body.innerHTML = ''; // the link did not survive restoration
    notePopstate();
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBeNull();
  });

  it('falls back (null) when the recorded link is not rendered (hidden)', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    stubCheckVisibility(false);
    notePopstate();
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBeNull();
  });

  it('consumes the popstate flag on every commit — a later push is not mistaken for a pop', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '/', '/work/flagstone/', true);
    notePopstate();
    resolveArrivalFocus('/work/flagstone/', '/'); // consumes the flag (seated)
    // a hash history hop set the flag, then a click take-over cleared it:
    notePopstate();
    notePushNavigation();
    expect(resolveArrivalFocus('/work/flagstone/', '/')).toBeNull(); // push, not pop
  });

  it('normalizes trailing slashes on origin, dest and arrival', () => {
    const row = addRowLink('/work/flagstone/');
    recordReturnFocus(anchorLike(row), '', '/work/flagstone', true);
    notePopstate();
    expect(resolveArrivalFocus('/work/flagstone', '')).toBe(row);
  });
});
