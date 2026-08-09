#!/usr/bin/env node
/**
 * glass-compare.mjs — the MOCKUP GATE for luxe Wave 1, item 2 `finish-the-glass`.
 *
 *   npm run build && node design-reviews/luxe-audit/2026-08-07/wave1/tools/glass-compare.mjs
 *
 * Renders the light-theme glass in BOTH states from ONE build: the shipped cool
 * pane, and the proposed warm pane. The warm state is applied as a runtime style
 * injection rather than a second build, so the two captures differ by exactly the
 * declarations under review and nothing else — no rebuild drift, no timing drift.
 *
 * WHAT IS UNDER REVIEW (measured on 933c59a)
 * -------------------------------------------
 *   · `.glass-card` pane tint       rgb(252 251 255 / .42)  — #FCFBFF, blue-white
 *   · `.glass-card::after` glint    rgb(206 228 244 / .26)  — the cool specular
 *
 * UP-19 (8645610) already warmed the RIM (`.glass-card::before`) from a soft-blue
 * lit stop to the estate's warm cream. Post-merge the material therefore splits:
 * a warm rim around a cool pane. This item completes that ruling.
 *
 * NOTE ON THE AUDIT'S CITED VALUE: the ledger names the corner glow as
 * `rgba(150,188,214,.26)`. On HEAD the cool specular in `.glass-card::after` is
 * `rgb(206 228 244 / 0.26)` — same alpha, lighter hue. `150 188 214` does appear
 * in globals.css (line 1182, an unrelated backdrop; and line 2040), and it WAS
 * the rim's lit stop before UP-19 replaced it. Recorded rather than smoothed
 * over: the alpha the audit measured is right, the triplet it quotes is not the
 * one this item changes.
 *
 * THE CONTRAST QUESTION, ANSWERED WITH ARITHMETIC RATHER THAN ASSERTION
 * ---------------------------------------------------------------------
 * The pane is 42% alpha, so it composites into the backdrop behind every piece of
 * text sitting on glass. This script therefore does not just take pictures: it
 * samples the real composited backdrop under each text node on a glass card and
 * reports the WCAG ratio in both states, so the taste decision arrives with its
 * a11y cost already priced. A warm shift at equal lightness should move the
 * ratios by ~0.00–0.02; anything larger is a finding, not a rounding error.
 *
 * Chromium only. Safari/WebKit stays a device row.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const ROOT = '/Users/skypie/Portfolio';
const OUT_DIR = path.join(ROOT, 'out');
const SHOT_DIR = path.join(ROOT, 'design-reviews/luxe-audit/2026-08-07/wave1/captures');
const REPORT = path.join(ROOT, 'design-reviews/luxe-audit/2026-08-07/wave1/glass-compare.json');
const PORT = Number(process.env.GLASS_PORT || 3096);
const BASE = `http://127.0.0.1:${PORT}`;

/** The proposed warm state — the ONLY difference between the two captures. */
const WARM_CSS = `
.glass-card {
  background:
    linear-gradient(to bottom, rgb(255 255 255 / 0.16), transparent 28%),
    rgb(255 252 244 / 0.42) !important;
}
.glass-card::after {
  background:
    radial-gradient(50% 60% at var(--mx, 28%) var(--my, 4%),
      rgb(255 255 255 / 0.22), transparent 60%),
    radial-gradient(20% 26% at var(--mx, 28%) var(--my, 4%),
      rgb(250 226 196 / 0.26), transparent 56%) !important;
}
`;

/** Views worth a picture — where glass actually carries the estate's first read. */
const VIEWS = [
  { key: 'home-identity-chip', url: '/', clip: { x: 0, y: 0, width: 640, height: 260 }, note: 'the identity chip — first pixel of every arrival' },
  { key: 'work-cards', url: '/work/', full: false, scrollTo: 900, note: 'the work cards' },
  { key: 'certificates', url: '/certificates/', full: false, scrollTo: 700, note: 'certificate glass' },
];

if (!fs.existsSync(OUT_DIR)) {
  console.error('[glass] out/ does not exist — run `npm run build` first.');
  process.exit(2);
}
fs.mkdirSync(SHOT_DIR, { recursive: true });

const server = spawn(
  'node',
  [path.join(ROOT, 'design-reviews/showcase-refresh/tools/static-serve.mjs'), OUT_DIR, String(PORT)],
  { stdio: 'ignore' },
);

async function ready() {
  for (let i = 0; i < 60; i += 1) {
    try { if ((await fetch(BASE + '/')).ok) return true; } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}
if (!(await ready())) { server.kill('SIGKILL'); console.error('[glass] fixture never came up.'); process.exit(2); }

const browser = await chromium.launch({ headless: true });
const report = {
  meta: {
    engine: 'Chromium (playwright-core) headless, 1440x900 DSF2, light theme — NOT Safari/WebKit',
    under_review: {
      pane: { current: 'rgb(252 251 255 / 0.42)', proposed: 'rgb(255 252 244 / 0.42)' },
      glint: { current: 'rgb(206 228 244 / 0.26)', proposed: 'rgb(250 226 196 / 0.26)' },
    },
  },
  contrast: [],
  captures: [],
};

/* WCAG helpers — sRGB relative luminance, then the 4.5/3.0 ratio. */
const CONTRAST_FN = `(() => {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const parse = (s) => (s.match(/[\\d.]+/g) || []).slice(0, 3).map(Number);
  const ratio = (fg, bg) => { const a = lum(fg), b = lum(bg); const [hi, lo] = a > b ? [a, b] : [b, a]; return (hi + 0.05) / (lo + 0.05); };

  // Composite every semi-transparent ancestor background down to an opaque colour.
  const backdrop = (el) => {
    let acc = null;
    const chain = [];
    for (let n = el; n; n = n.parentElement) chain.push(n);
    chain.reverse();
    acc = [255, 255, 255];
    for (const n of chain) {
      const bg = getComputedStyle(n).backgroundColor;
      const m = bg.match(/rgba?\\(([^)]+)\\)/);
      if (!m) continue;
      const parts = m[1].split(',').map((x) => parseFloat(x));
      const [r, g, b] = parts;
      const a = parts.length > 3 ? parts[3] : 1;
      if (!a) continue;
      acc = [r * a + acc[0] * (1 - a), g * a + acc[1] * (1 - a), b * a + acc[2] * (1 - a)];
    }
    return acc;
  };

  const out = [];
  for (const card of document.querySelectorAll('.glass-card')) {
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    let node;
    const seen = new Set();
    while ((node = walker.nextNode())) {
      const t = (node.nodeValue || '').trim();
      if (t.length < 3) continue;
      const el = node.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const fg = parse(cs.color);
      const bg = backdrop(el);
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const large = px >= 24 || (bold && px >= 18.66);
      out.push({
        text: t.slice(0, 44),
        fontPx: px,
        large,
        floor: large ? 3 : 4.5,
        ratio: Math.round(ratio(fg, bg) * 1000) / 1000,
        backdrop: bg.map((v) => Math.round(v * 10) / 10),
      });
    }
  }
  return out;
})()`;

for (const view of VIEWS) {
  for (const state of ['current', 'warm']) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      // DSF1 deliberately: the thing under review is a flat 6/255 hue shift over
      // large areas, which retina detail does not help you judge — and DSF2 put
      // 16 MB of photographic hero frames into a repo that keeps its captures.
      deviceScaleFactor: 1,
      colorScheme: 'light',
      reducedMotion: 'reduce', // land every Reveal at its final frame — we are judging paint, not motion
    });
    const page = await ctx.newPage();
    await page.goto(BASE + view.url, { waitUntil: 'networkidle' });
    if (state === 'warm') await page.addStyleTag({ content: WARM_CSS });
    await page.evaluate(`(async () => {
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y <= H; y += 700) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 70)); }
      scrollTo({ top: ${view.scrollTo ?? 0}, behavior: 'instant' });
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    })()`);
    await page.waitForTimeout(500);

    const file = path.join(SHOT_DIR, `glass-${view.key}--${state}.png`);
    await page.screenshot({ path: file, clip: view.clip });
    report.captures.push({ view: view.key, state, file: path.relative(ROOT, file), note: view.note });

    /* BASELINE-CONTAMINATION GUARD — learned the hard way, 2026-08-09.
       This tool compares the SHIPPED pane against an injected warm one. If
       ./out/ was built from a branch that already carries the warm change, the
       "current" arm is warm too, every delta comes out 0.000, and the run reads
       as a clean pass instead of a void measurement. That happened once. It
       cannot happen quietly again: assert the un-injected arm still paints the
       cool pane before trusting a single number from it. */
    if (state === 'current') {
      const pane = await page.evaluate(
        `(() => { const c = document.querySelector('.glass-card');
                  return c ? getComputedStyle(c).backgroundColor : null; })()`,
      );
      const cool = pane && /252,\s*251,\s*255/.test(pane);
      if (!cool) {
        await browser.close();
        server.kill('SIGKILL');
        console.error(
          `[glass] BASELINE CONTAMINATED on ${view.key}: the un-injected pane computes ` +
            `"${pane}", not rgb(252 251 255 / .42).\n` +
            '[glass] ./out/ was built from a tree that already carries the warm change. ' +
            'Rebuild from the branch WITHOUT it (the train), then re-run. Refusing to ' +
            'emit a comparison whose two arms are the same colour.',
        );
        process.exit(3);
      }
    }

    const rows = await page.evaluate(CONTRAST_FN);
    for (const r of rows) report.contrast.push({ view: view.key, state, ...r });
    console.log(`[glass] ${view.key} · ${state}: ${rows.length} text nodes on glass measured`);
    await ctx.close();
  }
}

await browser.close();
server.kill('SIGKILL');

/* Pair the two states so a regression is impossible to miss. */
const byKey = new Map();
for (const r of report.contrast) {
  const k = `${r.view}||${r.text}`;
  if (!byKey.has(k)) byKey.set(k, {});
  byKey.get(k)[r.state] = r;
}
const deltas = [];
for (const [k, pair] of byKey) {
  if (!pair.current || !pair.warm) continue;
  const d = Math.round((pair.warm.ratio - pair.current.ratio) * 1000) / 1000;
  deltas.push({
    node: k.split('||')[1],
    floor: pair.current.floor,
    current: pair.current.ratio,
    warm: pair.warm.ratio,
    delta: d,
    currentPasses: pair.current.ratio >= pair.current.floor,
    warmPasses: pair.warm.ratio >= pair.warm.floor,
  });
}
deltas.sort((a, b) => a.warm - b.warm);
report.deltas = deltas;

const regressions = deltas.filter((d) => d.currentPasses && !d.warmPasses);
const worst = deltas[0];
report.verdict = {
  measuredNodes: deltas.length,
  newFailures: regressions.length,
  worstAfter: worst ? { node: worst.node, ratio: worst.warm, floor: worst.floor } : null,
  maxAbsDelta: deltas.length ? Math.max(...deltas.map((d) => Math.abs(d.delta))) : 0,
};

fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
console.log(`\n[glass] ${deltas.length} text-on-glass nodes measured in BOTH states.`);
console.log(`[glass] new AA failures introduced by the warm pane: ${regressions.length}`);
console.log(`[glass] largest ratio movement: ${report.verdict.maxAbsDelta}`);
if (worst) console.log(`[glass] lowest ratio after warm: ${worst.warm} (floor ${worst.floor}) — "${worst.node}"`);
for (const r of regressions) console.log(`   REGRESSION  ${r.current} → ${r.warm} (floor ${r.floor})  "${r.node}"`);
console.log('[glass] →', path.relative(ROOT, REPORT));
console.log('[glass] captures →', path.relative(ROOT, SHOT_DIR));
process.exit(regressions.length === 0 ? 0 : 1);
