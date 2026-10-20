/**
 * clauses.test.ts — Release 6 (R6-A) wrap-point etiquette for status lines.
 *
 * Guards the two things the renderer relies on: a status splits into its
 * interpunct clauses with the separator preserved (so the rendered text is
 * byte-identical), and only clauses short enough for the narrowest column
 * are held unbroken (UP-14 #4's overflow finding is the reason for the cap).
 */
import { describe, expect, it } from 'vitest';

import { CLAUSE_SEPARATOR, MAX_BOUND_CLAUSE, splitClauses } from '@/lib/clauses';
import { getDeliverables } from '@/lib/content';

describe('splitClauses', () => {
  it('splits on the interpunct and keeps every clause bound when short', () => {
    const clauses = splitClauses('On the App Store · US and Canada · Sept 2026');
    expect(clauses.map((c) => c.text)).toEqual(['On the App Store', 'US and Canada', 'Sept 2026']);
    expect(clauses.every((c) => c.bound)).toBe(true);
  });

  it('round-trips byte-identically through the separator', () => {
    for (const d of getDeliverables()) {
      expect(splitClauses(d.status).map((c) => c.text).join(CLAUSE_SEPARATOR)).toBe(d.status);
    }
  });

  it('treats a line without separators as one clause', () => {
    expect(splitClauses('In active use, on my projects only')).toEqual([
      { text: 'In active use, on my projects only', bound: false },
    ]);
  });

  it('never binds a clause longer than the narrow-column guard', () => {
    const long = 'a'.repeat(MAX_BOUND_CLAUSE + 1);
    expect(splitClauses(`${long} · short`)).toEqual([
      { text: long, bound: false },
      { text: 'short', bound: true },
    ]);
  });

  it("every shipped status clause fits the guard, so today's rows all hold their month and year", () => {
    for (const d of getDeliverables()) {
      for (const c of splitClauses(d.status)) {
        if (c.text.length <= MAX_BOUND_CLAUSE) expect(c.bound).toBe(true);
      }
      const last = splitClauses(d.status).at(-1)!;
      if (/\b\d{4}$/.test(last.text)) expect(last.bound, `${d.id}: "${last.text}" must hold its year`).toBe(true);
    }
  });
});
