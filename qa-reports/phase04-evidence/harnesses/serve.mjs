import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const roots = {4404:'/Users/skypie/Portfolio-3.0-baseline/out',4405:'/Users/skypie/Portfolio-codex/portfolio-3.0-phase04-20260904/out'};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.jpg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm'};
for (const [port,root] of Object.entries(roots)) http.createServer((req,res)=>{
 let f=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!f.startsWith(root+'/')&&f!==root){res.writeHead(403);res.end();return;}
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
 if(!fs.existsSync(f)){res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');fs.createReadStream(f).pipe(res);
}).listen(Number(port),'127.0.0.1',()=>console.log(`serving ${port}: ${root}`));
