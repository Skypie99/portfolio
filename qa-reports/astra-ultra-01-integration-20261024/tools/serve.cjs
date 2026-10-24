// Minimal static server for a Next export dir (trailing-slash routes).
// usage: node serve.cjs <dir> <port>
const http = require('http'); const fs = require('fs'); const path = require('path');
const [dir, port] = process.argv.slice(2); const root = path.resolve(dir);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (p.endsWith('/')) f = path.join(f, 'index.html');
  fs.stat(f, (err, st) => {
    if (!err && st.isDirectory()) f = path.join(f, 'index.html');
    fs.readFile(f, (e, buf) => {
      if (e) { res.writeHead(404, { 'content-type': 'text/html' }); return fs.createReadStream(path.join(root, '404.html')).on('error', () => res.end()).pipe(res); }
      res.writeHead(200, { 'content-type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(buf);
    });
  });
}).listen(+port, '127.0.0.1');
