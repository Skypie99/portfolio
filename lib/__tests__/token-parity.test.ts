/**
 * token-parity.test.ts — Overhaul 2026-06-03 foundation guard (Shamus).
 *
 * The design system is mirrored across THREE files and they must stay in
 * lockstep, or classes silently break at build/merge time (the "globals ↔
 * tailwind drift" footgun + the lib/cn.ts Cycle-11 collapse bug):
 *
 *   app/globals.css      — the SOURCE OF TRUTH: `--fs-*`, `--ease-*`,
 *                          `--shadow-*` custom properties (+ html.dark
 *                          overrides for the rgba-literal shadows).
 *   tailwind.config.ts   — the MIRROR: fontSize / transitionTimingFunction /
 *                          boxShadow keys must point at `var(--…)`.
 *   lib/cn.ts            — twMerge allowlist: every NEW named `text-*` token
 *                          must be in CUSTOM_FONT_SIZES.
 *
 * This test fails loudly if a future cycle adds a Tailwind token whose
 * backing CSS variable is missing (which would resolve to nothing and
 * inherit), forgets the html.dark shadow override (shadows are rgba
 * literals — they do NOT auto-flip), or forgets the cn.ts registration.
 *
 * Scope: the additive tokens introduced by the below-the-landing overhaul.
 * It does NOT touch or assert anything about the frozen cinematic landing.
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd());
const GLOBALS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8');
const TAILWIND = readFileSync(join(ROOT, 'tailwind.config.ts'), 'utf8');
const CN = readFileSync(join(ROOT, 'lib', 'cn.ts'), 'utf8');

/** The `html.dark { … }` block body (flat custom props — no nested braces). */
const DARK_BLOCK = GLOBALS.match(/html\.dark\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

// Tailwind fontSize key  →  backing CSS var is always `--fs-<key>`.
const TYPE_STEPS = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'display', 'hero'];
const EASINGS = ['entrance', 'exit', 'snap'];
const SHADOWS = ['sm', 'md', 'lg', 'xl'];

describe('token parity — modular type scale', () => {
  it.each(TYPE_STEPS)('--fs-%s is defined in globals.css', (key) => {
    expect(GLOBALS).toContain(`--fs-${key}:`);
  });

  it.each(TYPE_STEPS)('tailwind fontSize "%s" points at its CSS var', (key) => {
    expect(TAILWIND).toContain(`var(--fs-${key})`);
  });

  it.each(TYPE_STEPS)('text-%s is registered in lib/cn.ts CUSTOM_FONT_SIZES', (key) => {
    // Without this, twMerge groups `text-step-3` as text-COLOR and drops it
    // when combined with a real color class (the Cycle 11 bug).
    expect(CN).toContain(`'${key}'`);
  });
});

describe('token parity — easing vocabulary', () => {
  it.each(EASINGS)('--ease-%s is defined in globals.css', (key) => {
    expect(GLOBALS).toContain(`--ease-${key}:`);
  });

  it.each(EASINGS)('tailwind transitionTimingFunction "%s" points at its var', (key) => {
    expect(TAILWIND).toContain(`var(--ease-${key})`);
  });
});

describe('token parity — warm shadow ramp', () => {
  it.each(SHADOWS)('--shadow-%s is defined in :root (light)', (key) => {
    expect(GLOBALS).toContain(`--shadow-${key}:`);
  });

  it.each(SHADOWS)('--shadow-%s has an html.dark override (rgba literals do NOT auto-flip)', (key) => {
    expect(DARK_BLOCK).toContain(`--shadow-${key}:`);
  });

  it.each(SHADOWS)('tailwind boxShadow "%s" points at its var', (key) => {
    expect(TAILWIND).toContain(`var(--shadow-${key})`);
  });
});

// ── §7.4 SP-1 — the spacing namespace must stay HONEST: the numeral in every
//    spacing key tracks the size it renders (numeral × 0.25rem). This guards
//    against the inverted scale (py-16 = 8rem) ever silently returning.
describe('token parity — honest spacing scale (SP-1)', () => {
  // Canonical scale lives in globals.css --space-* (the parity anchor).
  const spaceEntries = [...GLOBALS.matchAll(/--space-(\d+):\s*([\d.]+)rem;/g)]
    .map((m) => ({ key: Number(m[1]), rem: parseFloat(m[2]) }));

  it('declares the full enumerated --space-* scale', () => {
    expect(spaceEntries.length).toBeGreaterThanOrEqual(13);
    expect(spaceEntries.map((e) => e.key)).toEqual(
      expect.arrayContaining([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 18, 20, 50]),
    );
  });

  it.each([
    [1, 0.25], [2, 0.5], [3, 0.75], [4, 1], [5, 1.25], [6, 1.5], [8, 2],
    [10, 2.5], [12, 3], [16, 4], [18, 4.5], [20, 5], [50, 12.5],
  ])('--space-%i == %f rem (numeral × 0.25rem — honest)', (key, rem) => {
    const e = spaceEntries.find((x) => x.key === key);
    expect(e).toBeDefined();
    expect(e!.rem).toBe(rem);
    expect(e!.rem).toBe(key * 0.25); // the invariant: numeral tracks size
  });

  it('the --space-* scale is strictly monotonic (numeric order = size order)', () => {
    const sorted = [...spaceEntries].sort((a, b) => a.key - b.key);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].rem).toBeGreaterThan(sorted[i - 1].rem);
    }
  });

  it.each([
    "'5': '1.5rem'", "'6': '2rem'", "'8': '3rem'", "'10': '4rem'",
    "'12': '6rem'", "'16': '8rem'", "'20': '12.5rem'",
  ])('tailwind.config spacing no longer contains the inverted literal %s', (lit) => {
    expect(TAILWIND).not.toContain(lit);
  });

  it.each([["'18': '4.5rem'"], ["'50': '12.5rem'"]])(
    'tailwind.config declares the honest non-default key %s',
    (lit) => {
      expect(TAILWIND).toContain(lit);
    },
  );
});

// ── §7.4 TY-8 — promoted display tokens. Same three-file trinity the type scale
//    is held to (globals.css ↔ tailwind.config ↔ lib/cn.ts), plus exact computed
//    values so a promoted clamp can never silently drift, and the folded specs.
describe('token parity — promoted type tokens (TY-8)', () => {
  const PROMOTED = [
    'card-numeral', 'card-title', 'stat-figure', 'nav-item',
    'prose-h2', 'prose-h3', 'case-h2', 'case-h3', 'blog-card-title',
  ];
  const CLAMPS: Record<string, string> = {
    'card-numeral': 'clamp(2.6rem, 5vw, 3.6rem)',
    'card-title': 'clamp(1.85rem, 2.6vw, 2.4rem)',
    'stat-figure': 'clamp(2.75rem, 5.5vw, var(--fs-step-5))',
    'nav-item': 'clamp(2rem, 6.2vw, 3.75rem)',
    'prose-h2': 'clamp(1.5rem, 3vw, 2.25rem)',
    'prose-h3': 'clamp(1.25rem, 2.5vw, 1.75rem)',
    'case-h2': 'clamp(1.5rem, 3vw, 2rem)',
    'case-h3': 'clamp(1.25rem, 2.5vw, 1.5rem)',
    'blog-card-title': 'clamp(1.5rem, 3.5vw, 2.25rem)',
  };

  it.each(PROMOTED)('--fs-%s is defined in globals.css', (key) => {
    expect(GLOBALS).toContain(`--fs-${key}:`);
  });

  it.each(PROMOTED)('tailwind fontSize "%s" points at its CSS var', (key) => {
    expect(TAILWIND).toContain(`var(--fs-${key})`);
  });

  it.each(PROMOTED)('text-%s is registered in lib/cn.ts CUSTOM_FONT_SIZES (Cycle-11 guard)', (key) => {
    expect(CN).toContain(`'${key}'`);
  });

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  it.each(PROMOTED)('--fs-%s holds its exact computed clamp (no silent drift)', (key) => {
    expect(GLOBALS).toMatch(new RegExp(`--fs-${key}:\\s+${esc(CLAMPS[key])};`));
  });

  it('CountUpStat keeps var(--fs-step-5) as its clamp CEILING (Flagship #2)', () => {
    const m = GLOBALS.match(/--fs-stat-figure:\s*([^;]+);/);
    expect(m?.[1]).toContain('var(--fs-step-5)');
  });

  it.each([
    ['--ls-card-title', '-0.022em'],
    ['--ls-heading', '-0.01em'],
    ['--ls-stat', '-0.03em'],
  ])('letter-spacing token %s == %s (promoted off-token tracking)', (name, val) => {
    expect(GLOBALS).toMatch(new RegExp(`${name}:\\s*${val.replace(/[.\-]/g, '\\$&')}`));
  });

  it.each(['var(--ls-heading)', 'var(--ls-card-title)', 'var(--ls-stat)'])(
    'tailwind fontSize tuples reference the named tracking token %s',
    (ref) => {
      expect(TAILWIND).toContain(ref);
    },
  );

  it('the text-display line-height override is folded into the token (1.1 → 1.05)', () => {
    expect(TAILWIND).toMatch(/display:\s*\['var\(--fs-display\)',\s*\{\s*lineHeight:\s*'1\.05'/);
  });
});
