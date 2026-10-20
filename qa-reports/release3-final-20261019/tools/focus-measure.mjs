/*
 * focus-measure.mjs: the per-angle focus-indicator measurement from focus-sweep.mjs (r1, FIX=none),
 * lifted into a module so the dense-seek and real-playback runs use exactly the same arithmetic.
 *
 * Geometry (CSS px, measured at device scale 2): halo band r in [22, 24] sampled at 23; ring band
 * r in [24, 26] sampled at 25; the video just outside the ring sampled at 27.5. 360 angles.
 * Per angle: strict = ring:video >= 3; twoBand = ring:video >= 3 OR (halo:video >= 3 AND
 * ring:halo >= 3) (Understanding 1.4.11 "either part", Technique C40).
 * Added for this packet: the failing angles of any frame below 100% are returned in full, so every
 * remaining exception can be listed with its colours.
 */
import { PLAY_SEL, decode, px, contrast, lum, r2, quantile, rgbStr, parseRgb } from './lib.mjs';

export const DPR = 2;

export async function focusGeometry(page) {
  return page.evaluate((sel) => {
    const b = document.querySelector(sel);
    const r = b.getBoundingClientRect();
    const s = getComputedStyle(b);
    const v = b.parentElement.querySelector('video');
    return { cx: r.x + r.width / 2, cy: r.y + r.height / 2, w: r.width, h: r.height, outline: s.outlineColor, outlineW: s.outlineWidth, offset: s.outlineOffset, shadow: s.boxShadow, src: v.currentSrc.split('/').pop() };
  }, PLAY_SEL);
}

/** Release 3 final (v2): fit the ring centre ONCE from a capture with the clip's video and poster
 *  hidden (visibility only; layout and focus unchanged), so the fit sees the ring over the plain
 *  mat. v1 refit every frame from ring-coloured pixels, which an ink ring shares with the clip's
 *  dark UI: the fit drifted up to 2.3 CSS px and sampled off the bands (fake failures). */
export async function fitCentreClean(page, geo) {
  const half = 36;
  const x0 = Math.floor(geo.cx - half);
  const y0 = Math.floor(geo.cy - half);
  const style = await page.addStyleTag({ content: '[data-themed-motion] video, [data-themed-motion] img, [data-themed-motion] picture { visibility: hidden !important; }' });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const buf = await page.screenshot({ clip: { x: x0, y: y0, width: half * 2, height: half * 2 }, type: 'png', animations: 'allow' });
  await style.evaluate((st) => st.remove());
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const img = await decode(buf);
  const ringRGB = parseRgb(geo.outline);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const domCx = (geo.cx - x0) * DPR;
  const domCy = (geo.cy - y0) * DPR;
  let sx = 0; let sy = 0; let n = 0;
  for (let y = 0; y < img.h; y += 1) for (let x = 0; x < img.w; x += 1) {
    const rr = Math.hypot(x + 0.5 - domCx, y + 0.5 - domCy) / DPR;
    if (rr < 23.5 || rr > 26.5) continue;
    if (dist(px(img, x, y), ringRGB) <= 18) { sx += x + 0.5; sy += y + 0.5; n += 1; }
  }
  return { fx: n > 200 ? sx / n : domCx, fy: n > 200 ? sy / n : domCy, ringPx: n, buf };
}

export function makeMeasure(page, geo, fixed = null) {
  const half = 36;
  const x0 = Math.floor(geo.cx - half);
  const y0 = Math.floor(geo.cy - half);
  const clip = { x: x0, y: y0, width: half * 2, height: half * 2 };
  const ringRGB = parseRgb(geo.outline);
  const haloRGB = parseRgb(geo.shadow);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  return async (label) => {
    const state = await page.evaluate((sel) => {
      const b = document.querySelector(sel);
      const v = b.parentElement.querySelector('video');
      return { active: document.activeElement === b, fv: b.matches(':focus-visible'), t: v.currentTime, paused: v.paused, name: b.getAttribute('aria-label') };
    }, PLAY_SEL);
    const buf = await page.screenshot({ clip, type: 'png', animations: 'allow' });
    const tAfter = await page.evaluate((sel) => document.querySelector(sel).parentElement.querySelector('video').currentTime, PLAY_SEL);
    const img = await decode(buf);
    const domCx = (geo.cx - x0) * DPR;
    const domCy = (geo.cy - y0) * DPR;
    let sx = 0; let sy = 0; let n = 0;
    for (let y = 0; y < img.h; y += 1) {
      for (let x = 0; x < img.w; x += 1) {
        const rr = Math.hypot(x + 0.5 - domCx, y + 0.5 - domCy) / DPR;
        if (rr < 23.5 || rr > 26.5) continue;
        if (dist(px(img, x, y), ringRGB) <= 18) { sx += x + 0.5; sy += y + 0.5; n += 1; }
      }
    }
    const fx = fixed ? fixed.fx : n > 200 ? sx / n : domCx;
    const fy = fixed ? fixed.fy : n > 200 ? sy / n : domCy;
    const at = (r, th) => px(img, fx + r * DPR * Math.cos(th) - 0.5, fy + r * DPR * Math.sin(th) - 0.5);
    const per = [];
    for (let deg = 0; deg < 360; deg += 1) {
      const th = (deg * Math.PI) / 180;
      const H = at(23, th);
      const R = at(25, th);
      const B = at(27.5, th);
      const cRB = contrast(R, B);
      const cHB = contrast(H, B);
      const cRH = contrast(R, H);
      per.push({ deg, H, R, B, cRB, cHB, cRH, ringOk: dist(R, ringRGB) <= 18, haloOk: dist(H, haloRGB) <= 18, strict: cRB >= 3, twoBand: cRB >= 3 || (cHB >= 3 && cRH >= 3) });
    }
    const f = (k) => per.filter((p) => p[k]).length / per.length;
    const worst = per.reduce((a, p) => (Math.max(p.cRB, p.cHB) < Math.max(a.cRB, a.cHB) ? p : a));
    const failing = per.filter((p) => !p.twoBand).map((p) => ({ deg: p.deg, bg: rgbStr(p.B), ring: rgbStr(p.R), halo: rgbStr(p.H), bgLum: Math.round(lum(p.B) * 10000) / 10000, cRB: r2(p.cRB), cHB: r2(p.cHB), cRH: r2(p.cRH) }));
    return {
      label,
      t: Math.round(state.t * 1000) / 1000,
      tAfter: Math.round(tAfter * 1000) / 1000,
      paused: state.paused,
      name: state.name,
      focused: state.active && state.fv,
      fit: { dxCss: r2((fx - domCx) / DPR), dyCss: r2((fy - domCy) / DPR), ringPx: n },
      ringPresent: r2(f('ringOk')),
      haloPresent: r2(f('haloOk')),
      ringMed: rgbStr([0, 1, 2].map((i) => quantile(per.map((p) => p.R[i]), 0.5))),
      haloMed: rgbStr([0, 1, 2].map((i) => quantile(per.map((p) => p.H[i]), 0.5))),
      bgLum: { min: Math.round(Math.min(...per.map((p) => lum(p.B))) * 10000) / 10000, max: Math.round(Math.max(...per.map((p) => lum(p.B))) * 10000) / 10000 },
      cRB: { min: r2(Math.min(...per.map((p) => p.cRB))), med: r2(quantile(per.map((p) => p.cRB), 0.5)) },
      cHB: { min: r2(Math.min(...per.map((p) => p.cHB))), med: r2(quantile(per.map((p) => p.cHB), 0.5)) },
      cRH: { min: r2(Math.min(...per.map((p) => p.cRH))), med: r2(quantile(per.map((p) => p.cRH), 0.5)) },
      strictFrac: r2(f('strict')),
      twoBandFrac: r2(f('twoBand')),
      twoBandFailDeg: failing.length,
      worst: { deg: worst.deg, bg: rgbStr(worst.B), ring: rgbStr(worst.R), halo: rgbStr(worst.H), cRB: r2(worst.cRB), cHB: r2(worst.cHB) },
      failing,
      buf,
    };
  };
}

/** Summarise a list of measured frames (same fields as focus-sweep.mjs's summary, plus exceptions). */
export function summarise(frames) {
  const below = frames.filter((fr) => fr.twoBandFrac < 1);
  const exceptions = below.map((fr) => ({ label: fr.label, t: fr.t, twoBandFrac: fr.twoBandFrac, failDeg: fr.twoBandFailDeg, minPairMax: Math.min(...fr.failing.map((x) => Math.max(x.cRB, x.cHB))), failing: fr.failing }));
  return {
    frames: frames.length,
    allFocused: frames.every((fr) => fr.focused),
    minRingPresent: Math.min(...frames.map((fr) => fr.ringPresent)),
    minHaloPresent: Math.min(...frames.map((fr) => fr.haloPresent)),
    fitOffsetMaxCss: r2(Math.max(...frames.map((fr) => Math.hypot(fr.fit.dxCss, fr.fit.dyCss)))),
    ringMed: frames[0].ringMed,
    haloMed: frames[0].haloMed,
    cRHmed: frames[0].cRH.med,
    minStrictFrac: Math.min(...frames.map((fr) => fr.strictFrac)),
    minTwoBandFrac: Math.min(...frames.map((fr) => fr.twoBandFrac)),
    framesTwoBandBelowFull: below.length,
    maxFailDegInAFrame: below.length ? Math.max(...below.map((fr) => fr.twoBandFailDeg)) : 0,
    worstExceptionPair: exceptions.length ? Math.min(...exceptions.map((e) => e.minPairMax)) : null,
    exceptions,
  };
}
