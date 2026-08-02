/**
 * servers.mjs — build/serve/ready/teardown for the capture factory.
 *
 * Every spawned process is detached into its own group and registered with a
 * global reaper, so a crash, SIGINT, or normal exit always kills the whole
 * tree (python http.server, next start, expo export children). One project
 * failing must never leave a port squatted for the next.
 */

import { spawn } from 'node:child_process';
import net from 'node:net';

const REAPER = new Set();
let hooked = false;

function hookReaper() {
  if (hooked) return;
  hooked = true;
  const sweep = () => {
    for (const h of REAPER) {
      try {
        process.kill(-h.proc.pid, 'SIGTERM');
      } catch {
        try { h.proc.kill('SIGTERM'); } catch { /* gone */ }
      }
    }
    REAPER.clear();
  };
  process.on('exit', sweep);
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      sweep();
      process.exit(130);
    });
  }
}

export function portInUse(port) {
  return new Promise((resolvePort) => {
    const sock = net.connect({ port, host: '127.0.0.1' });
    const done = (v) => { sock.destroy(); resolvePort(v); };
    sock.once('connect', () => done(true));
    sock.once('error', () => done(false));
    sock.setTimeout(700, () => done(false));
  });
}

/** Spawn a long-lived server (detached group), capture output for diagnostics. */
export function startServer(cmd, args, { cwd, env, name }) {
  hookReaper();
  const proc = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const handle = { proc, name, log: [] };
  const keep = (buf) => {
    handle.log.push(buf.toString());
    if (handle.log.length > 200) handle.log.shift();
  };
  proc.stdout.on('data', keep);
  proc.stderr.on('data', keep);
  REAPER.add(handle);
  return handle;
}

export function startStaticServer(dir, port) {
  return startServer('python3', ['-m', 'http.server', String(port), '--directory', dir, '--bind', '127.0.0.1'], {
    name: `static:${port}`,
  });
}

export function stopServer(handle) {
  if (!handle) return;
  try {
    process.kill(-handle.proc.pid, 'SIGTERM');
  } catch {
    try { handle.proc.kill('SIGTERM'); } catch { /* gone */ }
  }
  REAPER.delete(handle);
}

/** Run a build to completion (NOT registered as a server; it must exit 0). */
export function runBuild(cmd, args, { cwd, env, timeoutMs, name }) {
  return new Promise((resolveBuild, reject) => {
    const proc = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = [];
    const keep = (b) => { out.push(b.toString()); if (out.length > 400) out.shift(); };
    proc.stdout.on('data', keep);
    proc.stderr.on('data', keep);
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch { /* gone */ }
      reject(new Error(`[${name}] build timed out after ${Math.round(timeoutMs / 60000)} min\n${out.slice(-15).join('')}`));
    }, timeoutMs);
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolveBuild({ log: out.join('') });
      else reject(new Error(`[${name}] build exited ${code}\n${out.slice(-25).join('')}`));
    });
  });
}

export async function waitReady(url, { timeoutMs = 60_000, handle = null } = {}) {
  const start = Date.now();
  let lastErr = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) return true;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  const tail = handle ? `\nserver log tail:\n${handle.log.slice(-10).join('')}` : '';
  throw new Error(`server at ${url} never became ready (${lastErr?.message ?? 'no response'})${tail}`);
}
