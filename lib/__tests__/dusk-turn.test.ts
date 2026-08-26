/**
 * THE ROOM / Phase G · G1 — the dusk-turn's CSS contract.
 *
 * jsdom cannot evaluate media queries and cannot build a ::view-transition
 * pseudo tree at all, so the behaviour itself is unassertable in a unit test.
 * What IS assertable — and what actually protects the visitor — is the SOURCE
 * shape, because every way this feature can fail badly is a source edit that
 * still renders fine:
 *
 *   • move any of it out of `no-preference` and a reduced-motion visitor gets
 *     a full-viewport sky flashed at them (layer 2 of the RM contract, and the
 *     only layer a stylesheet edit can break);
 *   • let the two hold windows overlap and the sky is never uncovered — the
 *     turn silently reverts to the invisible cross-fade Sky rejected;
 *   • hard-code a colour and the ramp stops being this world's own dusk, drifts
 *     from WorldBackdrop, and escapes token-parity;
 *   • hard-code a duration and the turn leaves the ramp.
 *
 * The behavioural half (no transition started under RM, marker lifecycle) is
 * guarded in components/__tests__/ThemeToggle.test.tsx.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

/** Body of the brace-balanced block whose prelude starts at `from`. */
function blockAt(from: number): string {
  let i = css.indexOf('{', from);
  const bodyStart = i + 1;
  let depth = 1;
  while (depth > 0 && i < css.length - 1) {
    i += 1;
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') depth -= 1;
  }
  return css.slice(bodyStart, i);
}

/** Every `@media (prefers-reduced-motion: no-preference)` body in the sheet. */
function noPreferenceBodies(): string[] {
  const out: string[] = [];
  const needle = '@media (prefers-reduced-motion: no-preference)';
  let at = css.indexOf(needle);
  while (at !== -1) {
    out.push(blockAt(at));
    at = css.indexOf(needle, at + needle.length);
  }
  return out;
}

const NO_PREF = noPreferenceBodies();

/** The single no-preference block that owns the turn. */
const turnBlock = (() => {
  const owner = NO_PREF.filter((b) => b.includes('data-theme-turn'));
  expect(owner, 'exactly one no-preference block owns the dusk-turn').toHaveLength(1);
  return owner[0];
})();

const TURN_PIECES = [
  "html[data-theme-turn='dark']::view-transition",
  "html[data-theme-turn='light']::view-transition",
  'html[data-theme-turn]::view-transition-old(root)',
  'html[data-theme-turn]::view-transition-new(root)',
  '@keyframes theme-turn-out',
  '@keyframes theme-turn-in',
];

describe('the dusk-turn — reduced motion is the floor', () => {
  it.each(TURN_PIECES)('%s lives inside prefers-reduced-motion: no-preference', (piece) => {
    expect(turnBlock).toContain(piece);
  });

  it('NOTHING about the turn exists outside that block — the sky can never paint under RM', () => {
    // Count occurrences sheet-wide vs. inside the gate; any surplus is a leak.
    for (const piece of TURN_PIECES) {
      const sheetWide = css.split(piece).length - 1;
      const gated = turnBlock.split(piece).length - 1;
      expect(sheetWide, `${piece} appears only inside the RM gate`).toBe(gated);
    }
  });

  it('the pre-existing reduce guard still snaps every root snapshot (layer 3)', () => {
    // The sheet carries several `reduce` blocks; find the one that owns the
    // view-transition pseudos (they are NOT matched by the global
    // *,::before,::after floor, so this guard is their only one).
    const needle = '@media (prefers-reduced-motion: reduce)';
    const guards: string[] = [];
    let at = css.indexOf(needle);
    while (at !== -1) {
      guards.push(blockAt(at));
      at = css.indexOf(needle, at + needle.length);
    }
    const vtGuard = guards.filter((g) => g.includes('::view-transition-old(root)'));
    expect(vtGuard, 'exactly one reduce guard owns the root snapshots').toHaveLength(1);
    expect(vtGuard[0]).toContain('::view-transition-new(root)');
    expect(vtGuard[0]).toContain('animation-duration: 0.01ms !important');
  });
});

describe('the dusk-turn — the sky is actually uncovered', () => {
  /** Keyframe percentage -> opacity, for one @keyframes body. */
  function stops(name: string): Record<number, number> {
    const at = turnBlock.indexOf(`@keyframes ${name}`);
    expect(at, `${name} present`).toBeGreaterThan(-1);
    let i = turnBlock.indexOf('{', at);
    const start = i + 1;
    let depth = 1;
    while (depth > 0 && i < turnBlock.length - 1) {
      i += 1;
      if (turnBlock[i] === '{') depth += 1;
      if (turnBlock[i] === '}') depth -= 1;
    }
    const body = turnBlock.slice(start, i);
    const out: Record<number, number> = {};
    for (const m of body.matchAll(/(\d+)%\s*\{\s*opacity:\s*([\d.]+)\s*;?\s*\}/g)) {
      out[Number(m[1])] = Number(m[2]);
    }
    return out;
  }

  const out = stops('theme-turn-out');
  const inn = stops('theme-turn-in');

  it('the room you leave is fully gone before the room you enter begins', () => {
    // The gap between these two is the entire visual payload of the feature.
    const goneAt = Math.min(...Object.entries(out).filter(([, v]) => v === 0).map(([k]) => Number(k)));
    const beginsAt = Math.max(...Object.entries(inn).filter(([, v]) => v === 0).map(([k]) => Number(k)));
    expect(goneAt).toBeLessThan(beginsAt);
    // …and the window is wide enough to be seen, not a one-frame seam.
    expect(beginsAt - goneAt).toBeGreaterThanOrEqual(10); // ≥10% of 420ms ≈ 42ms
  });

  it('both keyframes start and end at the resting states (no stuck frame)', () => {
    expect(out[0]).toBe(1);
    expect(out[100]).toBe(0);
    expect(inn[0]).toBe(0);
    expect(inn[100]).toBe(1);
  });
});

describe('the dusk-turn — the colour and the clock are the site\'s own', () => {
  const skyRules = turnBlock
    .split(/(?=html\[data-theme-turn=)/)
    .filter((s) => s.startsWith('html[data-theme-turn=') && s.includes('::view-transition {'));

  it('paints two skies — one per destination room', () => {
    expect(skyRules).toHaveLength(2);
  });

  it.each(['dark', 'light'])('the %s ramp is built from tokens, never a literal colour', (leg) => {
    const rule = skyRules.find((r) => r.includes(`'${leg}'`))!;
    const decl = rule.slice(rule.indexOf('{'), rule.indexOf('}'));
    expect(decl).toContain('linear-gradient');
    // Every colour stop routes through a var() — nothing invented, so
    // token-parity keeps covering this and the ramp follows the world.
    expect(decl).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(decl).not.toMatch(/\brgba?\(\s*\d/);
    expect((decl.match(/rgb\(var\(--/g) ?? []).length).toBeGreaterThanOrEqual(5);
  });

  it('the turn rides the duration ramp, not a literal', () => {
    const timed = turnBlock.match(/animation: theme-turn-(?:out|in)[^;]+;/g) ?? [];
    expect(timed).toHaveLength(2);
    for (const rule of timed) {
      expect(rule).toContain('var(--dur-transition)');
      expect(rule).not.toMatch(/\d+m?s/);
    }
  });
});
