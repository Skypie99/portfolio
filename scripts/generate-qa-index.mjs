#!/usr/bin/env node
/**
 * generate-qa-index.mjs — regenerate qa-reports/INDEX.md from the TRACKED
 * files under qa-reports/ (`git ls-files`), so the evidence index can never
 * silently stop covering the evidence again (the hand-curated index it
 * replaced froze at 2026-05-28 while the directory grew past 900 files).
 *
 *   npm run qa:index          # write qa-reports/INDEX.md (only if it changed)
 *   npm run qa:index:check    # write nothing; exit 1 if INDEX.md is stale
 *
 * Deterministic by construction: the input is the git index (untracked files
 * are ignored, so stage new evidence with `git add` before regenerating),
 * ordering is plain byte order (never locale), and the output carries no
 * timestamp. Titles come from each listed report's first `# ` heading.
 * No network, no dependencies, and no writes outside qa-reports/INDEX.md.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QA_DIR = 'qa-reports';
const INDEX_REL = `${QA_DIR}/INDEX.md`;
const INDEX_ABS = path.join(REPO_ROOT, INDEX_REL);
const RECENT_LIMIT = 15;

const DATE = /(\d{4}-\d{2}-\d{2})/;
const byBytes = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function fail(message, code = 2) {
  console.error(`[qa-index] ${message}`);
  process.exit(code);
}

function trackedFiles() {
  let out;
  try {
    out = execFileSync('git', ['-C', REPO_ROOT, 'ls-files', '-z', '--', QA_DIR], { encoding: 'utf8' });
  } catch (err) {
    fail(`could not list tracked files with git (${String(err.message).split('\n')[0]}). Run this from a git checkout of the repository.`);
  }
  const files = new Set(out.split('\0').filter(Boolean));
  // The index always describes a tree that contains the index itself, so the
  // output is a fixed point whether or not INDEX.md is staged yet.
  files.add(INDEX_REL);
  return [...files].sort(byBytes);
}

function titleOf(rel) {
  const abs = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  const heading = fs.readFileSync(abs, 'utf8').split('\n').find((line) => line.startsWith('# '));
  return heading ? heading.slice(2).trim() : null;
}

const ext = (rel) => {
  const base = path.posix.basename(rel);
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : '(none)';
};

/** Link target relative to qa-reports/, percent-encoding anything unusual. */
const href = (rel) => encodeURI(rel.slice(QA_DIR.length + 1));
const link = (rel) => `[\`${rel.slice(QA_DIR.length + 1)}\`](${href(rel)})`;
const cell = (text) => String(text).replace(/\|/g, '\\|');
const count = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;

function typeSummary(list) {
  const tally = new Map();
  for (const rel of list) tally.set(ext(rel), (tally.get(ext(rel)) ?? 0) + 1);
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1] || byBytes(a[0], b[0]))
    .map(([e, n]) => `${e} ${n}`)
    .join(', ');
}

function build(files) {
  const rootFiles = files.filter((rel) => rel.split('/').length === 2);
  const rootReports = rootFiles.filter((rel) => rel.endsWith('.md') && rel !== INDEX_REL);
  const dirs = new Map();
  for (const rel of files) {
    const parts = rel.split('/');
    if (parts.length > 2) {
      if (!dirs.has(parts[1])) dirs.set(parts[1], []);
      dirs.get(parts[1]).push(rel);
    }
  }
  const dirNames = [...dirs.keys()].sort(byBytes);

  const dates = files.map((rel) => rel.match(DATE)?.[1]).filter(Boolean).sort(byBytes);

  // Newest dated reports anywhere: Markdown whose file name starts with a date.
  const dated = files
    .filter((rel) => rel.endsWith('.md') && /^\d{4}-\d{2}-\d{2}/.test(path.posix.basename(rel)))
    .map((rel) => ({ rel, date: path.posix.basename(rel).slice(0, 10) }))
    .sort((a, b) => byBytes(b.date, a.date) || byBytes(a.rel, b.rel));

  const gates = rootReports.filter((rel) => path.posix.basename(rel).startsWith('PHASE-'));
  const nestedReceipts = files.filter(
    (rel) => rel.split('/').length > 2 && rel.endsWith('.md') && /receipt/i.test(path.posix.basename(rel)),
  );
  const earlierIndexes = files.filter((rel) => rel !== INDEX_REL && /(^|[_-])INDEX([_.-]|$)/.test(path.posix.basename(rel)));

  const citedBy = (dir) => {
    const pattern = new RegExp(`(^|[^A-Za-z0-9_-])${dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9_-]|$)`);
    return rootReports.filter((rel) => {
      const abs = path.join(REPO_ROOT, rel);
      return fs.existsSync(abs) && pattern.test(fs.readFileSync(abs, 'utf8'));
    });
  };

  const months = new Map();
  for (const rel of rootFiles) {
    const key = rel.match(DATE)?.[1].slice(0, 7) ?? 'undated';
    months.set(key, (months.get(key) ?? 0) + 1);
  }
  const monthKeys = [...months.keys()].sort((a, b) => (a === 'undated' ? 1 : b === 'undated' ? -1 : byBytes(b, a)));

  const L = [];
  L.push('# QA reports index', '');
  L.push(
    '> **Generated file. Do not edit by hand.** Written by `scripts/generate-qa-index.mjs` from the files git tracks under `qa-reports/`. ' +
      'After adding evidence, stage it (`git add`) and run `npm run qa:index`; `npm run qa:index:check` reports drift without writing.',
    '',
  );
  L.push('## At a glance', '');
  L.push('| Measure | Value |', '|---|---|');
  L.push(`| Tracked files under \`qa-reports/\` | ${files.length} |`);
  L.push(`| Top-level reports and receipts (Markdown) | ${rootReports.length} |`);
  L.push(`| Evidence directories | ${dirNames.length} |`);
  L.push(`| File types | ${typeSummary(files)} |`);
  L.push(`| Dates named in file paths | ${dates.length ? `${dates[0]} to ${dates[dates.length - 1]}` : 'none'} |`, '');

  L.push('## How the evidence is organized', '');
  L.push(
    '- **Receipts and reports** are the Markdown files at the top of this directory. Dated ones start with `YYYY-MM-DD`; phase gate receipts and approval packets start with `PHASE-`. A receipt is true for its own date and is never rewritten: a later receipt supersedes it.',
    '- **Raw evidence** (screenshots, logs, JSON inventories, harness scripts) lives in the subdirectories. Each directory is cited by relative path from the receipts listed beside it below, so start from the receipt and follow its paths.',
    '- **Adding evidence.** Name a receipt `YYYY-MM-DD_<Topic>.md` and cite its raw evidence by relative path. When a new artifact would be byte-identical to one already tracked, cite the existing path with its SHA-256 (or a manifest entry) instead of committing another copy, unless a self-contained package or a before/after comparison genuinely needs the copy. Then stage the files and regenerate this index.',
    '- **Evidence outside this directory:** `design-reviews/` (dated review programs) and `summaries/` (June 2026 pass reports). See [`docs/INDEX.md`](../docs/INDEX.md) for how every document in the repository is classified.',
    '',
  );

  L.push(`## Newest dated reports (${Math.min(RECENT_LIMIT, dated.length)} of ${dated.length})`, '');
  L.push('| Date | Report | Title |', '|---|---|---|');
  for (const { rel, date } of dated.slice(0, RECENT_LIMIT)) L.push(`| ${date} | ${link(rel)} | ${cell(titleOf(rel) ?? '')} |`);
  L.push('');

  L.push(`## Phase gate receipts and packets (${gates.length})`, '');
  L.push('| Receipt | Title |', '|---|---|');
  for (const rel of gates) L.push(`| ${link(rel)} | ${cell(titleOf(rel) ?? '')} |`);
  L.push('');

  L.push(`## Evidence directories (${dirNames.length})`, '');
  L.push('| Directory | Files | Types | Cited by |', '|---|---|---|---|');
  for (const dir of dirNames) {
    const cites = citedBy(dir);
    L.push(
      `| [\`${dir}/\`](${encodeURI(dir)}/) | ${dirs.get(dir).length} | ${typeSummary(dirs.get(dir))} | ${cites.length ? cites.map(link).join('<br>') : 'no top-level report'} |`,
    );
  }
  L.push('');

  L.push(`## Receipts filed inside evidence directories (${nestedReceipts.length})`, '');
  L.push('| Receipt | Title |', '|---|---|');
  for (const rel of nestedReceipts) L.push(`| ${link(rel)} | ${cell(titleOf(rel) ?? '')} |`);
  L.push('');

  L.push('## Older material', '');
  L.push('Top-level files by the month named in their file name:', '');
  L.push('| Month | Top-level files |', '|---|---|');
  for (const key of monthKeys) L.push(`| ${key} | ${months.get(key)} |`);
  L.push('');
  L.push(
    'To list a month, run `git ls-files \'qa-reports/*2026-05-*\'` (substituting the month). The May 2026 role and cycle reports also embed their date mid-name, for example `cycle-2026-05-23.md`.',
  );
  if (earlierIndexes.length) {
    L.push('', `Earlier hand-maintained indexes, preserved as dated records: ${earlierIndexes.map(link).join(', ')}.`);
  }
  L.push('');
  return L.join('\n');
}

const args = process.argv.slice(2);
const unknown = args.filter((a) => a !== '--check');
if (unknown.length) fail(`unknown argument(s): ${unknown.join(' ')}. Usage: node scripts/generate-qa-index.mjs [--check]`);

const expected = build(trackedFiles());
const current = fs.existsSync(INDEX_ABS) ? fs.readFileSync(INDEX_ABS, 'utf8') : null;

if (args.includes('--check')) {
  if (current === expected) {
    console.log(`[qa-index] ${INDEX_REL} is up to date.`);
    process.exit(0);
  }
  const a = (current ?? '').split('\n');
  const b = expected.split('\n');
  const line = b.findIndex((text, i) => text !== a[i]);
  console.error(
    `[qa-index] ${INDEX_REL} is stale${current === null ? ' (missing)' : ` (first difference at line ${line + 1})`}. Run \`npm run qa:index\` and commit the result.`,
  );
  process.exit(1);
}

if (current === expected) {
  console.log(`[qa-index] ${INDEX_REL} already up to date; nothing written.`);
} else {
  fs.writeFileSync(INDEX_ABS, expected);
  console.log(`[qa-index] wrote ${INDEX_REL}.`);
}
