import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require=createRequire(path.join(process.cwd(),'package.json'));
const {JSDOM}=require('jsdom');
const [baseline,candidate,dest]=process.argv.slice(2);
const routes=root=>fs.readdirSync(root,{recursive:true}).filter(p=>p.endsWith('index.html')).sort();
function normalized(html){
 const d=new JSDOM(html).window.document;
 d.querySelectorAll('script:not([type="application/ld+json"]),link[rel="stylesheet"],link[rel="preload"],link[rel="modulepreload"]').forEach(el=>el.remove());
 d.querySelectorAll('[class]').forEach(el=>el.setAttribute('class',el.getAttribute('class').split(/\s+/).filter(Boolean).sort().join(' ')));
 return d.documentElement.outerHTML.replace(/<!--[A-Za-z0-9_-]{15,}-->/g,'<!--BUILDID-->');
}
const a=routes(baseline),b=routes(candidate);
const result={method:'Compare DOM after removing hydration/runtime scripts and bundled asset links, normalizing build-id comments and class token order; preserve JSON-LD, media links, copy, attributes, markup and metadata.',sameRoutes:JSON.stringify(a)===JSON.stringify(b),routes:a.map(p=>({route:p,identical:b.includes(p)&&normalized(fs.readFileSync(path.join(baseline,p),'utf8'))===normalized(fs.readFileSync(path.join(candidate,p),'utf8'))})),protectedPathChanges:execFileSync('git',['diff','--name-only','78169e94c9f2b9810d3c9cdb18c54b0cacb7e297','--','components/cinematic','app/page.tsx','app/layout.tsx','app/float','app/tokyo-through-time','public/videos','public/showcase','public/images','components/ProofArrival.tsx','components/ThemedMotion.tsx','package.json','package-lock.json','.github/workflows'],{encoding:'utf8'}).trim().split('\n').filter(Boolean)};
fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
process.exitCode=(!result.sameRoutes||result.protectedPathChanges.length||result.routes.some(r=>!r.identical&&!['work/flagstone/index.html','flagstone/accessibility/index.html'].includes(r.route)))?1:0;
