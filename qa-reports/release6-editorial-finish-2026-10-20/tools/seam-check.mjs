#!/usr/bin/env node
/**
 * seam-check.mjs — the Release 5 / Release 6 runtime seam, on a BUILT export
 * of the merged tree.
 *
 *   node seam-check.mjs --dir out [--port 3451]
 *
 * Release 6 adds an opt-in `editorial` prop to CaseStudyCard and only the
 * gallery wall passes it. Release 5's four case studies render the same
 * component in their "Other work" band without it. This checks, in a real
 * DOM: on each of the four routes every "Other work" card renders the
 * default variant (those cards pass no status, so the check is the /30
 * ghost numeral and no facts block after the description; a card that did
 * pass status would have to read status above the title), the Release 5
 * chapter is present, and on /work/ every plate reads title above the facts
 * with the /65 numeral (the editorial order).
 */
import path from 'node:path';
import { opt, resolveChromium, serve, chromium, load } from './lib.mjs';

const DIR = path.resolve(opt('dir', 'out'));
const PORT = Number(opt('port', 3451));
const BASE = `http://127.0.0.1:${PORT}`;
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });
let failures = 0;
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const inspect = () =>
    page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.case-study-card'));
      return cards.map((c) => {
        const copy = c.querySelector('.case-study-card-copy');
        const h3 = copy.querySelector('h3');
        const status = Array.from(copy.querySelectorAll('p.font-mono.text-meta')).find((p) => !/^Verified /.test(p.textContent || ''));
        const numeral = copy.querySelector('span[aria-hidden="true"]');
        const order = !status ? 'no status' : h3.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING ? 'title then status' : 'status then title';
        return { title: h3.textContent.trim(), order, numeralInk: (numeral.className.match(/text-ink\/\d+/) || ['?'])[0] };
      });
    });
  for (const slug of ['prompt-library', 'claude-corp', 'ghost-code', 'dashboard']) {
    await load(page, `${BASE}/work/${slug}/`);
    const chapter = await page.evaluate(() => Boolean(document.querySelector('h2[id]') && /Inside the build/i.test(document.body.textContent || '')));
    const cards = await inspect();
    const bad = cards.filter((c) => !(c.order === 'status then title' || c.order === 'no status') || c.numeralInk !== 'text-ink/30');
    failures += bad.length + (chapter ? 0 : 1);
    console.log(`[seam] /work/${slug}/: Release 5 chapter ${chapter ? 'present' : 'MISSING'} · ${cards.length} "Other work" cards (${cards.map((c) => c.order).join(', ')}) · ${bad.length === 0 ? 'all default variant with /30 numeral' : 'UNEXPECTED: ' + JSON.stringify(bad)}`);
  }
  await load(page, `${BASE}/work/`);
  const wall = await inspect();
  const badWall = wall.filter((c) => c.order !== 'title then status' || c.numeralInk !== 'text-ink/65');
  failures += badWall.length;
  console.log(`[seam] /work/: ${wall.length} plates · ${badWall.length === 0 ? 'all editorial order with /65 numeral' : 'UNEXPECTED: ' + JSON.stringify(badWall)}`);
  await ctx.close();
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
console.log(`[seam] ${failures === 0 ? 'PASS' : 'FAIL (' + failures + ')'}`);
process.exit(failures === 0 ? 0 : 1);
