import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import crypto from 'node:crypto';
const repo='/Users/skypie/Portfolio-codex/portfolio-3.0-phase08-20260907';
const require=createRequire(repo+'/package.json');
const {chromium}=require('playwright-core');
const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const instrument=fs.readFileSync(repo+'/scripts/overflow-census.mjs','utf8');
const start=instrument.indexOf('const CENSUS = ')+'const CENSUS = '.length;
const census=new Function('return '+instrument.slice(start,instrument.indexOf('\nasync function main()',start)))();
const out=path.resolve('work/evidence/final-matrix');fs.mkdirSync(out,{recursive:true});
const walk=(d,r='')=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name),r+e.name+'/'):e.name==='index.html'?['/'+r]:[]);
const allRoutes=walk(repo+'/out').sort();
const routes=allRoutes.filter(r=>!r.startsWith('/archive'));
const widths=[1440,1280,1024,768,430,393,390,375,360,320];
const cells=[];
for(const route of routes)for(const theme of ['light','dark'])for(const width of widths)cells.push({route,theme,width,height:width>=768?900:852,mode:'normal',axe:width===1440||width===320,shot:width===1440||width===320});
for(const route of ['/','/about/','/work/','/work/flagstone/','/accessibility/','/contact/','/certificates/','/flagstone/'])for(const theme of ['light','dark'])for(const width of [479,480,481,599,600,601,639,640,641,766,767,769,1023,1025,1279,1281])cells.push({route,theme,width,height:900,mode:'boundary'});
for(const route of routes)for(const theme of ['light','dark'])cells.push({route,theme,width:390,height:844,mode:'reduced',shot:route==='/' });
for(const route of routes.filter(r=>r.startsWith('/flagstone/')))for(const theme of ['light','dark'])for(const mode of ['forced','high','reading','text200','spacing'])cells.push({route,theme,width:390,height:844,mode,axe:true,shot:true});
for(const route of ['/','/work/','/work/flagstone/','/about/','/contact/'])for(const theme of ['light','dark'])for(const height of [499,500,501,799,800,801,898,899,900])cells.push({route,theme,width:1280,height,mode:'short'});
for(const theme of ['light','dark'])for(const height of [499,500,501])cells.push({route:'/',theme,width:844,height,mode:'touch',shot:true});
cells.splice(0,cells.length,...cells.filter(c=>c.route==='/accessibility/'||c.route.startsWith('/flagstone/')));
fs.writeFileSync(out+'/manifest.json',JSON.stringify({candidateState:'uncommitted Phase08 fixes; see final-source-identity.json',baseSourceSha:'47c3d67c5fabd358c4cfc689d294c8395e65c494',baseSourceTree:'098ec9e6793e88d30172a65f3d35f67e26a3194f',allRoutes,routes,excluded:allRoutes.filter(r=>!routes.includes(r)),cells:cells.length,axeVersion:require('axe-core/package.json').version,instrumentSha256:crypto.createHash('sha256').update(instrument).digest('hex')},null,2));
const browser=await chromium.launch({executablePath:'/Users/skypie/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell',headless:true});
console.log('Browser '+browser.version()+' cells '+cells.length+' routes '+routes.length);
let idx=0,done=0;const results=fs.existsSync(out+'/summary.json')?JSON.parse(fs.readFileSync(out+'/summary.json')).filter(r=>!r.error):[];const finished=new Set(results.map(r=>r.id));
async function worker(){while(idx<cells.length){const cell=cells[idx++];let context;const id=String(idx).padStart(4,'0')+'-'+cell.route.replaceAll('/','_')+'-'+cell.theme+'-'+cell.width+'x'+cell.height+'-'+cell.mode;if(finished.has(id)){done++;continue;}try{
context=await browser.newContext({viewport:{width:cell.width,height:cell.height},colorScheme:cell.theme,reducedMotion:cell.mode==='reduced'?'reduce':'no-preference',hasTouch:cell.mode==='touch',isMobile:cell.mode==='touch',forcedColors:cell.mode==='forced'?'active':'none'});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
await context.addInitScript(({theme,mode})=>{localStorage.setItem('theme',theme);localStorage.setItem('flagstone-a11y-prefs',JSON.stringify({dark:theme==='dark',size:mode==='text200'?200:100,contrast:mode==='high',reading:mode==='reading',motion:mode==='reduced'}));},cell);
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const response=await page.goto('http://127.0.0.1:3038'+cell.route,{waitUntil:'load',timeout:30000});
const redirects={'/blog/building-accessmap/':'/blog/building-flagstone/','/work/accessmap/':'/work/flagstone/','/work/mutual-mesh/':'/work/'};if(redirects[cell.route])await page.waitForURL('**'+redirects[cell.route],{waitUntil:'load'});
await page.evaluate(()=>document.fonts.ready);
if(cell.route==='/'&&cell.mode!=='reduced')await page.waitForSelector('.pin-spacer',{timeout:15000});
if(cell.mode==='spacing')await page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
await page.waitForTimeout(150);
const initial=await page.evaluate(census);
if(cell.route==='/'){const skip=page.getByRole('link',{name:/skip intro/i});if(await skip.isVisible()){await skip.click();await page.waitForTimeout(400);}}
const geometry=await page.evaluate(census);
const semantics=await page.evaluate(()=>({title:document.title,theme:document.documentElement.dataset.theme||document.documentElement.className,bg:getComputedStyle(document.body).backgroundColor,color:getComputedStyle(document.body).color,rootSize:getComputedStyle(document.documentElement).fontSize,main:document.querySelectorAll('main').length,headings:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>({level:e.tagName,text:e.textContent.trim()})),text:document.querySelector('main')?.innerText,controls:[...document.querySelectorAll('a,button,input,summary')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').map(e=>({tag:e.tagName,text:(e.getAttribute('aria-label')||e.textContent).trim().slice(0,100),href:e.getAttribute('href'),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),header:[...document.querySelectorAll('header.page .tagline,header.page .meta')].map(e=>({text:e.textContent,color:getComputedStyle(e).color,opacity:getComputedStyle(e).opacity,background:getComputedStyle(e.closest('header')).backgroundColor,fontSize:getComputedStyle(e).fontSize}))}));
let accessibility=null;if(cell.axe){await page.evaluate(axe);accessibility=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});return {violations:r.violations,incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),passes:r.passes.length};});}
if(cell.shot)await page.screenshot({path:out+'/'+id+'.png',fullPage:true,timeout:60000});
const row={id,...cell,finalUrl:page.url(),status:response.status(),initial,geometry,semantics,accessibility,errors};fs.writeFileSync(out+'/'+id+'.json',JSON.stringify(row));results.push({id,...cell,status:row.status,offenders:geometry.offenders.length,initialOffenders:initial.offenders.length,probe:geometry.nonVacuityProof,violations:accessibility?.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),errors});
}catch(e){results.push({id,...cell,error:String(e)});}finally{await context?.close().catch(()=>{});done++;if(done%25===0){fs.writeFileSync(out+'/summary.json',JSON.stringify(results,null,2));console.log('completed '+done+'/'+cells.length);}}}}
try{await Promise.all([worker(),worker()]);}finally{await browser.close();fs.writeFileSync(out+'/summary.json',JSON.stringify(results,null,2));}console.log('DONE '+results.length);
