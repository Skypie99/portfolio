// For every element carrying one of the changed strings, check that its text
// is not clipped by an overflow-hidden ancestor and does not overflow the viewport.
// usage: node clip-census.cjs <baseUrl> <label>
const assertStyled = require('./guard.cjs');
const { chromium } = require(process.env.PW);
const STRINGS = ['I set the direction', 'I direct AI agents', 'A documented defect', 'Last defect', 'View LinkedIn profile', 'Full history on LinkedIn',
  'Open web app', 'Read system overview', 'Try synthetic demo', 'Open Prompt Library', 'Play Ghost Code', 'Live demo', 'Live', 'Back to home'];
const ROUTES = ['/', '/work/', '/work/flagstone/', '/work/claude-corp/', '/work/dashboard/', '/work/prompt-library/', '/work/ghost-code/', '/contact/', '/certificates/', '/about/', '/blog/', '/accessibility/'];
(async () => {
  const [base, label] = process.argv.slice(2);
  const b = await chromium.launch(); const issues = []; let checked = 0;
  for (const width of [320, 360, 390, 414]) for (const zoom of [100, 125, 150]) {
    const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    for (const route of ROUTES) {
      await p.goto(base + route, { waitUntil: 'networkidle' }); await assertStyled(p);
      if (zoom !== 100) await p.addStyleTag({ content: `html{font-size:${zoom}% !important}` });
      await p.waitForTimeout(150);
      const r = await p.evaluate((STRINGS) => {
        const out = []; let n = 0;
        const all = [...document.querySelectorAll('h1,h2,h3,p,a,span,dt,dd,li,button')].filter((el) => {
          const own = [...el.childNodes].filter((c) => c.nodeType === 3).map((c) => c.data).join('').replace(/­/g, '');
          return STRINGS.some((s) => own.includes(s)) && el.getClientRects().length;
        });
        for (const el of all) {
          n++;
          const rg = document.createRange(); rg.selectNodeContents(el);
          const rects = [...rg.getClientRects()].filter((x) => x.width > 0.5);
          if (!rects.length) continue;
          const right = Math.max(...rects.map((x) => x.right)), left = Math.min(...rects.map((x) => x.left));
          let clipper = null;
          for (let a = el.parentElement; a; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== 'visible' || cs.overflow !== 'visible') { clipper = a; break; } }
          const cb = clipper ? clipper.getBoundingClientRect() : { left: 0, right: innerWidth };
          const clip = Math.max(right - Math.min(cb.right, innerWidth), Math.max(cb.left, 0) - left);
          if (clip > 0.5) out.push({ text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 50), clipPx: Math.round(clip) });
        }
        return { n, out, docOverflow: document.documentElement.scrollWidth - innerWidth };
      }, STRINGS);
      checked += r.n;
      for (const o of r.out) issues.push(`${width} @${zoom}% ${route} "${o.text}" clipped/overflow ${o.clipPx}px`);
      if (r.docOverflow > 0) issues.push(`${width} @${zoom}% ${route} page horizontal overflow ${r.docOverflow}px`);
    }
    await ctx.close();
  }
  await b.close();
  console.log(`${label}: elements checked ${checked}, issues ${issues.length}`); console.log(issues.join('\n'));
})();
