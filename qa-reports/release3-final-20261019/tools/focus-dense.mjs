/*
 * focus-dense.mjs: the Play-button focus indicator over EVERY frame of the clip (60 fps, 901 frames),
 * rendered, with real keyboard focus held. Same page set-up as focus-sweep.mjs (r1); the only
 * differences are the step (one native frame, sought at the frame's centre) and the exception list.
 *
 *   PLAN="chromium:dark:1440x900,webkit:dark:393x852" node focus-dense.mjs
 * Output: <RV>/measurements/focus-dense/focus-dense_<tag>.json, crops in <RV>/captures/focus-dense/
 */
import fs from 'node:fs';
import path from 'node:path';
import { BASE, RV, launch, themedContext, tabToPlay, settle, PLAY_SEL, writeJson, ensureDir } from './lib.mjs';
import { DPR, focusGeometry, makeMeasure, summarise, fitCentreClean } from './focus-measure.mjs';

const FPS = Number(process.env.FPS ?? 60);
const OUT = ensureDir(path.join(RV, 'measurements', 'focus-dense'));
const SHOTS = ensureDir(path.join(RV, 'captures', 'focus-dense'));
const plan = (process.env.PLAN ?? 'chromium:dark:1440x900').split(',').map((s) => {
  const [engine, theme, wh] = s.split(':');
  return { engine, theme, vp: wh.split('x').map(Number) };
});

for (const { engine, theme, vp } of plan) {
  const browser = await launch(engine);
  const ctx = await themedContext(browser, { theme, viewport: vp, dpr: DPR });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/work/flagstone/`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // Release 3 final: FOCUS_CSS re-applies the previous ring on the same build (before/after on one export).
  if (process.env.FOCUS_CSS) await page.addStyleTag({ content: process.env.FOCUS_CSS });
  await settle(page, 300);
  const key = engine === 'webkit' ? 'Alt+Tab' : 'Tab';
  const tabs = await tabToPlay(page, { max: 80, key });
  const tag = `${engine}_${theme}_${vp[0]}x${vp[1]}${process.env.TAG_SUFFIX ?? ''}`;
  if (tabs === null) {
    writeJson(path.join(OUT, `focus-dense_${tag}.json`), { engine, theme, vp, error: 'Play button not reached by keyboard' });
    await browser.close();
    continue;
  }
  await settle(page, 1200);
  const geo = await focusGeometry(page);
  const fixed = process.env.FIT_ONCE ? await fitCentreClean(page, geo) : null;
  if (fixed) fs.writeFileSync(path.join(SHOTS, `${tag}_fit-clean.png`), fixed.buf);
  const measure = makeMeasure(page, geo, fixed);
  const t0 = Date.now();
  const frames = [await measure('poster')];
  await page.evaluate(async (sel) => {
    const v = document.querySelector(sel).parentElement.querySelector('video');
    v.preload = 'auto';
    if (v.readyState < 2) {
      v.load();
      await new Promise((r) => { v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 8000); });
    }
  }, PLAY_SEL);
  const duration = await page.evaluate((sel) => document.querySelector(sel).parentElement.querySelector('video').duration, PLAY_SEL);
  const n = Math.floor(duration * FPS + 1e-6);
  for (let i = 0; i < n; i += 1) {
    const t = (i + 0.5) / FPS;
    await page.evaluate((args) => new Promise((r) => {
      const v = document.querySelector(args.sel).parentElement.querySelector('video');
      v.addEventListener('seeked', () => requestAnimationFrame(() => requestAnimationFrame(() => r())), { once: true });
      v.currentTime = args.t;
      setTimeout(r, 4000);
    }), { sel: PLAY_SEL, t });
    frames.push(await measure(`f${String(i).padStart(3, '0')}`));
  }
  const s = summarise(frames);
  const worstFrame = frames.reduce((a, fr) => (fr.twoBandFrac < a.twoBandFrac || (fr.twoBandFrac === a.twoBandFrac && fr.cRB.min < a.cRB.min) ? fr : a));
  fs.writeFileSync(path.join(SHOTS, `${tag}_poster.png`), frames[0].buf);
  fs.writeFileSync(path.join(SHOTS, `${tag}_worst_${worstFrame.label}.png`), worstFrame.buf);
  for (const fr of frames) delete fr.buf;
  const compact = frames.map((fr) => ({ label: fr.label, t: fr.t, focused: fr.focused, twoBandFrac: fr.twoBandFrac, strictFrac: fr.strictFrac, cRBmin: fr.cRB.min, cHBmin: fr.cHB.min, failDeg: fr.twoBandFailDeg, bgLum: fr.bgLum }));
  const out = {
    generated: new Date().toISOString(), base: BASE, engine, version: browser.version(), theme, viewport: vp, dpr: DPR, fps: FPS,
    duration, framesSought: n, tabs, key, src: geo.src, seconds: Math.round((Date.now() - t0) / 1000),
    computed: { outline: `${geo.outlineW} solid ${geo.outline} @ ${geo.offset}`, halo: geo.shadow, button: `${geo.w}x${geo.h}` },
    summary: s,
    worstFrame: { label: worstFrame.label, t: worstFrame.t, twoBandFrac: worstFrame.twoBandFrac },
    frames: compact,
  };
  writeJson(path.join(OUT, `focus-dense_${tag}.json`), out);
  const { exceptions, ...rest } = s;
  console.log(JSON.stringify({ tag, tabs, src: geo.src, seconds: out.seconds, ...rest, exceptionFrames: exceptions.map((e) => `${e.label}@${e.t}:${e.failDeg}deg`).slice(0, 40) }));
  await browser.close();
}
