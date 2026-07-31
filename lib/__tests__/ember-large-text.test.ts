/**
 * ember-large-text.test.ts — the ember gradient may only ever be used at
 * large-text sizes (a11y deep-QA, 2026-07-31, finding L4-2).
 *
 * WHY THIS EXISTS
 * The ember gradients are measured at worst-stop 3.18:1 (dark) / 3.30:1 (light).
 * That clears SC 1.4.3's LARGE-text floor of 3:1 — and nothing else. At body size
 * the same gradient would need 4.5:1 and would fail everywhere it appeared.
 *
 * Today every call site is display-scale, so there is no defect. This guard pins
 * the invariant that makes it safe, so a future reuse at 14px cannot silently ship
 * 3.2:1 body text. It checks BOTH halves:
 *   1. every ember* class sits on an element that also carries an approved
 *      display-size class;
 *   2. those size tokens are all still ≥24px (the large-text threshold for
 *      non-bold text in SC 1.4.3).
 *
 * `rule-ember` is deliberately excluded — it is a 1px decorative hairline, not text.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd());
const CSS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8');

/** Size classes whose computed font-size is comfortably above the 24px large-text floor. */
const APPROVED_DISPLAY_SIZES = [
  'text-hero',
  'text-step-4',
  'text-step-5',
  'text-display',
  'text-stat-figure',
  'text-card-numeral',
] as const;

/** The custom properties backing those classes, for the ≥24px half of the check. */
const SIZE_TOKENS: Record<string, string> = {
  'text-hero': '--fs-hero',
  'text-step-4': '--fs-step-4',
  'text-step-5': '--fs-step-5',
  'text-display': '--fs-display',
  'text-stat-figure': '--fs-stat-figure',
  'text-card-numeral': '--fs-card-numeral',
};

const LARGE_TEXT_PX = 24;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (entry.endsWith('.tsx')) out.push(full);
  }
  return out;
}

/** Smallest px value a font-size declaration can resolve to (clamp → its minimum). */
function minPx(decl: string): number {
  const clamp = /clamp\(\s*([\d.]+)(rem|px)/.exec(decl);
  if (clamp) return Number(clamp[1]) * (clamp[2] === 'rem' ? 16 : 1);
  const plain = /([\d.]+)(rem|px)/.exec(decl);
  if (plain) return Number(plain[1]) * (plain[2] === 'rem' ? 16 : 1);
  return NaN;
}

// The ember TEXT gradients (rule-ember is a hairline, not text).
const EMBER_TOKEN = /(?:^|[\s"'`])(ember(?:-teal|-gold|-moss)?)(?=[\s"'`]|$)/;

describe('L4-2 — the ember gradient stays at large-text sizes only', () => {
  it('every ember* class sits alongside an approved display-size class', () => {
    const offenders: string[] = [];
    for (const file of [...sourceFiles(join(ROOT, 'app')), ...sourceFiles(join(ROOT, 'components'))]) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/className=(?:"([^"]*)"|\{cn\(([\s\S]*?)\)\})/g)) {
        const blob = m[1] ?? m[2] ?? '';
        if (!EMBER_TOKEN.test(blob)) continue;
        // CountUpStat composes its ember class from a prop; its own size class is
        // in the same blob, so the same rule applies uniformly.
        if (!APPROVED_DISPLAY_SIZES.some((s) => blob.includes(s))) {
          offenders.push(`${file.replace(ROOT, '')} → ${blob.replace(/\s+/g, ' ').trim().slice(0, 120)}`);
        }
      }
    }
    expect(
      offenders,
      `ember used without an approved display size (would render <24px gradient text at ~3.2:1):\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('the approved display-size tokens are all still ≥24px', () => {
    for (const [cls, token] of Object.entries(SIZE_TOKENS)) {
      const m = new RegExp(`${token}:\\s*([^;]+);`).exec(CSS);
      expect(m, `${token} must be defined in globals.css`).toBeTruthy();
      const px = minPx(m![1]);
      expect(Number.isNaN(px), `could not parse a px value from ${token}: ${m![1]}`).toBe(false);
      expect(px, `${cls} (${token}) fell below the large-text floor`).toBeGreaterThanOrEqual(LARGE_TEXT_PX);
    }
  });

  it('ember gradients are still gradient-clipped text (the reason the floor is 3:1)', () => {
    // If ember ever stopped being background-clip:text, its contrast would be
    // governed by plain colour rules and this guard's premise would change.
    const emberBlock = CSS.slice(CSS.indexOf('.ember {'), CSS.indexOf('.ember {') + 400);
    expect(emberBlock).toMatch(/background-clip:\s*text|-webkit-background-clip:\s*text/);
  });
});
