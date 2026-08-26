/**
 * THE ROOM / Phase G · G2 — the method underline's contract.
 *
 * The tic is one CSS rule plus two class hooks, and BOTH of its failure modes
 * are silent — the page renders perfectly either way:
 *
 *   • `.method-draw` paints nothing on its own. It is a rider that needs
 *     `.link-draw`'s gradient on the SAME element (the `.link-draw-group`
 *     idiom it copies). Ship one without the other and the underline simply
 *     never appears, with no error anywhere.
 *   • `.method-pair` is the trigger. A `.method-draw` in a file that never
 *     declares a pair can only ever answer its own direct hover — i.e. it
 *     silently degrades to the plain `link-draw` the site already had, which
 *     is exactly the "nothing happened" outcome this phase exists to fix.
 *
 * Component-level behaviour (the door being open at rest, the pair containing
 * both halves) is guarded in Receipt.test.tsx and A11yReceipts.test.tsx.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === '__tests__' || name === 'node_modules' || name === 'archive') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const SOURCES = [...walk('app'), ...walk('components'), ...walk('lib')].map((path) => ({
  path,
  src: readFileSync(path, 'utf8'),
}));

/** Every className string literal that mentions method-draw, anywhere. */
const drawSites = SOURCES.flatMap(({ path, src }) =>
  [...src.matchAll(/className=(?:"([^"]*)"|\{[^}]*?"([^"]*)"[^}]*?\})/g)]
    .map((m) => ({ path, cls: m[1] ?? m[2] ?? '' }))
    .filter((c) => c.cls.includes('method-draw')),
);

describe('the method underline — the rider can never ship alone', () => {
  it('is actually wired somewhere (this guard is not vacuous)', () => {
    expect(drawSites.length).toBeGreaterThanOrEqual(3); // Receipt · Flagstone · A11yReceipts
  });

  it.each(drawSites.map((s) => [s.path, s.cls]))(
    '%s — method-draw sits beside link-draw',
    (_path, cls) => {
      expect(cls).toContain('link-draw');
    },
  );

  it('every file that draws also declares a pair to trigger it', () => {
    const files = new Set(drawSites.map((s) => s.path));
    for (const f of files) {
      const src = SOURCES.find((s) => s.path === f)!.src;
      expect(src, `${f} declares a .method-pair`).toContain('method-pair');
    }
  });
});

describe('the method underline — the CSS contract', () => {
  /** Body of the brace-balanced rule whose selector list starts at `from`. */
  function ruleAt(from: number): string {
    const open = css.indexOf('{', from);
    const close = css.indexOf('}', open);
    return css.slice(open + 1, close);
  }

  it('runs at the 180ms tier the design system specifies', () => {
    const at = css.indexOf('.method-draw {');
    expect(at).toBeGreaterThan(-1);
    const decl = ruleAt(at);
    expect(decl).toContain('var(--dur-fast)');
    // No literal ms — the tic stays on the ramp.
    expect(decl).not.toMatch(/\d+m?s/);
    // Both animated properties are named explicitly; transition-all is banned
    // site-wide and this is exactly the kind of rule that invites it.
    expect(decl).not.toContain('transition: all');
    expect(decl).toContain('background-size');
    expect(decl).toContain('color');
  });

  it('the pair answers on BOTH hover and focus-within (keyboard parity)', () => {
    expect(css).toContain('.method-pair:hover .method-draw');
    expect(css).toContain('.method-pair:focus-within .method-draw');
  });

  it('the pair-triggered answer is the LINE only — never a colour change', () => {
    // Deliberate, matching .link-draw-group. Today's anchors pin
    // hover:text-accent-text, so no colour tier exists on them either way;
    // this keeps a broad hover region from ever deepening ink under a card.
    const at = css.indexOf('.method-pair:hover .method-draw');
    const decl = ruleAt(at);
    expect(decl).toContain('background-size: 100% 1px');
    expect(decl).not.toContain('color:');
  });

  it('.method-pair declares no layout of its own', () => {
    // It is added as a bare wrapper in A11yReceipts on the strength of this.
    const standalone = css.match(/^\.method-pair\s*\{/m);
    expect(standalone, '.method-pair is a trigger, never a box').toBeNull();
  });
});
