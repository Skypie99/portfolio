const {chromium}=require('/Users/skypie/Portfolio-3.0-baseline/node_modules/playwright-core');const fs=require('fs'),path=require('path');
const dir=path.resolve('work/resolution-evidence/interactions');fs.mkdirSync(dir,{recursive:true});
const utility=['/flagstone/','/flagstone/accessibility/','/flagstone/privacy/','/flagstone/support/','/flagstone/terms/'];
const routes=['/','/work/flagstone/','/about/',...utility];const results={at:new Date().toISOString(),axe:[],smoke:[],activation:[],typography:[]};
const executablePath='/Users/skypie/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
(async()=>{const browser=await chromium.launch({headless:true,executablePath});results.browser=browser.version();
for(const theme of ['light','dark']){
 const ctx=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,colorScheme:theme,reducedMotion:'reduce'});
 await ctx.addInitScript(t=>{localStorage.setItem('theme',t);localStorage.setItem('flagstone-a11y-prefs',JSON.stringify({dark:t==='dark',motion:true}));},theme);
 const page=await ctx.newPage();
 for(const route of routes){
  await page.goto('http://127.0.0.1:4405'+route,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
  await page.addScriptTag({path:'/Users/skypie/Portfolio-3.0-baseline/node_modules/axe-core/axe.min.js'});
  const axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length})),passes:r.passes.length}});
  results.axe.push({theme,route,width:393,...axe});
  if(utility.includes(route)){
   await page.locator('summary').first().tap();
   await page.locator('#a11y-size').focus();await page.keyboard.press('End');
   results.smoke.push({theme,route,type:'native text-size control 200%',...await page.evaluate(()=>({size:document.documentElement.style.fontSize,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,headerFont:getComputedStyle(document.querySelector('header.page p')).fontSize}))});
   await page.screenshot({path:path.join(dir,theme+'-'+route.split('/').filter(Boolean).join('-')+'-text200.png')});
   await page.locator('#a11y-size').focus();await page.keyboard.press('Home');
   await page.locator('#a11y-contrast').tap();
   results.smoke.push({theme,route,type:'site high contrast toggle',value:await page.locator('html').getAttribute('data-contrast')});
   await page.locator('#a11y-contrast').tap();
  }
  await page.emulateMedia({forcedColors:'active'});
  await page.keyboard.press('Tab');
  results.smoke.push({theme,route,type:'forced-colors',...await page.evaluate(()=>({active:matchMedia('(forced-colors: active)').matches,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,focus:document.activeElement.tagName,outline:getComputedStyle(document.activeElement).outlineStyle}))});
  await page.emulateMedia({forcedColors:'none'});
  await page.setViewportSize({width:640,height:450});
  results.smoke.push({theme,route,type:'200% browser-zoom reflow equivalent (1280 physical to 640 CSS px; not native browser zoom)',...await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}))});
  await page.screenshot({path:path.join(dir,theme+'-'+(route==='/'?'home':route.split('/').filter(Boolean).join('-'))+'-reflow640.png')});
  await page.setViewportSize({width:393,height:852});fs.writeFileSync(path.join(dir,'checks.json'),JSON.stringify(results,null,2));
 }
 for(const mode of ['keyboard','pointer','touch']){
  await page.goto('http://127.0.0.1:4405/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(350);
  const target=page.locator('#flagship a.rounded-pill.h-11');
  if(mode==='keyboard'){
   let found=false,tabStops=[];for(let i=0;i<100;i++){await page.keyboard.press('Tab');const info=await page.evaluate(()=>({text:document.activeElement.textContent?.trim().slice(0,90),href:document.activeElement.getAttribute('href'),isFlagship:!!document.activeElement.closest('#flagship')&&document.activeElement.classList.contains('rounded-pill'),focusVisible:document.activeElement.matches(':focus-visible')}));tabStops.push(info);if(info.isFlagship){found=true;break;}}
   if(found){await page.keyboard.press('Enter');await page.waitForURL(/\/work\/flagstone\/?$/,{waitUntil:'domcontentloaded'});}
   results.activation.push({theme,mode,found,url:page.url(),tabStops});
  }else{await target.scrollIntoViewIfNeeded();if(mode==='pointer')await target.click();else await target.tap();await page.waitForURL(/\/work\/flagstone\/?$/,{waitUntil:'domcontentloaded'});results.activation.push({theme,mode,url:page.url()});}
 }
 // The duplicate row doorway remains activatable while its row title owns keyboard focus.
 await page.goto('http://127.0.0.1:4405/',{waitUntil:'domcontentloaded'});const row=page.locator('a[aria-label="View project: Flagstone case study"]');await row.tap();await page.waitForURL(/\/work\/flagstone\/?$/,{waitUntil:'domcontentloaded'});results.activation.push({theme,mode:'duplicate-row-touch',url:page.url()});
 await page.getByText('This is the support work Flagstone demonstrates:',{exact:false}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,theme+'-professional-bridge.png')});
 for(const route of ['/','/about/','/work/flagstone/','/work/','/contact/']){await page.goto('http://127.0.0.1:4405'+route,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);results.typography.push({theme,route,...await page.evaluate(()=>{const s={};for(const cls of ['font-serif','font-sans','font-mono']){const e=document.querySelector('.'+cls);s[cls]=e?getComputedStyle(e).fontFamily:null;}return s;})});}
 await ctx.close();fs.writeFileSync(path.join(dir,'checks.json'),JSON.stringify(results,null,2));console.log('completed checks',theme);
}
// Standard-motion smoke, with the unchanged real skip affordance.
const ctx=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'no-preference'});const page=await ctx.newPage();for(const route of ['/','/work/flagstone/',...utility]){await page.goto('http://127.0.0.1:4405'+route,{waitUntil:'domcontentloaded'});results.smoke.push({route,type:'standard-motion',...await page.evaluate(()=>({reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,skipLinks:[...document.querySelectorAll('a,button')].filter(e=>/skip intro/i.test(e.textContent)).map(e=>e.textContent.trim())}))});}await ctx.close();fs.writeFileSync(path.join(dir,'checks.json'),JSON.stringify(results,null,2));await browser.close();console.log('COMPLETE interactions');})().catch(e=>{console.error(e);process.exit(1)});
