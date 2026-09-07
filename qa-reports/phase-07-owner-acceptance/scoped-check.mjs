import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const folder = dirname(fileURLToPath(import.meta.url));
const repo = resolve(folder, '../..');
const require = createRequire(resolve(repo, 'package.json'));
const { chromium } = require('playwright-core');
const instrument = readFileSync(resolve(repo, 'scripts/overflow-census.mjs'), 'utf8');
// Reuse the repository's exact element-level detector and its injected
// non-vacuity proof. Only fixture/readiness orchestration is different.
const start = instrument.indexOf('const CENSUS = ') + 'const CENSUS = '.length;
const end = instrument.indexOf('\nasync function main()', start);
assert.ok(start > 15 && end > start);
const census = new Function(`return ${instrument.slice(start, end)}`)();
const sourceCommit = 'd6e378a4f5b76682a3a9b821e7d90c12e255be76';
assert.equal(execFileSync('git', ['diff', sourceCommit, '--', 'app', 'components', 'content', 'lib', 'public'], { cwd: repo, encoding: 'utf8' }).trim(), '');
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const rows = [];
try {
  for (const [width, height] of [[320,720],[360,800],[375,812],[393,852],[430,932],[768,900],[1024,900],[1280,900],[1440,900],[1728,900]]) {
    for (const colorScheme of ['light','dark']) {
      for (let run = 1; run <= (width < 768 ? 2 : 1); run++) {
        const context = await browser.newContext({viewport:{width,height},colorScheme});
        const page = await context.newPage();
        await page.goto('http://127.0.0.1:3028/?phase07=d6e378a&check=closure', {waitUntil:'load'});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForSelector('.pin-spacer');
        const initial = await page.evaluate(census);
        assert.equal(initial.nonVacuityProof, true);
        assert.deepEqual(initial.offenders, [], `${width} ${colorScheme}: initial overflow`);
        await page.getByRole('link',{name:/skip intro/i}).click();
        await page.waitForTimeout(400);
        const arrival = await page.evaluate(census);
        assert.equal(arrival.nonVacuityProof, true);
        assert.deepEqual(arrival.offenders, [], `${width} ${colorScheme}: arrival overflow`);
        const geometry = await page.evaluate(() => {
          const identity = document.querySelector('[data-hero-identity]');
          const role = [...identity.querySelectorAll('p')].find(p => p.textContent.startsWith('Senior technical-support'));
          return {identityTop:identity.getBoundingClientRect().top,roleTop:role.getBoundingClientRect().top,heroMargin:getComputedStyle(document.querySelector('#hero')).scrollMarginTop};
        });
        assert.ok(geometry.identityTop > 0);
        assert.equal(geometry.heroMargin,width<768?'-360px':'0px');
        if(width<768) assert.ok(geometry.roleTop < height/2);
        rows.push({width,height,colorScheme,run,initial,arrival,geometry});
        console.log(`PASS ${width} ${colorScheme} run ${run}`);
        await context.close();
      }
    }
  }
} finally { await browser.close(); }
writeFileSync(resolve(folder,'scoped-check.json'),JSON.stringify({sourceCommit,instrumentSha256:createHash('sha256').update(instrument).digest('hex'),browser:'Desktop Chrome; not new physical Safari evidence',rows},null,2)+'\n');
console.log(JSON.stringify({cells:rows.length,frames:rows.length*2,offenders:0,nonVacuityProofs:rows.length*2}));
