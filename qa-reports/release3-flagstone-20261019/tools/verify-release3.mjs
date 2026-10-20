#!/usr/bin/env node
// Run from the candidate checkout, against its local static export server.
// node verify-release3.mjs <http://127.0.0.1:PORT> <evidence-directory>
// Each browser runs sequentially; all page requests are restricted to loopback.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const { chromium, webkit } = require('playwright-core');
const base = process.argv[2];
const dest = path.resolve(process.argv[3]);
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
fs.mkdirSync(path.join(dest, 'screenshots'), { recursive: true });
const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const results = { scenarioRuns: [], tableRuns: [], failures: [], methodology: {
  page: '/work/flagstone/', engines: 'Headless Playwright Chromium and WebKit, not real Safari/device acceptance',
  noJS: 'Browser javaScriptEnabled:false; evaluation used only for measurement, no theme injection',
  captures: 'Arrival screenshots use the stated viewport. Hero/proof section captures temporarily extend viewport height at the same width to paint the fixed backdrop over the whole section.',
  axe: 'WCAG 2 A/AA, 2.1 A/AA, 2.2 AA; normal/reduced-motion scenarios only. Incomplete rules require manual review.',
} };
const save = () => fs.writeFileSync(path.join(dest, 'browser-results.json'), JSON.stringify(results, null, 2) + '\n');
const check = (condition, message, record) => {
  if (!condition) { record.failures.push(message); results.failures.push(`${record.id}: ${message}`); }
};
async function setup(browser, viewport, theme, mode) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1,
    colorScheme: theme, reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference',
    javaScriptEnabled: mode !== 'nojs', isMobile: viewport.width < 640, hasTouch: viewport.width < 640 });
  const blockedHosts = [];
  await ctx.route('**/*', route => {
    const url = new URL(route.request().url());
    const host = url.hostname;
    if (url.protocol === 'data:' || (url.protocol === 'blob:' && url.origin === base)) return route.continue();
    if (['127.0.0.1', 'localhost'].includes(host)) return route.continue();
    blockedHosts.push(host); return route.abort();
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return { ctx, page, errors, blockedHosts };
}
async function screenshot(page, locator, name, viewport) {
  const h = await locator.evaluate(el => el.getBoundingClientRect().height);
  await page.setViewportSize({ width: viewport.width, height: Math.max(viewport.height, Math.ceil(h + 100)) });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await locator.screenshot({ path: path.join(dest, 'screenshots', name + '.jpg'), type: 'jpeg', quality: 88, animations: 'disabled' });
  await page.setViewportSize(viewport);
}
async function audit(page, scope) {
  await page.evaluate(axe);
  return page.evaluate(async scope => {
    const r = await window.axe.run(scope || document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] } });
    const concise = a => a.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) }));
    return { violations: concise(r.violations), incomplete: concise(r.incomplete), passes: r.passes.length };
  }, scope);
}
for (const [engine, launcher] of Object.entries({ chromium, webkit })) {
  if (process.argv[4] && !process.argv[4].split(',').includes(engine)) continue;
  const browser = await launcher.launch({ headless: true });
  console.log('ENGINE', engine, browser.version());
  for (const viewport of [{width:1440,height:900}, {width:393,height:852}]) {
    for (const theme of ['light','dark']) for (const mode of ['normal','reduce','nojs']) {
      const id = `${engine}-${viewport.width}-${theme}-${mode}`;
      const record = { id, engine, browserVersion: browser.version(), viewport, requestedTheme: theme, mode, failures: [] };
      const {ctx,page,errors,blockedHosts} = await setup(browser,viewport,theme,mode);
      try {
        const response = await page.goto(base+'/work/flagstone/',{waitUntil:'load'});
        check(response.status() === 200, 'route status', record);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1700);
        record.initial = await page.evaluate(() => ({dark:document.documentElement.classList.contains('dark'),js:document.documentElement.classList.contains('js'),video:Array.from(document.querySelectorAll('.proof-row video')).map(v=>({paused:v.paused,time:v.currentTime,autoplay:v.autoplay,controls:v.controls}))}));
        check(record.initial.video.every(v=>v.paused && v.time===0 && !v.autoplay),'video must stay paused on load',record);
        if(mode!=='nojs') check(record.initial.dark===(theme==='dark'),'theme must match',record);
        else check(!record.initial.js && record.initial.video.every(v=>v.controls),'no-JS native controls and static document',record);
        await page.screenshot({path:path.join(dest,'screenshots',id+'-arrival.jpg'),type:'jpeg',quality:85,animations:'disabled'});
        const hero=page.locator('figure').filter({has:page.locator('.hero-settle-img')}).first();
        await hero.scrollIntoViewIfNeeded();
        record.hero=await hero.evaluate(el=>{
          const img=el.querySelector('img'),screen=el.querySelector('.pr-screen-phone'),well=el.querySelector('.hero-settle-img'),cap=el.querySelector('figcaption');
          const b=img.getBoundingClientRect(),s=screen.getBoundingClientRect();
          return {width:b.width,height:b.height,screenWidth:s.width,screenHeight:s.height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,complete:img.complete,alt:img.alt,src:img.getAttribute('src'),caption:cap.textContent,gap:cap.getBoundingClientRect().top-well.getBoundingClientRect().bottom};
        });
        check(record.hero.complete && record.hero.naturalWidth===1290 && record.hero.naturalHeight===2803,'authentic capture loads with declared dimensions',record);
        check(Math.abs(record.hero.width/record.hero.height-1290/2803)<0.001,'capture aspect preserved',record);
        check(viewport.width!==393 || Math.abs(record.hero.width-217.4)<1,'approved 220px treatment',record);
        await screenshot(page,hero,id+'-hero',viewport);
        const proof=page.locator('.proof-breakout');
        await proof.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        if (mode === 'normal' && viewport.width >= 1024) {
          await page.waitForFunction(() => Array.from(document.querySelectorAll('.proof-row > li')).every(el => Number(getComputedStyle(el).opacity) > .999 && Math.abs(el.getBoundingClientRect().top - document.querySelector('.proof-row').getBoundingClientRect().top) < 1), null, { timeout: 8000 });
        }
        record.proof=await page.evaluate(()=>{
          const row=document.querySelector('.proof-row');
          return {items:Array.from(row.children).map(li=>{const b=li.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width};}),provenance:row.nextElementSibling.textContent,video:Array.from(row.querySelectorAll('video')).map(v=>({paused:v.paused,time:v.currentTime,autoplay:v.autoplay}))};
        });
        check(record.proof.items.length===3,'three proof panels',record);
        check(record.proof.video.every(v=>v.paused&&v.time===0&&!v.autoplay),'scroll entry must not play clip',record);
        check(record.proof.provenance.includes('2026-09-01')&&record.proof.provenance.includes('1cfb4b1'),'correct provenance',record);
        if(viewport.width>=1024) check(Math.max(...record.proof.items.map(x=>x.y))-Math.min(...record.proof.items.map(x=>x.y))<1,'desktop panels aligned in a row',record);
        else check(record.proof.items.every((a,i,all)=>i===0||a.y>all[i-1].y),'phone panels in reading order',record);
        await screenshot(page,proof,id+'-proof',viewport);
        if(mode!=='nojs') {
          record.axe=await audit(page);
          check(record.axe.violations.length===0,'axe violations',record);
          await page.evaluate(()=>{document.activeElement.blur();window.scrollTo(0,0);});
          let reached=false;
          for(let n=1;n<=60;n++) {
            await page.keyboard.press(engine === 'webkit' ? 'Alt+Tab' : 'Tab');
            if(await page.evaluate(()=>document.activeElement.matches('.proof-row [data-themed-motion] > button'))) {record.keyboardTabs=n;reached=true;break;}
          }
          check(reached,'keyboard reaches video control',record);
          if(reached) {
            record.focus=await page.evaluate(()=>{const a=document.activeElement,c=getComputedStyle(a),b=a.getBoundingClientRect();return {name:a.getAttribute('aria-label'),focusVisible:a.matches(':focus-visible'),outline:c.outline,width:c.outlineWidth,color:c.outlineColor,notObscured:document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)===a||a.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2))};});
            check(record.focus.focusVisible&&record.focus.notObscured&&parseFloat(record.focus.width)>=2,'visible unobscured focus',record);
            await page.screenshot({path:path.join(dest,'screenshots',id+'-focus.jpg'),type:'jpeg',quality:90,animations:'disabled'});
            await page.keyboard.press('Enter');
            await page.waitForFunction(() => document.querySelector('.proof-row video').currentTime > 0, null, { timeout: 8000 });
            record.play=await page.locator('.proof-row video').first().evaluate(v=>({paused:v.paused,time:v.currentTime}));
            check(!record.play.paused&&record.play.time>0,'Enter intentionally plays',record);
            await page.keyboard.press('Space');await page.waitForTimeout(150);
            check(await page.locator('.proof-row video').first().evaluate(v=>v.paused),'Space pauses',record);
            await page.emulateMedia({colorScheme:theme==='light'?'dark':'light'});await page.waitForTimeout(250);
            check(await page.locator('.proof-row video').first().evaluate(v=>v.paused),'theme change preserves pause',record);
          }
        }
        record.errors=errors;record.blockedHosts=blockedHosts;
        check(errors.length===0,'browser console/page errors',record);
        check(blockedHosts.length===0,'unexpected external requests',record);
      } catch(e) {check(false,String(e),record);}
      finally {await ctx.close();results.scenarioRuns.push(record);save();console.log(id,record.failures.length?'FAIL':'PASS');}
    }
  }
  for (const theme of ['light','dark']) for(const scale of [100,200]) {
    const viewport={width:320,height:568};const id=`${engine}-table-${theme}-${scale}`;
    const record={id,engine,theme,textScale:scale,failures:[]};
    const {ctx,page,errors,blockedHosts}=await setup(browser,viewport,theme,'normal');
    try {
      await ctx.addInitScript(scale=>localStorage.setItem('flagstone-a11y-prefs',JSON.stringify({size:scale})),scale);
      await page.goto(base+'/flagstone/accessibility/',{waitUntil:'load'});
      const table=page.locator('.table-wrap');
      await table.scrollIntoViewIfNeeded();
      // Focus is entered using the keyboard from the previous link, not programmatically on the region.
      await page.locator('a[href="https://developer.apple.com/accessibility/"]').focus();
      await page.keyboard.press(engine==='webkit'?'Alt+Tab':'Tab');
      record.focused=await table.evaluate(el=>el===document.activeElement);
      check(record.focused,'keyboard reaches table region',record);
      record.before=await table.evaluate(el=>({left:el.scrollLeft,max:el.scrollWidth-el.clientWidth,name:document.getElementById(el.getAttribute('aria-labelledby')).textContent,outline:getComputedStyle(el).outline,focusVisible:el.matches(':focus-visible')}));
      check(record.before.focusVisible,'table focus is visible',record);
      for(let n=0;n<12;n++){await page.keyboard.press('ArrowRight');await page.waitForTimeout(45);}
      await page.waitForTimeout(200);
      record.right=await table.evaluate(el=>el.scrollLeft);
      check(record.before.max>0&&record.right>0,'keyboard scrolls table right',record);
      for(let n=0;n<12;n++){await page.keyboard.press('ArrowLeft');await page.waitForTimeout(45);}
      await page.waitForTimeout(200);
      record.left=await table.evaluate(el=>el.scrollLeft);
      check(record.left<record.right,'keyboard scrolls table left',record);
      await page.screenshot({path:path.join(dest,'screenshots',id+'.jpg'),type:'jpeg',quality:88,animations:'disabled'});
      await page.keyboard.press('Tab');
      check(await table.evaluate(el=>el!==document.activeElement),'Tab exits region',record);
      record.axe=await audit(page);check(record.axe.violations.length===0,'table page axe violations',record);
      record.errors=errors;record.blockedHosts=blockedHosts;check(errors.length===0,'table page browser errors',record);
    } catch(e){check(false,String(e),record);}
    finally {await ctx.close();results.tableRuns.push(record);save();console.log(id,record.failures.length?'FAIL':'PASS');}
  }
  await browser.close();
}
save();
console.log(JSON.stringify({scenarios:results.scenarioRuns.length,tables:results.tableRuns.length,failures:results.failures},null,2));
process.exitCode=results.failures.length?1:0;
