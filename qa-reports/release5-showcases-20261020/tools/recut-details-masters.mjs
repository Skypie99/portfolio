#!/usr/bin/env node
/**
 * recut-details-masters.mjs — Release 5 detail crops re-cut at MASTER
 * resolution (2880×1800), completing the FACTORY_RECUTS.md handoff.
 *
 *   node qa-reports/release5-showcases-20261020/tools/recut-details-masters.mjs [--dry]
 *
 * Source law:
 *  - The master for each capture is the one content/showcase.manifest.json
 *    records (path + sha256 + dimensions). Relative paths resolve under the
 *    masters bank (SHOWCASE_BANK_ROOT, default the main checkout's
 *    design-reviews/showcase-refresh). The tool never writes to the bank or
 *    the registered project workspaces; they are read-only sources.
 *  - Before any cut it verifies (1) the master's SHA-256 against the
 *    manifest, (2) 2880×1800, and (3) content pairing: the master downscaled
 *    to the shipped capture must match it (greyscale MAE ≤ 4, < 0.5% of
 *    pixels differing by more than 32), so every crop remains a truthful
 *    detail of the exact capture the site ships.
 *  - Crop rectangles are the FACTORY_RECUTS.md master-space boxes (the
 *    shipped-space boxes from details.json scaled ×2.232 or ×1.8). Output
 *    file names are unchanged, so lib/caseShowcase.ts references stand;
 *    their width/height entries track the real file pixels (pinned by
 *    app/__tests__/case-showcase.test.tsx).
 *  - Encoder settings match cut-details.mjs: AVIF quality 56 effort 6,
 *    WebP quality 84.
 *  - Phone-native cuts (r5-team-phone, r5-think-tank-phone, r5-dispatch-phone)
 *    are already at their capture's native resolution and are not re-cut.
 *
 * Writes details.json (updated entries: outSize, master provenance, bytes)
 * beside the outputs.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const DRY = process.argv.includes('--dry');
const BANK_ROOT = process.env.SHOWCASE_BANK_ROOT || '/Users/skypie/Portfolio/design-reviews/showcase-refresh';
const THEMES = ['light', 'dark'];

/**
 * name → { from: shipped file pattern ({theme} substituted), box: shipped-space
 * [left, top, width, height], masterBox: master-space box, note }
 * Boxes: details.json (shipped space) and FACTORY_RECUTS.md (master space).
 */
const CUTS = {
  'prompt-library': {
    'r5-prompt-open': {
      from: 'showcase/prompt-library/prompt-detail.{theme}.desktop.webp',
      scene: { project: 'prompt-library', scene: 'prompt-detail', viewport: 'desktop' },
      box: [288, 228, 1024, 544],
      masterBox: [518, 410, 1843, 979],
      note: 'The opened prompt: preview with {{variables}} on the left, the variable fields and run controls on the right.',
    },
    'r5-prompt-variables': {
      from: 'showcase/prompt-library/prompt-detail.{theme}.desktop.webp',
      scene: { project: 'prompt-library', scene: 'prompt-detail', viewport: 'desktop' },
      box: [792, 372, 520, 400],
      masterBox: [1426, 670, 936, 720],
      note: 'The variables panel only, for the phone reading size.',
    },
    'r5-featured-card': {
      from: 'showcase/prompt-library/home.{theme}.desktop.webp',
      scene: { project: 'prompt-library', scene: 'home', viewport: 'desktop' },
      box: [760, 222, 330, 206],
      masterBox: [1697, 496, 737, 460],
      note: 'The featured prompt card as the library opens: category, title, description and tags (the phone reading size). The 2026-07-31 phone capture of the home was not used: its privacy line predates the truth pass.',
    },
  },
  'claude-corp': {
    'r5-pipeline': {
      from: 'showcase/claude-corp/hero-pipeline.{theme}.desktop.webp',
      scene: { project: 'claude-corp', scene: 'hero-pipeline', viewport: 'desktop' },
      box: [150, 488, 990, 298],
      masterBox: [335, 1089, 2210, 665],
      note: 'The orchestration pipeline band from the public site: Sky, Morgan, 15 roles, Safety, main.',
    },
  },
  'dashboard': {
    'r5-disclosure': {
      from: 'showcase/dashboard/command-center.{theme}.desktop.webp',
      scene: { project: 'dashboard', scene: 'command-center', viewport: 'desktop' },
      box: [200, 0, 1090, 440],
      masterBox: [447, 0, 2433, 982],
      note: 'The demo seam at reading size: the DEMO badge, the dated snapshot, the command center and the synthetic-data banner.',
    },
    'r5-think-tank': {
      from: 'showcase/dashboard/think-tank.{theme}.desktop.webp',
      scene: { project: 'dashboard', scene: 'think-tank', viewport: 'desktop' },
      box: [248, 76, 1352, 754],
      masterBox: [446, 137, 2434, 1357],
      note: 'The Think Tank board without the sidebar: the triage header, project filters and the first two ideas.',
    },
    'r5-dispatch': {
      from: 'showcase/dashboard/dispatch.{theme}.desktop.webp',
      scene: { project: 'dashboard', scene: 'dispatch', viewport: 'desktop' },
      box: [240, 60, 1360, 775],
      masterBox: [432, 108, 2448, 1395],
      note: 'The Dispatch queue without the sidebar: status filters and the first four queued items, whole.',
    },
  },
};

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'showcase.manifest.json'), 'utf8'));

function masterFor(scene, theme) {
  const cap = manifest.captures.find(
    (c) => c.project === scene.project && c.scene === scene.scene && c.theme === theme && c.viewport === scene.viewport && c.files?.master,
  );
  if (!cap) throw new Error(`no manifest master for ${scene.project}/${scene.scene}.${theme}.${scene.viewport}`);
  const abs = cap.files.master.path.startsWith('/') ? cap.files.master.path : path.join(BANK_ROOT, cap.files.master.path);
  return { abs, sha256: cap.files.master.sha256, dims: [cap.files.master.width, cap.files.master.height], capturedAt: cap.capturedAt, projectSha: cap.projectSha };
}

/** Greyscale MAE + share of pixels differing by >32 between two raw buffers. */
function diff(a, b) {
  let sum = 0, big = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]);
    sum += d;
    if (d > 32) big++;
  }
  return { mae: sum / a.length, big: big / a.length };
}

const detailsPath = path.join(ROOT, 'qa-reports', 'release5-showcases-20261020', 'details.json');
const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));

for (const [slug, cuts] of Object.entries(CUTS)) {
  const outDir = path.join(ROOT, 'public', 'images', 'deliverables', slug);
  for (const [name, cut] of Object.entries(cuts)) {
    for (const theme of THEMES) {
      const shippedRel = cut.from.replace('{theme}', theme);
      const shippedAbs = path.join(ROOT, 'public', shippedRel);
      const m = masterFor(cut.scene, theme);
      if (!fs.existsSync(m.abs)) throw new Error(`missing master ${m.abs}`);

      // (1) integrity: the master is byte-identical to the manifest record
      const sha = crypto.createHash('sha256').update(fs.readFileSync(m.abs)).digest('hex');
      if (sha !== m.sha256) throw new Error(`${name} ${theme}: master sha256 mismatch (${sha} != ${m.sha256})`);

      const mm = await sharp(m.abs).metadata();
      // (2) dimensions
      if (mm.width !== m.dims[0] || mm.height !== m.dims[1]) throw new Error(`${name} ${theme}: master is ${mm.width}×${mm.height}, manifest says ${m.dims.join('×')}`);
      const sm = await sharp(shippedAbs).metadata();

      // (3) truth: the master is the source of the shipped capture
      const [mr, sr] = await Promise.all([
        sharp(m.abs).resize(sm.width, sm.height, { fit: 'fill' }).greyscale().raw().toBuffer(),
        sharp(shippedAbs).greyscale().raw().toBuffer(),
      ]);
      const d = diff(mr, sr);
      if (d.mae > 4 || d.big > 0.005) throw new Error(`${name} ${theme}: master does not pair with shipped capture (MAE ${d.mae.toFixed(2)}, ${(d.big * 100).toFixed(2)}% >32)`);
      console.log(`[verify] ${slug}/${name}.${theme}: master sha ok · ${mm.width}×${mm.height} · pairs with shipped (MAE ${d.mae.toFixed(2)})`);

      // crop rectangle arithmetic: the master box must be the shipped box scaled
      const sx = mm.width / sm.width;
      const expect = cut.box.map((v) => Math.round(v * sx));
      const [l, t, w, h] = cut.masterBox;
      for (let i = 0; i < 4; i++) if (Math.abs(expect[i] - cut.masterBox[i]) > 1) throw new Error(`${name} ${theme}: masterBox ${JSON.stringify(cut.masterBox)} off shipped box ×${sx.toFixed(3)} (${JSON.stringify(expect)})`);
      if (l + w > mm.width || t + h > mm.height) throw new Error(`${name} ${theme}: masterBox exceeds ${mm.width}×${mm.height}`);

      const outs = {
        avif: path.join(outDir, `${name}.${theme}.avif`),
        webp: path.join(outDir, `${name}.${theme}.webp`),
      };
      let bytes = null;
      let outSize = [w, h];
      if (!DRY) {
        const base = sharp(m.abs).extract({ left: l, top: t, width: w, height: h });
        await base.clone().avif({ quality: 56, effort: 6 }).toFile(outs.avif);
        await base.clone().webp({ quality: 84 }).toFile(outs.webp);
        outSize = await sharp(outs.webp).metadata().then((x) => [x.width, x.height]);
        bytes = { avif: fs.statSync(outs.avif).size, webp: fs.statSync(outs.webp).size };
      }

      // update the canonical record in place; the shipped-space box and note stand
      const entry = details.outputs.find((o) => o.slug === slug && o.name === name && o.theme === theme);
      if (!entry) throw new Error(`no details.json entry for ${slug}/${name}.${theme}`);
      entry.sourceSize = [sm.width, sm.height];
      entry.outSize = outSize;
      entry.bytes = bytes;
      entry.master = {
        source: m.abs.startsWith(BANK_ROOT) ? path.relative(BANK_ROOT, m.abs) : m.abs,
        sha256: m.sha256,
        sourceSize: [mm.width, mm.height],
        box: cut.masterBox,
        capturedAt: m.capturedAt,
        projectSha: m.projectSha,
        pairingMae: Number(d.mae.toFixed(2)),
      };
      console.log(`[cut] ${slug}/${name}.${theme}: ${outSize.join('×')} from ${path.basename(m.abs)}${bytes ? ` · avif ${bytes.avif} B · webp ${bytes.webp} B` : ' (dry)'}`);
    }
  }
}

details.recut = {
  date: new Date().toISOString().slice(0, 10),
  tool: 'qa-reports/release5-showcases-20261020/tools/recut-details-masters.mjs',
  note: 'Desktop-sourced detail crops re-cut from the manifest-recorded 2880×1800 masters at master resolution (FACTORY_RECUTS.md boxes); phone-native cuts (r5-team-phone, r5-think-tank-phone, r5-dispatch-phone) were already native and stand from the original cut. Entries carry master provenance and the pairing check.',
};
if (!DRY) fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2) + '\n');
console.log(DRY ? '[dry] no files written' : '[done] details.json updated');
