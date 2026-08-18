/**
 * Display-title wrap-point helpers (TY-6) — unit tests.
 *
 * These pin the no-break-space (U+00A0) insertions that keep display crowns
 * from breaking badly: bindSoloLetters glues a lone "A/a/I" to the next word;
 * bindSeparatorDash (Polish §6 P2) glues a spaced em/en dash to the preceding
 * word so a crown line can't START with a hanging dash.
 *
 * Every expected NBSP is written as the explicit ` ` escape (an
 * unambiguous ASCII sequence the parser converts) — never a literal NBSP
 * character — so the assertions prove byte placement rather than relying on
 * how an editor happened to store a space.
 */
import { describe, expect, it } from 'vitest';

import { bindSeparatorDash, bindSoloLetters } from '@/lib/markdown';

const NBSP = ' ';

describe('bindSoloLetters', () => {
  it('binds a leading solo "A" to the following word', () => {
    expect(bindSoloLetters('A Lesson')).toBe(`A${NBSP}Lesson`);
  });

  it('binds solo "I" mid-string', () => {
    expect(bindSoloLetters('you and I are here')).toBe(`you and I${NBSP}are here`);
  });

  it('binds a lowercase solo "a" too', () => {
    expect(bindSoloLetters('An apple a day')).toBe(`An apple a${NBSP}day`);
  });

  it('leaves strings with no solo letters untouched', () => {
    expect(bindSoloLetters('no solo letters here')).toBe('no solo letters here');
  });
});

describe('bindSeparatorDash', () => {
  it('glues a spaced em-dash to the preceding word, keeping the trailing space', () => {
    expect(bindSeparatorDash('Flagstone — A')).toBe(`Flagstone${NBSP}— A`);
  });

  it('handles a spaced en-dash the same way', () => {
    expect(bindSeparatorDash('one – two')).toBe(`one${NBSP}– two`);
  });

  it('does NOT touch a dash without surrounding spaces (hyphen/compound)', () => {
    expect(bindSeparatorDash('well-known phrase')).toBe('well-known phrase');
    expect(bindSeparatorDash('range 3—4 here')).toBe('range 3—4 here');
  });

  it('leaves prose without a spaced separator dash unchanged', () => {
    expect(bindSeparatorDash('just a plain sentence')).toBe('just a plain sentence');
  });

  it('binds every spaced dash when several appear', () => {
    expect(bindSeparatorDash('a — b — c')).toBe(`a${NBSP}— b${NBSP}— c`);
  });
});

describe('composed crown transform (the real blog title)', () => {
  const RAW = 'Building Flagstone — A Lesson in Shipping Something That Matters';

  it('binds the separator dash to Flagstone AND the solo "A" to Lesson', () => {
    const out = bindSeparatorDash(bindSoloLetters(RAW));
    expect(out).toBe(
      `Building Flagstone${NBSP}— A${NBSP}Lesson in Shipping Something That Matters`,
    );
    // The character immediately before the em-dash must be a NBSP (U+00A0 = 160),
    // never a plain space — that is the no-JS proof the dash can't start a line.
    const dashIdx = out.indexOf('—');
    expect(out.charCodeAt(dashIdx - 1)).toBe(0x00a0);
    // Visible text (NBSP normalised back to a normal space) is identical to RAW —
    // i.e. we changed wrap points, not copy.
    expect(out.replace(/ /g, ' ')).toBe(RAW);
  });

  it('is order-independent (helpers target disjoint patterns)', () => {
    expect(bindSeparatorDash(bindSoloLetters(RAW))).toBe(
      bindSoloLetters(bindSeparatorDash(RAW)),
    );
  });
});
