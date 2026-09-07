import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4','.json':'application/json'};
http.createServer((req,res)=>{let p=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(root)){res.writeHead(403).end();return;}try{if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(p).pipe(res);}catch{res.writeHead(404).end('Not found');}}).listen(3038,'127.0.0.1',()=>console.log('Phase08 static server 3038 '+root));
