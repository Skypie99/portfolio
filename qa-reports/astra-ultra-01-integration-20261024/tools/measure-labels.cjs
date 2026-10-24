// Layout census for the external destination labels.
// usage: node measure-labels.cjs <baseUrl> <outJson>
const assertStyled = require('./guard.cjs');
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs');

const DEMO_HOSTS = ['flagstone.skypistudio.com', 'claudecorp.skypistudio.com', 'dashboard.skypistudio.com', 'prompts.skypistudio.com', 'ghostcode.skypistudio.com'];
const ROUTES = ['/work/', '/work/flagstone/', '/work/claude-corp/', '/work/dashboard/', '/work/prompt-library/', '/work/ghost-code/'];
const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

async function probe(page) {
  return page.evaluate((hosts) => {
    // Visible label lines: only text nodes outside aria-hidden decoration
    // (the dot and the arrow), grouped by line box.
    const lines = (el) => {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.2;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const tops = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim() || n.parentElement.closest('[aria-hidden="true"], .sr-only')) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        for (const x of r.getClientRects()) if (x.width > 0.5 && !tops.some((t) => Math.abs(t - x.top) < lh / 2)) tops.push(x.top);
      }
      return tops.length;
    };
    const box = (r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height });
    const hit = (a, b) => a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5;
    const out = { docOverflow: document.documentElement.scrollWidth - window.innerWidth, links: [] };
    const demos = [...document.querySelectorAll('a[href]')].filter((a) => hosts.some((h) => a.href.includes(h)) && a.getClientRects().length);
    for (const a of demos) {
      const r = a.getBoundingClientRect();
      const pill = a.className.includes('rounded-pill');
      const row = a.closest('div.border-t');
      const card = !pill && row && [...row.querySelectorAll('a')].some((x) => /View project/.test(x.textContent));
      const rec = { kind: pill ? 'pill' : card ? 'card' : 'other', where: a.closest('aside,nav,footer,main')?.tagName, text: a.textContent.trim(), aria: a.getAttribute('aria-label'), rect: box(r), lines: lines(a), overflowX: a.scrollWidth - a.clientWidth };
      if (pill) {
        const col = a.parentElement.getBoundingClientRect();
        rec.outsideColumn = Math.max(0, r.right - col.right, col.left - r.left);
      } else if (card) {
        const rr = row.getBoundingClientRect();
        rec.outsideRow = Math.max(0, r.right - rr.right, rr.left - r.left) - parseFloat(getComputedStyle(a).marginRight) * -1;
        // Touch targets as the ::after recipe builds them: leading link up 21px, trailing down 21px.
        const targets = [...row.querySelectorAll('a')].map((x) => {
          const b = box(x.getBoundingClientRect());
          const up = x.className.includes('after:-top-[21px]');
          return { name: x.textContent.trim(), ...b, t: up ? b.t - 21 : b.t, b: up ? b.b : b.b + 21 };
        });
        rec.collisions = [];
        for (let i = 0; i < targets.length; i++) for (let j = i + 1; j < targets.length; j++) if (hit(targets[i], targets[j])) rec.collisions.push(`${targets[i].name} × ${targets[j].name}`);
        rec.rowHeight = rr.height;
      }
      out.links.push(rec);
    }
    return out;
  }, DEMO_HOSTS);
}

(async () => {
  const [base, outFile, compareFile] = process.argv.slice(2);
  const browser = await chromium.launch();
  const results = [];
  for (const scheme of ['light', 'dark']) {
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      for (const route of ROUTES) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await assertStyled(page);
        for (const zoom of [100, 200]) {
          if (zoom !== 100) await page.addStyleTag({ content: `html{font-size:${zoom}% !important}` });
          await page.waitForTimeout(50);
          results.push({ scheme, width, route, zoom, ...(await probe(page)) });
        }
      }
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
  const bad = [];
  for (const r of results) for (const l of r.links) {
    const flags = [];
    if (l.overflowX > 0) flags.push(`overflowX ${l.overflowX}`);
    if (l.outsideRow > 0.5) flags.push(`outsideRow ${l.outsideRow.toFixed(1)}`);
    if (l.outsideColumn > 0.5) flags.push(`outsideColumn ${l.outsideColumn.toFixed(1)}`);
    if (l.collisions && l.collisions.length) flags.push(`collide ${l.collisions.join(';')}`);
    if (l.lines > 1) flags.push(`lines ${l.lines}`);
    if (flags.length) bad.push(`${r.scheme} ${r.width} z${r.zoom} ${r.route} [${l.kind}] "${l.text}": ${flags.join(', ')}`);
  }
  if (compareFile) {
    const flagsOf = (rs) => { const m = new Map(); for (const r of rs) for (const l of r.links) { const f = []; if (l.overflowX > 0) f.push('overflowX'); if (l.outsideRow > 0.5) f.push('outsideRow'); if (l.outsideColumn > 0.5) f.push('outsideColumn'); if (l.collisions && l.collisions.length) f.push('collide'); if (l.lines > 1) f.push('lines>1'); m.set(`${r.scheme} ${r.width} z${r.zoom} ${r.route} ${l.kind}#${r.links.filter((x) => x.kind === l.kind).indexOf(l)}`, { f, l }); } return m; };
    const before = flagsOf(JSON.parse(fs.readFileSync(compareFile, 'utf8')));
    const after = flagsOf(results);
    const news = [];
    for (const [k, { f, l }] of after) { const b = before.get(k); const nf = f.filter((x) => !(b && b.f.includes(x))); if (nf.length) news.push(`${k} "${l.text}" NEW: ${nf.join(',')} lines=${l.lines} outsideRow=${(l.outsideRow ?? 0).toFixed(1)} coll=${(l.collisions || []).join(';')}`); }
    console.log(`NEW flags vs ${compareFile}: ${news.length}`); console.log(news.join('\n'));
  }
  const docs = results.filter((r) => r.docOverflow > 0).map((r) => `${r.scheme} ${r.width} z${r.zoom} ${r.route} docOverflow ${r.docOverflow}`);
  console.log(`cases ${results.length}, link observations ${results.reduce((n, r) => n + r.links.length, 0)}`);
  if (!compareFile) console.log([...new Set(bad.map((s) => s.replace(/^(light|dark) /, '')))].join('\n') || 'no link flags');
  console.log([...new Set(docs.map((s) => s.replace(/^(light|dark) /, '')))].join('\n') || 'no document overflow');
})();
