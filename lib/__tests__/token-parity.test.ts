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
