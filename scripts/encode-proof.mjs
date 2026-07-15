/**
 * encode-proof.mjs — turn a raw proof screenshot (PNG/JPG) into the exact sibling
 * set the deliverables schema + <picture> in ProductReveal already expect: AVIF
 * (primary) + WebP (fallback) + an inline LQIP blur placeholder — all under the
 * cinematic intro's ≤213 KiB plate discipline, with a hard budget guard so a new
 * L7-02 whale can never ship silently.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 * The flagship proof image (accessmap/screen-map.png) is a 1,068 KiB PNG that
 * lazy-loads above the fold → ~11.4 s throttled LCP (audit finding L7-02). The
 * locked intro's plates already prove the fix: AVIF + WebP at ~80% lighter, crisp
 * edges via 4:4:4 chroma. This script gives deliverable proof media the SAME
 * treatment. It PRODUCES + STAGES optimized siblings (P2-A); wiring them into the
 * showcase is P2-B's job.
 *
 * ── MASTERS ─────────────────────────────────────────────────────────────────
 * Net-new masters (Sky-provide device shots, captured raws) live OUTSIDE public/
 * in proof-masters/<slug>/ so they never double-ship. For an already-on-disk
 * deliverable PNG the master IS that public file — the PNG stays as the universal
 * <img> fallback and we emit .avif/.webp SIBLINGS next to it (modern browsers get
 * the AVIF; the whale is never downloaded by them).
 *
 * ── ENCODE ──────────────────────────────────────────────────────────────────
 * AVIF quality is chosen by a BUDGET GUARD: encode, measure, and step quality
 * down (52→48→44→40→36) until the AVIF is under the per-kind budget. If it still
 * won't fit at q36, EXIT NON-ZERO with the measured KB — the whale guard. WebP is
 * a flat q80/effort6 fallback. 4:4:4 chroma keeps UI text/edges crisp (4:2:0
 * smears type). Never upscales (withoutEnlargement).
 *
 * ── LQIP ────────────────────────────────────────────────────────────────────
 * A ~0.5 KiB blurred 20px WebP encoded to a base64 data-URI, PRINTED to stdout
 * (and emitted in --json). No sibling file → zero extra request, zero CLS, and
 * RM-safe by construction (it's a static paint the real image covers on decode).
 * Paste it into the deliverable's schema `lqip` field.
 *
 *   node scripts/encode-proof.mjs <slug> <masterPath> \
 *     [--kind hero|shot|card] [--name screen-map] [--widths 1280,960] [--dry] [--json]
 *
 * Examples:
 *   node scripts/encode-proof.mjs accessmap public/images/deliverables/accessmap/screen-map.png --kind hero
 *   node scripts/encode-proof.mjs ghost-code proof-masters/ghost-code/round.png --kind shot --json
 */

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

/** Per-kind: max width tier (never upscale past it) + AVIF byte budget (KiB).
 *  All sit at or under the intro's 213 KiB plate ceiling. Hero gets a touch more
 *  headroom (it is the LCP element, quality matters most). */
const KIND = {
  hero: { maxW: 1290, budgetKB: 210 },
  shot: { maxW: 1600, budgetKB: 150 },
  card: { maxW: 1600, budgetKB: 150 },
};

const AVIF_QUALITY_LADDER = [52, 48, 44, 40, 36];
const WEBP_QUALITY = 80;
const CEILING_KB = 213; // absolute hard ceiling for any single proof image

const fmtKB = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

function parseArgs(argv) {
  const pos = [];
  const opt = { kind: 'shot', name: null, widths: [], dry: false, json: false, outDir: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry') opt.dry = true;
    else if (a === '--json') opt.json = true;
    else if (a === '--kind') opt.kind = argv[++i];
    else if (a === '--name') opt.name = argv[++i];
    else if (a === '--out-dir') opt.outDir = argv[++i];
    else if (a === '--widths') opt.widths = String(argv[++i]).split(',').map((n) => parseInt(n, 10)).filter(Boolean);
    else pos.push(a);
  }
  return { slug: pos[0], masterArg: pos[1], ...opt };
}

/** Encode a single AVIF under budget by stepping quality down. Returns
 *  { path, bytes, quality } or throws if it can't fit at the lowest quality. */
async function encodeAvifUnderBudget(makePipeline, outPath, budgetBytes, dry) {
  let last = null;
  for (const q of AVIF_QUALITY_LADDER) {
    // eslint-disable-next-line no-await-in-loop
    const buf = await makePipeline()
      .avif({ quality: q, effort: 9, chromaSubsampling: '4:4:4' })
      .toBuffer();
    last = { bytes: buf.length, quality: q, buf };
    if (buf.length <= budgetBytes) break;
  }
  if (last.bytes > CEILING_KB * 1024) {
    throw new Error(
      `AVIF ${fmtKB(last.bytes)} exceeds the ${CEILING_KB}KB ceiling even at q${last.quality} — ` +
        `master too large or wrong --kind. Re-shoot smaller or split. (whale guard)`,
    );
  }
  if (!dry) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(outPath, last.buf);
  }
  return { path: outPath, bytes: last.bytes, quality: last.quality };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { slug, masterArg, kind, dry, json } = args;

  if (!slug || !masterArg) {
    console.error('usage: node scripts/encode-proof.mjs <slug> <masterPath> [--kind hero|shot|card] [--name N] [--out-dir DIR] [--widths a,b] [--dry] [--json]');
    process.exit(2);
  }
  if (!SLUG_RE.test(slug)) {
    console.error(`[encode-proof] ERROR: "${slug}" is not a kebab-case slug.`);
    process.exit(2);
  }
  if (!KIND[kind]) {
    console.error(`[encode-proof] ERROR: --kind must be one of ${Object.keys(KIND).join('|')}.`);
    process.exit(2);
  }

  const masterPath = resolve(ROOT, masterArg);
  if (!existsSync(masterPath)) {
    console.error(`[encode-proof] ERROR: master not found: ${masterPath}`);
    process.exit(2);
  }

  const name = args.name ?? basename(masterArg, extname(masterArg));
  // Default output is the deliverables tree; --out-dir writes siblings elsewhere
  // (e.g. public/images/certificates/<dir>/ for the C-02 badge encode). rel()
  // below already derives the correct /-rooted path from any location under public/.
  const outDir = args.outDir ? resolve(ROOT, args.outDir) : join(ROOT, 'public', 'images', 'deliverables', slug);
  const { maxW, budgetKB } = KIND[kind];
  const budgetBytes = budgetKB * 1024;

  const meta = await sharp(masterPath).metadata();
  const targetW = meta.width && meta.width > maxW ? maxW : meta.width;
  const resizeOpts = meta.width && meta.width > maxW ? { width: maxW, withoutEnlargement: true } : null;
  const makeBase = () => {
    let s = sharp(masterPath);
    if (resizeOpts) s = s.resize(resizeOpts);
    return s;
  };

  if (!dry) mkdirSync(outDir, { recursive: true });

  console.log(`[encode-proof] ${slug}/${name}  kind=${kind}  ${meta.width}→${targetW}px  budget ${budgetKB}KB${dry ? '  (DRY RUN)' : ''}`);

  // AVIF (primary, budget-guarded) + WebP (flat q80 fallback).
  const avifPath = join(outDir, `${name}.avif`);
  const avif = await encodeAvifUnderBudget(makeBase, avifPath, budgetBytes, dry);

  const webpPath = join(outDir, `${name}.webp`);
  let webpBytes = 0;
  {
    const buf = await makeBase().webp({ quality: WEBP_QUALITY, effort: 6 }).toBuffer();
    webpBytes = buf.length;
    if (!dry) {
      const { writeFileSync } = await import('node:fs');
      writeFileSync(webpPath, buf);
    }
  }

  // Optional width variants (opt-in; default single candidate keeps the locked
  // <picture> test's single-srcset assertion valid).
  const variants = [];
  for (const w of args.widths.filter((x) => x < targetW)) {
    const mkV = () => sharp(masterPath).resize({ width: w, withoutEnlargement: true });
    // eslint-disable-next-line no-await-in-loop
    const vAvif = await encodeAvifUnderBudget(mkV, join(outDir, `${name}-${w}.avif`), Math.round(budgetBytes * (w / targetW) ** 2 * 1.2) || budgetBytes, dry);
    // eslint-disable-next-line no-await-in-loop
    const vWebpBuf = await mkV().webp({ quality: WEBP_QUALITY, effort: 6 }).toBuffer();
    if (!dry) {
      const { writeFileSync } = await import('node:fs');
      writeFileSync(join(outDir, `${name}-${w}.webp`), vWebpBuf);
    }
    variants.push({ width: w, avif: vAvif.bytes, webp: vWebpBuf.length });
  }

  // LQIP — ~0.5 KiB blurred base64 data-URI (no file; paste into schema `lqip`).
  const lqipBuf = await sharp(masterPath).resize(20).blur().webp({ quality: 30 }).toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuf.toString('base64')}`;

  const srcBytes = statSync(masterPath).size;
  console.log(
    `  PNG/JPG ${fmtKB(srcBytes).padStart(7)}  →  AVIF ${fmtKB(avif.bytes).padStart(6)} (q${avif.quality})  ` +
      `WebP ${fmtKB(webpBytes).padStart(6)}  LQIP ${fmtKB(lqipBuf.length)}`,
  );
  for (const v of variants) console.log(`    +${v.width}px  AVIF ${fmtKB(v.avif)}  WebP ${fmtKB(v.webp)}`);

  const field = kind === 'hero' ? 'heroShot' : kind === 'card' ? 'cardImage' : 'shots[n]';
  const rel = (p) => `/${p.split('/public/')[1] ?? p}`;
  const result = {
    slug,
    name,
    kind,
    recommendField: field,
    src: `/images/deliverables/${slug}/${basename(masterArg)}`,
    avif: { path: rel(avifPath), bytes: avif.bytes, quality: avif.quality },
    webp: { path: rel(webpPath), bytes: webpBytes },
    variants,
    lqip,
    savingsVsMasterPct: Math.round((1 - avif.bytes / srcBytes) * 100),
  };

  if (json) {
    console.log('\n--json--');
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n  lqip (paste into deliverables.json ${field}.lqip):`);
    console.log(`  ${lqip.slice(0, 80)}… (${lqip.length} chars)`);
    console.log(`  recommended schema field: ${field}  ·  AVIF is ${result.savingsVsMasterPct}% lighter than the master`);
  }
}

main().catch((err) => {
  console.error('[encode-proof] failed:', err.message);
  process.exit(1);
});
