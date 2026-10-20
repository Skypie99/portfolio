#!/usr/bin/env node
/**
 * contrast-probe.mjs — measured foreground/background contrast of the Release 6
 * text, over the pixels it is actually painted on (gradients, glass, washes
 * included), from a BUILT export.
 *
 *   node contrast-probe.mjs --dir <export dir> --out <dir> [--themes light,dark] [--sizes 1440x900@1,393x852@2]
 *
 * For each probe (a route, a selector, a label) the page is loaded, walked so
 * reveals rest visible, the element is scrolled into view, its computed colour
 * read, then its text is made transparent (color: transparent on the element,
 * inherited by its text nodes) and the element's box is screenshotted so the
 * backdrop under the glyphs can be sampled. The reported ratio is against the
 * WORST backdrop pixel in the box (the binding one), and the median backdrop
 * for context. Threshold: 4.5:1 for normal text, 3:1 for large text (>= 24px
 * or >= 18.66px bold) per WCAG 1.4.3. Pure measurement; nothing is changed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { opt, parseSizes, resolveChromium, serve, chromium, makeContext, load, scrollThrough, sleep, sharp } from './lib.mjs';

const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out'));
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = parseSizes(opt('sizes', '1440x900@1,393x852@2'));
const PORT = Number(opt('port', 3232));
// --inject-css "<css>": an experiment overlay applied after load (measure a
// candidate before building it). Reported in the JSON so no run can be mistaken
// for the shipped page.
const INJECT = opt('inject-css', '');
const BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });

const PROBES = [
  { route: '/work/', label: 'wall · title', selector: '.case-study-card h3 a', nth: 0 },
  { route: '/work/', label: 'wall · description', selector: '.case-study-card .case-study-card-copy p.font-sans', nth: 0 },
  { route: '/work/', label: 'wall · status (facts)', selector: '.case-study-card p.font-mono.text-meta.text-text-meta', nth: 0 },
  { route: '/work/', label: 'wall · verified line', selector: '.case-study-card p.font-mono.text-meta.text-text-meta', nth: 1 },
  { route: '/work/', label: 'wall · View project', selector: '.case-study-card a[aria-label^="View project"]', nth: 0 },
  { route: '/work/', label: 'wall · numeral (decorative, large)', selector: '.case-study-card .text-card-numeral', nth: 0 },
  { route: '/work/', label: 'wall plate 03 · status (right-hung)', selector: '.case-study-card p.font-mono.text-meta.text-text-meta', nth: 4 },
  { route: '/', label: 'index · title', selector: '#work ol h3 a', nth: 0 },
  { route: '/', label: 'index · summary', selector: '#work ol p.font-sans', nth: 0 },
  { route: '/', label: 'index · status', selector: '#work ol p.font-mono.text-text-meta.text-pretty', nth: 1 },
  { route: '/', label: 'index · status row 03', selector: '#work ol p.font-mono.text-text-meta.text-pretty', nth: 2 },
  { route: '/', label: 'index · note (accent)', selector: '#work ol p.font-mono.text-accent-text', nth: 0 },
  { route: '/', label: 'index · year', selector: '#work ol p.tabular-nums.text-text-meta', nth: 0 },
  { route: '/', label: 'index · numeral', selector: '#work ol span[aria-hidden="true"].tabular-nums', nth: 0 },
  { route: '/', label: 'index · Featured: above link', selector: '#work ol a[href="#flagship"]', nth: 0 },
  { route: '/', label: 'record · open round counts', selector: '#record li:first-child span.font-sans', nth: 0 },
];

const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const parseRgb = (s) => {
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(s) || /rgba?\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/.exec(s);
  return m ? { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], a: m[4] === undefined ? 1 : Number(m[4]) } : null;
};

const engine = resolveChromium();
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
const rows = [];
try {
  for (const theme of THEMES) {
    for (const size of SIZES) {
      for (const route of ['/work/', '/']) {
        const ctx = await makeContext(browser, { ...size, theme, mode: 'normal' });
        const page = await ctx.newPage();
        await load(page, BASE + route);
        if (INJECT) await page.addStyleTag({ content: INJECT });
        await scrollThrough(page);
        for (const probe of PROBES.filter((p) => p.route === route)) {
          const handle = (await page.$$(probe.selector))[probe.nth];
          if (!handle) {
            rows.push({ theme, size: size.tag, ...probe, missing: true });
            continue;
          }
          await handle.scrollIntoViewIfNeeded();
          await sleep(900);
          const info = await handle.evaluate((el) => {
            const cs = getComputedStyle(el);
            return { color: cs.color, fontSize: parseFloat(cs.fontSize), fontWeight: cs.fontWeight, text: (el.textContent || '').trim().slice(0, 60) };
          });
          const fg = parseRgb(info.color);
          const box = await handle.boundingBox();
          if (!box || !fg) continue;
          // Hide the glyphs (and any text-shadow) to sample the backdrop beneath them.
          await handle.evaluate((el) => {
            el.dataset.probePrevColor = el.style.color;
            el.style.setProperty('color', 'transparent', 'important');
            el.style.setProperty('text-shadow', 'none', 'important');
            el.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
            el.querySelectorAll('*').forEach((c) => {
              c.style.setProperty('color', 'transparent', 'important');
              c.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
              c.style.setProperty('background', 'transparent', 'important');
            });
          });
          const clip = { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, Math.min(box.width, size.w - box.x)), height: Math.max(1, box.height) };
          const buf = await page.screenshot({ type: 'png', clip });
          await handle.evaluate((el) => {
            el.style.color = el.dataset.probePrevColor || '';
            el.style.removeProperty('text-shadow');
            el.style.removeProperty('-webkit-text-fill-color');
            el.querySelectorAll('*').forEach((c) => {
              c.style.removeProperty('color');
              c.style.removeProperty('-webkit-text-fill-color');
              c.style.removeProperty('background');
            });
          });
          const { data, info: im } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
          // Effective foreground when the ink carries alpha (e.g. text-ink/70):
          // composite over each backdrop pixel before measuring.
          let worst = Infinity;
          let worstPx = null;
          const ratios = [];
          for (let i = 0; i < data.length; i += im.channels) {
            const bg = [data[i], data[i + 1], data[i + 2]];
            const eff = fg.a < 1 ? fg.rgb.map((c, k) => Math.round(c * fg.a + bg[k] * (1 - fg.a))) : fg.rgb;
            const r = ratio(eff, bg);
            ratios.push(r);
            if (r < worst) {
              worst = r;
              worstPx = bg;
            }
          }
          ratios.sort((a, b) => a - b);
          const median = ratios[Math.floor(ratios.length / 2)];
          const large = info.fontSize >= 24 || (info.fontSize >= 18.66 && Number(info.fontWeight) >= 700);
          const threshold = probe.label.includes('decorative') ? 3 : large ? 3 : 4.5;
          rows.push({ theme, size: size.tag, label: probe.label, text: info.text, color: info.color, fontSize: info.fontSize, worst: Number(worst.toFixed(2)), median: Number(median.toFixed(2)), worstBackdrop: worstPx, threshold, pass: worst >= threshold });
          console.log(`[contrast] ${theme} ${size.tag} ${probe.label}: worst ${worst.toFixed(2)}:1 (median ${median.toFixed(2)}) vs ${threshold} ${worst >= threshold ? 'PASS' : 'FAIL'} · ${info.fontSize}px · "${info.text.slice(0, 32)}"`);
        }
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
fs.writeFileSync(path.join(OUT, 'contrast.json'), JSON.stringify({ dir: DIR, at: new Date().toISOString(), injectedCss: INJECT || null, rows }, null, 2));
const fails = rows.filter((r) => r.pass === false);
console.log(`[contrast] ${rows.length} probes, ${fails.length} below threshold`);
