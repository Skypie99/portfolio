#!/usr/bin/env node
/**
 * static-serve.mjs — dependency-free static file server for QA fixtures.
 *
 *   node scripts/static-serve.mjs <dir> [port]      # default: out/ 3005
 *
 * Serves a built export directory over loopback so a browser harness can drive
 * real routes. Node's `http` core is used deliberately: `python3 -m http.server`
 * is single-threaded and drops sockets under Playwright's parallel navigation
 * churn, which surfaces as blank documents and phantom violations
 * (design-reviews/guards/2026-08-01/GUARD-LEDGER.md §browser floors). No npm
 * dependency, no global install — `node` is the only prerequisite.
 *
 * This is the TRACKED replacement for the historically untracked
 * `design-reviews/showcase-refresh/tools/static-serve.mjs` that made
 * `npm run check:overflow` unrunnable from a fresh clone. It keeps the same
 * `<dir> <port>` interface so `scripts/overflow-census.mjs` can spawn it.
 *
 * On ready it prints one line:
 *   [static-serve] <dir> http://127.0.0.1:<port>
 * and exits 1 with an actionable message if the directory is missing or the
 * port is already taken. SIGTERM/SIGINT close the listener cleanly.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const dirArg = process.argv[2] ?? 'out';
const port = Number(process.argv[3] ?? 3005);
const dir = path.resolve(dirArg);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error(`[static-serve] invalid port: ${process.argv[3]}`);
  process.exit(1);
}
if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
  console.error(
    `[static-serve] directory not found: ${dir}\n` +
      '[static-serve] build it first (e.g. `npm run build`) or pass an explicit directory.',
  );
  process.exit(1);
}
/* Resolved once: containment below compares real paths, so a symlink inside the
   served tree cannot be used to read a file outside it. */
const REAL_DIR = fs.realpathSync(dir);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.vtt': 'text/vtt', '.webmanifest': 'application/manifest+json',
};

const notFound = (res) => {
  const page = path.join(dir, '404.html');
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
  res.end(fs.existsSync(page) ? fs.readFileSync(page) : 'not found');
};

const server = http.createServer((req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.join(dir, url);
    /* Containment: a decoded `..` must not escape the served directory. */
    const rel = path.relative(dir, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      if (fs.existsSync(`${file}.html`)) file = `${file}.html`;
      else return notFound(res);
    }
    /* Containment, symlink-aware: resolve the target and require it to stay under
       the served root, so a link inside out/ cannot expose a file outside it. */
    const real = fs.realpathSync(file);
    const within = path.relative(REAL_DIR, real);
    if (within.startsWith('..') || path.isAbsolute(within)) {
      res.writeHead(403).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream' });
    /* A read error (e.g. EACCES) must fail this response, not crash the server. */
    const stream = fs.createReadStream(file);
    stream.on('error', () => { res.destroy(); });
    stream.pipe(res);
  } catch {
    res.writeHead(500).end();
  }
});

server.on('error', (err) => {
  const hint =
    err.code === 'EADDRINUSE'
      ? `\n[static-serve] port ${port} is already in use — stop the process holding it, or pass a free port (the overflow census reads OVERFLOW_PORT).`
      : '';
  console.error(`[static-serve] failed to start: ${err.message}${hint}`);
  process.exit(1);
});

/* Clean shutdown: a TERM/INT closes the listener instead of dropping sockets. */
const shutdown = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500).unref();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(port, '127.0.0.1', () => {
  console.log(`[static-serve] ${dir} http://127.0.0.1:${server.address().port}`);
});
