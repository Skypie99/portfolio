import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const { chromium, webkit } = require('playwright-core');
const [base, dest] = process.argv.slice(2);
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname));
const source = fs.readFileSync('scripts/overflow-census.mjs', 'utf8');
const body = source.match(/const CENSUS = new Function\(`([\s\S]*?)`\);/);
assert(body, 'repository census must be present');
const census = new Function(body[1]);
const rows = [];
for (const [engine, launcher] of Object.entries({chromium,webkit})) {
  const browser = await launcher.launch({headless:true});
  for (const width of [320,393,1440]) for (const theme of ['light','dark']) for (const route of ['/work/flagstone/','/flagstone/accessibility/']) {
    const context = await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce',javaScriptEnabled:false});
    await context.route('**/*',req=>{const u=new URL(req.request().url());if(u.hostname==='127.0.0.1'||u.protocol==='data:'||(u.protocol==='blob:'&&u.origin===base))return req.continue();return req.abort();});
    const page = await context.newPage();
    const response = await page.goto(base+route,{waitUntil:'networkidle'});
    const r = await page.evaluate(census);
    const item = {engine,width,theme,route,status:response.status(),overhangs:r.offenders,nonVacuityProof:r.nonVacuityProof,jsEnabled:await page.evaluate(()=>{const s=document.createElement('script');s.textContent='window.__qa_probe=true';document.body.append(s);return Boolean(window.__qa_probe);})};
    rows.push(item);
    if(item.status!==200||item.overhangs.length||!item.nonVacuityProof||item.jsEnabled)console.error('FAIL',JSON.stringify(item));
    await context.close();
  }
  console.log(engine,'completed 12 no-JS frames');
  await browser.close();
}
fs.writeFileSync(dest,JSON.stringify(rows,null,2)+'\n');
console.log('no-JS overflow:',rows.length,'frames;',rows.reduce((n,r)=>n+r.overhangs.length,0),'findings;',rows.filter(r=>r.nonVacuityProof).length,'plants caught');
if(rows.some(r=>r.status!==200||r.overhangs.length||!r.nonVacuityProof||r.jsEnabled))process.exitCode=1;
