// Static server for the built out/ — Node, not `python3 -m http.server`.
// WHY: the launch config's python server is single-threaded; under the axe /
// CLS / console rigs' concurrent loads it starves and drops sockets, which
// surfaces as FALSE a11y violations (document-title + landmark-one-main +
// page-has-heading-one on random routes) and false console errors
// (ERR_CONNECTION_RESET). Both were observed in Phase J before this existed.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.argv[2] || '/Users/skypie/Portfolio/out';
const PORT = Number(process.argv[3] || 3005);
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript',
  '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif',
  '.woff2':'font/woff2', '.woff':'font/woff', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8',
  '.mp4':'video/mp4', '.webm':'video/webm', '.ico':'image/x-icon' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(ROOT, p);
  try {
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { const alt = f.replace(/\/$/, '') + '.html';
      if (fs.existsSync(alt)) f = alt; else { res.writeHead(404); return res.end('404'); } }
    const body = fs.readFileSync(f);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream',
      'Content-Length': body.length, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}).listen(PORT, '127.0.0.1', () => console.log(`[serve-out] ${ROOT} → http://127.0.0.1:${PORT}`));
