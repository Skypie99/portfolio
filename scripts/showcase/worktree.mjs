/**
 * worktree.mjs — isolated checkouts for project repos whose working trees are
 * dirty, mid-train, or on the wrong branch. The factory NEVER builds from a
 * project's live checkout unless it is clean and on the pinned ref; it never
 * stashes, never touches the checkout, and removes its worktrees at teardown.
 *
 * .env handling is mechanical: copied byte-for-byte (never read into logs),
 * chmod 600, deleted with the worktree.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const WT_ROOT = process.env.SHOWCASE_WT_ROOT || path.join(os.tmpdir(), 'showcase-worktrees');

const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();

export function resolveSha(repo, ref) {
  return git(repo, 'rev-parse', ref);
}

export function shortSha(repo, ref) {
  return git(repo, 'rev-parse', '--short', ref);
}

export function describeRepoState(repo) {
  const head = git(repo, 'rev-parse', '--short', 'HEAD');
  const branch = git(repo, 'rev-parse', '--abbrev-ref', 'HEAD');
  const dirty = git(repo, 'status', '--porcelain').split('\n').filter((l) => l && !l.startsWith('??')).length;
  return { head, branch, dirtyTracked: dirty };
}

/** main==origin check for the Dashboard policy (capture main if pushed). */
export function mainMatchesOrigin(repo) {
  try {
    return resolveSha(repo, 'main') === resolveSha(repo, 'origin/main');
  } catch {
    return null; // no remote (e.g. Pet Paradise)
  }
}

export function addWorktree(repo, ref, slug) {
  const sha = resolveSha(repo, ref);
  const dest = path.join(WT_ROOT, `${slug}-${sha.slice(0, 7)}`);
  if (fs.existsSync(dest)) {
    // Stale from a prior run at the same SHA — reuse only if git still tracks it.
    const listed = git(repo, 'worktree', 'list', '--porcelain').includes(dest);
    if (listed) return { dest, sha, reused: true };
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(WT_ROOT, { recursive: true });
  git(repo, 'worktree', 'add', '--detach', dest, sha);
  return { dest, sha, reused: false };
}

export function linkNodeModules(repo, dest, appDir = null) {
  const src = appDir ? path.join(repo, appDir, 'node_modules') : path.join(repo, 'node_modules');
  const target = appDir ? path.join(dest, appDir, 'node_modules') : path.join(dest, 'node_modules');
  if (!fs.existsSync(src)) throw new Error(`node_modules missing in source repo: ${src} (installs are forbidden)`);
  if (!fs.existsSync(target)) fs.symlinkSync(src, target, 'dir');
}

/** Copy .env byte-for-byte for build-time EXPO_PUBLIC_* vars. Contents are never
 *  read into this process, never logged. Returns the copy's path for teardown. */
export function copyEnv(repo, dest) {
  const src = path.join(repo, '.env');
  if (!fs.existsSync(src)) return null;
  const target = path.join(dest, '.env');
  fs.copyFileSync(src, target);
  fs.chmodSync(target, 0o600);
  return target;
}

export function removeWorktree(repo, dest) {
  if (!dest) return;
  const envCopy = path.join(dest, '.env');
  if (fs.existsSync(envCopy)) fs.rmSync(envCopy, { force: true });
  try {
    git(repo, 'worktree', 'remove', '--force', dest);
  } catch {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  try { git(repo, 'worktree', 'prune'); } catch { /* best effort */ }
}
