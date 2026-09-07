import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const repo = '/Users/skypie/Portfolio-codex/portfolio-3.0-phase07-20260905';
const require = createRequire(join(repo, 'package.json'));
const { chromium } = require('playwright-core');
const output = join(repo, 'qa-reports/phase-07-repair3');
mkdirSync(output, { recursive: true });
const base = 'http://127.0.0.1:3028/';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const results = [];
const failures = [];

async function ready(page, options) {
  await page.evaluate(() => document.fonts.ready);
  if (options.javaScriptEnabled !== false && options.reducedMotion !== 'reduce') {
    await page.waitForSelector('.pin-spacer');
  }
  await page.waitForFunction(() => [...document.querySelectorAll('img[data-plate]')]
    .every(img => img.complete && img.naturalWidth > 0));
}

async function inspect(label, options, deficit = null, keyboard = false, journey = false) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (deficit !== null) {
    // Diagnostic simulation only: model Safari's svh/vh difference before
    // ScrollTrigger initializes. The production artifact itself is unchanged.
    await page.route('**/_next/static/css/*.css', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()) + `\n.cdesert-pin{height:calc(100vh - ${deficit}px)!important;}` });
    });
  }
  // Next background route prefetch can remain in flight after the page is
  // fully rendered. Assert the film, fonts, and pin directly, not network idle.
  await page.goto(`${base}?verify=${label}`, { waitUntil: 'load' });
  await ready(page, options);
  if (deficit !== null) {
    await page.waitForSelector('.pin-spacer');
    await page.evaluate(() => scrollTo(0, document.querySelector('.cdesert-stage').getBoundingClientRect().bottom + scrollY - 620));
    await page.waitForTimeout(1300);
    const seam = await page.evaluate(() => {
      const pin = document.querySelector('.cdesert-pin').getBoundingClientRect();
      const stage = document.querySelector('.cdesert-stage').getBoundingClientRect();
      const hero = document.querySelector('#hero').getBoundingClientRect();
      return { pinBottom: pin.bottom, stageBottom: stage.bottom, heroTop: hero.top, gap: hero.top - pin.bottom };
    });
    assert.ok(Math.abs(seam.gap) < 1, `${label}: exposed stage gap ${seam.gap}`);
    results.push({ label, simulatedSmallViewportDeficit: deficit, seam });
    await page.screenshot({ path: join(output, `${label}.png`) });
    await context.close();
    return;
  }
  await page.screenshot({path: join(output, `${label}-first.png`)});
  const skip = page.getByRole('link', {name: /skip intro/i});
  if (keyboard) { await skip.focus(); await page.keyboard.press('Enter'); }
  else if (options.hasTouch) await skip.tap();
  else await skip.click();
  await page.waitForTimeout(500);
  const landing = await page.evaluate(() => {
    const hero = document.querySelector('#hero');
    const identity = document.querySelector('[data-hero-identity]');
    const ps = [...identity.querySelectorAll('p')];
    const role = ps.find(p => p.textContent.startsWith('Senior technical-support'));
    const imprint = ps.find(p => p.textContent.startsWith('SkyPi Studio'));
    return {
      viewport: [innerWidth, innerHeight], scrollY, margin: getComputedStyle(hero).scrollMarginTop,
      identityTop: identity.getBoundingClientRect().top,
      roleTop: role.getBoundingClientRect().top,
      headingTop: document.querySelector('#hero h1').getBoundingClientRect().top,
      name: ps[0].textContent, imprint: imprint.textContent,
      creditCasing: getComputedStyle(imprint).textTransform,
      focus: document.activeElement === hero,
      focusVisible: hero.matches(':focus-visible'),
      overflow: document.documentElement.scrollWidth - innerWidth,
      title: document.title,
    };
  });
  assert.equal(landing.name, 'Skyler Halisky');
  assert.equal(landing.imprint, 'SkyPi Studio is one person.');
  assert.equal(landing.creditCasing, 'none');
  assert.ok(landing.identityTop > 0, `${label}: clipped identity`);
  assert.equal(landing.overflow, 0);
  if (options.viewport.width < 768) {
    assert.ok(landing.roleTop < options.viewport.height / 2, `${label}: role too low`);
    assert.equal(landing.margin, '-360px');
  }
  if (options.viewport.width === 956) assert.equal(landing.margin, '-310px');
  if (options.viewport.width === 1440) assert.equal(landing.margin, '0px');
  if (keyboard) { assert.equal(landing.focus, true); assert.equal(landing.focusVisible, true); }
  await page.screenshot({path: join(output, `${label}-arrival.png`)});
  const steps = [];
  if (journey) {
    await page.goBack(); await page.waitForTimeout(400);
    steps.push({step:'back', y:await page.evaluate(()=>scrollY)});
    assert.ok(steps.at(-1).y < 10);
    await page.goForward(); await page.waitForTimeout(500);
    steps.push({step:'forward', y:await page.evaluate(()=>scrollY)});
    assert.ok(Math.abs(steps.at(-1).y - landing.scrollY) < 2);
    await page.reload({waitUntil:'load'}); await ready(page, options); await page.waitForTimeout(500);
    steps.push({step:'reload', y:await page.evaluate(()=>scrollY)});
    assert.ok(Math.abs(steps.at(-1).y - landing.scrollY) < 2);
    await page.setViewportSize({width:956,height:440});
    await page.waitForTimeout(800);
    await page.goto(`${base}?verify=rotated`,{waitUntil:'load'}); await ready(page, options);
    await page.getByRole('link',{name:/skip intro/i}).tap(); await page.waitForTimeout(500);
    const rotated = await page.evaluate(()=>({identityTop:document.querySelector('[data-hero-identity]').getBoundingClientRect().top,margin:getComputedStyle(document.querySelector('#hero')).scrollMarginTop}));
    assert.ok(rotated.identityTop > 0 && rotated.identityTop < 100);
    assert.equal(rotated.margin,'-310px');
    steps.push({step:'rotate-landscape',...rotated});
  }
  assert.deepEqual(errors, []);
  results.push({label, landing, steps, errors});
  await context.close();
}

async function run(...args) {
  try {await inspect(...args); console.log(`PASS ${args[0]}`);}
  catch(error) {failures.push({label:args[0],error:error.message});}
}
for (const theme of ['dark','light']) {
  for (const deficit of [0,40,80]) await run(`seam-${theme}-${deficit}`,{viewport:{width:440,height:844},hasTouch:true,isMobile:true,colorScheme:theme},deficit);
  for (const width of [320,375,393,430,440]) await run(`portrait-${theme}-${width}`,{viewport:{width,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3,colorScheme:theme},null,false,width===440&&theme==='dark');
  await run(`landscape-${theme}`,{viewport:{width:956,height:440},hasTouch:true,isMobile:true,colorScheme:theme});
  await run(`desktop-${theme}`,{viewport:{width:1440,height:900},colorScheme:theme});
}
await run('reduced-motion',{viewport:{width:375,height:812},hasTouch:true,isMobile:true,colorScheme:'dark',reducedMotion:'reduce'});
await run('keyboard',{viewport:{width:375,height:812},colorScheme:'dark'},null,true);
await run('no-js',{viewport:{width:375,height:812},colorScheme:'light',javaScriptEnabled:false});
await browser.close();
const evidence = {sourceHead:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),browser:'Desktop Chromium; svh/vh mismatch simulated; not physical Safari evidence',results,failures};
writeFileSync(join(output,'metrics.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({cells:results.length,failures,landings:results.filter(x=>x.landing).map(({label,landing})=>({label,identityTop:landing.identityTop,roleTop:landing.roleTop,headingTop:landing.headingTop})),seams:results.filter(x=>x.seam).map(({label,seam})=>({label,gap:seam.gap}))},null,2));
assert.equal(failures.length,0);
