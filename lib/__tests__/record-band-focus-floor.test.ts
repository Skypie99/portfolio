/**
 * Post-Release-6 — the Record band's keyboard-focus floor.
 *
 * WHY. The home `#record` band's four row links (`the record`, `the account`,
 * `the statement`, `evidence`) sit inside `Reveal variant="depth"` rows: under
 * `html.js` a row rests at opacity 0 until its IntersectionObserver fires, then
 * fades in over `--dur-reveal` (900 ms) behind its stagger delay (0–240 ms).
 * Tabbing to a link scrolls its row into view, the observer arms `reveal-shown`
 * — and the reader gets a focus ring on content that is still ~900 ms from
 * being readable. Measured against the Release 6 build (qa-reports/
 * record-band-focus-2026-10-20/evidence/baseline/): ancestor opacity AT focus
 * arrival was 0.000–0.755 on every one of the 48 normal-mode arrivals (Tab and
 * Shift+Tab, 1440x900 and 393x852, both themes), settling only at ~902 ms.
 *
 * The repair is one rule in globals.css — `html.js #record .reveal:focus-within`
 * resting the focused row at its visible frame at once (the Release 6
 * reading-group floor's grammar, scoped to this band). The shared Reveal
 * defaults stay byte-for-byte as they were; the one-rule site-wide version
 * remains deferred (DECISIONS_LOG [r6-focus-floor-scoped]).
 *
 * This guard demonstrates BOTH sides: it resolves the same record-row subject
 * through the sheet's actual cascade with the floor rule removed (the old
 * failure — focus inside content computed invisible or 900 ms from readable)
 * and with it present (the corrected behaviour — visible frame at once), then
 * pins that entrance motion, the scoped-only reach, and every !important floor
 * are exactly as before. jsdom cannot evaluate `:focus-within`, so the cascade
 * is modelled here from the parsed rules, deterministically, in CI, with no
 * browser.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// ─────────────────────────────────────────────────────────────────────
// Parse the sheet: every style rule with its declarations and the at-rule
// preludes wrapping it (brace walk; no style-rule nesting in this sheet).
// ─────────────────────────────────────────────────────────────────────
interface Rule {
  selector: string;
  body: string;
  /** Enclosing at-rule preludes, outermost first (e.g. ['@media print']). */
  ancestors: string[];
  offset: number;
}

function rules(sheet: string): Rule[] {
  const out: Rule[] = [];
  const stack: string[] = [];
  let start = 0;
  for (let i = 0; i < sheet.length; i++) {
    const ch = sheet[i];
    if (ch === '{') {
      const prelude = sheet.slice(start, i).trim();
      if (!prelude.startsWith('@')) {
        out.push({ selector: prelude, body: '', ancestors: [...stack], offset: i });
        // Body runs to the matching close brace — capture it directly.
        let depth = 1;
        let j = i + 1;
        for (; j < sheet.length && depth > 0; j++) {
          if (sheet[j] === '{') depth += 1;
          else if (sheet[j] === '}') depth -= 1;
        }
        out[out.length - 1].body = sheet.slice(i + 1, j - 1);
        stack.push(prelude);
        start = j;
        i = j - 1;
        stack.pop();
        continue;
      }
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

const ALL = rules(css);
/** Only rules that touch the reveal family (`.reveal`, `.reveal-shown`, …). */
const REVEAL = ALL.filter((r) => /\.reveal[a-z-]*/.test(r.selector));

// ─────────────────────────────────────────────────────────────────────
// A small cascade evaluator for exactly the selector shapes this sheet uses
// on reveals: descendant combinators of compounds made of a tag, #id,
// .classes, :focus-within and :not(.class). Unknown shapes fail loudly below.
// ─────────────────────────────────────────────────────────────────────
type Subject = {
  /** Root (html) classes — `js`, `dark`, `reveal-seat`, … */
  rootClasses: string[];
  /** Ancestors below root, outermost first (tag + id + classes). */
  chain: { tag: string; id?: string; classes: string[] }[];
  /** The reveal element itself. */
  self: { tag: string; id?: string; classes: string[] };
  /** Pseudo state on the reveal element. */
  focusWithin: boolean;
  /** Which media floors are active. */
  media: { rm?: boolean; print?: boolean; noScript?: boolean };
};

type Parsed =
  | { kind: 'compound'; tag?: string; id?: string; classes: string[]; not?: string; focusWithin?: boolean }
  | { kind: 'unsupported'; raw: string };

function parseCompound(raw: string): Parsed {
  // Shapes in this sheet: html.js / .reveal / .reveal.reveal-shown /
  // #record / .reveal:focus-within / .reveal:not(.reveal-shown).
  const not = /^([a-z]+)?((?:[.#][\w-]+)*):not\(\.([\w-]+)\)$/.exec(raw);
  if (not) {
    const [, tag, affixes = '', negated] = not;
    const { id, classes } = affix(affixes);
    return { kind: 'compound', tag, id, classes, not: negated };
  }
  const m = /^([a-z]+)?((?:[.#][\w-]+)*)(:focus-within)?$/.exec(raw);
  if (!m) return { kind: 'unsupported', raw };
  const [, tag, affixes = '', pseudo = ''] = m;
  const { id, classes } = affix(affixes);
  return { kind: 'compound', tag, id, classes, focusWithin: pseudo === ':focus-within' || undefined };
}

function affix(affixes: string): { id?: string; classes: string[] } {
  const classes: string[] = [];
  let id: string | undefined;
  for (const a of affixes.match(/[.#][\w-]+/g) ?? []) {
    if (a.startsWith('#')) id = a.slice(1);
    else classes.push(a.slice(1));
  }
  return { id, classes };
}

function specificity(selector: string): number {
  let score = 0;
  for (const part of selector.split(/\s+/)) {
    score += (part.match(/#[\w-]+/g) ?? []).length * 100;
    score += ((part.match(/\.[\w-]+/g) ?? []).length + (part.match(/:[\w-]+/g) ?? []).length) * 10;
    score += (part.match(/^[a-z]+|[>~+]\s*[a-z]+/g) ?? []).length;
  }
  return score;
}

function matches(compound: Parsed, node: { tag?: string; id?: string; classes: string[] }, focusWithin: boolean): boolean {
  if (compound.kind === 'unsupported') return false;
  if (compound.tag && compound.tag !== node.tag) return false;
  if (compound.id && compound.id !== node.id) return false;
  for (const c of compound.classes) if (!node.classes.includes(c)) return false;
  if (compound.not && node.classes.includes(compound.not)) return false;
  if (compound.focusWithin && !focusWithin) return false;
  return true;
}

/** Does the selector match the subject? (descendant combinators only). */
function selectorMatches(selector: string, s: Subject): boolean {
  const compounds = selector.split(/\s+/).map(parseCompound);
  if (compounds.some((c) => c.kind === 'unsupported')) return false;
  // The right-most compound matches the reveal element itself; the rest match
  // ancestors (or the root) in order, walking outward.
  const nodes = [
    { node: s.self, focusWithin: s.focusWithin },
    ...[...s.chain].reverse().map((n) => ({ node: n, focusWithin: s.focusWithin })),
    { node: { tag: 'html', classes: s.rootClasses }, focusWithin: s.focusWithin },
  ];
  let cursor = nodes.findIndex((n) => matches(compounds[compounds.length - 1], n.node, n.focusWithin));
  if (cursor === -1) return false;
  for (let i = compounds.length - 2; i >= 0; i--) {
    let found = -1;
    for (let j = cursor + 1; j < nodes.length; j++) {
      if (matches(compounds[i], nodes[j].node, nodes[j].focusWithin)) {
        found = j;
        break;
      }
    }
    if (found === -1) return false;
    cursor = found;
  }
  return true;
}

/** Media floors gate whole rules; anything unrecognised stays inert here. */
function mediaApplies(ancestors: string[], s: Subject): boolean {
  for (const a of ancestors) {
    const m = /^@media\s+(.+)$/.exec(a);
    if (!m) return false; // @supports etc. never gates reveals in this sheet
    const query = m[1];
    if (/prefers-reduced-motion:\s*reduce/.test(query)) {
      if (!s.media.rm) return false;
    } else if (query === 'print') {
      if (!s.media.print) return false;
    } else if (/scripting:\s*none/.test(query)) {
      if (!s.media.noScript) return false;
    } else {
      return false;
    }
  }
  return true;
}

type Decl = { prop: string; value: string; important: boolean };

function declarations(body: string): Decl[] {
  return body
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const important = /!\s*important/.test(d);
      const [prop, ...rest] = d.split(':');
      return { prop: prop.trim(), value: rest.join(':').replace(/!\s*important/, '').trim(), important };
    });
}

/** Resolve the winning declarations for `props` under the subject. */
function resolve(sheetRules: Rule[], s: Subject, props: string[]): Record<string, string> {
  const winners: Record<string, { value: string; important: boolean; weight: number; order: number }> = {};
  sheetRules.forEach((rule, order) => {
    if (!mediaApplies(rule.ancestors, s)) return;
    for (const selector of rule.selector.split(',')) {
      const sel = selector.trim();
      if (!selectorMatches(sel, s)) continue;
      const weight = specificity(sel);
      for (const d of declarations(rule.body)) {
        if (!props.includes(d.prop)) continue;
        const cur = winners[d.prop];
        const better =
          !cur ||
          (d.important && !cur.important) ||
          (d.important === cur.important && (weight > cur.weight || (weight === cur.weight && order > cur.order)));
        if (better) winners[d.prop] = { value: d.value, important: d.important, weight, order };
      }
    }
  });
  return Object.fromEntries(Object.entries(winners).map(([p, w]) => [p, w.value]));
}

const FLOOR_SELECTOR = 'html.js #record .reveal:focus-within';
const floor = REVEAL.find((r) => r.selector === FLOOR_SELECTOR);
const withoutFloor = REVEAL.filter((r) => r !== floor);

/** A record-band row: `html.js` root, `#record` section, reveal-depth row. */
function recordRow({ focusWithin, shown, media = {} }: { focusWithin: boolean; shown: boolean; media?: Subject['media'] }): Subject {
  return {
    rootClasses: ['js'],
    chain: [{ tag: 'body', classes: [] }, { tag: 'main', classes: [] }, { tag: 'section', id: 'record', classes: [] }],
    self: { tag: 'div', classes: shown ? ['reveal', 'reveal-depth', 'reveal-shown'] : ['reveal', 'reveal-depth'] },
    focusWithin,
    media,
  };
}

/** A reveal outside the Record band — the floor must never reach it. */
function outsideRow(focusWithin: boolean): Subject {
  return {
    rootClasses: ['js'],
    chain: [{ tag: 'body', classes: [] }, { tag: 'main', classes: [] }, { tag: 'section', id: 'work', classes: [] }],
    self: { tag: 'div', classes: ['reveal', 'reveal-depth', 'reveal-shown'] },
    focusWithin,
    media: {},
  };
}

const PROPS = ['opacity', 'transform', 'transition-property', 'transition-duration', 'transition', 'filter'];

// ─────────────────────────────────────────────────────────────────────
describe('Record band keyboard-focus floor', () => {
  it('the cascade walk is not vacuous', () => {
    expect(REVEAL.length).toBeGreaterThanOrEqual(10);
    expect(floor, `globals.css must contain ${FLOOR_SELECTOR}`).toBeTruthy();
  });

  it('DEMONSTRATES THE OLD FAILURE: without the floor, focus lands on content the reader cannot see', () => {
    // Row still armed (observer not yet fired): the focused link sits at
    // opacity 0 — the worst measured arrivals (0.000).
    const armed = resolve(withoutFloor, recordRow({ focusWithin: true, shown: false }), PROPS);
    expect(armed.opacity).toBe('0');

    // Row armed by the observer: the rest frame is right, but the fade is the
    // 900 ms depth clock — the reader holds a ring on faint content for the
    // whole transition (measured settle ≈ 902 ms).
    const fading = resolve(withoutFloor, recordRow({ focusWithin: true, shown: true }), PROPS);
    expect(fading.opacity).toBe('1');
    const transition = fading.transition ?? `${fading['transition-duration']}`;
    expect(transition).toMatch(/var\(--dur-reveal\)/); // 900 ms, not instant
  });

  it('DEMONSTRATES THE CORRECTED BEHAVIOUR: with the floor, the focused row rests visible AT ONCE', () => {
    for (const shown of [false, true]) {
      const r = resolve(REVEAL, recordRow({ focusWithin: true, shown }), PROPS);
      expect(r.opacity, `shown=${shown}`).toBe('1');
      expect(r.transform, `shown=${shown}`).toBe('none');
      // `transition: none` — no fade, no stagger delay: visible on focus arrival.
      const none = r['transition-property'] === 'none' || r.transition === 'none';
      expect(none, `focused row must not transition (shown=${shown}), got ${JSON.stringify(r)}`).toBe(true);
    }
  });

  it('preserves ordinary entrance motion: no focus, no floor — the row arms and fades as before', () => {
    const armed = resolve(REVEAL, recordRow({ focusWithin: false, shown: false }), PROPS);
    expect(armed.opacity).toBe('0');
    expect(armed.transform).toBe('translateY(22px) scale(0.985)'); // depth travel, untouched
    expect(armed.transition ?? armed['transition-duration']).toMatch(/var\(--dur-reveal\)/);

    const shown = resolve(REVEAL, recordRow({ focusWithin: false, shown: true }), PROPS);
    expect(shown.opacity).toBe('1');
    expect(shown.transform).toBe('none');
  });

  it('is scoped to the #record band: a focused reveal elsewhere resolves exactly as it did before', () => {
    expect(outsideRow(true).chain.some((n) => n.id === 'record')).toBe(false);
    const withRule = resolve(REVEAL, outsideRow(true), PROPS);
    const withoutRule = resolve(withoutFloor, outsideRow(true), PROPS);
    expect(withRule).toEqual(withoutRule);
  });

  it('keeps the site-wide version deferred: no unscoped `.reveal:focus-within` floor ships in globals.css', () => {
    const unscoped = ALL.filter((r) => /(^|,\s*)html\.js\s+\.reveal:focus-within(\s*[,{]|$)/.test(r.selector));
    expect(unscoped.map((r) => r.selector)).toEqual([]);
  });

  it('never beats the !important floors (RM, print, no-JS, failsafe, seat, rearm)', () => {
    expect(declarations(floor!.body).some((d) => d.important)).toBe(false);

    // Reduced motion: armed, unfocused — the RM floor must still rest visible.
    const rm = resolve(REVEAL, recordRow({ focusWithin: false, shown: false, media: { rm: true } }), PROPS);
    expect(rm.opacity).toBe('1');
    expect(rm.transform).toBe('none');

    // Print: paper is a rest frame, not a scroll.
    const print = resolve(REVEAL, recordRow({ focusWithin: false, shown: false, media: { print: true } }), PROPS);
    expect(print.opacity).toBe('1');

    // scripting: none — the rest state is the visible state. Without scripting
    // the `html.js` class never lands, so the armed rules cannot even match; the
    // subject models that honestly (no `js` class on the root) with the
    // scripting:none floor active as well.
    const noJs = resolve(
      REVEAL,
      { ...recordRow({ focusWithin: false, shown: false }), rootClasses: [], media: { noScript: true } },
      PROPS,
    );
    expect(noJs.opacity).toBe('1');

    // Dead-JS watchdog and hash-arrival seat arrive as html classes.
    for (const extra of ['reveal-failsafe', 'reveal-seat']) {
      const s = recordRow({ focusWithin: false, shown: false });
      s.rootClasses.push(extra);
      expect(resolve(REVEAL, s, PROPS).opacity, extra).toBe('1');
    }
  });

  it('the floor wins the cascade by specificity, not by !important (Release 6 grammar)', () => {
    expect(specificity(FLOOR_SELECTOR)).toBeGreaterThan(specificity('html.js .reveal-depth'));
    expect(specificity(FLOOR_SELECTOR)).toBeGreaterThan(specificity('html.js .reveal-shown.reveal-depth'));
  });

  it('every reveal selector in the sheet is a shape this evaluator understands', () => {
    const unknown = REVEAL.flatMap((r) => r.selector.split(','))
      .map((s) => s.trim())
      .filter((s) => s.includes('.reveal') && parseCompound(s.split(/\s+/).pop() ?? '').kind === 'unsupported');
    expect(unknown).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Build-backed wiring: the floor's scope must actually contain the links.
// Skips (loudly) on a bare checkout, as with static-integrity.test.ts.
// ─────────────────────────────────────────────────────────────────────
const OUT_DIR = join(process.cwd(), 'out');
const OUT_EXISTS = existsSync(OUT_DIR);

describe.skipIf(!OUT_EXISTS)('Record band focus floor: built wiring', () => {
  it('each #record row link sits inside a .reveal container in the built home page', () => {
    const html = readFileSync(join(OUT_DIR, 'index.html'), 'utf8');
    // Scope to the band: these hrefs appear in the nav and the hero strip too,
    // so a page-wide indexOf would prove nothing about the record rows.
    const bandStart = html.indexOf('id="record"');
    expect(bandStart, '#record must be on the home page').toBeGreaterThan(-1);
    const bandEnd = html.indexOf('id="how-i-work"', bandStart);
    const band = html.slice(bandStart, bandEnd === -1 ? undefined : bandEnd);
    for (const href of ['/colophon/#calibration', '/work/flagstone/#what-went-wrong', '/accessibility/', '/accessibility/#receipts']) {
      const at = band.indexOf(`href="${href}"`);
      expect(at, `${href} must be in the #record band`).toBeGreaterThan(-1);
      // Nearest preceding `reveal` class opens the row container that the
      // `#record .reveal:focus-within` floor rests when this link holds focus.
      const before = band.slice(0, at);
      const openReveal = before.lastIndexOf('reveal');
      const closeRevealDiv = before.lastIndexOf('</div>');
      expect(openReveal, `${href} must sit inside a reveal container`).toBeGreaterThan(closeRevealDiv);
    }
  });

  it('the floor rule ships in the built CSS', () => {
    const cssDir = join(OUT_DIR, '_next', 'static', 'css');
    if (!existsSync(cssDir)) return;
    const built = readdirSync(cssDir)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(cssDir, f), 'utf8'))
      .join('\n');
    expect(built).toContain('#record .reveal:focus-within');
    expect(built).toMatch(/html\.js\s+\.reveal\{opacity:0/); // armed state intact
  });
});
