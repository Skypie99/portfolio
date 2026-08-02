/**
 * manifest.mjs — the tracked record of every capture: date, project SHA/branch,
 * theme, viewport, route, alt text, file hashes, budgets, determinism proof.
 *
 * Bank-as-you-go: each project's rows merge-write the moment it banks, so a
 * dead window keeps everything captured so far. Stable sort + date-only stamps
 * keep re-run diffs readable (the overwrite-in-place law applies to rows too:
 * same project+scene+theme+viewport replaces its previous row).
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { BUDGETS, MANIFEST_PATH, SHIP_ROOT } from './registry.mjs';

export const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

export const isoDate = () => new Date().toISOString().slice(0, 10); // date-only; excluded from determinism diffs

// scene already carries the clip identity ('clip:<id>') — keying on clip.id
// again let a FAILED clip attempt (no clip payload) survive beside its later
// successful row instead of being replaced. One key axis, replace-by-scene.
const rowKey = (r) => [r.project, r.scene, r.theme, r.viewport].join('|');

export function emptyManifest() {
  return {
    schema: 'showcase-manifest/1',
    generatedAt: null,
    factory: {
      script: 'scripts/capture-showcase.mjs',
      engine: 'playwright-core 1.61.1 / chromium-1228 (Chromium — Safari/WebKit stays a device gate)',
      encoders: 'ffmpeg-static 6.0 (libx264 + libvpx-vp9) + sharp 0.34.5',
    },
    projects: {},
    captures: [],
    budget: null,
    determinismProof: null,
  };
}

export function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return emptyManifest();
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

export function writeManifest(m) {
  m.generatedAt = isoDate();
  m.captures.sort((a, b) => rowKey(a).localeCompare(rowKey(b)));
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n');
  return m;
}

/** Merge one project's fresh rows (replace-by-key) + its meta block, then write. */
export function bankProject(projectMeta, rows) {
  const m = readManifest();
  m.projects[projectMeta.slug] = { ...m.projects[projectMeta.slug], ...projectMeta, bankedAt: isoDate() };
  const fresh = new Set(rows.map(rowKey));
  m.captures = m.captures.filter((r) => r.project !== projectMeta.slug || !fresh.has(rowKey(r)));
  m.captures.push(...rows);
  m.budget = computeBudget(m);
  return writeManifest(m);
}

/** The stated arithmetic: shipped bytes by class vs the budgets, plus tree total. */
export function computeBudget(m) {
  const sum = { stillAvif: 0, stillWebp: 0, clipMp4: 0, clipWebm: 0, poster: 0, files: 0 };
  const max = { stillAvifKB: 0, clipMp4KB: 0 };
  for (const r of m.captures) {
    for (const f of r.files?.shipped ?? []) {
      sum.files += 1;
      if (f.path.endsWith('.avif')) {
        if (f.path.includes('-poster')) sum.poster += f.bytes;
        else { sum.stillAvif += f.bytes; max.stillAvifKB = Math.max(max.stillAvifKB, f.bytes / 1024); }
      } else if (f.path.endsWith('.webp') || f.path.endsWith('.jpg')) {
        if (f.path.includes('-poster')) sum.poster += f.bytes; else sum.stillWebp += f.bytes;
      }
    }
    if (r.clip) {
      if (r.clip.mp4?.bytes) { sum.files += 1; sum.clipMp4 += r.clip.mp4.bytes; max.clipMp4KB = Math.max(max.clipMp4KB, r.clip.mp4.bytes / 1024); }
      if (r.clip.webm?.bytes) { sum.files += 1; sum.clipWebm += r.clip.webm.bytes; }
      for (const p of r.clip.posters ?? []) { sum.files += 1; sum.poster += p.bytes; }
    }
  }
  const treeBytes = dirBytes(SHIP_ROOT);
  const mb = (b) => Math.round((b / 1024 / 1024) * 100) / 100;
  return {
    shipped: {
      files: sum.files,
      stillAvifMB: mb(sum.stillAvif),
      stillFallbackMB: mb(sum.stillWebp),
      clipMp4MB: mb(sum.clipMp4),
      clipWebmMB: mb(sum.clipWebm),
      posterMB: mb(sum.poster),
    },
    maxStillAvifKB: Math.round(max.stillAvifKB),
    maxClipMp4KB: Math.round(max.clipMp4KB),
    treeTotalMB: mb(treeBytes),
    targetMB: BUDGETS.shipTotalTargetMB,
    hardCapMB: BUDGETS.shipTotalHardCapMB,
    withinTarget: treeBytes <= BUDGETS.shipTotalTargetMB * 1024 * 1024,
    withinHardCap: treeBytes <= BUDGETS.shipTotalHardCapMB * 1024 * 1024,
  };
}

export function dirBytes(root) {
  if (!fs.existsSync(root)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(root, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) total += fs.statSync(path.join(entry.parentPath ?? entry.path, entry.name)).size;
  }
  return total;
}

export function printBudget(b) {
  if (!b) return;
  const s = b.shipped;
  console.log(
    `[budget] stills: ${s.stillAvifMB} MB avif + ${s.stillFallbackMB} MB fallback · clips: ${s.clipMp4MB} MB mp4 + ${s.clipWebmMB} MB webm · posters: ${s.posterMB} MB · max avif ${b.maxStillAvifKB} KB (cap ${BUDGETS.stillAvifKB}) · max mp4 ${b.maxClipMp4KB} KB (cap ${BUDGETS.clipMp4KB})`,
  );
  console.log(
    `[budget] public/showcase total ${b.treeTotalMB} MB — target ≤${b.targetMB} MB ${b.withinTarget ? 'OK' : 'OVER'} · hard cap ${b.hardCapMB} MB ${b.withinHardCap ? 'OK' : 'BREACHED'}`,
  );
}

/**
 * Determinism comparator — run 2 re-captures masters into a mirror; the diff is
 * per-class: file set + dimensions MUST match everywhere; sha256 must match for
 * seeded-byte; drift is WARN for byte-expected/demo-snapshot and expected for
 * structural (live data). Returns { result, checked, drift, missing }.
 */
export function compareRuns(rowsA, rowsB, classesBySlug) {
  const byKey = new Map(rowsB.map((r) => [rowKey(r), r]));
  const drift = [];
  const missing = [];
  let checked = 0;
  for (const a of rowsA) {
    const b = byKey.get(rowKey(a));
    if (!b) { missing.push(rowKey(a)); continue; }
    checked += 1;
    const am = a.files?.master, bm = b.files?.master;
    if (!am || !bm) continue;
    const cls = a.determinism || classesBySlug[a.project] || 'structural';
    if (am.width !== bm.width || am.height !== bm.height) {
      drift.push({ key: rowKey(a), kind: 'DIMENSIONS', a: `${am.width}×${am.height}`, b: `${bm.width}×${bm.height}`, class: cls, fatal: true });
    } else if (am.sha256 !== bm.sha256) {
      const fatal = cls === 'seeded-byte';
      const warn = cls === 'byte-expected' || cls === 'demo-snapshot';
      if (fatal || warn) drift.push({ key: rowKey(a), kind: 'BYTES', class: cls, fatal });
    }
  }
  const fatal = drift.some((d) => d.fatal) || missing.length > 0;
  return { result: fatal ? 'FAIL' : 'PASS', checked, drift, missing };
}
