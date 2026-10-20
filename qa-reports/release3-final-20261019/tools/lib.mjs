/*
 * lib.mjs — shared helpers for the Flagstone Version A independent review rig (2026-10-18).
 * Resolves playwright-core and sharp from the REVIEW worktree's node_modules (lockfile 46e68f63),
 * so nothing is installed. Read-only against the site: every probe runs in the browser page.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

export const WT = process.env.REVIEW_WT ?? '/Users/skypie/Portfolio-codex/flagstone-version-a-review-20261018';
/* Output root. Override with REVIEW_RV for a re-verification run so this r1 packet is never overwritten. */
export const RV = process.env.REVIEW_RV ?? '/Users/skypie/SkyPi_Portfolio_Execution_Review/2026-10-18_flagstone-version-a-independent-review-r1';
export const BASE = process.env.REVIEW_BASE ?? 'http://127.0.0.1:3141';
const require = createRequire(path.join(WT, 'package.json'));
export const pw = require('playwright-core');
export const sharp = require('sharp');

export const VIEWPORTS = [
  [1920, 1080], [1440, 900], [1280, 800], [1024, 768], [393, 852], [375, 667], [320, 568],
];

/* ---------- WCAG 2.x relative luminance and contrast (sRGB, 8-bit) ---------- */
const lin = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export const contrast = (a, b) => {
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
/** Composite an rgba over an opaque rgb (straight alpha). */
export const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
export const parseRgb = (s) => {
  const m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?/.exec(s);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])] : null;
};
export const r2 = (x) => Math.round(x * 100) / 100;
export const rgbStr = (c) => `rgb(${c.slice(0, 3).map((v) => Math.round(v)).join(' ')})`;
export const quantile = (arr, q) => {
  const s = [...arr].sort((a, b) => a - b);
  if (!s.length) return null;
  const i = (s.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
};

/* ---------- PNG decoding and sampling ---------- */
export async function decode(buf) {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, ch: info.channels };
}
export function px(img, x, y) {
  const xi = Math.min(img.w - 1, Math.max(0, Math.round(x)));
  const yi = Math.min(img.h - 1, Math.max(0, Math.round(y)));
  const o = (yi * img.w + xi) * img.ch;
  return [img.data[o], img.data[o + 1], img.data[o + 2]];
}

/* ---------- browser helpers ---------- */
export async function launch(engine) {
  return pw[engine].launch({ headless: true });
}

/** A context whose page starts in an explicit next-themes theme (class strategy). */
export async function themedContext(browser, { theme, viewport, dpr = 2, reducedMotion = 'no-preference', isMobile, hasTouch, javaScriptEnabled = true }) {
  const ctx = await browser.newContext({
    viewport: { width: viewport[0], height: viewport[1] },
    deviceScaleFactor: dpr,
    colorScheme: theme,
    reducedMotion,
    javaScriptEnabled,
    ...(isMobile !== undefined ? { isMobile } : {}),
    ...(hasTouch !== undefined ? { hasTouch } : {}),
  });
  await ctx.addInitScript((t) => {
    try { window.localStorage.setItem('theme', t); } catch { /* storage denied */ }
  }, theme);
  return ctx;
}

/** Instrument media so any playback, from any cause, is recorded with a timestamp. */
export async function instrumentMedia(ctx) {
  await ctx.addInitScript(() => {
    window.__media = { playCalls: [], playing: [], pauses: [] };
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function patchedPlay(...a) {
      window.__media.playCalls.push({ t: Math.round(performance.now()), src: (this.currentSrc || this.querySelector('source')?.src || '').split('/').pop(), stack: (new Error().stack || '').split('\n').slice(2, 5).join(' | ') });
      return orig.apply(this, a);
    };
    document.addEventListener('playing', (e) => window.__media.playing.push({ t: Math.round(performance.now()), src: (e.target.currentSrc || '').split('/').pop() }), true);
    document.addEventListener('pause', (e) => window.__media.pauses.push({ t: Math.round(performance.now()), src: (e.target.currentSrc || '').split('/').pop() }), true);
  });
}

export const PLAY_SEL = '.proof-row [data-themed-motion] > button';

/** Press Tab until the Play button is the active element; returns the number of presses or null. */
export async function tabToPlay(page, { max = 80, key = 'Tab' } = {}) {
  for (let i = 1; i <= max; i += 1) {
    await page.keyboard.press(key);
    const hit = await page.evaluate((sel) => document.activeElement === document.querySelector(sel), PLAY_SEL);
    if (hit) return i;
  }
  return null;
}

export async function settle(page, ms = 300) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(ms);
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
  return p;
}
export function writeJson(p, obj) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}
