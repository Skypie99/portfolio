// Tries CSS variants on the #how-i-work heading and prints line breaks and overflow.
const assertStyled = require('./guard.cjs');
const { chromium } = require(process.env.PW);
const VARIANTS = {
  shy_breakWords: '#how-i-work h2{overflow-wrap:break-word}',
  current: '',
  breakWords: '#how-i-work h2{overflow-wrap:break-word}',
  hyphensAuto: '#how-i-work h2{-webkit-hyphens:auto;hyphens:auto}',
  nowrapAI_breakWords: '#how-i-work h2{overflow-wrap:break-word} #how-i-work h2 .nw{white-space:nowrap}',
  nowrapAI_hyphens_breakWords: '#how-i-work h2{overflow-wrap:break-word;-webkit-hyphens:auto;hyphens:auto} #how-i-work h2 .nw{white-space:nowrap}',
};
(async () => {
  const b = await chromium.launch();
  const lang = await (async () => { const c = await b.newContext(); const p = await c.newPage(); await p.goto(process.argv[2] + '/'); const l = await p.evaluate(() => document.documentElement.lang); await c.close(); return l; })();
  console.log('html lang =', lang);
  for (const [name, css] of Object.entries(VARIANTS).filter(([n]) => !process.argv[3] || n === process.argv[3])) {
    console.log('== ' + name);
    for (const zoom of [100, 125, 150])
      for (const width of [320, 340, 360, 375, 390, 414, 480, 600, 700, 768, 820, 900, 1024, 1280, 1440, 1920]) {
        const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const p = await ctx.newPage();
        await p.goto(process.argv[2] + '/', { waitUntil: 'networkidle' });
        await assertStyled(p);
        { const c = (zoom !== 100 ? `html{font-size:${zoom}% !important}` : '') + css; if (c) await p.addStyleTag({ content: c }); }
        if (name.startsWith('shy')) await p.$eval('#how-i-work h2', (h) => { h.innerHTML = h.innerHTML.replace('implementation', 'imple\u00ADmentation'); });
        if (name.includes('nowrapAI')) await p.$eval('#how-i-work h2', (h) => { h.innerHTML = h.innerHTML.replace('AI-assisted', '<span class="nw">AI-assisted</span>'); });
        await p.waitForTimeout(60);
        const r = await p.$eval('#how-i-work h2', (h) => {
          const box = h.getBoundingClientRect(); const out = []; let maxRight = 0;
          const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
          for (let n = w.nextNode(); n; n = w.nextNode()) for (let i = 0; i < n.length; i++) {
            const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1); const rc = rg.getClientRects()[0]; if (!rc) continue;
            maxRight = Math.max(maxRight, rc.right);
            const top = Math.round(rc.top); let line = out.find((l) => Math.abs(l.top - top) < 8); if (!line) out.push(line = { top, text: '' }); line.text += n.data[i];
          }
          // a hyphen inserted by the browser is not in the text; detect by a line ending mid-word
          return { lines: out.map((l) => l.text.trim()), over: Math.round(maxRight - box.right) };
        });
        console.log(`  ${zoom}% ${String(width).padStart(4)} over=${String(r.over).padStart(4)} ${r.over > 0 ? 'OVER ' : '     '}${r.lines.join(' | ')}`);
        await ctx.close();
      }
  }
  await b.close();
})();
