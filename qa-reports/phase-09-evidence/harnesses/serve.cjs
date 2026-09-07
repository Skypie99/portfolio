// Local read-only export server. Uses Next's existing send dependency for MIME,
// ranges, conditional requests and traversal protection. No SPA fallback.
const http = require('node:http');
const path = require('node:path');
const send = require('next/dist/compiled/send');
const root = path.resolve(process.argv[2] || 'out');
const port = Number(process.argv[3] || 3049);
http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  send(req, new URL(req.url, 'http://localhost').pathname, {
    root, index: 'index.html', maxAge: '1h', dotfiles: 'deny',
  }).on('error', e => { res.writeHead(e.statusCode || 500).end(); })
    .pipe(res);
}).listen(port, '127.0.0.1', () => console.log(JSON.stringify({ root, port, compression: false, cache: '1h', range: true })));
