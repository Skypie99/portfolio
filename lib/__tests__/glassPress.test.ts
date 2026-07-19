/**
 * Glass with mass (R4/BP3 · P12) — the CSS contract.
 * jsdom cannot evaluate media queries, so this locks the SOURCE contract:
 * coarse-pointer gating, every ladder rung as a STANDALONE rule (selector
 * immediately followed by `{` — pins separateness in any order, the BP3
 * skeptic's stronger form), the DARK rungs (the C-18 specificity trap),
 * the LVHA tie-break (doubled class), transform confined to no-preference,
 * tokens only, and the zero-JS cell across the whole runtime source.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

/** Extract a brace-balanced @media block's body, given its exact prelude. */
function mediaBlock(prelude: string): string {
  const start = css.indexOf(prelude);
  expect(start, `media prelude present: ${prelude}`).toBeGreaterThan(-1);
  let i = css.indexOf('{', start);
  let depth = 1;
  const bodyStart = i + 1;
  while (depth > 0 && i < css.length - 1) {
    i += 1;
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') depth -= 1;
  }
  return css.slice(bodyStart, i);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === '__tests__' || name === 'node_modules') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

describe('glass press (coarse pointers) — source contract', () => {
  const shadowBlock = mediaBlock('@media (pointer: coarse) {');
  const motionBlock = mediaBlock(
    '@media (pointer: coarse) and (prefers-reduced-motion: no-preference) {',
  );

  it('ships every ladder rung as a STANDALONE rule (selector immediately opens its own block)', () => {
    // Light rungs carry the LVHA tie-break (doubled class beats the later
    // :focus-within at 0,2,0); dark rungs carry html.dark (beats the dark
    // rest stack at 0,2,1). A comma-combined list in ANY order would fail
    // these prelude-shape assertions.
    expect(shadowBlock).toMatch(/\.glass-card\.glass-card:active\s*\{/);
    expect(shadowBlock).toMatch(/\.glass-card\.glass-card:has\(:active\)\s*\{/);
    expect(shadowBlock).toMatch(/html\.dark \.glass-card:active\s*\{/);
    expect(shadowBlock).toMatch(/html\.dark \.glass-card:has\(:active\)\s*\{/);
    expect(motionBlock).toMatch(/\.glass-card\.glass-card:active\s*\{/);
    expect(motionBlock).toMatch(/\.glass-card\.glass-card:has\(:active\)\s*\{/);
    expect(shadowBlock).not.toMatch(/:active\s*,/);
    expect(motionBlock).not.toMatch(/:active\s*,/);
  });

  it('gives DARK its own shadow answer (the C-18 trap: html.dark rest stack out-ranks bare rungs)', () => {
    const darkRung = shadowBlock.slice(shadowBlock.indexOf('html.dark .glass-card:active'));
    expect(darkRung).toContain('rgb(255 240 214 / 0.1)'); // the dark rest insets, verbatim
    expect(darkRung).toContain('rgb(0 0 0 / 0.55)'); // tightened dark outers
  });

  it('confines the press TRANSFORM to the no-preference block (RM = shadow-only)', () => {
    expect(motionBlock).toContain('transform: translateY(1px) scale(0.995)');
    expect(shadowBlock).not.toContain('transform:');
  });

  it('uses tokens only — no raw beziers or magic durations in the press blocks', () => {
    for (const block of [shadowBlock, motionBlock]) {
      expect(block).not.toContain('cubic-bezier(');
    }
    expect(motionBlock).toContain('var(--ease-gh-settle)');
    expect(motionBlock).toContain('var(--dur-base)');
    expect(motionBlock).toContain('calc(var(--dur-fast) / 2)');
    expect(motionBlock).toContain('var(--ease-gh-glide)');
    expect(motionBlock).not.toMatch(/[\s:]\d+ms/);
  });

  it('keeps the pitch\'s 0-JS cell true — no touchstart anywhere in the runtime source', () => {
    const files = [
      ...walk(join(process.cwd(), 'components')),
      ...walk(join(process.cwd(), 'lib')),
      ...walk(join(process.cwd(), 'app')),
    ];
    const offenders = files.filter((f) => readFileSync(f, 'utf8').includes('touchstart'));
    expect(offenders).toEqual([]);
  });
});
