/*
 * focus-play.mjs: the Play-button focus indicator over the clip WHILE IT PLAYS (moving frames).
 * Real keyboard focus (Tab, or Option+Tab in WebKit), then Enter starts playback the way a keyboard
 * user would. Focus stays on the button, which now reads "Pause animation: ...". Captures are taken
 * back to back for one full pass of the looping 15.02 s clip; each is measured with the same per-angle
 * arithmetic as focus-sweep.mjs (focus-measure.mjs). Space then pauses, and the name is read back.
 *
 *   PLAN="chromium:dark:1440x900,webkit:dark:1440x900" node focus-play.mjs
 * Output: <RV>/measurements/focus-play/focus-play_<tag>.json, crops in <RV>/captures/focus-play/
 */
import fs from 'node:fs';
import path from 'node:path';
import { BASE, RV, launch, themedContext, tabToPlay, settle, PLAY_SEL, writeJson, ensureDir } from './lib.mjs';
import { DPR, focusGeometry, makeMeasure, summarise, fitCentreClean } from './focus-measure.mjs';

const OUT = ensureDir(path.join(RV, 'measurements', 'focus-play'));
const SHOTS = ensureDir(path.join(RV, 'captures', 'focus-play'));
const plan = (process.env.PLAN ?? 'chromium:dark:1440x900').split(',').map((s) => {
  const [engine, theme, wh] = s.split(':');
  return { engine, theme, vp: wh.split('x').map(Number) };
});
const videoState = (page) => page.evaluate((sel) => {
  const b = document.querySelector(sel);
  const v = b.parentElement.querySelector('video');
  return { t: v.currentTime, paused: v.paused, duration: v.duration, name: b.getAttribute('aria-label'), active: document.activeElement === b, fv: b.matches(':focus-visible') };
}, PLAY_SEL);

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
    writeJson(path.join(OUT, `focus-play_${tag}.json`), { engine, theme, vp, error: 'Play button not reached by keyboard' });
    await browser.close();
    continue;
  }
  await settle(page, 1200);
  const geo = await focusGeometry(page);
  const fixed = process.env.FIT_ONCE ? await fitCentreClean(page, geo) : null;
  if (fixed) fs.writeFileSync(path.join(SHOTS, `${tag}_fit-clean.png`), fixed.buf);
  const measure = makeMeasure(page, geo, fixed);
  const frames = [await measure('rest')];
  const before = await videoState(page);
  // Keyboard activation, held 20 ms (WebKit drops an instantaneous press right after a focus change).
  await page.keyboard.down('Enter');
  await page.waitForTimeout(20);
  await page.keyboard.up('Enter');
  const started = await page.evaluate((sel) => new Promise((r) => {
    const v = document.querySelector(sel).parentElement.querySelector('video');
    if (!v.paused && v.readyState >= 3) { r(true); return; }
    v.addEventListener('playing', () => r(true), { once: true });
    setTimeout(() => r(!v.paused), 8000);
  }), PLAY_SEL);
  const afterPlay = await videoState(page);
  const t0 = Date.now();
  let lastT = afterPlay.t;
  let wrapped = false;
  let k = 0;
  while (Date.now() - t0 < 17000) {
    const fr = await measure(`play${String(k).padStart(3, '0')}`);
    k += 1;
    frames.push(fr);
    if (fr.t + 0.25 < lastT) wrapped = true; // the loop restarted: one full pass is in hand
    lastT = fr.t;
    if (wrapped && fr.t > afterPlay.t) break;
  }
  const playedSpan = Math.round((Date.now() - t0) / 100) / 10;
  await page.keyboard.down('Space');
  await page.waitForTimeout(20);
  await page.keyboard.up('Space');
  await page.waitForTimeout(300);
  const afterPause = await videoState(page);
  const playing = frames.slice(1);
  const s = summarise(playing);
  const worstFrame = playing.reduce((a, fr) => (fr.twoBandFrac < a.twoBandFrac || (fr.twoBandFrac === a.twoBandFrac && fr.cRB.min < a.cRB.min) ? fr : a));
  fs.writeFileSync(path.join(SHOTS, `${tag}_rest.png`), frames[0].buf);
  fs.writeFileSync(path.join(SHOTS, `${tag}_worst-playing_${worstFrame.label}_t${worstFrame.t}.png`), worstFrame.buf);
  for (const fr of frames) delete fr.buf;
  // distinct video frames actually covered (60 fps): which frame indices the captures landed on
  const covered = new Set(playing.map((fr) => Math.floor(fr.t * 60)));
  const out = {
    generated: new Date().toISOString(), base: BASE, engine, version: browser.version(), theme, viewport: vp, dpr: DPR, tabs, key, src: geo.src,
    computed: { outline: `${geo.outlineW} solid ${geo.outline} @ ${geo.offset}`, halo: geo.shadow, button: `${geo.w}x${geo.h}` },
    keyboard: { before, started, afterPlay, afterPause },
    playback: { capturesWhilePlaying: playing.length, secondsCaptured: playedSpan, wrapped, distinctFramesCovered: covered.size, allCapturedWhilePlaying: playing.every((fr) => fr.paused === false) },
    rest: { twoBandFrac: frames[0].twoBandFrac, strictFrac: frames[0].strictFrac, cRB: frames[0].cRB, cHB: frames[0].cHB, cRH: frames[0].cRH },
    summary: s,
    worstFrame: { label: worstFrame.label, t: worstFrame.t, twoBandFrac: worstFrame.twoBandFrac },
    frames: frames.map((fr) => ({ label: fr.label, t: fr.t, paused: fr.paused, focused: fr.focused, twoBandFrac: fr.twoBandFrac, strictFrac: fr.strictFrac, cRBmin: fr.cRB.min, cHBmin: fr.cHB.min, failDeg: fr.twoBandFailDeg })),
  };
  writeJson(path.join(OUT, `focus-play_${tag}.json`), out);
  const { exceptions, ...rest } = s;
  console.log(JSON.stringify({ tag, tabs, src: geo.src, started, nameBefore: before.name.slice(0, 16), namePlaying: afterPlay.name.slice(0, 16), nameAfterPause: afterPause.name.slice(0, 16), pausedAfterSpace: afterPause.paused, focusKept: afterPause.active && afterPause.fv, ...out.playback, rest: out.rest.twoBandFrac, ...rest, exceptionFrames: exceptions.map((e) => `${e.label}@${e.t}:${e.failDeg}deg`).slice(0, 30) }));
  await browser.close();
}
