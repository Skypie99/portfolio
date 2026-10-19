import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const SEL = 'main a.rounded-pill.h-14';
async function setup(opts) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, ...opts });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto('http://127.0.0.1:3105/accessibility/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const el = page.locator(SEL).first();
  await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 600));
  const box = await el.boundingBox();
  const media = await page.evaluate(() => [matchMedia('(hover: hover)').matches, matchMedia('(pointer: coarse)').matches]);
  return { ctx, page, cdp, x: box.x + box.width / 2, y: box.y + box.height / 2, media };
}
async function poll(page, ms, step = 25) {
  await page.evaluate(([s, sel]) => { window.__log = []; const t0 = performance.now(); window.__poll = setInterval(() => { const a = document.querySelector(sel); window.__log.push([Math.round(performance.now() - t0), a.matches(':active'), a.matches(':hover')]); }, s); }, [step, SEL]);
  await new Promise((r) => setTimeout(r, ms));
}
async function stopPoll(page) { return page.evaluate(() => { clearInterval(window.__poll); return window.__log; }); }
const summarize = (log) => { const a = log.filter((l) => l[1]); return a.length ? `:active ${a[0][0]}–${a[a.length - 1][0]}ms (${a.length}/${log.length})` : ':active never'; };

// A. touch-from-mouse emulation (DevTools device mode path)
{
  const s = await setup({ isMobile: true, hasTouch: true });
  const p = poll(s.page, 900);
  await s.cdp.send('Input.emulateTouchFromMouseEvent', { type: 'mousePressed', x: Math.round(s.x), y: Math.round(s.y), button: 'left', clickCount: 1 });
  await p;
  await s.cdp.send('Input.emulateTouchFromMouseEvent', { type: 'mouseReleased', x: Math.round(s.x), y: Math.round(s.y), button: 'left', clickCount: 1 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 300));
  console.log('A emulateTouchFromMouseEvent (isMobile+hasTouch)', s.media, summarize(await stopPoll(s.page)));
  await s.ctx.close();
}
// B. CDP touch on hasTouch-only context (no mobile emulation)
{
  const s = await setup({ isMobile: false, hasTouch: true });
  const p = poll(s.page, 900);
  await s.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: s.x, y: s.y, id: 1 }] });
  await p;
  await s.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await new Promise((r) => setTimeout(r, 300));
  console.log('B dispatchTouchEvent (hasTouch only)', s.media, summarize(await stopPoll(s.page)));
  await s.ctx.close();
}
// C. mouse press on a phone-sized non-mobile context (true pointer)
{
  const s = await setup({ isMobile: false, hasTouch: false });
  const p = poll(s.page, 500);
  await s.page.mouse.move(s.x, s.y); await s.page.mouse.down();
  await p;
  await s.page.mouse.up();
  console.log('C mouse.down (no touch)', s.media, summarize(await stopPoll(s.page)));
  await s.ctx.close();
}
// D. CDP touch on mobile context, held 2.5s — does :active ever show DURING the hold?
{
  const s = await setup({ isMobile: true, hasTouch: true });
  const p = poll(s.page, 2500);
  await s.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: s.x, y: s.y, id: 1 }] });
  await p;
  const during = await s.page.evaluate(() => window.__log.filter((l) => l[1]).length);
  await s.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await new Promise((r) => setTimeout(r, 400));
  const log = await stopPoll(s.page);
  console.log('D dispatchTouchEvent held 2.5s (isMobile+hasTouch)', s.media, 'active-during-hold samples:', during, '| overall', summarize(log));
  await s.ctx.close();
}
// E. CDP mouse event with pointerType touch? (Input.dispatchMouseEvent pointerType: 'pen')
{
  const s = await setup({ isMobile: true, hasTouch: true });
  const p = poll(s.page, 600);
  await s.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: s.x, y: s.y, button: 'left', clickCount: 1, pointerType: 'pen' });
  await p;
  await s.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: s.x, y: s.y, button: 'left', clickCount: 1, pointerType: 'pen' });
  console.log('E dispatchMouseEvent pen (isMobile+hasTouch)', s.media, summarize(await stopPoll(s.page)));
  await s.ctx.close();
}
await browser.close();
