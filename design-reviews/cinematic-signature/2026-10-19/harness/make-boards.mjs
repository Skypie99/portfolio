// make-boards.mjs — compose the board spec from the baseline + candidate manifests.
//   node make-boards.mjs --evidence <dir> --out spec.json
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean));
const E = args.evidence;
const B = join(E, 'baseline'), C = join(E, 'candidate');
const film = (p) => `film-p${p.toFixed(2)}.png`, hand = (o) => `handoff-+${o}.png`;
const cell = (dir, cfg, file, caption) => existsSync(join(dir, cfg, file)) ? { src: join(dir, cfg, file), caption } : null;
const pair = (cfg, file, label, note, capB, capC) => ({ label, note, cells: [cell(B, cfg, file, capB || 'ORIGINAL (main b3e992b)'), cell(C, cfg, file, capC || 'CANDIDATE (this branch)')] });
const boards = [];
const DESK_ROWS = [
  ['film-p0.00.png', 'Opening frame', 'p = 0.00 · the valley. The candidate LIGHTS UP into this over 1.2 s (see board 06); at rest the two are the same frame.'],
  ['film-p0.55.png', 'The push', 'p = 0.55 · unchanged by design: the dolly, the rise and the one dissolve are the owner-ratified film.'],
  ['film-p0.82.png', 'The gold lands', 'p = 0.82 · rim-glow + vignette arc as before; the veil has not started (0.88).'],
  ['film-p0.90.png', 'Title carves', 'p = 0.90 · wordmark condensing; in the candidate the floor has begun to melt and the credit rule is about to draw.'],
  ['film-p1.00.png', 'THE LANDING', 'p = 1.00 · the frame you are left on. Candidate: credit resolved under the mark; bottom of the frame IS the page colour.'],
  ['handoff-+160.png', 'THE SEAM (+160 px)', 'pin released 160 px ago · original: hard dark edge against rail + canvas. Candidate: canvas meets canvas.'],
  ['handoff-+420.png', 'Handoff (+420 px)', 'the hero nameplate enters below the film.'],
  ['handoff-+720.png', 'Handoff (+720 px)', 'the hero composes; the film\'s last third is paper.'],
];
boards.push({ id: '01-desktop-light-film-and-handoff', title: 'Desktop 1440×900 · light · film + handoff', subtitle: 'Original (left) vs candidate (right), settled frames at the same scroll positions. p = scroll progress through the pinned film (0 = top, 1 = pin release).', columns: ['Original', 'Candidate'], cellWidth: 620, rows: DESK_ROWS.map(([f, l, n]) => pair('desktop-light', f, l, n)) });
boards.push({ id: '02-desktop-dark-film-and-handoff', title: 'Desktop 1440×900 · dark · landing + handoff', subtitle: 'The film is theme-invariant; the veil and the page-side fade are token-driven, so in dark mode the floor sinks into the night canvas instead of paper.', columns: ['Original', 'Candidate'], cellWidth: 620, rows: [['film-p0.00.png', 'Opening frame', 'p = 0.00'], ['film-p1.00.png', 'THE LANDING', 'p = 1.00'], ['handoff-+160.png', 'THE SEAM (+160 px)', ''], ['handoff-+420.png', 'Handoff (+420 px)', '']].map(([f, l, n]) => pair('desktop-dark', f, l, n)) });
const MOB_ROWS = [['film-p0.00.png', 'Opening', 'p = 0.00'], ['film-p0.55.png', 'The push', 'p = 0.55 (unchanged)'], ['film-p0.90.png', 'Title carves', 'p = 0.90'], ['film-p1.00.png', 'THE LANDING', 'p = 1.00 · credit stacks as two lines on phones'], ['handoff-+160.png', 'THE SEAM (+160 px)', ''], ['handoff-+420.png', 'Handoff (+420 px)', '']];
boards.push({ id: '03-mobile-393-light', title: 'Phone 393×852 (DPR 2) · light', subtitle: 'Original vs candidate. The phone film is 300vh; the mobile plate tier is used. The credit stacks name / role on two lines under 480 px.', columns: ['Original', 'Candidate'], cellWidth: 393, rows: MOB_ROWS.map(([f, l, n]) => pair('mobile-light', f, l, n)) });
boards.push({ id: '04-mobile-393-dark', title: 'Phone 393×852 (DPR 2) · dark', subtitle: 'Original vs candidate, dark scheme.', columns: ['Original', 'Candidate'], cellWidth: 393, rows: [['film-p0.00.png', 'Opening', ''], ['film-p1.00.png', 'THE LANDING', ''], ['handoff-+160.png', 'THE SEAM (+160 px)', ''], ['handoff-+420.png', 'Handoff (+420 px)', '']].map(([f, l, n]) => pair('mobile-dark', f, l, n)) });
boards.push({ id: '05-small-phone-360', title: 'Small phone 360×740 (DPR 2) · light + dark', subtitle: 'The smaller inspection viewport. Four cells per row: original light, candidate light, original dark, candidate dark.', columns: ['Original · light', 'Candidate · light', 'Original · dark', 'Candidate · dark'], cellWidth: 300, rows: [['film-p0.00.png', 'Opening', ''], ['film-p1.00.png', 'THE LANDING', ''], ['handoff-+160.png', 'THE SEAM (+160 px)', ''], ['handoff-+420.png', 'Handoff (+420 px)', '']].map(([f, l, n]) => ({ label: l, note: n, cells: [cell(B, 'small-light', f, 'original · light'), cell(C, 'small-light', f, 'candidate · light'), cell(B, 'small-dark', f, 'original · dark'), cell(C, 'small-dark', f, 'candidate · dark')] })) });
// opening light-up — deterministic frames (CSS animation paused at exact times) + the wall-clock burst as a caveat
const anim = (dir, name) => { const p = join(dir, name, 'manifest.json'); return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : { shots: [] }; };
const ad = anim(C, 'opening-anim-desktop'), am = anim(C, 'opening-anim-mobile'), ao = anim(B, 'opening-anim-desktop');
const burst = (dir) => { const p = join(dir, 'opening-desktop', 'manifest.json'); return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : []; };
const bb = burst(B), bc = burst(C);
const painted = ao.shots[0] ? { src: join(B, 'opening-anim-desktop', ao.shots[0].file), caption: 'original · the painted first frame (no light-up); the reference for every candidate cell' } : null;
const animRows = ad.shots.map((s, i) => ({ label: `animation time ${s.animationTime} ms`, note: i === 0 ? 'opacity 0 · scale 1.045 — the pin\'s dawn wash shows through' : s.animationTime === 200 ? 'cubic-bezier(0.22, 0.9, 0.26, 1) is front-loaded: ≈61% exposure here' : s.animationTime === 600 ? '≈95% exposure; the remaining 5% and the last 0.2% of scale take the second half (the settle)' : i === ad.shots.length - 1 ? 'at rest — identical to the original\'s painted frame' : '', cells: [painted, { src: join(C, 'opening-anim-desktop', s.file), caption: `candidate · desktop · t = ${s.animationTime} ms of 1200` }, am.shots[i] ? { src: join(C, 'opening-anim-mobile', am.shots[i].file), caption: `candidate · phone · t = ${am.shots[i].animationTime} ms` } : null] }));
const n = Math.min(3, bb.length, bc.length);
const burstRows = Array.from({ length: n }, (_, i) => ({ label: `wall-clock sample ${i + 1}`, note: `screenshot REQUESTED at original ${bb[i].ms} ms · candidate ${bc[i].ms} ms after navigation commit; each capture completes ~0.7 s later in this container, so these cannot resolve the move. Shown for one honest reason: sample 1 is the dawn wash on BOTH builds — the planes decode asynchronously and the original also shows the gradient until they land.`, cells: [{ src: join(B, 'opening-desktop', bb[i].file), caption: `original · requested at ${bb[i].ms} ms` }, { src: join(C, 'opening-desktop', bc[i].file), caption: `candidate · requested at ${bc[i].ms} ms` }, null] }));
boards.push({ id: '06-opening-light-up', title: 'The opening light-up · deterministic frames of the 1200 ms settle', subtitle: 'Rows 1–7: the candidate\'s CSS animation (.cdesert-frame, cdesert-arrive) paused at exact animation times after the planes had decoded, desktop 1440×900 and phone 393×852; the left cell is the original\'s painted first frame for reference. Last rows: the wall-clock burst, kept as a caveat about screenshot latency and about what the original itself shows before its planes decode. The live recording (board 07, t = 0 s) caught the same mid-fade frame in real time.', columns: ['Original (painted)', 'Candidate · desktop', 'Candidate · phone'], cellWidth: 460, rows: [...animRows, ...burstRows] });
// motion sequence from the videos (1 fps)
const frames = (dir, cfg) => { const d = join(dir, 'video-' + cfg, 'frames'); return existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.png')).sort() : []; };
for (const [cfg, w, title] of [['desktop-light', 620, 'Desktop 1440×900'], ['mobile-light', 393, 'Phone 393×852']]) {
  const fb = frames(B, cfg), fc = frames(C, cfg); const m = Math.min(fb.length, fc.length);
  boards.push({ id: `07-motion-sequence-${cfg}`, title: `Motion sequence · ${title} · one frame per second of a 12 s human-paced scroll-through`, subtitle: 'Extracted from the Playwright recordings (same scroll curve both sides: 1.2 s hold, eased scroll through the film, 1.2 s past release, 2 s settle). Frame N = second N of the recording. The .mp4 files sit beside this board.', columns: ['Original', 'Candidate'], cellWidth: w, rows: Array.from({ length: m }, (_, i) => ({ label: `t = ${i} s`, note: '', cells: [{ src: join(B, 'video-' + cfg, 'frames', fb[i]), caption: `original · ${i} s` }, { src: join(C, 'video-' + cfg, 'frames', fc[i]), caption: `candidate · ${i} s` }] })) });
}
// direction B prototype
const pb = join(E, 'direction-b'); if (existsSync(join(pb, 'manifest.json'))) {
  const m = JSON.parse(readFileSync(join(pb, 'manifest.json'), 'utf8'));
  const ids = ['open-plate', 'open-slate', 'mid', 'land-plate', 'handoff'];
  boards.push({ id: '08-direction-b-the-plate-prototype', title: 'DIRECTION B · "The Plate" · visual prototype (NOT implemented)', subtitle: 'Rendered by injecting prototype CSS/DOM over the real ORIGINAL build at settled scroll positions, so composition, type and colour are real; the motion between these states is described in CREATIVE_DIRECTION_B.md, not recorded. Columns: desktop light, desktop dark, phone light.', columns: ['Desktop · light', 'Desktop · dark', 'Phone · light'], cellWidth: 460, rows: ids.map((id) => { const d = m['desktop-light'].find((x) => x.file === id + '.png'); return { label: id, note: d?.note || '', cells: [{ src: join(pb, 'desktop-light', id + '.png'), caption: 'desktop · light' }, { src: join(pb, 'desktop-dark', id + '.png'), caption: 'desktop · dark' }, { src: join(pb, 'mobile-light', id + '.png'), caption: 'phone · light' }] }; }) });
}
// the one-page side-by-side board
boards.push({ id: '00-side-by-side-board', title: 'SkyPi Studio · cinematic signature candidate · side-by-side', subtitle: 'The four moments that changed, original vs candidate: the opening (lit vs painted), the landing (credit under the mark), the seam (canvas meets canvas), the phone landing. Full sequences are on boards 01–07; Direction B on 08.', columns: ['Original', 'Candidate'], cellWidth: 620, rows: [
  { label: 'The opening · 600 ms in', note: 'desktop light · the candidate\'s light-up paused at 600 of 1200 ms; the original has no such move', cells: [painted, (() => { const s = ad.shots.find((x) => x.animationTime === 600); return s ? { src: join(C, 'opening-anim-desktop', s.file), caption: 'candidate · animation time 600 ms (≈95% exposure, the long settle still running)' } : null; })()] },
  pair('desktop-light', 'film-p1.00.png', 'The landing', 'desktop light · p = 1.00'),
  pair('desktop-light', 'handoff-+160.png', 'The seam', 'desktop light · +160 px after release'),
  pair('desktop-dark', 'handoff-+160.png', 'The seam · dark', 'desktop dark · +160 px after release'),
  { label: 'Phone landing + seam', note: '393×852 light · p = 1.00 and +160 px', cells: [cell(B, 'mobile-light', 'film-p1.00.png', 'original · p = 1.00'), cell(C, 'mobile-light', 'film-p1.00.png', 'candidate · p = 1.00')] },
  { label: '', note: '', cells: [cell(B, 'mobile-light', 'handoff-+160.png', 'original · +160 px'), cell(C, 'mobile-light', 'handoff-+160.png', 'candidate · +160 px')] },
] });
writeFileSync(args.out, JSON.stringify({ boards }, null, 2));
console.log('[spec]', boards.map((b) => `${b.id} (${b.rows.length} rows)`).join('\n  '));
