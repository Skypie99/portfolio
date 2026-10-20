/**
 * Release 4 — the homepage work rows' hover cues are fine-pointer only.
 *
 * WHY. ProjectDoorwayButton gates its own hover behind `[@media(hover:hover)]`
 * so a tap never leaves the pill hovered. The W4-05/M2 list-side rules in
 * globals.css (`#work ol > li:has(a:hover) …`) used to bypass that gate: on a
 * phone the tapped row kept its sticky :hover, so the doorway dot measured
 * 6px at rest → 4px pressed → 8px after release instead of returning to 6px.
 * Class-string tests on the component cannot see this; it lives in the sheet.
 *
 * The contract: every globals.css rule that targets `#work ol` with `:hover`
 * sits inside `@media (hover: hover)`. Focus-visible and press cues stay
 * ungated (keyboard and touch both need them), and the gated hover dot rule
 * stays ahead of the `:active` dot rule so press keeps winning the cascade.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const CSS = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

interface Rule {
  selector: string;
  /** Enclosing at-rule preludes, outermost first. */
  ancestors: string[];
  offset: number;
}

/** Every style rule with its enclosing at-rules (a brace walk; no nesting in this sheet). */
function rules(css: string): Rule[] {
  const out: Rule[] = [];
  const stack: string[] = [];
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      const prelude = css.slice(start, i).trim();
      if (!prelude.startsWith('@')) out.push({ selector: prelude, ancestors: [...stack], offset: i });
      stack.push(prelude);
      start = i + 1;
    } else if (ch === '}') {
      stack.pop();
      start = i + 1;
    } else if (ch === ';') {
      start = i + 1;
    }
  }
  return out;
}

const ALL = rules(CSS);
const WORK_ROW = ALL.filter((r) => r.selector.includes('#work ol'));
const insideHoverGate = (r: Rule) => r.ancestors.some((a) => /^@media\s*\(hover:\s*hover\)/.test(a));
const DOT = "a.group > span[aria-hidden='true'].rounded-full";

describe('homepage work rows: hover cues are gated to hover-capable pointers', () => {
  it('finds the work-row rules (the walk is not vacuous)', () => {
    expect(WORK_ROW.length).toBeGreaterThanOrEqual(5);
  });

  it('every #work ol :hover rule sits inside @media (hover: hover)', () => {
    const hover = WORK_ROW.filter((r) => r.selector.includes(':hover'));
    expect(hover.length).toBeGreaterThanOrEqual(3);
    expect(hover.filter((r) => !insideHoverGate(r)).map((r) => r.selector)).toEqual([]);
  });

  it('focus-visible and press cues stay ungated', () => {
    const ungated = WORK_ROW.filter((r) => !insideHoverGate(r)).map((r) => r.selector);
    expect(ungated.some((s) => s.includes('a:focus-visible') && s.includes(DOT))).toBe(true);
    expect(ungated.some((s) => s.includes('a:active') && s.includes(DOT))).toBe(true);
    expect(ungated.some((s) => s.includes('a:focus-visible') && !s.includes(DOT))).toBe(true);
  });

  it('the gated hover dot rule precedes the :active dot rule, so press wins', () => {
    const hoverDot = WORK_ROW.find((r) => r.selector.includes('a:hover') && r.selector.includes(DOT));
    const activeDot = WORK_ROW.find((r) => r.selector.includes('a:active') && r.selector.includes(DOT));
    expect(hoverDot && activeDot).toBeTruthy();
    expect(hoverDot!.offset).toBeLessThan(activeDot!.offset);
  });
});
