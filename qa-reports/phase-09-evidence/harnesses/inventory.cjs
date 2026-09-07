const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const zlib = require('node:zlib');
const { JSDOM } = require('jsdom');
const out = path.resolve(process.argv[3] || 'out');
const destination = process.argv[2] || 'qa-reports/phase-09-evidence/artifact.json';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
const files = walk(out).sort().map(f => {
  const b = fs.readFileSync(f); const ext = path.extname(f).toLowerCase();
  return { path: path.relative(out, f), bytes: b.length, sha256: sha(b), ext, gzip: ['.js','.css','.html'].includes(ext) ? zlib.gzipSync(b).length : null };
});
const sums = {};
for (const f of files) { const key = f.ext || '(extensionless)'; const row = sums[key] ||= { count: 0, bytes: 0 }; row.count++; row.bytes += f.bytes; }
function routeFor(f) { return '/' + f.replace(/index\.html$/, '').replace(/^\//,''); }
const docs = new Map(files.filter(f => f.ext === '.html').map(f => [f.path, new JSDOM(fs.readFileSync(path.join(out, f.path), 'utf8')).window.document]));
const issues = []; const routes = []; const external = new Set();
function resolveFile(url) {
  const p = decodeURIComponent(url.pathname).replace(/^\//,'');
  const candidates = [p, path.posix.join(p,'index.html'), p+'.html'];
  return candidates.find(p => docs.has(p) || (fs.existsSync(path.join(out,p)) && fs.statSync(path.join(out,p)).isFile()));
}
for (const [f, doc] of docs) {
  const route = routeFor(f); const base = new URL(route, 'https://skypistudio.com');
  const canonical = [...doc.querySelectorAll('link[rel="canonical"]')].map(x => x.href);
  const robots = [...doc.querySelectorAll('meta[name="robots"]')].map(x => x.content);
  const refresh = doc.querySelector('meta[http-equiv="refresh" i]')?.content || null;
  const ids = new Set();
  for (const el of doc.querySelectorAll('[id]')) { if (ids.has(el.id)) issues.push({route, kind:'duplicate-id', value:el.id}); ids.add(el.id); }
  const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(el => ({level:Number(el.tagName[1]), text:el.textContent.trim()}));
  const row = { route, file:f, canonical, robots, refresh, title:doc.title, headings, images:doc.images.length, links:doc.links.length, scripts:[...doc.querySelectorAll('script[src]')].map(x=>x.getAttribute('src')), styles:[...doc.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.getAttribute('href')) };
  routes.push(row);
  if (!refresh && headings.filter(h=>h.level===1).length!==1) issues.push({route,kind:'h1-count',value:headings.filter(h=>h.level===1).length});
  for (let i=1;i<headings.length;i++) if(headings[i].level>headings[i-1].level+1) issues.push({route,kind:'heading-jump',value:[headings[i-1],headings[i]]});
  for (const el of doc.querySelectorAll('img')) if(!el.hasAttribute('alt')) issues.push({route,kind:'missing-alt',value:el.getAttribute('src')});
  for (const el of doc.querySelectorAll('a')) {
    const raw=el.getAttribute('href');
    if(!raw || raw==='#') issues.push({route,kind:'blank-href',value:raw});
    if(!(el.textContent.trim() || el.getAttribute('aria-label') || el.querySelector('img[alt]')?.getAttribute('alt'))) issues.push({route,kind:'blank-link-name',value:raw});
    if(!raw) continue;
    let u; try { u=new URL(raw,base); } catch { issues.push({route,kind:'invalid-href',value:raw}); continue; }
    if(!['http:','https:'].includes(u.protocol)) continue;
    if(u.origin!==base.origin) {
      external.add(u.href);
      if(el.getAttribute('target')==='_blank' && !['noopener','noreferrer'].every(x=>el.rel.split(/\s+/).includes(x))) issues.push({route,kind:'unsafe-rel',value:raw});
      continue;
    }
    const resolved=resolveFile(u);
    if(!resolved) issues.push({route,kind:'missing-link',value:raw});
    else if(u.hash && docs.has(resolved) && !docs.get(resolved).getElementById(decodeURIComponent(u.hash.slice(1)))) issues.push({route,kind:'missing-anchor',value:raw});
  }
  for(const el of doc.querySelectorAll('img[src],script[src],source[src],video[src],video[poster],link[rel="stylesheet"][href],link[rel="preload"][href]')) {
    for(const attr of ['src','poster','href']) {
      const raw=el.getAttribute(attr); if(!raw) continue;
      const u=new URL(raw,base); if(u.origin===base.origin && !resolveFile(u)) issues.push({route,kind:'missing-asset',value:raw});
    }
  }
}
const tracked=cp.execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean).filter(f=>!f.startsWith('qa-reports/') && !f.startsWith('design-reviews/'));
const historical=Boolean(process.argv[3]);
const source=historical?[]:tracked.map(f=>({path:f,sha256:sha(fs.readFileSync(f))}));
const head=historical?'19d946c9c48b325bce5d3a9f292d2cb48450cf01':cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const result={date:new Date().toISOString(),head,identityMethod:historical?'Recovered deployment ZIP matches Phase00 recorded SHA256; see phase00-recovery.json':'Fresh local build and source inventory',artifactDigest:sha(JSON.stringify(files.map(({path,bytes,sha256})=>({path,bytes,sha256})))),sourceDigest:historical?null:sha(JSON.stringify(source)),source,files,sums,largest:[...files].sort((a,b)=>b.bytes-a.bytes).slice(0,25),routes,issues,external:[...external].sort()};
fs.writeFileSync(destination,JSON.stringify(result,null,2));
console.log(JSON.stringify({destination,files:files.length,routes:routes.length,issues,artifactDigest:result.artifactDigest,sums},null,2));
