/**
 * The Door Ajar (R4/BP2 · P08) — record/apply matrix.
 * In-memory only; click-returns only; OPT-IN marking (data-door-target hooks
 * only — never bare href matches); one bar per card; present-until-next-nav;
 * destination-checked at commit; consumed on apply so a refresh (or any
 * later arrival) shows nothing.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { _resetDoorAjarForTests, applyDoorAjar, recordDeparture } from '@/lib/doorAjar';

function addCardHook(href: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.setAttribute('data-door-target', href);
  document.body.appendChild(a);
  return a;
}

function addBareLink(href: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.setAttribute('href', href); // e.g. the showcase chip — NO opt-in hook
  document.body.appendChild(a);
  return a;
}

beforeEach(() => {
  _resetDoorAjarForTests();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('doorAjar (record → apply)', () => {
  it('marks the departed room card hook on a return home', () => {
    const card = addCardHook('/work/flagstone/');
    recordDeparture('/work/flagstone/', '/');
    applyDoorAjar('/');
    expect(card.hasAttribute('data-door-ajar')).toBe(true);
  });

  it('marks the card hook on a return to /work/ (the "← All work" leg)', () => {
    const card = addCardHook('/work/dashboard/');
    recordDeparture('/work/dashboard/', '/work/');
    applyDoorAjar('/work/');
    expect(card.hasAttribute('data-door-ajar')).toBe(true);
  });

  it('NEVER marks a bare href match — opt-in hooks only (the stretched-link chips stay unpositioned)', () => {
    const chip = addBareLink('/work/flagstone/');
    const card = addCardHook('/work/flagstone/');
    recordDeparture('/work/flagstone/', '/');
    applyDoorAjar('/');
    expect(chip.hasAttribute('data-door-ajar')).toBe(false);
    expect(card.hasAttribute('data-door-ajar')).toBe(true);
  });

  it('does nothing when the destination shows no cards', () => {
    const card = addCardHook('/work/flagstone/');
    recordDeparture('/work/flagstone/', '/about/');
    applyDoorAjar('/about/');
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('does nothing when the origin is not a case-study room', () => {
    const card = addCardHook('/work/flagstone/');
    recordDeparture('/about/', '/');
    applyDoorAjar('/');
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('consumes WITHOUT marking when the committed path differs from the recorded destination (the popstate leak, closed)', () => {
    // A click toward '/' that never commits must not leak its mark onto a
    // later Back/Forward arrival at a card page.
    const card = addCardHook('/work/flagstone/');
    recordDeparture('/work/flagstone/', '/');
    applyDoorAjar('/work/'); // a different commit than the recorded destination
    expect(card.hasAttribute('data-door-ajar')).toBe(false);

    applyDoorAjar('/'); // the destination arrives LATER — memory already consumed
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('is consumed on apply — a later arrival shows nothing (in-memory truth)', () => {
    const card = addCardHook('/work/flagstone/');
    recordDeparture('/work/flagstone/', '/');
    applyDoorAjar('/');
    card.removeAttribute('data-door-ajar');
    applyDoorAjar('/'); // e.g. a re-render / a later commit with no new departure
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('clears a stale mark on the next commit (present-until-next-nav)', () => {
    const card = addCardHook('/work/flagstone/');
    recordDeparture('/work/flagstone/', '/');
    applyDoorAjar('/');
    expect(card.hasAttribute('data-door-ajar')).toBe(true);

    recordDeparture('/', '/about/'); // the next navigation, not a return
    applyDoorAjar('/about/');
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('normalizes trailing slashes on the destination', () => {
    const card = addCardHook('/work/flagstone/');
    recordDeparture('/work/flagstone/', '/work');
    applyDoorAjar('/work');
    expect(card.hasAttribute('data-door-ajar')).toBe(true);
  });
});
