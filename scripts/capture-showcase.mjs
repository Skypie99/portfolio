#!/usr/bin/env node
/**
 * capture-showcase.mjs — the one command that refreshes every project's
 * showcase imagery: build/serve each repo at its pinned SHA, photograph the
 * registry's scenes in BOTH themes at phone+desktop, record the flagship
 * clips, encode through the repo's own budget-guarded pipeline, and bank a
 * SHA-stamped manifest. Re-runs overwrite in place (stable names) — the
 * factory is the deliverable; the photos are its output.
 *
 *   node scripts/capture-showcase.mjs                  # full run, priority order
 *     [--project flagstone[,ghost-code]] [--scene map-overview]
 *     [--theme light|dark] [--stills-only] [--clips-only]
 *     [--resume]   reuse existing masters, re-encode + re-bank
 *     [--verify]   re-capture masters into a mirror + determinism diff
 *     [--dry]      print the resolved job plan, touch nothing
 *     [--headed]   headless off (frozen-animation retry aid)
 *
 * Safety: guest-only, read-only on every app; the driver refuses terminal
 * mutating controls and aborts non-GET Supabase calls (see driver.mjs).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import {
  BANK_ROOT, MASTERS_ROOT, RECEIPTS_ROOT, PROJECTS, VIEWPORTS,
} from './showcase/registry.mjs';
import { bankProject, compareRuns, isoDate, printBudget, readManifest, writeManifest } from './showcase/manifest.mjs';
import { launchBrowser, makeContext, runNav, settleTheme, shoot, assertNoViolations } from './showcase/driver.mjs';
import { runBuild, startServer, startStaticServer, stopServer, waitReady, portInUse } from './showcase/servers.mjs';
import { addWorktree, copyEnv, describeRepoState, linkNodeModules, mainMatchesOrigin, removeWorktree, resolveSha } from './showcase/worktree.mjs';
import { encodeClip, encodeStill, masterInfo } from './showcase/media.mjs';

const require = createRequire(import.meta.url);
const ffmpegPath = require('ffmpeg-static');

function parseArgs(argv) {
  const o = { projects: null, scene: null, theme: null, stillsOnly: false, clipsOnly: false, resume: false, verify: false, dry: false, headed: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--project') o.projects = argv[++i].split(',');
    else if (a === '--scene') o.scene = argv[++i];
    else if (a === '--theme') o.theme = argv[++i];
    else if (a === '--stills-only') o.stillsOnly = true;
    else if (a === '--clips-only') o.clipsOnly = true;
    else if (a === '--resume') o.resume = true;
    else if (a === '--verify') o.verify = true;
    else if (a === '--dry') o.dry = true;
    else if (a === '--headed') o.headed = true;
    else { console.error(`unknown arg ${a}`); process.exit(2); }
  }
  return o;
}

function preflight() {
  const checks = [];
  const { chromium } = require('playwright-core');
  checks.push(['playwright-core', !!chromium]);
  checks.push(['chromium executable', fs.existsSync(chromium.executablePath())]);
  try {
    execFileSync(ffmpegPath, ['-version'], { stdio: 'ignore' });
    checks.push(['ffmpeg-static', true]);
  } catch { checks.push(['ffmpeg-static', false]); }
  try { require('sharp'); checks.push(['sharp', true]); } catch { checks.push(['sharp', false]); }
  const failed = checks.filter(([, ok]) => !ok);
  console.log(`[preflight] ${checks.map(([n, ok]) => `${n}:${ok ? 'ok' : 'MISSING'}`).join('  ')}`);
  if (failed.length) throw new Error(`preflight failed: ${failed.map(([n]) => n).join(', ')} (installs are forbidden — fix the environment by hand)`);
}

const themesFor = (scene, only) => {
  const list = scene.themes === 'matte' ? ['matte'] : ['light', 'dark'];
  return only ? list.filter((t) => t === only) : list;
};

/** Resolve where a project's servable tree comes from (worktree vs in place). */
async function resolveSource(project, notes) {
  if (project.source.kind === 'live') {
    const sha = resolveSha(project.repo, project.source.shaRef ?? 'origin/main');
    notes.push(`captured from the LIVE deployment at ${project.source.url} (local build impossible: missing dep, installs forbidden); sha recorded from ${project.source.shaRef ?? 'origin/main'}`);
    return { rootDir: null, sha, branch: project.source.shaRef ?? 'origin/main', worktree: null, decision: 'live-capture' };
  }
  if (project.source.kind === 'inplace') {
    const state = describeRepoState(project.repo);
    const pinned = project.source.sha;
    if (pinned && !state.head.startsWith(pinned)) notes.push(`HEAD ${state.head} ≠ pinned ${pinned} — captured HEAD, recorded`);
    if (state.dirtyTracked > 0) notes.push(`${state.dirtyTracked} tracked file(s) modified in checkout (doc-level dirt tolerated, recorded)`);
    return { rootDir: project.repo, sha: resolveSha(project.repo, 'HEAD'), branch: state.branch, worktree: null, decision: 'inplace' };
  }
  // worktree
  let ref = project.source.ref;
  if (project.slug === 'dashboard') {
    const match = mainMatchesOrigin(project.repo);
    if (match === false) notes.push('main ≠ origin/main at run time — captured local main tip per the most-advanced-committed-tip policy');
  }
  const sha = resolveSha(project.repo, ref);
  const wt = addWorktree(project.repo, ref, project.slug);
  return { rootDir: wt.dest, sha, branch: ref, worktree: wt, decision: 'sky-pinned' };
}

/** Build + serve; returns { server, baseUrl, teardownExtra } */
async function buildAndServe(project, src, notes) {
  const b = project.build ?? { kind: 'none' };
  if (b.kind === 'live') {
    return { server: null, baseUrl: project.source.url };
  }
  const port = project.serve.port;
  if (await portInUse(port)) throw new Error(`port ${port} already in use — refusing to squat`);

  if (b.kind === 'none') {
    const dir = project.serve.dir ? path.join(src.rootDir, project.serve.dir) : src.rootDir;
    const server = startStaticServer(dir, port);
    await waitReady(`http://127.0.0.1:${port}/`, { handle: server });
    return { server, baseUrl: `http://127.0.0.1:${port}` };
  }

  if (b.kind === 'expo-export') {
    if (b.linkNodeModules) linkNodeModules(project.repo, src.rootDir);
    if (b.needsEnv) {
      const env = copyEnv(project.repo, src.rootDir);
      if (!env) throw new Error('.env missing in source repo — web build would die at module scope');
    }
    const outDir = path.join(src.rootDir, 'dist-showcase');
    await runBuild(b.cmd[0], [...b.cmd.slice(1), outDir], { cwd: src.rootDir, timeoutMs: b.timeoutMs, name: `${project.slug}-export` });
    const server = startStaticServer(outDir, port);
    await waitReady(`http://127.0.0.1:${port}/`, { handle: server });
    return { server, baseUrl: `http://127.0.0.1:${port}` };
  }

  if (b.kind === 'next-build') {
    await runBuild(b.cmd[0], b.cmd.slice(1), { cwd: src.rootDir, timeoutMs: b.timeoutMs, name: `${project.slug}-build` });
    const dir = path.join(src.rootDir, b.outDir);
    const server = startStaticServer(dir, port);
    await waitReady(`http://127.0.0.1:${port}/`, { handle: server });
    return { server, baseUrl: `http://127.0.0.1:${port}` };
  }

  if (b.kind === 'next-demo-server') {
    const appCwd = project.appDir ? path.join(src.rootDir, project.appDir) : src.rootDir;
    if (b.linkNodeModules) linkNodeModules(project.repo, src.rootDir, project.appDir);
    await runBuild(b.buildCmd[0], b.buildCmd.slice(1), { cwd: appCwd, env: b.env, timeoutMs: b.timeoutMs, name: `${project.slug}-build` });
    const server = startServer(b.startCmd[0], b.startCmd.slice(1), { cwd: appCwd, env: b.env, name: `${project.slug}:${port}` });
    await waitReady(`http://127.0.0.1:${port}/`, { timeoutMs: 90_000, handle: server });
    return { server, baseUrl: `http://127.0.0.1:${port}` };
  }

  throw new Error(`unknown build kind ${b.kind}`);
}

/** Extract 3 frames from a raw recording; identical frames = frozen animation. */
function recordingHasMotion(rawPath) {
  const tmp = path.join(path.dirname(rawPath), '.probe');
  fs.mkdirSync(tmp, { recursive: true });
  const hashes = [];
  for (const pct of [0.2, 0.5, 0.8]) {
    const out = path.join(tmp, `f${pct}.png`);
    try {
      execFileSync(ffmpegPath, ['-y', '-v', 'error', '-ss', String(pct * 3), '-i', rawPath, '-frames:v', '1', out], { stdio: 'ignore' });
      hashes.push(fs.readFileSync(out).length + ':' + fs.readFileSync(out).subarray(0, 4096).toString('base64'));
    } catch { /* short clip; partial probe is fine */ }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return new Set(hashes).size > 1;
}

async function captureStills({ project, src, baseUrl, browser, args, mastersRoot, rows }) {
  for (const scene of project.scenes) {
    if (args.scene && scene.id !== args.scene) continue;
    if (scene.onlyOn && !scene.onlyOn.some((m) => src.sha.startsWith(m) || src.branch === m)) {
      rows.push(baseRow(project, src, scene.id, 'skipped', 'skipped', scene, ['SKIPPED-ON-THIS-SHA']));
      continue;
    }
    for (const theme of themesFor(scene, args.theme)) {
      for (const vpName of scene.viewports) {
        const stem = `${scene.id}.${theme}.${vpName}`;
        const masterPath = path.join(mastersRoot, project.slug, `${stem}.png`);
        fs.mkdirSync(path.dirname(masterPath), { recursive: true });
        const exists = fs.existsSync(masterPath);
        if (!(args.resume && exists)) {
          // Per-scene isolation: one scene failing must never kill the project.
          // On failure, bank a FAILED frame + the page's accessible names so the
          // fix is a diagnosis, not a guess — then continue.
          const ctx = await makeContext(browser, project, { theme, viewport: VIEWPORTS[vpName] });
          try {
            const page = await ctx.newPage();
            await page.goto(baseUrl + (scene.path ?? '/'), { waitUntil: 'networkidle', timeout: 120_000 }).catch(async () => {
              await page.goto(baseUrl + (scene.path ?? '/'), { waitUntil: 'load', timeout: 60_000 });
            });
            await settleTheme(page, project, theme);
            if (project.readyText) await page.getByText(project.readyText, { exact: false }).first().waitFor({ timeout: 30_000 }).catch(() => {});
            try {
              await runNav(page, ctx, scene.nav ?? []);
              await shoot(page, masterPath, { settleMs: scene.settle ?? 450 });
              assertNoViolations(ctx, `${project.slug}/${stem}`);
            } catch (err) {
              await page.screenshot({ path: masterPath.replace(/\.png$/, '.FAILED.png') }).catch(() => {});
              const aria = await page
                .evaluate(() =>
                  Array.from(document.querySelectorAll('button,[role="button"],a,[role="tab"],[aria-label]'))
                    .map((el) => ({
                      label: el.getAttribute('aria-label'),
                      text: (el.textContent || '').trim().slice(0, 60),
                      role: el.getAttribute('role') || el.tagName.toLowerCase(),
                    }))
                    .filter((x) => x.label || x.text)
                    .slice(0, 120),
                )
                .catch(() => []);
              fs.writeFileSync(masterPath.replace(/\.png$/, '.FAILED.aria.json'), JSON.stringify(aria, null, 1));
              rows.push({ ...baseRow(project, src, scene.id, theme, vpName, scene, ['FAILED']), error: String(err.message).slice(0, 200) });
              console.log(`  [still] ${project.slug}/${stem} FAILED — ${String(err.message).split('\n')[0].slice(0, 110)}`);
              continue;
            }
          } finally {
            await ctx.close();
          }
        }
        const master = await masterInfo(masterPath);
        const row = baseRow(project, src, scene.id, theme, vpName, scene, [...(scene.flags ?? [])]);
        row.files = { master };
        // Verify mode compares masters ONLY — it must never re-encode into the
        // shipped tree (run 2's animation-pixel drift would silently replace
        // the canonical, manifest-recorded assets).
        if (scene.ship && !args.verify) {
          try {
            const enc = encodeStill({ slug: project.slug, stem, kind: scene.shipKind ?? 'shot', masterPath });
            row.files.shipped = enc.shipped;
            row.files.lqip = enc.lqip;
          } catch (err) {
            row.flags.push('MASTERS-ONLY');
            row.encodeError = String(err.message).slice(0, 300);
          }
        }
        rows.push(row);
        console.log(`  [still] ${project.slug}/${stem} ${row.flags.join(',') || 'ok'}`);
      }
    }
  }
}

async function captureClips({ project, src, baseUrl, browser, args, mastersRoot, rows }) {
  for (const clip of project.clips ?? []) {
    if (args.scene && clip.id !== args.scene) continue;
    for (const theme of clip.themes.filter((t) => !args.theme || t === args.theme)) {
      try {
      const stem = `${clip.id}.${theme}.phone`;
      const clipDir = path.join(mastersRoot, project.slug, 'clips');
      fs.mkdirSync(clipDir, { recursive: true });
      const rawPath = path.join(clipDir, `${stem}.raw.webm`);
      let marks = {};
      if (!(args.resume && fs.existsSync(rawPath))) {
        const videoTmp = path.join(clipDir, '.rec');
        fs.mkdirSync(videoTmp, { recursive: true });
        const ctx = await makeContext(browser, project, { theme, viewport: VIEWPORTS.phone, dsf: 1, recordVideoDir: videoTmp });
        let videoRef = null;
        try {
          const page = await ctx.newPage();
          videoRef = page.video();
          await page.goto(baseUrl + '/', { waitUntil: 'networkidle', timeout: 120_000 }).catch(() => {});
          await settleTheme(page, project, theme);
          if (project.readyText) await page.getByText(project.readyText, { exact: false }).first().waitFor({ timeout: 30_000 }).catch(() => {});
          await runNav(page, ctx, clip.pre ?? []);
          marks = await runNav(page, ctx, clip.drive);
          assertNoViolations(ctx, `${project.slug}/${stem}`);
        } finally {
          await ctx.close();
        }
        const recPath = videoRef ? await videoRef.path() : null;
        if (!recPath || !fs.existsSync(recPath)) throw new Error(`no recording produced for ${stem}`);
        fs.copyFileSync(recPath, rawPath);
        fs.rmSync(path.dirname(recPath), { recursive: true, force: true });
        fs.writeFileSync(`${rawPath}.marks.json`, JSON.stringify(marks));
      } else if (fs.existsSync(`${rawPath}.marks.json`)) {
        marks = JSON.parse(fs.readFileSync(`${rawPath}.marks.json`, 'utf8'));
      }

      if (!recordingHasMotion(rawPath)) {
        rows.push({ ...baseRow(project, src, `clip:${clip.id}`, theme, 'phone', clip, ['DROPPED-FROZEN']), clip: { id: clip.id } });
        console.log(`  [clip] ${stem} DROPPED — frames frozen (re-try with --headed)`);
        continue;
      }

      const gs = (marks.gestureStart ?? 800) / 1000;
      const ge = (marks.gestureEnd ?? gs * 1000 + clip.targetS * 1000) / 1000;
      const startS = Math.max(0, gs - 0.4);
      const seconds = Math.min(Math.max(ge - gs + 1.2, 3), (clip.targetS ?? 6) + 2);
      const posterAt = clip.posterAt === 'end' ? Math.max(0.2, seconds - 0.3) : clip.posterAt ?? 1.0;

      const row = { ...baseRow(project, src, `clip:${clip.id}`, theme, 'phone', clip, [...(clip.flags ?? [])]) };
      row.files = { master: await rawFileInfo(rawPath) };
      try {
        const enc = encodeClip({ slug: project.slug, stem, masterPath: rawPath, startS, seconds, posterAt });
        row.clip = { id: clip.id, durationS: Math.round(seconds * 10) / 10, trim: { rawStartS: Math.round(startS * 10) / 10 }, ...enc };
        if (enc.webm === null && enc.webmDropReason) row.flags.push('WEBM-DROPPED');
      } catch (err) {
        row.flags.push('MASTERS-ONLY');
        row.encodeError = String(err.message).slice(0, 300);
        row.clip = { id: clip.id };
      }
      rows.push(row);
      console.log(`  [clip] ${stem} ${row.flags.join(',') || 'ok'}`);
      } catch (err) {
        rows.push({ ...baseRow(project, src, `clip:${clip.id}`, theme, 'phone', clip, ['FAILED']), error: String(err.message).slice(0, 200) });
        console.log(`  [clip] ${clip.id}.${theme} FAILED — ${String(err.message).split('\n')[0].slice(0, 110)}`);
      }
    }
  }
}

async function rawFileInfo(file) {
  const { createHash } = await import('node:crypto');
  return {
    path: path.relative(BANK_ROOT, file),
    sha256: createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    bytes: fs.statSync(file).size,
  };
}

function baseRow(project, src, scene, theme, viewport, spec, flags) {
  return {
    project: project.slug,
    projectSha: src.sha,
    projectBranch: src.branch,
    scene,
    capturedAt: isoDate(),
    theme,
    viewport,
    route: spec.path ?? '/',
    altText: spec.alt,
    determinism: spec.determinism ?? project.determinism,
    flags,
  };
}

async function runProject(project, args, { mastersRoot }) {
  console.log(`\n[${project.slug}] priority ${project.priority} — ${project.title}`);
  const notes = [];
  let src = null;
  let served = null;
  let browser = null;
  const rows = [];
  try {
    if (args.dry) {
      // No side effects in dry mode: resolve the SHA without creating worktrees.
      const ref = project.source.kind === 'inplace' ? 'HEAD' : project.source.ref;
      const sha = resolveSha(project.repo, ref);
      const jobs = project.scenes.flatMap((s) => themesFor(s, args.theme).flatMap((t) => s.viewports.map((v) => `${s.id}.${t}.${v}`)));
      console.log(`  would capture @ ${sha.slice(0, 7)} (${ref}) via ${project.source.kind}: ${jobs.join(', ')}${project.clips?.length ? ` + clips ${project.clips.map((c) => c.id).join(',')}` : ''}`);
      return { ok: true, dry: true };
    }

    src = await resolveSource(project, notes);

    try {
      served = await buildAndServe(project, src, notes);
    } catch (err) {
      const fb = project.source.fallback;
      if (!fb) throw err;
      console.log(`  [fallback] ${err.message.split('\n')[0]} → retrying at ${fb.ref} ${fb.sha}`);
      notes.push(`exploratory build at ${src.sha.slice(0, 7)} failed → fallback ${fb.sha} (${fb.note}); drops: ${fb.drops?.join(',') ?? 'none'}`);
      if (src.worktree) removeWorktree(project.repo, src.worktree.dest);
      const sha = resolveSha(project.repo, fb.ref);
      const wt = addWorktree(project.repo, fb.ref, project.slug);
      src = { rootDir: wt.dest, sha, branch: fb.ref, worktree: wt, decision: 'fallback-main' };
      served = await buildAndServe(project, src, notes);
    }

    browser = await launchBrowser({ headless: !args.headed });
    if (!args.clipsOnly) await captureStills({ project, src, baseUrl: served.baseUrl, browser, args, mastersRoot, rows });
    if (!args.stillsOnly && !args.verify) await captureClips({ project, src, baseUrl: served.baseUrl, browser, args, mastersRoot, rows });

    if (!args.verify) {
      const banked = bankProject(
        {
          slug: project.slug,
          repo: project.repo,
          projectBranch: src.branch,
          projectSha: src.sha,
          shaDecision: src.decision,
          determinism: project.determinism,
          bankOnly: !!project.bankOnly,
          needsDevice: project.needsDevice ?? [],
          notes,
        },
        rows.filter((r) => r.theme !== 'skipped'),
      );
      printBudget(banked.budget);
    }
    console.log(`[${project.slug}] BANKED ${rows.length} rows @ ${src.sha.slice(0, 7)}${notes.length ? ` · notes: ${notes.join(' | ')}` : ''}`);
    return { ok: true, rows };
  } catch (err) {
    console.error(`[${project.slug}] FAILED: ${err.message}`);
    return { ok: false, error: err.message, rows };
  } finally {
    if (served?.server) stopServer(served.server);
    if (browser) await browser.close().catch(() => {});
    if (src?.worktree) removeWorktree(project.repo, src.worktree.dest);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  preflight();
  fs.mkdirSync(MASTERS_ROOT, { recursive: true });
  fs.mkdirSync(RECEIPTS_ROOT, { recursive: true });

  const selected = PROJECTS.filter((p) => !args.projects || args.projects.includes(p.slug)).sort((a, b) => a.priority - b.priority);
  if (!selected.length) { console.error('no matching projects'); process.exit(2); }

  const mastersRoot = args.verify ? path.join(BANK_ROOT, 'verify-mirror') : MASTERS_ROOT;
  if (args.verify) fs.rmSync(mastersRoot, { recursive: true, force: true });

  const results = {};
  for (const project of selected) {
    if (project.stretch && !args.projects?.includes(project.slug) && args.verify) continue;
    results[project.slug] = await runProject(project, args, { mastersRoot });
  }

  if (args.verify) {
    const m = readManifest();
    const mirrorRows = Object.values(results).flatMap((r) => r.rows ?? []);
    const classes = Object.fromEntries(PROJECTS.map((p) => [p.slug, p.determinism]));
    const storedStills = m.captures.filter((r) => !r.clip && !r.flags?.includes('SKIPPED-ON-THIS-SHA'));
    const proof = compareRuns(storedStills, mirrorRows.filter((r) => !r.clip), classes);
    proof.ranAt = isoDate();
    m.determinismProof = { ranAt: proof.ranAt, result: proof.result, checked: proof.checked, drift: proof.drift.length, missing: proof.missing.length };
    writeManifest(m);
    const receipt = [
      `# Determinism proof — ${proof.ranAt}`,
      `Result: **${proof.result}** · rows checked ${proof.checked} · drift ${proof.drift.length} · missing ${proof.missing.length}`,
      '',
      ...proof.drift.map((d) => `- ${d.fatal ? 'FATAL' : 'warn'} ${d.kind} [${d.class}] ${d.key}${d.a ? ` (${d.a} vs ${d.b})` : ''}`),
      ...proof.missing.map((k) => `- MISSING in run 2: ${k}`),
    ].join('\n');
    fs.writeFileSync(path.join(RECEIPTS_ROOT, `determinism-${proof.ranAt}.md`), receipt + '\n');
    console.log(`\n[verify] ${proof.result} — ${proof.checked} rows, ${proof.drift.length} drift, ${proof.missing.length} missing → receipts/determinism-${proof.ranAt}.md`);
  }

  const failed = Object.entries(results).filter(([, r]) => !r.ok);
  console.log(`\n[capture-showcase] done — ${Object.keys(results).length} project(s), ${failed.length} failed${failed.length ? `: ${failed.map(([s]) => s).join(', ')}` : ''}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error('[capture-showcase] fatal:', err);
  process.exit(1);
});
