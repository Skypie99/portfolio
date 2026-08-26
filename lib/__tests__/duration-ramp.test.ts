/**
 * THE ROOM / Phase G · G3 — the duration ramp holds.
 *
 * WHY THIS FILE EXISTS AT ALL. token-parity.test.ts guards `--fs-*`, `--ease-*`
 * and `--shadow-*` — it has never covered DURATIONS. That gap is precisely how
 * the sheet accumulated a 300ms, a 560ms and a 120ms sitting beside a tokenised
 * ramp, and how one keyframe (`settle-title`) ended up driven at 560ms from one
 * rule and `var(--dur-slow)` from another. Nothing failed; the ramp just quietly
 * stopped being the whole truth. This closes that gap.
 *
 * The contract: every animation/transition duration authored in globals.css is
 * either a ramp token or one of the SURVIVORS enumerated below with its reason.
 * A new literal fails this test and has to argue for itself in the list.
 *
 * SCOPE. globals.css only. `app/archive/**` is the Studio Archive — the art
 * surface, deliberately excluded from the design-system census since Phase A,
 * with Phase F held and "no motion on artwork" standing. Its stylesheet is not
 * governed by this ramp and is not swept here.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const CSS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8');
const TW = readFileSync(join(ROOT, 'tailwind.config.ts'), 'utf8');

/** The ramp, as the approved system sheet (board 04) enumerates it. */
const RAMP: Record<string, string> = {
  '--dur-fast': '180ms',
  '--dur-base': '280ms',
  '--dur-slow': '520ms',
  '--dur-reveal': '900ms',
  '--dur-settle': '560ms',
  '--dur-transition': '420ms',
  '--dur-scene': '1200ms',
};

/**
 * Literal durations that are allowed to remain, each with the reason it is not
 * a drift. Anything not on this list must use a token.
 */
const SURVIVORS: { match: string; why: string }[] = [
  {
    match: 'animation-delay: 150ms',
    why: "the hero title's offset inside ONE composed arrival — not rhythm, and " +
      'no delay tier sits above --stagger-scene (120ms). Not in the system ' +
      "sheet's stray list.",
  },
  {
    match: 'animation: intro-cue-rise 600ms',
    why: 'PROTECT-66 sanctions the intro cue\'s EXIT duration only; this is its ' +
      'ENTRANCE. Retiming it is a recorded governance violation (two such ' +
      'refinements were reverted before merge). Escalated, not touched.',
  },
  {
    match: 'animation-delay: 700ms',
    why: "the same cue's entrance delay — same PROTECT-66 reasoning.",
  },
  {
    match: 'var(--dur-ambient, 26s)',
    why: 'a var() FALLBACK, not an untokenised value.',
  },
];

/**
 * Every `animation:`/`transition:`/`-duration:`/`-delay:` DECLARATION, with
 * trailing comments stripped — several tokenised rules annotate themselves with
 * the ms value the token resolves to (`var(--dur-transition); /* 420ms … *\/`),
 * which is documentation, not drift.
 */
const DECLARATIONS = CSS.split('\n')
  .map((line, i) => ({ n: i + 1, line: line.trim().replace(/\/\*[\s\S]*?(\*\/|$)/g, '').trim() }))
  .filter(({ line }) => /^(animation|transition)(-duration|-delay)?\s*:/.test(line));

describe('the duration ramp — every rung is where the system sheet says', () => {
  it.each(Object.entries(RAMP))('%s is %s', (token, value) => {
    // Pinned, not merely present: --dur-fast in particular is now DIRECTLY
    // COUPLED to Flagstone's `.pr-stone-settle`, whose 180ms is cited from the
    // app's own art-direction codex. Retuning this rung silently retimes the
    // flagship's one loud beat and falsifies that citation — so the retune has
    // to come through here first.
    const m = CSS.match(new RegExp(`${token}:\\s*([^;]+);`));
    expect(m, `${token} declared`).not.toBeNull();
    expect(m![1].trim()).toBe(value);
  });

  it('the ramp carries exactly the seven rungs the sheet names', () => {
    const declared = [...CSS.matchAll(/--dur-([a-z]+):\s*[^;]+;/g)].map((m) => m[1]);
    expect(new Set(declared)).toEqual(
      new Set(['fast', 'base', 'slow', 'reveal', 'settle', 'transition', 'scene', 'ambient']),
    );
  });
});

describe('the duration ramp — nothing drifted off it', () => {
  it('every authored duration is a token, or a listed survivor', () => {
    const drift = DECLARATIONS.filter(({ line }) => {
      if (!/\d+(\.\d+)?m?s/.test(line)) return false;                 // no literal at all
      if (line.includes('0.01ms !important')) return false;           // the RM floor itself
      return !SURVIVORS.some((s) => line.includes(s.match));
    }).map(({ n, line }) => `globals.css:${n}  ${line}`);

    expect(drift, `off-ramp durations (add a token, or justify in SURVIVORS):\n${drift.join('\n')}`)
      .toEqual([]);
  });

  it('every listed survivor is still real — the list cannot rot', () => {
    // A survivor that no longer exists means the list is stale and is quietly
    // widening what this test permits.
    for (const s of SURVIVORS) {
      expect(CSS, `SURVIVOR no longer present, remove it: ${s.match}`).toContain(s.match);
    }
  });

  it('the flagship settle and the :target arrival both read from the ramp', () => {
    // Named explicitly because these two are what G3 was asked to confirm.
    expect(CSS).toContain('animation: stone-laid-settle var(--dur-fast)');
    expect(CSS).toContain('animation: target-arrival var(--dur-base)');
  });

  it('settle-title is driven only by named tiers, never a literal', () => {
    const callers = [...CSS.matchAll(/animation:\s*settle-title\s+([^\s]+)/g)].map((m) => m[1]);
    expect(callers.length).toBeGreaterThanOrEqual(2);
    for (const c of callers) expect(c).toMatch(/^var\(--dur-[a-z]+\)$/);
  });
});

describe('the duration ramp — the Tailwind mirror is honest', () => {
  const mirrored = (() => {
    const block = TW.match(/transitionDuration:\s*\{([\s\S]*?)\n\s{6}\},/);
    expect(block, 'transitionDuration block found').not.toBeNull();
    return [...block![1].matchAll(/^\s{8}([a-z]+):/gm)].map((m) => m[1]);
  })();

  it('mirrors only the tiers a Tailwind class can actually reach', () => {
    expect(mirrored.sort()).toEqual(['base', 'fast', 'reveal', 'slow']);
  });

  it('the removed keys are gone from the config, not just unused', () => {
    for (const dead of ['transition:', 'scene:', 'settle:']) {
      const block = TW.match(/transitionDuration:\s*\{([\s\S]*?)\n\s{6}\},/)![1];
      expect(block.split('\n').filter((l) => l.trim().startsWith(dead))).toEqual([]);
    }
  });
});
