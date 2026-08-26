/**
 * ink-contrast.test.ts — the ink tokens must clear WCAG AA on the surfaces the
 * site actually paints them on (a11y deep-QA, 2026-07-31).
 *
 * WHY THIS EXISTS
 * The `world-surface-*` panels are TRANSLUCENT (alpha 0.62–0.82) over the moving
 * WorldBackdrop, so a token's contrast cannot be read off the token pair alone —
 * `--rgb-accent-ink` was specced "≥4.5:1" but that only ever held against pure
 * canvas. Measured at HEAD 38b94db, 59 light-theme and 1 dark-theme text elements
 * sat below the 4.5:1 floor, including the homepage contact eyebrow at 3.49:1 —
 * which falsified the /accessibility/ page's "every text role meets WCAG AA
 * contrast, light and dark alike".
 *
 * WHAT IT GUARDS
 * BINDING_SURFACES below are the darkest (light theme) / lightest (dark theme)
 * backgrounds each ink is actually painted on, originally pixel-measured across
 * 16 routes × 2 themes with every glyph painted transparent (so the sample is the
 * true composite: panel + WorldBackdrop + gradients).
 *
 * 2026-08-06 — THE COMPOSITES ARE NOW DERIVED, NOT REMEMBERED.
 * They used to be frozen triplets, which made this guard unable to fail on the
 * change it most needed to catch: it compared ink against a background literal that
 * no longer described the page. Under the old form, dropping --surface-alpha-alt
 * from 0.82 to 0.55 — which really does push two inks below AA — left this suite
 * fully green, because the alpha appeared nowhere in it. It now recomputes each
 * composite from the live panel token and alpha, and that same edit fails four
 * assertions. Only the WorldBackdrop pixel stays pinned (it comes from a scrolling
 * gradient), and a companion pin fails loudly if the sky stops behind it move.
 * See DECISIONS §P `P7-UP-20-GUARD-VACUOUS`.
 *
 * Evidence + method: design-reviews/a11y-qa/2026-07-31/
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd());
const CSS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8');

type RGB = [number, number, number];

/** Relative luminance, WCAG 2.x definition. */
function luminance([r, g, b]: RGB): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Every top-level block in globals.css whose selector is EXACTLY `sel`, brace-matched.
 *
 * The previous reader sliced the file at the FIRST `html.dark {` and regexed the
 * remainder. That is safe only for tokens defined in the early blocks. globals.css
 * has a SECOND token pair further down — `:root` (~1365) and `html.dark` (~1389),
 * carrying the world sky stops and the surface alphas — so a `scope: 'dark'` lookup
 * for anything defined down there would scan from line 348 and return whichever
 * definition came first, i.e. the LIGHT value, silently. Nothing in the old file
 * exercised that path, so it was a trap rather than a live bug; this reader closes
 * it by matching whole blocks and refusing ambiguity outright.
 */
function blocksFor(sel: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`^${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'gm');
  let m: RegExpExecArray | null;
  while ((m = re.exec(CSS)) !== null) {
    let i = m.index + m[0].length;
    let depth = 1;
    while (depth > 0 && i < CSS.length) {
      if (CSS[i] === '{') depth++;
      else if (CSS[i] === '}') depth--;
      i++;
    }
    out.push(CSS.slice(m.index + m[0].length, i - 1));
  }
  return out;
}

/** The single declared value of `--name` in the light (`:root`) or dark (`html.dark`) blocks. */
function readDecl(name: string, scope: 'root' | 'dark'): string {
  const sel = scope === 'root' ? ':root' : 'html.dark';
  const hits = blocksFor(sel)
    .map((b) => b.match(new RegExp(`--${name}:\\s*([^;]+);`)))
    .filter(Boolean)
    .map((m) => m![1].trim());
  // Exactly one, always. Zero means the token moved; more than one means two blocks
  // disagree and the "which wins" answer would depend on source order — either way
  // this guard must stop rather than pick.
  expect(hits, `--${name} must have exactly one definition in ${sel} (found ${hits.length})`)
    .toHaveLength(1);
  return hits[0];
}

/** Read an `--rgb-*` triplet. */
function readToken(name: string, scope: 'root' | 'dark'): RGB {
  const parts = readDecl(name, scope).split(/\s+/).slice(0, 3).map(Number);
  expect(parts.every((n) => Number.isFinite(n)), `--${name} (${scope}) must be an r g b triplet`).toBe(true);
  return parts as RGB;
}

/** Read a scalar custom property (the surface alphas). */
function readNumber(name: string, scope: 'root' | 'dark'): number {
  const n = Number(readDecl(name, scope).split(/\s+/)[0]);
  expect(Number.isFinite(n), `--${name} (${scope}) must be numeric`).toBe(true);
  return n;
}

/** Source-over compositing of an opaque backdrop under a translucent panel. */
function composite(panel: RGB, alpha: number, backdrop: RGB): RGB {
  return panel.map((c, i) => c * alpha + backdrop[i] * (1 - alpha)) as RGB;
}

/**
 * THE BINDING SURFACES — DERIVED, NOT FROZEN.
 *
 * This table used to store each binding background as a finished pixel triplet.
 * Those numbers were correct when measured (2026-07-31) and then FROZE: any change
 * to a surface token or a surface alpha left the assertion comparing ink against a
 * stale backdrop, so it stayed green while the real rendered pair fell below AA.
 * The file's own header anticipated exactly that and nothing enforced it — the
 * `P7-UP-20-GUARD-VACUOUS` finding, and the reason UP-20 had to be measured around
 * this guard rather than trusted to it.
 *
 * What each of these surfaces actually is, is computable:
 *
 *     .world-surface-*  =  rgb(var(--rgb-PANEL) / var(--surface-alpha-*))
 *                          composited over the WorldBackdrop
 *
 * so the composite is `panel × alpha + backdrop × (1 − alpha)` and only ONE term
 * resists derivation: the backdrop pixel itself, which comes out of a scrolling
 * multi-stop sky gradient. So that is the only thing still pinned — recovered from
 * the original census by inverting the same equation, and sanity-checked: all five
 * land inside [0,255] and read as warm desert-sky values ([234,180,147] …
 * [195,148,94]), which is what the WorldBackdrop paints. A wrong model would not
 * have produced five plausible sky pixels.
 *
 * The guard now tracks --rgb-canvas, --rgb-canvas-alt, --rgb-wash-cool,
 * --rgb-panel-cool, every --surface-alpha-*, and the ink tokens automatically.
 * The residue (a moved SKY STOP would change the pinned backdrops) is covered by
 * its own staleness pin below, so it fails loudly asking for a re-measure instead
 * of passing quietly.
 */
const BINDING_SURFACES: ReadonlyArray<{
  token: string;
  scope: 'root' | 'dark';
  panel: string;
  alphaVar: string;
  backdrop: RGB;
  measured: RGB;
  where: string;
}> = [
  { token: 'rgb-accent-ink', scope: 'root', panel: 'rgb-panel-cool', alphaVar: 'surface-alpha-coolpale', backdrop: [234.41, 179.94, 147.29], measured: [215, 209, 190], where: 'homepage contact eyebrow — world-surface-cool-pale' },
  { token: 'rgb-accent-ink', scope: 'root', panel: 'rgb-canvas-alt', alphaVar: 'surface-alpha-alt', backdrop: [206.11, 159.22, 116.44], measured: [238, 223, 203], where: '"More work" eyebrow — world-surface-alt (work pages)' },
  { token: 'rgb-accent-ink', scope: 'root', panel: 'rgb-wash-cool', alphaVar: 'surface-alpha-cool', backdrop: [194.0, 176.0, 136.0], measured: [226, 228, 216], where: '"Shipped" eyebrow — world-surface-cool' },
  { token: 'rgb-ink-meta', scope: 'root', panel: 'rgb-canvas-alt', alphaVar: 'surface-alpha-alt', backdrop: [195.0, 148.11, 94.22], measured: [236, 221, 199], where: 'showcase date meta — world-surface-alt' },
  { token: 'rgb-accent-ink', scope: 'dark', panel: 'rgb-canvas-alt', alphaVar: 'surface-alpha-alt', backdrop: [205.88, 171.75, 131.38], measured: [89, 74, 57], where: 'prose link on /work/flagstone/ — world-surface-alt over the night world' },

  // --rgb-link-hover (luxe W2, 2026-08-09) — the link HOVER ink, decoupled from
  // --rgb-accent-hover and deepened so it clears AA everywhere a link can hover.
  // Same three composited world surfaces as the resting link above (a hover
  // colour is only ever seen where the resting link already renders), plus the
  // dark case. The first row is the binding one — world-surface-cool-pale is the
  // lightest surface, so it is the floor the deepen was tuned against.
  { token: 'rgb-link-hover', scope: 'root', panel: 'rgb-panel-cool', alphaVar: 'surface-alpha-coolpale', backdrop: [234.41, 179.94, 147.29], measured: [215, 209, 190], where: 'link hover on world-surface-cool-pale (the binding floor)' },
  { token: 'rgb-link-hover', scope: 'root', panel: 'rgb-canvas-alt', alphaVar: 'surface-alpha-alt', backdrop: [206.11, 159.22, 116.44], measured: [238, 223, 203], where: 'Footer + more-work link hover — world-surface-alt' },
  { token: 'rgb-link-hover', scope: 'root', panel: 'rgb-wash-cool', alphaVar: 'surface-alpha-cool', backdrop: [194.0, 176.0, 136.0], measured: [226, 228, 216], where: 'Shipped-band link hover — world-surface-cool' },
  { token: 'rgb-link-hover', scope: 'dark', panel: 'rgb-canvas-alt', alphaVar: 'surface-alpha-alt', backdrop: [205.88, 171.75, 131.38], measured: [89, 74, 57], where: 'dark prose/footer link hover — world-surface-alt over the night world' },
];

/**
 * The sky stops that were live when the backdrops above were measured. These are
 * the ONE input the derivation cannot recompute, so if any of them moves the pinned
 * backdrops are stale and this fails with a re-measure instruction rather than
 * quietly certifying against an old sky.
 */
const SKY_STOPS_AT_MEASUREMENT: ReadonlyArray<{ name: string; scope: 'root' | 'dark'; rgb: RGB }> = [
  { name: 'sky-day-1', scope: 'root', rgb: [255, 236, 206] },
  { name: 'sky-day-4', scope: 'root', rgb: [230, 210, 182] },
  { name: 'sky-dusk-4', scope: 'root', rgb: [238, 211, 184] },
  { name: 'sky-night-4', scope: 'root', rgb: [238, 213, 187] },
  { name: 'sky-day-1', scope: 'dark', rgb: [103, 63, 40] },
  { name: 'sky-day-4', scope: 'dark', rgb: [60, 42, 30] },
  { name: 'sky-dusk-4', scope: 'dark', rgb: [24, 20, 24] },
  { name: 'sky-night-4', scope: 'dark', rgb: [18, 13, 9] },
];

const AA_SMALL = 4.5;

describe('ink tokens clear WCAG AA on the surfaces they are actually painted on', () => {
  it.each(BINDING_SURFACES)(
    '--$token ($scope) ≥ 4.5:1 against $where',
    ({ token, scope, panel, alphaVar, backdrop }) => {
      const ink = readToken(token, scope);
      const bg = composite(readToken(panel, scope), readNumber(alphaVar, scope), backdrop);
      expect(contrast(ink, bg)).toBeGreaterThanOrEqual(AA_SMALL);
    },
  );

  // The derivation must REPRODUCE the original census at today's token values.
  // If this drifts, either a token moved (and the AA assertions above already
  // re-derived correctly, which is the point) or the model is wrong — and a model
  // that cannot reproduce its own measurement is not allowed to certify anything.
  it.each(BINDING_SURFACES)(
    'the composite model reproduces the measured backdrop for $where',
    ({ scope, panel, alphaVar, backdrop, measured }) => {
      const bg = composite(readToken(panel, scope), readNumber(alphaVar, scope), backdrop);
      bg.forEach((c, i) => expect(Math.abs(c - measured[i])).toBeLessThanOrEqual(0.51));
    },
  );

  it('the sky stops behind the pinned backdrops have not moved (else re-measure)', () => {
    for (const { name, scope, rgb } of SKY_STOPS_AT_MEASUREMENT) {
      expect(
        readToken(name, scope),
        `--${name} (${scope}) changed since the 2026-07-31 census. The pinned backdrops in ` +
          `BINDING_SURFACES are composited over this sky, so they are now stale — re-run the ` +
          `paint-sampled census (design-reviews/a11y-qa/2026-07-31/) and update them together.`,
      ).toEqual(rgb);
    }
  });

  // Regression pin: the specific values this audit landed on. A deliberate future
  // change should update these together with a fresh measured census — never one
  // without the other.
  it('the audited ink values are the ones in the stylesheet', () => {
    expect(readToken('rgb-accent-ink', 'root')).toEqual([135, 71, 45]);
    expect(readToken('rgb-ink-meta', 'root')).toEqual([84, 100, 93]);
    expect(readToken('rgb-accent-ink', 'dark')).toEqual([231, 181, 147]);
    // luxe W2: the deepened link-hover ink. Light deepens from resting; dark keeps
    // its already-deepening value. A change here needs a fresh AA re-derivation.
    expect(readToken('rgb-link-hover', 'root')).toEqual([120, 62, 38]);
    expect(readToken('rgb-link-hover', 'dark')).toEqual([240, 196, 166]);
  });

  // luxe W2 non-vacuity: the OLD link hover reused --rgb-accent-hover and failed on
  // the binding surface in BOTH themes — 178 81 40 on the light cool-pale composite,
  // and 218 138 92 on the lit dark world-surface-alt. Proving both fail here means
  // this suite catches the exact regressions the fix closed rather than passing blind.
  it('rejects the pre-fix link-hover on its binding surface, both themes (non-vacuity)', () => {
    expect(contrast([178, 81, 40], [215, 209, 190])).toBeLessThan(AA_SMALL); // old light
    expect(contrast([218, 138, 92], [89, 74, 57])).toBeLessThan(AA_SMALL); // old dark
  });

  // The floors themselves must not silently move: prove the maths still fails the
  // pre-fix values, so this suite can never pass vacuously.
  it('rejects the pre-fix ink values (non-vacuity)', () => {
    expect(contrast([163, 86, 54], [215, 209, 190])).toBeLessThan(AA_SMALL);
    expect(contrast([90, 107, 100], [236, 221, 199])).toBeLessThan(AA_SMALL);
    expect(contrast([224, 160, 116], [89, 74, 57])).toBeLessThan(AA_SMALL);
  });
});

/**
 * H2 (THE ROOM Phase H) — the receipt paper stock (--rgb-receipt /
 * --rgb-receipt-rule, A5). Unlike world-surface-*, `bg-receipt` is painted
 * at full opacity — no consumer anywhere applies a `bg-receipt/NN` opacity
 * modifier (grepped empirically across app/ + components/) — so there is no
 * panel×alpha compositing to derive: the inks sit directly on --rgb-receipt.
 * Every ink token Receipt.tsx actually paints on it is checked here, in both
 * themes, plus the card's own border as a non-text (WCAG 1.4.11) boundary.
 */
const RECEIPT_INKS: ReadonlyArray<{ token: string; where: string }> = [
  { token: 'rgb-ink', where: 'the value figure' },
  { token: 'rgb-ink-meta', where: 'the label / tier+date line' },
  { token: 'rgb-accent-ink', where: 'the method link' },
];

describe('ink tokens clear WCAG AA on the receipt paper stock (--rgb-receipt)', () => {
  for (const scope of ['root', 'dark'] as const) {
    it.each(RECEIPT_INKS)(`--$token (${scope}) ≥ 4.5:1 on --rgb-receipt — $where`, ({ token }) => {
      const ink = readToken(token, scope);
      const bg = readToken('rgb-receipt', scope);
      expect(contrast(ink, bg)).toBeGreaterThanOrEqual(AA_SMALL);
    });
  }

  it.each(['root', 'dark'] as const)(
    '--rgb-receipt-rule (%s) ≥ 3:1 against --rgb-receipt — the card boundary (WCAG 1.4.11)',
    (scope) => {
      const rule = readToken('rgb-receipt-rule', scope);
      const bg = readToken('rgb-receipt', scope);
      expect(contrast(rule, bg)).toBeGreaterThanOrEqual(3);
    },
  );
});
