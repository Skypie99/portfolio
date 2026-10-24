#!/usr/bin/env node
/**
 * contrast-scroll.mjs — rendered-pixel contrast of every text line in the
 * homepage flagship room, measured at several scroll offsets, from a BUILT
 * export. The room's backdrop is not static: its golden wash drifts with
 * scroll (parallax) and the world behind its translucent panel changes tint
 * with scroll (day/night). A single frame can therefore miss the binding
 * state; this reports each line's MINIMUM over the offsets.
 *
 *   node qa-reports/creative-release7-refinement-2026-10-23/tools/contrast-scroll.mjs \
 *        --dir <export dir> --out <dir> --tag <name> [--themes light,dark] \
 *        [--sizes 1440x900@1,768x1024@1,393x852@2] [--inject-css "<css>"] [--port 3601]
 *
 * Method (the Release 6 probe's, stricter): for each line, read its computed
 * colour, make its glyphs transparent (a decorative child's paint is hidden
 * too; the line's own text-shadow is KEPT, so a glow behind the glyphs counts
 * as backdrop), screenshot the line's whole element box, and take the ratio
 * against the WORST pixel in that box. Offsets: the room's top at 35% of a
 * viewport above the top edge, 120px above, at the top edge, and 160px
 * below; a line is measured only at offsets where its box is fully in view.
 * Fixed-position chrome that overlaps the line's box at that moment (the phone
 * menu button, the identity chip) is hidden for the sample and named in the
 * JSON: a floating control passing over a line is occlusion, not the line's
 * contrast (found when the menu button's shadow, beyond the end of the plate
 * claim's text, set a 4.33:1 "worst pixel" at 393).
 * Where the room is taller than the viewport (stacked phones and tablets), two
 * more offsets bring its lower half into view (middle, and its bottom edge 40px
 * above the viewport's), so every line is measured at every width.
 * Thresholds: 4.5:1 under 24px, 3:1 at or above (WCAG 1.4.3). Pure
 * measurement; `--inject-css` measures an experiment and is recorded.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const DIR = path.resolve(opt('dir', 'out')); const OUT = path.resolve(opt('out', 'contrast-scroll'));
const TAG = opt('tag', 'after'); const INJECT = opt('inject-css', '');
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = opt('sizes', '1440x900@1,768x1024@1,393x852@2').split(',').map((t) => { const m = /^(\d+)x(\d+)@([\d.]+)$/.exec(t); return { w: +m[1], h: +m[2], dpr: +m[3], tag: t }; });
const PORT = Number(opt('port', 3601));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
const LINES = [
  ['eyebrow · Featured: the flagship', '#flagship .order-1 p'],
  ['plate · claim', '#flagship .pr-plate-lit'],
  ['plate · caption', '#flagship .pr-plate-lit + p'],
  ['plate · provenance', '#flagship .flex.flex-col.gap-3 > p:last-child'],
  ['status line', '#flagship .order-4 > p'],
  ['detail tag · Detail of the same capture', '#flagship [data-exhibit-detail] > p'],
  ['capture caption · Current product capture · Explore', '#flagship .order-3 [data-exhibit-detail] ~ p, #flagship .order-3 p.text-center'],
];
fs.mkdirSync(OUT, { recursive: true });
const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((r) => srv.stdout.once('data', r));
const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  for (const theme of THEMES) for (const size of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr, colorScheme: theme, ...(size.w < 600 ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch { /* denied */ } }, theme);
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (INJECT) await page.addStyleTag({ content: INJECT });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(size.h * 0.6)) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(40); }
    const { top, roomH } = await page.evaluate(() => { const r = document.querySelector('#flagship').getBoundingClientRect(); return { top: r.top + scrollY, roomH: r.height }; });
    const lower = roomH > size.h ? [Math.round((roomH - size.h) / 2), Math.round(roomH - size.h + 40)] : [];
    const offsets = [...new Set([-Math.round(size.h * 0.35), -120, 0, 160, ...lower.filter((o) => o > 160)])];
    const result = {};
    for (const off of offsets) {
      await page.evaluate((v) => scrollTo(0, v), top + off);
      await sleep(1400);
      for (const [label, sel] of LINES) {
        const el = await page.$(sel);
        if (!el) { result[label] ??= { missing: true }; continue; }
        const box = await el.boundingBox();
        if (!box || box.y < 0 || box.y + box.height > size.h) continue;
        const info = await el.evaluate((n) => { const cs = getComputedStyle(n); return { color: cs.color, fontSize: parseFloat(cs.fontSize), fontWeight: cs.fontWeight }; });
        const fg = info.color.match(/[\d.]+/g).slice(0, 3).map(Number);
        const hidden = await page.evaluate(({ x, y, w, h }) => {
          const out = [];
          for (const f of document.querySelectorAll('body *')) {
            const cs = getComputedStyle(f);
            if (cs.position !== 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') continue;
            const r = f.getBoundingClientRect();
            if (r.right <= x || r.left >= x + w || r.bottom <= y || r.top >= y + h || r.width === 0) continue;
            if (r.width >= innerWidth * 0.95 && r.height >= innerHeight * 0.95) continue; // full-viewport layers (the world backdrop) are the backdrop
            f.dataset.csHidden = '1'; f.style.setProperty('visibility', 'hidden', 'important');
            out.push(f.tagName.toLowerCase() + (f.getAttribute('aria-label') ? `[${f.getAttribute('aria-label')}]` : '') + '.' + String(f.className).split(' ').slice(0, 2).join('.'));
          }
          return out;
        }, { x: box.x, y: box.y, w: box.width, h: box.height });
        await el.evaluate((n) => { n.querySelectorAll('*').forEach((c) => { c.style.setProperty('color', 'transparent', 'important'); c.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); c.style.setProperty('background', 'transparent', 'important'); }); n.style.setProperty('color', 'transparent', 'important'); n.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); });
        const buf = await page.screenshot({ type: 'png', clip: { x: Math.max(0, box.x), y: box.y, width: Math.max(1, Math.min(box.width, size.w - box.x)), height: Math.max(1, box.height) } });
        await el.evaluate((n) => { n.querySelectorAll('*').forEach((c) => { c.style.removeProperty('color'); c.style.removeProperty('-webkit-text-fill-color'); c.style.removeProperty('background'); }); n.style.removeProperty('color'); n.style.removeProperty('-webkit-text-fill-color'); });
        await page.evaluate(() => { for (const f of document.querySelectorAll('[data-cs-hidden]')) { f.style.removeProperty('visibility'); delete f.dataset.csHidden; } });
        const { data, info: im } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
        let worst = Infinity;
        for (let i = 0; i < data.length; i += im.channels) { const r = ratio(fg, [data[i], data[i + 1], data[i + 2]]); if (r < worst) worst = r; }
        const large = info.fontSize >= 24 || (info.fontSize >= 18.66 && Number(info.fontWeight) >= 700);
        const prev = result[label];
        if (!prev || prev.missing || worst < prev.worst) result[label] = { worst: +worst.toFixed(2), atOffset: off, fontSize: info.fontSize, color: info.color, threshold: large ? 3 : 4.5, hiddenChrome: hidden };
      }
    }
    for (const [label] of LINES) { const r = result[label]; if (r && !r.missing) r.pass = r.worst >= r.threshold; }
    rows.push({ theme, size: size.tag, lines: result });
    console.log(`${TAG} ${theme} ${size.tag}: ` + LINES.map(([l]) => `${l.split(' · ')[0]}${l.includes('plate') ? '·' + l.split(' · ')[1] : ''} ${result[l]?.worst ?? '—'}`).join(' | '));
    await ctx.close();
  }
} finally { await browser.close(); srv.kill(); }
fs.writeFileSync(path.join(OUT, `contrast-scroll-${TAG}.json`), JSON.stringify({ tag: TAG, injectCss: INJECT || null, method: 'min over scroll offsets of the worst-pixel ratio in each line box; glyphs transparent, own text-shadow kept', rows }, null, 1));
