// proto-b.mjs — DIRECTION B visual prototype: "The Plate" (editorial exit), rendered by
// injecting CSS/DOM over the REAL baseline build at settled scroll positions. These are
// clearly-labelled prototype renders, not a working implementation.
//   node proto-b.mjs --base http://localhost:3100 --out <dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/portfolio/package.json');
const { chromium } = require('playwright-core');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean));
const BASE = args.base || 'http://localhost:3100'; const OUT = args.out; mkdirSync(OUT, { recursive: true });

const CONFIGS = {
  'desktop-light': { width: 1440, height: 900, dpr: 1, scheme: 'light', mobile: false },
  'desktop-dark':  { width: 1440, height: 900, dpr: 1, scheme: 'dark',  mobile: false },
  'mobile-light':  { width: 393,  height: 852, dpr: 2, scheme: 'light', mobile: true },
};

// The prototype's CSS. Everything is scoped to .proto-* hooks added at runtime.
const CSS = `
  .cdesert-pin.proto-paper { background: rgb(var(--rgb-canvas)) !important; }
  .proto-plate { position:absolute; inset:0; transform-origin: 50% 46%; transform: scale(var(--proto-scale, 1)); overflow:hidden; }
  .proto-plate::after { content:''; position:absolute; inset:0; box-shadow: inset 0 0 0 1px rgb(var(--rgb-ink) / 0.14); pointer-events:none; }
  .proto-caption { position:absolute; left:0; right:0; bottom: var(--proto-cap-bottom, 4.2%); z-index: 80; margin:0; text-align:center;
    font-family: var(--font-dm-mono), ui-monospace, monospace; font-size: clamp(0.625rem, 0.8vw, 0.72rem); letter-spacing:0.18em; text-transform:uppercase; line-height:1.7;
    color: rgb(var(--rgb-ink) / 0.78); padding: 0 8%; }
  .proto-caption b { font-weight:400; color: rgb(var(--rgb-ink)); }
  .proto-slate { position:fixed; left: max(1.15rem, env(safe-area-inset-left)); bottom: max(1.25rem, env(safe-area-inset-bottom)); z-index:56;
    font-family: var(--font-dm-mono), ui-monospace, monospace; font-size: 0.6875rem; letter-spacing:0.16em; text-transform:uppercase; line-height:1.8; color: rgb(255 246 236 / 0.9);
    text-shadow: 0 1px 2px rgb(24 10 4 / .9), 0 1px 10px rgb(26 11 4 / .8); }
  .proto-slate::before { content:''; display:block; width:40px; height:1px; background: rgb(255 246 236 / .7); margin-bottom:.6rem; }
  .proto-hide { display:none !important; }
  @media (max-width: 480px) { .proto-caption { font-size: 0.5625rem; letter-spacing: .14em; padding: 0 5%; } .proto-slate { font-size: 0.625rem; } }
`;

async function ready(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => { await document.fonts?.ready; const planes = [...document.querySelectorAll('img[data-plate]')]; await Promise.race([Promise.all(planes.map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 5000))]); });
  await page.waitForTimeout(400);
}
async function geometry(page) {
  return page.evaluate(() => { const stage = document.querySelector('.cdesert-stage'); const pin = document.querySelector('.cdesert-pin'); const r = stage.getBoundingClientRect(); const top = r.top + window.scrollY; const h = r.height; const phone = matchMedia('(max-width: 767px)').matches; const end = phone ? top + h - pin.offsetHeight : top + h - window.innerHeight; return { top, h, end }; });
}
async function inject(page, { scale, caption, slate, paper, hideChrome }) {
  await page.evaluate(({ CSS, scale, caption, slate, paper, hideChrome }) => {
    if (!document.getElementById('proto-css')) { const st = document.createElement('style'); st.id = 'proto-css'; st.textContent = CSS; document.head.appendChild(st); }
    const pin = document.querySelector('.cdesert-pin');
    let plate = pin.querySelector('.proto-plate');
    if (!plate) { plate = document.createElement('div'); plate.className = 'proto-plate'; while (pin.firstChild) plate.appendChild(pin.firstChild); pin.appendChild(plate); }
    plate.style.setProperty('--proto-scale', String(scale));
    pin.classList.toggle('proto-paper', !!paper);
    pin.querySelector('.proto-caption')?.remove();
    if (caption) { const p = document.createElement('p'); p.className = 'proto-caption'; p.innerHTML = caption; pin.appendChild(p); }
    document.querySelector('.proto-slate')?.remove();
    if (slate) { const d = document.createElement('div'); d.className = 'proto-slate'; d.innerHTML = slate; document.body.appendChild(d); }
    for (const sel of ['.runway-identity', '.intro-scroll-cue']) document.querySelector(sel)?.classList.toggle('proto-hide', !!hideChrome);
  }, { CSS, scale, caption, slate, paper, hideChrome });
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
const CAPTION_LAND = 'Fig. 01 &nbsp;·&nbsp; The arrival wall, golden hour &nbsp;·&nbsp; <b>SkyPi Studio</b> is <b>Skyler Halisky</b>, senior technical support';
const CAPTION_OPEN = 'Fig. 00 &nbsp;·&nbsp; Monument valley, late light &nbsp;·&nbsp; <b>SkyPi Studio</b> &nbsp;·&nbsp; portfolio 2026';
const SLATE = 'SkyPi Studio &middot; Portfolio 2026<br>Skyler Halisky &middot; Senior technical support';
const out = {};
for (const [name, c] of Object.entries(CONFIGS)) {
  const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr, colorScheme: c.scheme, isMobile: c.mobile, hasTouch: c.mobile });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' }); await ready(page);
  const g = await geometry(page); const dir = join(OUT, name); mkdirSync(dir, { recursive: true }); out[name] = [];
  const shots = [
    { id: 'open-plate', y: g.top, scale: 0.9, paper: true, caption: CAPTION_OPEN, hideChrome: true, slate: '', note: 'p=0.00 · the film opens as a plate on the page; mono caption beneath' },
    { id: 'open-slate', y: g.top, scale: 1, paper: false, caption: '', hideChrome: true, slate: SLATE, note: 'p=0.00 · alt opener: full-bleed with a film-leader slate (replaces the glass chip)' },
    { id: 'mid', y: Math.round(g.top + 0.55 * (g.end - g.top)), scale: 1, paper: false, caption: '', hideChrome: false, slate: '', note: 'p=0.55 · unchanged full-bleed push (B keeps the body of the film as is)' },
    { id: 'land-plate', y: g.end, scale: 0.86, paper: true, caption: CAPTION_LAND, hideChrome: true, slate: '', note: 'p=1.00 · the world contracts into a framed plate; the credit becomes its caption' },
    { id: 'handoff', y: g.end + 300, scale: 0.86, paper: true, caption: CAPTION_LAND, hideChrome: true, slate: '', note: 'release +300px · the plate scrolls up INTO the page as a figure; no seam, canvas on both sides' },
  ];
  for (const s of shots) {
    await page.evaluate((yy) => window.scrollTo(0, yy), s.y); await page.waitForTimeout(1500);
    await inject(page, s); await page.waitForTimeout(250);
    const f = `${s.id}.png`; await page.screenshot({ path: join(dir, f), type: 'png' }); out[name].push({ file: f, note: s.note, scrollY: s.y });
    // restore full-bleed for the next scroll (so GSAP's geometry is untouched between shots)
    await inject(page, { scale: 1, paper: false, caption: '', slate: '', hideChrome: false });
  }
  await ctx.close(); console.log('[proto-b]', name, out[name].length);
}
await browser.close(); writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(out, null, 2));
