// boards.mjs — renders labelled side-by-side comparison boards from captured frames.
//   node boards.mjs --spec spec.json --out <dir>
// spec: { boards: [{ id, title, subtitle, cellWidth, rows: [{ label, cells: [{ src, caption }] }] }] }
// Each board is an HTML page rendered by Chromium and screenshotted full-page (JPEG).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/portfolio/package.json');
const { chromium } = require('playwright-core');

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean));
const spec = JSON.parse(readFileSync(args.spec, 'utf8'));
const OUT = resolve(args.out); mkdirSync(OUT, { recursive: true });
const ROOT = '/'; // serve absolute paths

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = resolve(ROOT, '.' + p);
  if (!existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = f.split('.').pop();
  const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', html: 'text/html; charset=utf-8', webp: 'image/webp' }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': mime }); createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(3200, r));

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
function html(b) {
  const cw = b.cellWidth || 520;
  const cols = Math.max(...b.rows.map((r) => r.cells.length));
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  :root{color-scheme:light}
  body{margin:0;background:#f5f1ea;color:#2a2622;font-family:"DM Sans",Inter,system-ui,-apple-system,sans-serif;padding:40px 48px 56px;width:${cols * cw + (cols - 1) * 28 + 96 + 180}px}
  h1{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:34px;margin:0 0 6px;letter-spacing:-0.01em}
  .sub{font-size:14px;color:#6b625a;margin:0 0 28px;max-width:1100px;line-height:1.5}
  .head{display:grid;grid-template-columns:180px repeat(${cols},${cw}px);gap:0 28px;margin-bottom:10px}
  .head div{font-family:ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a4d33;padding-bottom:8px;border-bottom:1px solid #d8cfc3}
  .row{display:grid;grid-template-columns:180px repeat(${cols},${cw}px);gap:0 28px;align-items:start;padding:18px 0;border-bottom:1px solid #e6ded3}
  .label{font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.5;color:#2a2622;padding-top:4px}
  .label b{display:block;font-size:13px;color:#8a4d33;margin-bottom:4px}
  .cell img{display:block;width:${cw}px;height:auto;border:1px solid #cfc5b8;box-shadow:0 10px 30px rgba(40,25,10,.12);background:#111}
  .cap{font-size:12px;color:#6b625a;margin-top:8px;line-height:1.45}
  .foot{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#8c8278;margin-top:22px;letter-spacing:.06em}
  </style></head><body>
  <h1>${esc(b.title)}</h1><p class="sub">${esc(b.subtitle)}</p>
  <div class="head"><div></div>${(b.columns || []).map((c) => `<div>${esc(c)}</div>`).join('')}</div>
  ${b.rows.map((r) => `<div class="row"><div class="label"><b>${esc(r.label)}</b>${esc(r.note || '')}</div>${r.cells.map((c) => c ? `<div class="cell"><img src="${c.src.startsWith('/') ? c.src : '/' + c.src}" alt=""><div class="cap">${esc(c.caption || '')}</div></div>` : '<div></div>').join('')}</div>`).join('')}
  <div class="foot">${esc(b.footer || 'Rendered in headless Chromium from the static export. Frames are settled viewport captures (scrub catch-up waited out).')}</div>
  </body></html>`;
}

const browser = await chromium.launch({ executablePath: existsSync(chromium.executablePath()) ? chromium.executablePath() : '/opt/pw-browsers/chromium', headless: true });
for (const b of spec.boards) {
  const file = join(OUT, `${b.id}.html`);
  writeFileSync(file, html(b));
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3200' + file, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  await page.screenshot({ path: join(OUT, `${b.id}.jpg`), fullPage: true, type: 'jpeg', quality: Number(args.quality || 86) });
  await page.close();
  console.log('[boards]', b.id);
}
await browser.close(); server.close();
