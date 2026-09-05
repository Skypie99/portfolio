const { chromium }=require('/Users/skypie/Portfolio-3.0-baseline/node_modules/playwright-core');
const fs=require('fs'),path=require('path');
const stage=process.argv[2],port=stage==='before'?4404:4405;
const root=process.argv[3]||'/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi/work/evidence';
const dir=path.join(root,stage);fs.mkdirSync(dir,{recursive:true});
const widths=[320,375,393,430,768,1024,1280,1440],themes=['light','dark'];
const routes=['/flagstone/','/flagstone/accessibility/','/flagstone/privacy/','/flagstone/support/','/flagstone/terms/'];
const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number);
const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{a=lum(a);b=lum(b);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
(async()=>{
 const browser=await chromium.launch({executablePath:'/Users/skypie/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',headless:true});
 const results={stage,browser:browser.version(),time:new Date().toISOString(),motion:'reduce',deviceScaleFactor:1,utility:[],cta:[],caseStudy:[]};
 for(const width of widths)for(const theme of themes){
  const ctx=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,colorScheme:theme,reducedMotion:'reduce'});
  await ctx.addInitScript(({theme})=>{localStorage.setItem('theme',theme);localStorage.setItem('flagstone-a11y-prefs',JSON.stringify({dark:theme==='dark',motion:true}));},{theme});
  const page=await ctx.newPage();
  for(const route of routes){
   await page.goto(`http://127.0.0.1:${port}${route}`,{waitUntil:'domcontentloaded'});
   await page.evaluate(()=>document.fonts.ready);
   const data=await page.locator('header.page p.tagline,header.page p.meta').evaluateAll(es=>es.map(e=>{const cs=getComputedStyle(e),h=e.closest('header.page'),hs=getComputedStyle(h);return {text:e.textContent,fontSize:cs.fontSize,fontWeight:cs.fontWeight,fontFamily:cs.fontFamily,color:cs.color,opacity:cs.opacity,background:hs.backgroundColor,headerOpacity:hs.opacity,theme:document.documentElement.dataset.theme,ancestors:(()=>{let p=e.parentElement,a=[];while(p){const s=getComputedStyle(p);a.push({tag:p.tagName,opacity:s.opacity,bg:s.backgroundColor});p=p.parentElement;}return a})(),rect:JSON.parse(JSON.stringify(e.getBoundingClientRect())),headerRect:JSON.parse(JSON.stringify(h.getBoundingClientRect()))}}));
   for(const d of data){let fg=rgb(d.color),bg=rgb(d.background);const alpha=Number(d.opacity)*(fg[3]??1);d.effectiveColor=fg.slice(0,3).map((c,i)=>c*alpha+bg[i]*(1-alpha));d.contrast=ratio(d.effectiveColor,bg);}
   const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   const file=`${width}-${theme}-${route.split('/').filter(Boolean).join('-')}.png`;
   await page.screenshot({path:path.join(dir,file)});results.utility.push({width,theme,route,data,overflow,file});
  }
  await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);
  const pills=page.locator('a.rounded-pill.h-11.border-border-interactive');
  const snapshots=[];
  for(let i=0;i<await pills.count();i++){
   const p=pills.nth(i);await p.scrollIntoViewIfNeeded();
   const states={};
   const read=()=>p.evaluate(e=>{const s=getComputedStyle(e);const keys=['height','width','paddingTop','paddingBottom','paddingLeft','paddingRight','borderRadius','borderTopWidth','borderTopColor','backgroundColor','color','fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','boxShadow','outlineStyle','outlineColor','outlineWidth','outlineOffset','transform','transitionDuration'];const r={};keys.forEach(k=>r[k]=s[k]);return {style:r,className:e.className,href:e.getAttribute('href'),tabIndex:e.tabIndex,focusVisible:e.matches(':focus-visible'),hover:e.matches(':hover'),active:e.matches(':active'),children:[...e.children].map(c=>{let s=getComputedStyle(c);return{color:s.color,width:s.width,height:s.height,background:s.backgroundColor}})}});
   await page.mouse.move(0,0);await p.evaluate(e=>e.blur());await page.waitForTimeout(200);states.default=await read();
   if(stage==='after'){
    await p.hover();await page.waitForTimeout(200);states.hover=await read();
    await page.mouse.down();states.active=await read();await page.mouse.move(0,0);await page.mouse.up();
    await page.keyboard.press('Tab');await p.focus();await page.waitForTimeout(200);states.focus=await read();
   }
   snapshots.push(states);
  }
  await page.locator('#flagship').scrollIntoViewIfNeeded();
  await page.locator('#flagship').screenshot({path:path.join(dir,`${width}-${theme}-flagship.png`)});
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  results.cta.push({width,theme,snapshots,overflow});
  await page.goto(`http://127.0.0.1:${port}/work/flagstone/`,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);
  await page.screenshot({path:path.join(dir,`${width}-${theme}-case-study.png`)});
  results.caseStudy.push({width,theme,overflow:await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})),bridgeCount:await page.getByText('This is the support work Flagstone demonstrates:',{exact:false}).count()});
  await ctx.close();
  fs.writeFileSync(path.join(dir,'matrix.json'),JSON.stringify(results,null,2));
  console.log(`${stage} ${width} ${theme} captured`);
 }
 await browser.close();console.log('COMPLETE',stage);
})().catch(e=>{console.error(e);process.exit(1)});
