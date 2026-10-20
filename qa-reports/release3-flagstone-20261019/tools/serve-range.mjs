#!/usr/bin/env node
/*
 * serve-range.mjs — Flagstone Version A independent review (2026-10-18).
 * Dependency-free, loopback-only static server for a built `out/` directory, with HTTP Range
 * support (WebKit will not play or seek an MP4 without 206 responses) and text/vtt for tracks.
 * Read-only: it never writes to the served tree.
 *
 *   node serve-range.mjs <out-dir> <port>
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const dir = path.resolve(process.argv[2] ?? 'out');
const port = Number(process.argv[3] ?? 3141);
const REAL = fs.realpathSync(dir);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.vtt': 'text/vtt',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    let file = path.join(dir, url);
    const rel = path.relative(dir, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      if (fs.existsSync(`${file}.html`)) file = `${file}.html`;
      else {
        const nf = path.join(dir, '404.html');
        res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'not found');
      }
    }
    const real = fs.realpathSync(file);
    if (!real.startsWith(REAL + path.sep) && real !== REAL) return res.writeHead(403).end();
    const size = fs.statSync(real).size;
    const type = TYPES[path.extname(real).toLowerCase()] ?? 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m && m[1] !== '' ? Number(m[1]) : 0;
      let end = m && m[2] !== '' ? Number(m[2]) : size - 1;
      if (m && m[1] === '' && m[2] !== '') { start = size - Number(m[2]); end = size - 1; }
      if (start >= size || end >= size || start > end) {
        res.writeHead(416, { 'content-range': `bytes */${size}` });
        return res.end();
      }
      res.writeHead(206, {
        'content-type': type, 'accept-ranges': 'bytes', 'content-length': end - start + 1,
        'content-range': `bytes ${start}-${end}/${size}`, 'cache-control': 'no-store',
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(real, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': size, 'cache-control': 'no-store' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(real).pipe(res);
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
});
server.on('error', (e) => { console.error(`[serve-range] ${e.message}`); process.exit(1); });
server.listen(port, '127.0.0.1', () => console.log(`[serve-range] ${dir} http://127.0.0.1:${server.address().port}`));
for (const s of ['SIGTERM', 'SIGINT']) process.on(s, () => server.close(() => process.exit(0)));
