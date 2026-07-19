/**
 * Glass with mass (R4/BP3 · P12) — the CSS contract.
 * jsdom cannot evaluate media queries, so this locks the SOURCE contract:
 * coarse-pointer gating, both zero-JS ladder rungs as SEPARATE rules,
 * transform confined to no-preference, tokens only (no raw beziers, no
 * magic durations), and the zero-JS cell (no touchstart rung shipped).
 */
import { readFileSync } from 'node:fs';
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

describe('glass press (coarse pointers) — source contract', () => {
  const shadowBlock = mediaBlock('@media (pointer: coarse) {');
  const motionBlock = mediaBlock(
    '@media (pointer: coarse) and (prefers-reduced-motion: no-preference) {',
  );

  it('ships BOTH zero-JS ladder rungs as SEPARATE rules in both blocks', () => {
    for (const block of [shadowBlock, motionBlock]) {
      expect(block).toContain('.glass-card:active');
      expect(block).toContain('.glass-card:has(:active)');
      // Separate rules — never one comma list an engine without :has would drop.
      expect(block).not.toMatch(/\.glass-card:active\s*,/);
      expect(block).not.toMatch(/,\s*\.glass-card:has\(:active\)/);
    }
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
    // No bare millisecond literals in the motion block (tokens/calc only).
    expect(motionBlock).not.toMatch(/[\s:]\d+ms/);
  });

  it('keeps the pitch\'s 0-JS cell true — no touchstart rung anywhere in the runtime source', () => {
    const interceptor = readFileSync(
      join(process.cwd(), 'components', 'ViewTransitions.tsx'),
      'utf8',
    );
    const doorAjar = readFileSync(join(process.cwd(), 'lib', 'doorAjar.ts'), 'utf8');
    expect(interceptor).not.toContain('touchstart');
    expect(doorAjar).not.toContain('touchstart');
  });
});
