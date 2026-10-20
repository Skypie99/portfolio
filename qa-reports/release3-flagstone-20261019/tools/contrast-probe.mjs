// Conservative rendered-background probe. This is not a complete WCAG audit.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(path.join(process.cwd(),'package.json'));
const {chromium}=require('playwright-core');const sharp=require('sharp');
const [base,dest]=process.argv.slice(2);
const targets={label01:'[data-proof-window="01"] > p',label02:'[data-proof-window="02"] > p',label03:'[data-proof-window="03"] > p',provenance:'.proof-row + p',caption01:'[data-proof-window="01"] figcaption',kicker:'.proof-breakout > p:first-child'};
const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const rows=[];const browser=await chromium.launch();
for(const width of [393,1440])for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,deviceScaleFactor:1,reducedMotion:'no-preference'});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const page=await context.newPage();await page.goto(base+'/work/flagstone/',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
 for(const [name,selector] of Object.entries(targets))for(const fraction of [.12,.45,.8]){
  await page.evaluate(({selector,fraction})=>{const e=document.querySelector(selector);window.scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*fraction);},{selector,fraction});
  await page.waitForTimeout(1200);
  const info=await page.evaluate(selector=>{const e=document.querySelector(selector),r=document.createRange();r.selectNodeContents(e);return{color:getComputedStyle(e).color,fontSize:getComputedStyle(e).fontSize,rects:[...r.getClientRects()].filter(b=>b.width>1&&b.y>=0&&b.bottom<=innerHeight).map(b=>({x:b.x,y:b.y,width:b.width,height:b.height}))};},selector);
  const color=info.color.match(/[\d.]+/g).slice(0,3).map(Number);if(!info.rects.length)continue;
  const style=await page.addStyleTag({content:`${selector}, ${selector} * { visibility:hidden!important; }`});
  await page.waitForTimeout(300);
  const shot=await page.screenshot({type:'png'});
  const {data,info:img}=await sharp(shot).raw().toBuffer({resolveWithObject:true});
  const after=await page.evaluate(selector=>{const r=document.createRange();r.selectNodeContents(document.querySelector(selector));return [...r.getClientRects()].filter(b=>b.width>1&&b.y>=0&&b.bottom<=innerHeight).map(b=>({x:b.x,y:b.y,width:b.width,height:b.height}));},selector);
  await style.evaluate(s=>s.remove());
  const stable=info.rects.length===after.length&&info.rects.every((r,i)=>Math.abs(r.x-after[i].x)<.5&&Math.abs(r.y-after[i].y)<.5);
  if(!stable){rows.push({width,theme,name,fraction,unstable:true,before:info.rects,after});continue;}
  const samples=[];
  for(const r of info.rects)for(let y=Math.ceil(r.y);y<Math.floor(r.y+r.height);y+=2)for(let x=Math.ceil(r.x);x<Math.floor(r.x+r.width);x+=2){if(x<0||x>=img.width||y<0||y>=img.height)continue;const n=(y*img.width+x)*img.channels;samples.push(ratio(color,[data[n],data[n+1],data[n+2]]));}
  samples.sort((a,b)=>a-b);rows.push({width,theme,name,fraction,color:info.color,fontSize:info.fontSize,min:samples[0],p05:samples[Math.floor(samples.length*.05)],median:samples[Math.floor(samples.length*.5)],stable});
  if(samples[0]<3)fs.writeFileSync(path.join(path.dirname(dest),`contrast-${width}-${theme}-${name}-${fraction}.png`),shot);
 }
 await context.close();console.log('contrast',width,theme);
}
await browser.close();
const worst={};for(const r of rows.filter(r=>!r.unstable)){const key=r.theme+'/'+r.name;if(!worst[key]||r.min<worst[key].min)worst[key]=r;}
const result={method:'Chromium only. Computed foreground compared with pixels behind glyph-hidden line rectangles at three scroll positions. Conservative background sampling; not a full focus/movie/assistive-technology conformance assessment.',rows,worst:Object.values(worst)};
fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.worst,null,2));
