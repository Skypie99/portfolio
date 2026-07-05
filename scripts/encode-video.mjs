/**
 * encode-video.mjs — turn a raw screen-recording (MOV/MP4/WebM) into the web-lean
 * proof-video sibling set: MP4 (H.264 +faststart) + WebM (VP9) + a poster still
 * (AVIF/WebP/JPG, run through the same sharp discipline as encode-proof.mjs).
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 * The "See it in motion" case-study slots can carry an actual short loop of a
 * product (Sky's directed extension beyond the report's stills). The a11y rail is
 * ABSOLUTE: the shipped <video> is poster-first, muted, playsInline, with a play
 * affordance; JS opts into autoplay ONLY when prefers-reduced-motion is unset
 * (that gating lives in ProductReveal, not here). This script only PRODUCES the
 * budget-checked media + poster; it stages, it does not wire (P2-B wires).
 *
 * ── BUDGET (the rail: never commit a heavy asset) ───────────────────────────
 * Target ≤3 MB per clip; poster ≤100 KB. If the encoded MP4 blows the ceiling,
 * outputs are written to the EVIDENCE dir (not public/) and the script exits
 * non-zero with an EXTERNAL-HOST recommendation — a heavy video can never land in
 * the shipped tree by accident.
 *
 * ── AUDIO ───────────────────────────────────────────────────────────────────
 * Proof clips ship SILENT (-an). Meaning is carried by the poster + caption/alt,
 * never by sound (and never by autoplay). If a .vtt is supplied it is staged and
 * a <track kind=captions> is wired by the component; else a NEEDS-CAPTIONS flag
 * is emitted (a text alt/label is always required at wire time).
 *
 *   node scripts/encode-video.mjs <slug> <masterPath> \
 *     [--name loop] [--width 1280] [--seconds 8] [--poster-at 1.0] \
 *     [--captions path.vtt] [--dry] [--json]
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, statSync, rmSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const VIDEO_CEILING_MB = 3;
const POSTER_BUDGET_KB = 100;

const fmtKB = (b) => `${(b / 1024).toFixed(0)}KB`;
const fmtMB = (b) => `${(b / 1024 / 1024).toFixed(2)}MB`;

function parseArgs(argv) {
  const pos = [];
  const o = { name: null, width: 1280, seconds: null, posterAt: 1.0, captions: null, dry: false, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry') o.dry = true;
    else if (a === '--json') o.json = true;
    else if (a === '--name') o.name = argv[++i];
    else if (a === '--width') o.width = parseInt(argv[++i], 10);
    else if (a === '--seconds') o.seconds = parseFloat(argv[++i]);
    else if (a === '--poster-at') o.posterAt = parseFloat(argv[++i]);
    else if (a === '--captions') o.captions = argv[++i];
    else pos.push(a);
  }
  return { slug: pos[0], masterArg: pos[1], ...o };
}

function ff(args) {
  execFileSync(ffmpegPath, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  const { slug, masterArg, width, dry, json } = a;

  if (!slug || !masterArg) {
    console.error('usage: node scripts/encode-video.mjs <slug> <masterPath> [--name N] [--width W] [--seconds S] [--poster-at T] [--captions f.vtt] [--dry] [--json]');
    process.exit(2);
  }
  if (!SLUG_RE.test(slug)) { console.error(`[encode-video] ERROR: "${slug}" is not a kebab-case slug.`); process.exit(2); }
  const masterPath = resolve(ROOT, masterArg);
  if (!existsSync(masterPath)) { console.error(`[encode-video] ERROR: master not found: ${masterPath}`); process.exit(2); }
  if (!ffmpegPath) { console.error('[encode-video] ERROR: ffmpeg-static did not resolve a binary.'); process.exit(1); }

  const name = a.name ?? basename(masterArg, extname(masterArg));
  const publicDir = join(ROOT, 'public', 'images', 'deliverables', slug);
  const evidenceDir = join(ROOT, 'design-reviews', 'uplift', 'assets', 'p2a', 'oversize', slug);
  const trim = a.seconds ? ['-t', String(a.seconds)] : [];
  // even dimensions required by H.264/VP9; scale width, keep AR, round height.
  const scale = `scale=${width}:-2:flags=lanczos`;

  console.log(`[encode-video] ${slug}/${name}  width=${width}  ceiling=${VIDEO_CEILING_MB}MB${dry ? '  (DRY RUN)' : ''}`);
  if (dry) { console.log('  (dry) would emit mp4 + webm + poster.{avif,webp,jpg}'); return; }

  mkdirSync(publicDir, { recursive: true });
  const tmpMp4 = join(publicDir, `${name}.mp4`);
  const tmpWebm = join(publicDir, `${name}.webm`);
  const tmpFrame = join(publicDir, `${name}.__poster.png`);

  // MP4 — H.264, faststart (moov atom up front for progressive play), silent.
  ff([...trim, '-i', masterPath, '-vf', scale, '-c:v', 'libx264', '-profile:v', 'high', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', tmpMp4]);
  // WebM — VP9, CRF mode, silent.
  ff([...trim, '-i', masterPath, '-vf', scale, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-an', tmpWebm]);
  // Poster frame → PNG → sharp → AVIF/WebP/JPG under budget.
  ff(['-ss', String(a.posterAt), '-i', masterPath, '-frames:v', '1', '-vf', scale, tmpFrame]);

  const posterAvif = join(publicDir, `${name}-poster.avif`);
  const posterWebp = join(publicDir, `${name}-poster.webp`);
  const posterJpg = join(publicDir, `${name}-poster.jpg`);
  let pQ = 60;
  let posterAvifBytes = 0;
  for (const q of [60, 54, 48, 42, 36]) {
    // eslint-disable-next-line no-await-in-loop
    const buf = await sharp(tmpFrame).avif({ quality: q, effort: 9, chromaSubsampling: '4:4:4' }).toBuffer();
    pQ = q; posterAvifBytes = buf.length;
    if (buf.length <= POSTER_BUDGET_KB * 1024) { const { writeFileSync } = await import('node:fs'); writeFileSync(posterAvif, buf); break; }
    if (q === 36) { const { writeFileSync } = await import('node:fs'); writeFileSync(posterAvif, buf); }
  }
  await sharp(tmpFrame).webp({ quality: 80, effort: 6 }).toFile(posterWebp);
  await sharp(tmpFrame).jpeg({ quality: 72, mozjpeg: true }).toFile(posterJpg);
  rmSync(tmpFrame, { force: true });

  const mp4Bytes = statSync(tmpMp4).size;
  const webmBytes = statSync(tmpWebm).size;
  const over = mp4Bytes > VIDEO_CEILING_MB * 1024 * 1024 || webmBytes > VIDEO_CEILING_MB * 1024 * 1024;

  // Captions
  let captionsRel = null;
  if (a.captions) {
    const cp = resolve(ROOT, a.captions);
    if (existsSync(cp)) { copyFileSync(cp, join(publicDir, `${name}.vtt`)); captionsRel = `/images/deliverables/${slug}/${name}.vtt`; }
    else console.error(`[encode-video] WARN: captions file not found: ${cp}`);
  }

  console.log(`  MP4 ${fmtMB(mp4Bytes)}  WebM ${fmtMB(webmBytes)}  poster AVIF ${fmtKB(posterAvifBytes)} (q${pQ}) + webp + jpg`);
  if (!captionsRel) console.log('  ⚠ NEEDS-CAPTIONS — supply a .vtt via --captions before wiring (a text alt is always required).');

  const rel = (p) => `/images/deliverables/${slug}/${basename(p)}`;
  const result = {
    slug, name,
    video: { mp4: rel(tmpMp4), webm: rel(tmpWebm), poster: rel(posterAvif), captions: captionsRel },
    posterBytes: { avif: posterAvifBytes },
    videoBytes: { mp4: mp4Bytes, webm: webmBytes },
    overBudget: over,
  };

  if (over) {
    // Rail: never commit a heavy asset. Relocate to evidence + fail loudly.
    mkdirSync(evidenceDir, { recursive: true });
    for (const f of [tmpMp4, tmpWebm, posterAvif, posterWebp, posterJpg]) {
      if (existsSync(f)) { copyFileSync(f, join(evidenceDir, basename(f))); rmSync(f, { force: true }); }
    }
    console.error(`\n[encode-video] OVER BUDGET (>${VIDEO_CEILING_MB}MB) — moved to ${evidenceDir}.`);
    console.error('  → EXTERNAL-HOST this clip (CDN/Vercel) or shorten/downscale it; do NOT commit to public/.');
    if (json) console.log(JSON.stringify({ ...result, staged: 'evidence' }, null, 2));
    process.exit(1);
  }

  if (json) { console.log('\n--json--'); console.log(JSON.stringify(result, null, 2)); }
  else console.log(`  staged in public/ — wire via deliverables.json <shot>.video (P2-B).`);
}

main().catch((err) => { console.error('[encode-video] failed:', err.message); process.exit(1); });
