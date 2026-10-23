#!/usr/bin/env node
/**
 * a11y-room.mjs — accessibility evidence for the homepage flagship room, from
 * a BUILT export: axe-core (whole page and #flagship alone), the keyboard path
 * through the room, the room's ARIA snapshot, and the rendered-pixel contrast
 * of every text line the room paints.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/a11y-room.mjs \
 *        --dir <export dir> --out <dir> --tag before|after [--themes light,dark] \
 *        [--sizes 1440x900@1,393x852@2] [--port 3371]
 *
 * Contrast follows the Release 6 probe's method (qa-reports/release6-…/tools/
 * contrast-probe.mjs): read the element's computed colour, make its glyphs
 * transparent, screenshot its box, and report the ratio against the WORST
 * backdrop pixel under the text (gradients, glass and washes count), with the
 * median for context. 4.5:1 below 24px, 3:1 at or above (WCAG 1.4.3). A
 * decorative child's paint (the eyebrow's terracotta dot) is hidden with the
 * glyphs, as in the Release 6 probe. The room's h2 is not probed: its `ember`
 * ink is a gradient clipped to the glyphs, which this method cannot isolate
 * (the element is unchanged by this candidate). `--keep-shadow` keeps a line's own
 * text-shadow in the sampled backdrop (stricter: a glow behind glyphs counts);
 * `--inject-css` measures an experiment overlay and records it in the JSON.
 * Keyboard: focus the last focusable element before the room, Tab until focus
 * leaves it, and record every stop inside (name, visible ring). Pure
 * measurement; nothing on the page is changed except the probe's own
 * temporary transparent ink, which it restores.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out', 'a11y'));
const TAG = opt('tag', 'after');
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = opt('sizes', '1440x900@1,393x852@2').split(',').map((t) => { const m = /^(\d+)x(\d+)@([\d.]+)$/.exec(t); return { w: +m[1], h: +m[2], dpr: +m[3], tag: t }; });
const PORT = Number(opt('port', 3371));
// --inject-css "<css>": an experiment overlay applied after load, to measure a candidate
// fix before building it (recorded in the JSON so no run can pass for the shipped page).
const INJECT = opt('inject-css', '');
// --keep-shadow: leave each probed line's text-shadow in place while the backdrop is
// sampled, so a glow behind the glyphs (the dark plate claim's) counts as backdrop.
const KEEP_SHADOW = argv.includes('--keep-shadow');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const PROBES = [
  { label: 'eyebrow · Featured: the flagship', selector: '#flagship .order-1 p' },
  { label: 'plate · claim', selector: '#flagship .pr-plate-lit' },
  { label: 'plate · caption', selector: '#flagship .pr-plate-lit + p' },
  { label: 'plate · provenance', selector: '#flagship .pr-plate-lit', up: 2, child: ':scope > p:last-child' },
  { label: 'status line', selector: '#flagship .order-4 > p' },
  { label: 'detail tag · Detail of the same capture (new)', selector: '#flagship [data-exhibit-detail] > p' },
  { label: 'capture caption · Current product capture · Explore', selector: '#flagship .order-3 p', text: 'Current product capture' },
];
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
const parseRgb = (s) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(s); return m ? { rgb: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] } : null; };

const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((r) => srv.stdout.once('data', r));
const browser = await chromium.launch({ headless: true });
const report = [];
try {
  for (const theme of THEMES) for (const size of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr, colorScheme: theme, ...(size.w < 600 ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch { /* denied */ } }, theme);
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (INJECT) await page.addStyleTag({ content: INJECT });
    // walk the whole page once so every reveal rests visible
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(size.h * 0.6)) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(70); }
    const top = await page.evaluate(() => document.querySelector('#flagship').getBoundingClientRect().top + scrollY);
    await page.evaluate((v) => scrollTo(0, v), top);
    await sleep(2400);
    await page.addScriptTag({ content: AXE });
    const axe = await page.evaluate(async () => {
      const opts = { resultTypes: ['violations', 'incomplete'] };
      const pageRun = await window.axe.run(document, opts);
      const roomRun = await window.axe.run(document.querySelector('#flagship'), opts);
      const pack = (r) => ({ violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, targets: v.nodes.slice(0, 4).map((n) => n.target.join(' ')) })), incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })) });
      return { page: pack(pageRun), room: pack(roomRun), version: window.axe.version };
    });
    // keyboard path through the room
    const keyboard = await page.evaluate(() => {
      const room = document.querySelector('#flagship');
      const focusables = [...document.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => el.tabIndex >= 0 && el.offsetParent !== null);
      const before = focusables.filter((el) => room.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING && !room.contains(el)).pop();
      if (before) before.focus();
      return { startedFrom: before ? (before.getAttribute('aria-label') || before.textContent || '').trim().slice(0, 60) : null, inside: focusables.filter((el) => room.contains(el)).length, hiddenFocusables: [...room.querySelectorAll('[aria-hidden="true"] a, [aria-hidden="true"] button, [aria-hidden="true"] [tabindex]')].length };
    });
    const stops = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      await sleep(120);
      const s = await page.evaluate(() => {
        const el = document.activeElement; const room = document.querySelector('#flagship');
        const cs = getComputedStyle(el);
        return { inRoom: room.contains(el), tag: el.tagName.toLowerCase(), name: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60), href: el.getAttribute('href'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, focusVisible: el.matches(':focus-visible') };
      });
      if (!s.inRoom && stops.some((x) => x.inRoom)) break;
      if (s.inRoom) stops.push(s);
    }
    keyboard.stops = stops;
    const aria = await page.locator('#flagship').ariaSnapshot();
    // contrast
    const contrast = [];
    for (const probe of PROBES) {
      let handle = probe.text
        ? (await page.$$(probe.selector)).find(Boolean) && (await (async () => { for (const h of await page.$$(probe.selector)) { if ((await h.textContent()).includes(probe.text)) return h; } return null; })())
        : await page.$(probe.selector);
      if (handle && probe.up) {
        handle = await handle.evaluateHandle((el, { up, child }) => { let n = el; for (let i = 0; i < up; i++) n = n.parentElement; return n.querySelector(child); }, { up: probe.up, child: probe.child });
      }
      const el = handle && handle.asElement();
      if (!el) { contrast.push({ label: probe.label, missing: true }); continue; }
      await el.scrollIntoViewIfNeeded();
      await page.evaluate((k) => { window.__keepShadow = k; }, KEEP_SHADOW);
      await sleep(500);
      const info = await el.evaluate((n) => { const cs = getComputedStyle(n); return { color: cs.color, fontSize: parseFloat(cs.fontSize), fontWeight: cs.fontWeight, text: (n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60) }; });
      const box = await el.boundingBox();
      const fg = parseRgb(info.color);
      if (!box || !fg) { contrast.push({ label: probe.label, missing: true }); continue; }
      await el.evaluate((n) => { n.querySelectorAll('*').forEach((c) => { c.style.setProperty('color', 'transparent', 'important'); c.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); c.style.setProperty('background', 'transparent', 'important'); }); n.style.setProperty('color', 'transparent', 'important'); n.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); if (!window.__keepShadow) n.style.setProperty('text-shadow', 'none', 'important'); });
      const clip = { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, Math.min(box.width, size.w - box.x)), height: Math.max(1, box.height) };
      const buf = await page.screenshot({ type: 'png', clip });
      await el.evaluate((n) => { n.querySelectorAll('*').forEach((c) => { c.style.removeProperty('color'); c.style.removeProperty('-webkit-text-fill-color'); c.style.removeProperty('background'); }); n.style.removeProperty('color'); n.style.removeProperty('-webkit-text-fill-color'); n.style.removeProperty('text-shadow'); });
      const { data, info: im } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      let worst = Infinity; const rs = [];
      for (let i = 0; i < data.length; i += im.channels) { const bg = [data[i], data[i + 1], data[i + 2]]; const eff = fg.a < 1 ? fg.rgb.map((c, k) => Math.round(c * fg.a + bg[k] * (1 - fg.a))) : fg.rgb; const r = ratio(eff, bg); rs.push(r); if (r < worst) worst = r; }
      rs.sort((a, b) => a - b);
      const large = info.fontSize >= 24 || (info.fontSize >= 18.66 && Number(info.fontWeight) >= 700);
      const threshold = large ? 3 : 4.5;
      contrast.push({ label: probe.label, text: info.text, fontSize: info.fontSize, color: info.color, worst: +worst.toFixed(2), median: +rs[Math.floor(rs.length / 2)].toFixed(2), threshold, pass: worst >= threshold });
    }
    report.push({ tag: TAG, theme, size: size.tag, injectCss: INJECT || null, keepShadow: KEEP_SHADOW, axe, keyboard, aria, contrast });
    console.log(`${TAG} ${theme} ${size.tag}: axe page ${axe.page.violations.length} viol / room ${axe.room.violations.length} viol · keyboard stops ${stops.length} (${stops.map((s) => s.name).join(' | ')}) · hidden focusables ${keyboard.hiddenFocusables} · contrast min ${Math.min(...contrast.filter((c) => !c.missing).map((c) => c.worst))} fails ${contrast.filter((c) => c.pass === false).length}`);
    await ctx.close();
  }
} finally { await browser.close(); srv.kill(); }
fs.writeFileSync(path.join(OUT, `a11y-${TAG}.json`), JSON.stringify(report, null, 1));
