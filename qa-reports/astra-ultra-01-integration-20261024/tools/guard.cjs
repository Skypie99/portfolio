// Fails loudly if the page rendered without the site's own stylesheets.
// Cross-origin sheets (cssRules throws) are skipped; same-origin ones must parse.
// A dropped local request is retried by reloading (up to 3 times), never ignored.
const styled = (page) => page.waitForFunction(() => {
  const own = [...document.querySelectorAll('link[rel=stylesheet]')].filter((l) => new URL(l.href).origin === location.origin);
  return own.length > 0 && own.every((l) => { try { return l.sheet && l.sheet.cssRules.length > 0; } catch { return false; } })
    && /DM Sans/.test(getComputedStyle(document.body).fontFamily);
}, null, { timeout: 8000 }).then(() => true, () => false);
module.exports = async function assertStyled(page) {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (await styled(page)) return;
    await page.reload({ waitUntil: 'networkidle' });
  }
  throw new Error('UNSTYLED PAGE after retries: ' + page.url());
};
