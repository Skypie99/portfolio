// Behavioural probes for the integrated changes, run against both builds.
// usage: node feature-probe.cjs <baselineUrl> <candidateUrl> <out.json>
const assertStyled = require('./guard.cjs');
const { chromium } = require(process.env.PW);
const fs = require('fs');

async function open(browser, url, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.width || 1440, height: opts.height || 900 }, colorScheme: opts.scheme || 'light', reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  // Keep pointer presses on the page: no navigation.
  await ctx.addInitScript(() => document.addEventListener('click', (e) => e.preventDefault(), true));
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await assertStyled(page);
  return { ctx, page };
}

const figures = (page) => page.$$eval('p.text-stat-figure[aria-hidden="true"]', (ps) => ps.map((p) => p.textContent.trim()));

async function counter(browser, base, flip) {
  const { ctx, page } = await open(browser, base + '/accessibility/');
  const finals = await figures(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.$eval('p.text-stat-figure', (p) => p.scrollIntoView({ block: 'center' }));
  // Wait until the count is visibly under way.
  const seen = [];
  const t0 = Date.now();
  let mid = null;
  while (Date.now() - t0 < 3000) {
    const now = await figures(page);
    if (now.some((v, i) => v !== finals[i])) { seen.push(now); if (seen.length >= 3) { mid = now; break; } }
    await page.waitForTimeout(25);
  }
  if (flip) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(120);
  const after120 = await figures(page);
  await page.waitForTimeout(1500);
  const after1620 = await figures(page);
  await ctx.close();
  return { finals, sawCounting: seen.length > 0, mid, after120ms: after120, after1620ms: after1620,
    finalAt120: after120.every((v, i) => v === finals[i]), finalAt1620: after1620.every((v, i) => v === finals[i]) };
}

async function certs(browser, base) {
  const out = [];
  for (const width of [1024, 1100, 1180, 1280, 1366, 1440, 1920]) {
    for (const zoom of [100, 125, 150, 200]) {
      const { ctx, page } = await open(browser, base + '/certificates/', { width, reduced: true });
      if (zoom !== 100) await page.addStyleTag({ content: `html{font-size:${zoom}% !important}` });
      await page.waitForTimeout(80);
      out.push({ width, zoom, ...(await page.evaluate(() => {
        const items = [...document.querySelectorAll('.cert-grid > li')];
        const lefts = [...new Set(items.map((li) => Math.round(li.getBoundingClientRect().left)))];
        const clipped = items.flatMap((li) => [...li.querySelectorAll('*')].filter((n) => n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflowX !== 'visible').map((n) => n.tagName + '.' + String(n.className).slice(0, 30)));
        const outside = items.filter((li) => li.getBoundingClientRect().right > window.innerWidth + 0.5).length;
        return { cards: items.length, columns: lefts.length, cardWidth: Math.round(items[0].getBoundingClientRect().width), gridWidth: Math.round(document.querySelector('.cert-grid').getBoundingClientRect().width), docOverflow: document.documentElement.scrollWidth - window.innerWidth, cardsPastViewport: outside, clippedDescendants: clipped.length };
      })) });
      await ctx.close();
    }
  }
  return out;
}

async function divider(browser, base) {
  const out = [];
  for (const scheme of ['light', 'dark']) for (const width of [1440, 768, 390]) {
    const { ctx, page } = await open(browser, base + '/', { width, scheme });
    const rows = await page.$$('#work ol > li');
    const read = (i) => page.$$eval('#work ol > li', (lis, i) => { const cs = getComputedStyle(lis[i]); return { top: cs.borderTopColor, bottom: cs.borderBottomColor, bottomWidth: cs.borderBottomWidth }; }, i);
    for (let i = 0; i < rows.length; i++) {
      const title = await rows[i].$('h3 a');
      await title.scrollIntoViewIfNeeded(); await page.mouse.move(1, 1); await page.waitForTimeout(400);
      const rest = await read(i);
      await title.hover(); await page.waitForTimeout(400);
      const hover = await read(i);
      await page.mouse.down(); await page.waitForTimeout(400);
      const press = await read(i);
      await page.mouse.up(); await page.mouse.move(1, 1);
      await page.keyboard.press('Shift'); await title.evaluate((a) => a.focus()); await page.waitForTimeout(400);
      const focus = await read(i);
      await title.evaluate((a) => a.blur());
      out.push({ scheme, width, row: i + 1, rest, hover, press, focus });
    }
    await ctx.close();
  }
  return out;
}

async function copy(browser, base) {
  const out = {};
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const { ctx, page } = await open(browser, base + '/', { width, reduced: true });
    out[`heading@${width}`] = await page.$eval('#how-i-work h2', (h) => { const lh = parseFloat(getComputedStyle(h).lineHeight); return { text: h.textContent.trim(), lines: Math.round(h.getBoundingClientRect().height / lh), width: Math.round(h.getBoundingClientRect().width) }; });
    if (width === 1440) {
      out.recordDefect = await page.evaluate(() => [...document.querySelectorAll('*')].filter((n) => n.children.length === 0 && /defect/i.test(n.textContent) && n.textContent.length < 40).map((n) => n.textContent.trim()));
      out.footerLinkedIn = await page.$$eval('footer a[href*="linkedin.com"]', (as) => as.map((a) => a.textContent.replace(/\s+/g, ' ').trim()));
    }
    await ctx.close();
  }
  const { ctx, page } = await open(browser, base + '/contact/', { reduced: true });
  out.contactParagraphs = await page.$$eval('main p', (ps) => ps.map((p) => p.textContent.replace(/\s+/g, ' ').trim()).filter((t) => /Accessible technology|senior support roles|socials below/.test(t)));
  out.contactLinkedIn = await page.$$eval('main a[href*="linkedin.com"]', (as) => as.map((a) => a.textContent.replace(/\s+/g, ' ').trim()));
  out.sitemapLastmod = await page.evaluate(async () => (await (await fetch('/sitemap.xml')).text()).split('<lastmod>').length - 1);
  await ctx.close();
  return out;
}

(async () => {
  const [baseUrl, candUrl, outFile] = process.argv.slice(2);
  const browser = await chromium.launch();
  const result = {};
  for (const [name, url] of [['baseline', baseUrl], ['candidate', candUrl]]) {
    result[name] = {
      counterFlip: await counter(browser, url, true),
      counterNoFlip: await counter(browser, url, false),
      certs: await certs(browser, url),
      divider: await divider(browser, url),
      copy: await copy(browser, url),
    };
    console.log(name, 'done');
  }
  await browser.close();
  fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
})();
