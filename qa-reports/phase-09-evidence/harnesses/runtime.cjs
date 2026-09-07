const fs=require('node:fs');
const {chromium}=require('playwright-core');
const executablePath='/Users/skypie/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const artifact=JSON.parse(fs.readFileSync('qa-reports/phase-09-evidence/artifact.json','utf8'));
const routes=artifact.routes.filter(x=>!['/archive/','/runway/'].includes(x.route));
(async()=>{
 const browser=await chromium.launch({executablePath,headless:true});const rows=[];
 for(const route of routes){
  const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light'});
  // Integrity run only: cache disabled by routing. Prevent unexpected writes.
  await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
  const page=await context.newPage();const errors=[],failed=[],responses=[];
  page.on('console',e=>{if(['error','warning'].includes(e.type()))errors.push({type:e.type(),message:e.text()})});
  page.on('pageerror',e=>errors.push({type:'pageerror',message:e.message}));
  page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('response',r=>{if(r.status()>=400)responses.push({url:r.url(),status:r.status()})});
  let result;
  try{
   const response=await page.goto('http://127.0.0.1:3049'+route.route,{waitUntil:'load',timeout:30000});
   await page.waitForTimeout(1800);
   // Natural scroll only, exercises existing reveal and lazy media ownership.
   let y=0;for(let i=0;i<40;i++){const height=await page.evaluate(()=>document.documentElement.scrollHeight);if(y>=height)break;await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(160);y+=720;}
   await page.waitForTimeout(1500);
   result=await page.evaluate(()=>({url:location.href,title:document.title,h1:[...document.querySelectorAll('h1')].map(x=>x.textContent.trim()),brokenImages:[...document.images].filter(x=>x.complete && x.currentSrc && x.naturalWidth===0).map(x=>x.currentSrc),resources:performance.getEntriesByType('resource').map(x=>({url:x.name,bytes:x.encodedBodySize})),canonical:[...document.querySelectorAll('link[rel="canonical"]')].map(x=>x.href)}));
   result.status=response?.status();
   if(['/','/work/flagstone/'].includes(route.route)){await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(300);await page.screenshot({path:'qa-reports/phase-09-evidence/'+(route.route==='/'?'home':'flagstone')+'-runtime.png'});}
  }catch(e){result={error:String(e)}}
  rows.push({route:route.route,redirect:route.refresh,...result,errors,failed,responses});
  fs.writeFileSync('qa-reports/phase-09-evidence/runtime.json',JSON.stringify({date:new Date().toISOString(),browser:browser.version(),artifactDigest:artifact.artifactDigest,method:'desktop1440x900 light normal motion, natural scroll; public HTML incl404/redirects; private Archive and unlisted Runway excluded from runtime, retained in static scan; no form submissions',rows},null,2));
  console.log(JSON.stringify({route:route.route,errors:errors.length,failed:failed.length,httpErrors:responses.length,brokenImages:result.brokenImages?.length}));
  await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
