/**
 * The Door Ajar (R4/BP2 · P08) — record/apply matrix.
 * In-memory only; click-returns only; present-until-next-nav; consumed on
 * apply so a refresh (or any later arrival) shows nothing.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { _resetDoorAjarForTests, applyDoorAjar, recordDeparture } from '@/lib/doorAjar';

function addCardLink(href: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.setAttribute('href', href);
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
  it('marks the departed room card on a return home', () => {
    const card = addCardLink('/work/accessmap/');
    recordDeparture('/work/accessmap/', '/');
    applyDoorAjar('/');
    expect(card.hasAttribute('data-door-ajar')).toBe(true);
  });

  it('marks the card on a return to /work/ (the "← All work" leg)', () => {
    const card = addCardLink('/work/dashboard/');
    recordDeparture('/work/dashboard/', '/work/');
    applyDoorAjar('/work/');
    expect(card.hasAttribute('data-door-ajar')).toBe(true);
  });

  it('marks EVERY matching link (hidden duplicates are harmless)', () => {
    const one = addCardLink('/work/accessmap/');
    const two = addCardLink('/work/accessmap/');
    recordDeparture('/work/accessmap/', '/');
    applyDoorAjar('/');
    expect(one.hasAttribute('data-door-ajar')).toBe(true);
    expect(two.hasAttribute('data-door-ajar')).toBe(true);
  });

  it('does nothing when the destination shows no cards', () => {
    const card = addCardLink('/work/accessmap/');
    recordDeparture('/work/accessmap/', '/about/');
    applyDoorAjar('/about/');
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('does nothing when the origin is not a case-study room', () => {
    const card = addCardLink('/work/accessmap/');
    recordDeparture('/about/', '/');
    applyDoorAjar('/');
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('is consumed on apply — a later arrival shows nothing (in-memory truth)', () => {
    const card = addCardLink('/work/accessmap/');
    recordDeparture('/work/accessmap/', '/');
    applyDoorAjar('/');
    card.removeAttribute('data-door-ajar');
    applyDoorAjar('/'); // e.g. a re-render / a later commit with no new departure
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('clears a stale mark on the next commit (present-until-next-nav)', () => {
    const card = addCardLink('/work/accessmap/');
    recordDeparture('/work/accessmap/', '/');
    applyDoorAjar('/');
    expect(card.hasAttribute('data-door-ajar')).toBe(true);

    recordDeparture('/', '/about/'); // the next navigation, not a return
    applyDoorAjar('/about/');
    expect(card.hasAttribute('data-door-ajar')).toBe(false);
  });

  it('normalizes trailing slashes on the destination', () => {
    const card = addCardLink('/work/accessmap/');
    recordDeparture('/work/accessmap/', '/work');
    applyDoorAjar('/work');
    expect(card.hasAttribute('data-door-ajar')).toBe(true);
  });
});
