/**
 * The calibration record's data gate (R4/BP7 · P02) — receipts pattern:
 * rounds.json validates at build, one close-date semantic per row, at most
 * one open round, and the fact triangle holds (no build-date fact lives
 * here — that home belongs to other strata).
 */
import { describe, expect, it } from 'vitest';

import { getRounds } from '@/lib/content';
import { RoundsSchema } from '@/lib/schema';

describe('rounds.json (calibration record)', () => {
  const rounds = getRounds();

  it('validates and keeps at most one open round', () => {
    expect(rounds.length).toBeGreaterThanOrEqual(4);
    expect(rounds.filter((r) => !r.closed)).toHaveLength(1);
  });

  it('keeps closed rows dated and ordered (append-only convention)', () => {
    const closed = rounds.filter((r) => r.closed);
    const dates = closed.map((r) => r.closed as string);
    expect([...dates].sort()).toEqual(dates); // appended in time order
  });

  it('rejects a second open round (the lifecycle gate)', () => {
    const bad = [...rounds, { numeral: 'V', title: 'Extra', counts: ['1 thing'] }];
    expect(RoundsSchema.safeParse(bad).success).toBe(false);
  });

  it('holds the fact triangle — no build-date fact in the card data', () => {
    const all = JSON.stringify(rounds).toLowerCase();
    expect(all).not.toContain('built');
    expect(all).not.toContain('build date');
  });
});
