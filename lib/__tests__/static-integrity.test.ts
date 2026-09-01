/**
 * static-integrity.test.ts — Portfolio static export integrity checks (Gary).
 *
 * Reads the built ./out/ directory and asserts two structural invariants:
 *
 *   Gap 2 — Internal link resolution
 *     Every internal href in every HTML file must resolve to an actual file
 *     or directory inside ./out/. A 404 on any internal nav link is a silent
 *     user-facing break that the build process won't catch on its own.
 *
 *   Gap 3 — External link rel attributes
 *     Every <a> that points to an external URL (http:// or https://) must
 *     carry rel="noopener noreferrer". Missing rel lets the opened page
 *     access window.opener and read the referrer — both a security risk and
 *     an Alex §4.5 / WCAG 3.2.5 compliance gap.
 *
 *   Gap 4 — Referenced image asset existence
 *     Every <img src="..."> pointing to a local path (not http:// / https:// /
 *     data:) must resolve to an existing file inside ./out/. Missing images
 *     produce broken-image icons on the live site — badge images, hero images,
 *     and gallery images are all caught.
 *
 * IMPORTANT — requires a prior `npm run build`.
 * These tests operate on all .html files inside ./out/. They will fail with a clear message
 * if ./out/ doesn't exist yet (run `npm run build` first, or use
 * `npm run test:static` which chains build → test).
 *
 * No mocks. No browser. Pure node:fs on the real artifact.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const OUT_DIR = resolve(process.cwd(), 'out');

// These checks read the built ./out/ artifact, so they only run after a build.
// `npm run test:static` chains build → test; a bare `npm run test` (e.g. CI's
// unit-test job, which builds separately) has no ./out/ yet. In that case SKIP
// rather than throw — the gate is still enforced by test:static and locally —
// so `npm test` stays green without a build. The skip is labeled (below), never
// silent. (Surfaced by the repo's first PR: vitest's default run picks this file
// up, and CI's Test job runs before any build.)
const OUT_EXISTS = existsSync(OUT_DIR);

describe.runIf(!OUT_EXISTS)('Static integrity (build-dependent)', () => {
  it.skip('skipped: needs ./out/; run `npm run test:static` (build → test) to exercise these', () => {});
});

/** Walk ./out/ and return absolute paths of every .html file. */
function collectHtmlFiles(dir: string): string[] {
  const { readdirSync, statSync } = require('node:fs') as typeof import('node:fs');
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Extract all href values from <a> tags in an HTML string.
 * Returns raw href strings as they appear in the source.
 */
function extractAnchorHrefs(html: string): string[] {
  const hrefs: string[] = [];
  // Match <a ... href="..." ...> — captures the href value
  const pattern = /<a\s[^>]*href="([^"]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    hrefs.push(match[1]);
  }
  return hrefs;
}

/**
 * Extract all <a> tag full attribute strings for rel checking.
 * Returns objects with href + rel (may be undefined).
 */
function extractAnchors(html: string): Array<{ href: string; rel: string | undefined }> {
  const anchors: Array<{ href: string; rel: string | undefined }> = [];
  // Match full <a ...> opening tags
  const tagPattern = /<a\s([^>]*)>/gi;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagPattern.exec(html)) !== null) {
    const attrs = tagMatch[1];
    const hrefMatch = /href="([^"]+)"/i.exec(attrs);
    const relMatch = /rel="([^"]+)"/i.exec(attrs);
    if (hrefMatch) {
      anchors.push({
        href: hrefMatch[1],
        rel: relMatch ? relMatch[1] : undefined,
      });
    }
  }
  return anchors;
}

/**
 * The Next.js static export for this site uses basePath=/portfolio in
 * production. Internal hrefs in ./out/ therefore look like:
 *   /portfolio/work/flagstone/
 *   /portfolio/
 * Strip the basePath prefix to get a path we can look up in ./out/.
 */
const BASE_PATH = '/portfolio';

function isInternalHref(href: string): boolean {
  // Starts with / (absolute internal) but not // (protocol-relative external)
  return href.startsWith('/') && !href.startsWith('//');
}

function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}

/**
 * Resolve an internal href to a filesystem path inside ./out/.
 * Strips the basePath prefix if present, then looks for:
 *   1. out/<path>/index.html  (directory-style URL with trailing slash)
 *   2. out/<path>.html        (direct file)
 *   3. out/<path>             (raw file, e.g. static assets — skipped for anchors)
 */
function resolveInternalHref(href: string): string | null {
  // Strip basePath prefix
  let path = href;
  if (path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length) || '/';
  }

  // Skip fragment-only links (#section) and mailto:
  if (path.startsWith('#') || path.startsWith('mailto:')) return null;

  // Strip query + fragment
  path = path.split('?')[0].split('#')[0];
  if (!path) return null;

  // Trailing-slash → index.html
  if (path.endsWith('/')) {
    return join(OUT_DIR, path, 'index.html');
  }

  // Try direct .html match, then a concrete static file (e.g. /feed.xml,
  // /feed.json — links to real files emitted by Route Handlers), then
  // directory/index.html.
  const direct = join(OUT_DIR, path);
  if (direct.endsWith('.html')) return direct;
  if (existsSync(direct)) return direct;
  return join(OUT_DIR, path, 'index.html');
}

// ---------------------------------------------------------------------------
// Guard: ./out/ must exist (fail fast with a useful message)
// ---------------------------------------------------------------------------

function assertOutDirExists() {
  if (!existsSync(OUT_DIR)) {
    throw new Error(
      `./out/ directory not found. Run \`npm run build\` before static-integrity tests.\n` +
        `Expected: ${OUT_DIR}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Gap 2 — Internal link resolution
// ---------------------------------------------------------------------------

describe.skipIf(!OUT_EXISTS)('Gap 2: internal link resolution', () => {
  it('every internal href in every HTML file resolves to an existing file in ./out/', () => {
    assertOutDirExists();

    const htmlFiles = collectHtmlFiles(OUT_DIR);
    expect(htmlFiles.length).toBeGreaterThan(0);

    const broken: Array<{ file: string; href: string; expected: string }> = [];

    for (const htmlFile of htmlFiles) {
      const html = readFileSync(htmlFile, 'utf8');
      const hrefs = extractAnchorHrefs(html);

      for (const href of hrefs) {
        if (!isInternalHref(href)) continue;

        const resolved = resolveInternalHref(href);
        if (resolved === null) continue; // mailto, fragment — skip

        if (!existsSync(resolved)) {
          broken.push({
            file: htmlFile.replace(OUT_DIR, './out'),
            href,
            expected: resolved.replace(OUT_DIR, './out'),
          });
        }
      }
    }

    if (broken.length > 0) {
      const report = broken
        .map((b) => `  [${b.file}] href="${b.href}" → missing ${b.expected}`)
        .join('\n');
      expect.fail(`${broken.length} broken internal link(s):\n${report}`);
    }
  });

  it('finds at least one internal link across all pages (sanity check)', () => {
    assertOutDirExists();

    const htmlFiles = collectHtmlFiles(OUT_DIR);
    let totalInternal = 0;

    for (const htmlFile of htmlFiles) {
      const html = readFileSync(htmlFile, 'utf8');
      const hrefs = extractAnchorHrefs(html);
      totalInternal += hrefs.filter(isInternalHref).length;
    }

    expect(totalInternal).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Gap 3 — External link rel attributes
// ---------------------------------------------------------------------------

describe.skipIf(!OUT_EXISTS)('Gap 3: external link rel attributes', () => {
  it('every external <a href="https://..."> has rel="noopener noreferrer"', () => {
    assertOutDirExists();

    const htmlFiles = collectHtmlFiles(OUT_DIR);
    expect(htmlFiles.length).toBeGreaterThan(0);

    const violations: Array<{ file: string; href: string; rel: string | undefined }> = [];

    for (const htmlFile of htmlFiles) {
      const html = readFileSync(htmlFile, 'utf8');
      const anchors = extractAnchors(html);

      for (const anchor of anchors) {
        if (!isExternalHref(anchor.href)) continue;

        const rel = anchor.rel ?? '';
        const parts = rel.split(/\s+/);
        const hasNoopener = parts.includes('noopener');
        const hasNoreferrer = parts.includes('noreferrer');

        if (!hasNoopener || !hasNoreferrer) {
          violations.push({
            file: htmlFile.replace(OUT_DIR, './out'),
            href: anchor.href,
            rel: anchor.rel,
          });
        }
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map(
          (v) =>
            `  [${v.file}] href="${v.href}" rel="${v.rel ?? '(none)'}"\n` +
            `    → needs rel="noopener noreferrer"`,
        )
        .join('\n');
      expect.fail(`${violations.length} external link(s) missing rel="noopener noreferrer":\n${report}`);
    }
  });

  it('finds at least one external link across all pages (sanity check)', () => {
    assertOutDirExists();

    const htmlFiles = collectHtmlFiles(OUT_DIR);
    let totalExternal = 0;

    for (const htmlFile of htmlFiles) {
      const html = readFileSync(htmlFile, 'utf8');
      const anchors = extractAnchors(html);
      totalExternal += anchors.filter((a) => isExternalHref(a.href)).length;
    }

    // If this fails the site has no external links at all — suspicious
    expect(totalExternal).toBeGreaterThan(0);
  });
});

/**
 * Gap 5 — Reveal failure floor (L7-01) pre-paint guard.
 *
 * The scroll-reveal primitive rests VISIBLE and only arms its hidden state
 * under `html.js`, set by an inline <head> script BEFORE first paint. This
 * locks that contract into the built artifact: if the guard is ever dropped
 * or moved out of <head>, every `.reveal` would ship permanently invisible on
 * a dropped chunk again. Also asserts the CSS scoping + watchdog floor landed.
 */
describe.skipIf(!OUT_EXISTS)('Gap 5: reveal failure floor guard', () => {
  it('every reveal-bearing page ships the inline `js` guard INSIDE <head> (pre-paint, no-flash)', () => {
    const htmlFiles = collectHtmlFiles(OUT_DIR);
    expect(htmlFiles.length).toBeGreaterThan(0);

    // Only pages that actually ship `.reveal` content need the guard. The
    // pages-router error shell (out/500/index.html) has no reveals and does not
    // go through the app-router root layout, so it is correctly exempt.
    const revealPages = htmlFiles.filter((f) => /class="[^"]*\breveal\b/.test(readFileSync(f, 'utf8')));
    expect(revealPages.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const htmlFile of revealPages) {
      const html = readFileSync(htmlFile, 'utf8');
      const headEnd = html.indexOf('</head>');
      const guardAt = html.indexOf("classList.add('js')");
      // Guard must exist AND sit before </head> so it runs during head-parse,
      // before any body .reveal computes style.
      if (guardAt === -1 || headEnd === -1 || guardAt > headEnd) {
        offenders.push(htmlFile.replace(OUT_DIR, './out'));
      }
    }
    expect(offenders, `guard missing or outside <head> in:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('static markup ships `.reveal` armed-not-shown (no baked reveal-shown)', () => {
    // The reveal-shown class is added by JS at runtime only; if it were baked
    // into the export the no-flash reasoning would not hold.
    const blog = join(OUT_DIR, 'blog', 'index.html');
    if (!existsSync(blog)) return; // route shape guarded elsewhere
    const html = readFileSync(blog, 'utf8');
    expect(html).toMatch(/class="[^"]*\breveal\b/); // reveal elements present
    expect(html).not.toContain('reveal-shown'); // never pre-shown in static HTML
  });

  it('built CSS scopes the hidden state under html.js and defines the failsafe floor', () => {
    const { readdirSync } = require('node:fs') as typeof import('node:fs');
    const cssDir = join(OUT_DIR, '_next', 'static', 'css');
    if (!existsSync(cssDir)) return;
    const css = readdirSync(cssDir)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(cssDir, f), 'utf8'))
      .join('\n');
    // Hidden state must be scoped to html.js (not a bare .reveal{opacity:0}).
    expect(css).toMatch(/html\.js\s+\.reveal\{opacity:0/);
    // Watchdog rescue floor must exist.
    expect(css).toContain('reveal-failsafe');
    // A BARE `.reveal{opacity:0}` (not scoped under `html.js `) must NOT ship —
    // that unconditional hide was the L7-01 exposure. The negative lookbehind
    // lets the scoped `html.js .reveal{opacity:0}` through while catching a bare
    // rule (which would be preceded by `}` , `,` or start-of-file, not `js `).
    expect(css).not.toMatch(/(?<!js )\.reveal\{opacity:0/);
  });
});

// ---------------------------------------------------------------------------
// Gap 5 — new-tab links announce themselves, INCLUDING inside <noscript>
//
// The /accessibility/ page publishes "links that open a new tab say so". The
// rendered site honoured that (133/133 labelled), but the <noscript> fallback in
// ContactEmail did not — 18 links (9 pages x 2) opened a new tab silently for
// no-JS visitors. DOM-based sweeps miss this class entirely, because a browser
// never parses <noscript> content into the DOM when JS is on. This check reads
// the shipped HTML as text, so noscript is just markup like any other.
// (a11y deep-QA 2026-07-31, finding C9-1.)
// ---------------------------------------------------------------------------

describe.runIf(OUT_EXISTS)('Gap 5: new-tab links announce themselves', () => {
  /** Full <a ...>...</a> elements, including any nested inside <noscript>. */
  function extractAnchorElements(html: string): Array<{ open: string; inner: string }> {
    const out: Array<{ open: string; inner: string }> = [];
    const pattern = /<a\s([^>]*)>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(html)) !== null) out.push({ open: m[1], inner: m[2] });
    return out;
  }

  const NEW_TAB_WORDING = /opens in (?:a )?new tab/i;

  it('every target="_blank" anchor carries an accessible new-tab announcement', () => {
    const offenders: string[] = [];
    for (const file of collectHtmlFiles(OUT_DIR)) {
      const html = readFileSync(file, 'utf8');
      for (const { open, inner } of extractAnchorElements(html)) {
        if (!/target="_blank"/i.test(open)) continue;
        // Either the visible/sr-only text says it, or the accessible name does.
        const ariaLabel = /aria-label="([^"]*)"/i.exec(open)?.[1] ?? '';
        const title = /title="([^"]*)"/i.exec(open)?.[1] ?? '';
        if (NEW_TAB_WORDING.test(inner) || NEW_TAB_WORDING.test(ariaLabel) || NEW_TAB_WORDING.test(title)) continue;
        const href = /href="([^"]+)"/i.exec(open)?.[1] ?? '(no href)';
        offenders.push(`${file.replace(OUT_DIR, '')} → ${href}`);
      }
    }
    expect(offenders, `new-tab links with no announcement:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('the noscript contact fallback specifically announces its new-tab links', () => {
    // Pins the exact regression C9-1 fixed: a DOM sweep cannot see this markup,
    // so without an explicit assertion the fallback can silently rot again.
    const home = join(OUT_DIR, 'index.html');
    if (!existsSync(home)) return;
    const html = readFileSync(home, 'utf8');
    const noscripts = [...html.matchAll(/<noscript>([\s\S]*?)<\/noscript>/gi)].map((m) => m[1]);
    const contactFallback = noscripts.find((n) => /github\.com|linkedin\.com/i.test(n));
    expect(contactFallback, 'expected a <noscript> socials fallback in the built homepage').toBeTruthy();
    const links = extractAnchorElements(contactFallback!).filter((a) => /target="_blank"/i.test(a.open));
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const l of links) expect(l.inner).toMatch(NEW_TAB_WORDING);
  });
});

// ---------------------------------------------------------------------------
// Gap 6 — share-card identity (every route unfurls as ITSELF)
//
// Next.js shallow-merges `metadata.openGraph` per TOP-LEVEL KEY: a leaf route
// that declares its own openGraph object REPLACES the root layout's rather than
// merging into it, and a leaf that declares NONE inherits the root's entire
// block — og:url included. Both halves of that rule bite:
//
//   - A route with no openGraph block inherits og:url = the HOMEPAGE, so a
//     shared link to it unfurls wearing the homepage's title, description and
//     URL. /certificates/ and /contact/ shipped this way.
//   - A route that declares openGraph but omits url/siteName/locale silently
//     drops all three from its card. /work/, /about/, /colophon/ and /blog/*
//     shipped this way.
//
// The site is a job-search artifact: the share card is the pre-click claim a
// recruiter reads before the page ever loads, so a card that names the wrong
// page is a truth defect, not a cosmetic one. This locks the whole class.
// (Truth audit 2026-07-31, finding TA-10 / F-3.)
// ---------------------------------------------------------------------------

describe.runIf(OUT_EXISTS)('Gap 6: share-card identity', () => {
  const SITE_ORIGIN = 'https://skypistudio.com';
  const EXPECTED_SITE_NAME = 'Sky Halisky: AI Portfolio';

  /** The route path a built HTML file is served at: out/work/index.html → /work/ */
  function routePathOf(file: string): string {
    const rel = file.replace(OUT_DIR, '').replace(/^\//, '');
    if (rel === 'index.html') return '/';
    return '/' + rel.replace(/index\.html$/, '');
  }

  /** <meta property="og:x" content="..."> — property-keyed, as OG tags are emitted. */
  function ogTag(html: string, prop: string): string | undefined {
    const m = new RegExp(
      `<meta\\s+property="og:${prop}"\\s+content="([^"]*)"`,
      'i',
    ).exec(html);
    return m?.[1];
  }

  // The 404 surface is served for ARBITRARY unmatched paths, so it has no
  // canonical URL of its own — inheriting the root's og:url is correct there,
  // not impersonation. Excluded deliberately, never silently.
  const IS_404 = (f: string) => /(^|\/)404(\.html|\/index\.html)$/.test(f.replace(OUT_DIR, ''));

  // A redirect stub is a signpost left at an old URL, not a route with an
  // identity of its own. It is a hand-written file in public/ (see
  // public/work/accessmap/index.html) carrying a meta refresh and a canonical
  // to its destination, and it declares NO og block on purpose: giving the old
  // URL a share card would make it compete with the new one, which is the
  // precise failure this guard exists to catch. Excluded deliberately, never
  // silently.
  //
  // Keyed on CONTENT, not on a path allowlist — so a new stub is covered the
  // day it is written, and a file that stops being a stub re-enters the guard
  // on its own rather than sitting exempt in a list nobody rereads.
  const IS_REDIRECT_STUB = (f: string) =>
    /<meta\s+http-equiv="refresh"/i.test(readFileSync(f, 'utf8'));

  function realRoutes(): string[] {
    return collectHtmlFiles(OUT_DIR).filter((f) => !IS_404(f) && !IS_REDIRECT_STUB(f));
  }

  it('every route declares og:url, and it is the route’s OWN url', () => {
    assertOutDirExists();
    const routes = realRoutes();
    expect(routes.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const file of routes) {
      const html = readFileSync(file, 'utf8');
      const expected = SITE_ORIGIN + routePathOf(file);
      const actual = ogTag(html, 'url');
      if (actual === undefined) {
        offenders.push(`${routePathOf(file)} → og:url MISSING (expected ${expected})`);
      } else if (actual !== expected) {
        offenders.push(`${routePathOf(file)} → og:url is "${actual}", expected "${expected}"`);
      }
    }
    expect(
      offenders,
      `routes whose share card names the wrong page:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('every route keeps og:site_name and og:locale (they drop when a leaf replaces the root block)', () => {
    const offenders: string[] = [];
    for (const file of realRoutes()) {
      const html = readFileSync(file, 'utf8');
      const siteName = ogTag(html, 'site_name');
      const locale = ogTag(html, 'locale');
      if (!['/archive/', '/flagstone/privacy/', '/flagstone/terms/'].includes(routePathOf(file)) && siteName !== EXPECTED_SITE_NAME) {
        offenders.push(`${routePathOf(file)} → og:site_name is ${siteName ?? 'MISSING'}`);
      }
      if (!locale) offenders.push(`${routePathOf(file)} → og:locale MISSING`);
    }
    expect(offenders, `share cards missing site identity:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('no interior route wears the homepage’s og:title or twitter:title', () => {
    // The precise impersonation lock: /certificates/ and /contact/ used to
    // announce themselves as "Sky Halisky — AI Portfolio" with the homepage's
    // description attached.
    const home = join(OUT_DIR, 'index.html');
    assertOutDirExists();
    const homeTitle = ogTag(readFileSync(home, 'utf8'), 'title');
    expect(homeTitle, 'expected the homepage to declare an og:title').toBeTruthy();

    const offenders: string[] = [];
    for (const file of realRoutes()) {
      if (file === home) continue;
      const html = readFileSync(file, 'utf8');
      if (ogTag(html, 'title') === homeTitle) {
        offenders.push(`${routePathOf(file)} → og:title`);
      }
      const twTitle = /<meta\s+name="twitter:title"\s+content="([^"]*)"/i.exec(html)?.[1];
      if (twTitle === homeTitle) offenders.push(`${routePathOf(file)} → twitter:title`);
    }
    expect(
      offenders,
      `interior routes unfurling as the homepage:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Gap 7 — share-card images resolve, and resolve as IMAGES
//
// GitHub Pages derives content-type from the file extension alone. Next's
// opengraph-image file convention emits its PNG at an EXTENSIONLESS path
// (out/opengraph-image), so GH Pages shipped a valid 1200x630 PNG as
// `application/octet-stream` — verified live 2026-07-31. Sniffing unfurlers
// render it anyway; a strict one that trusts content-type can refuse the card.
//
// scripts/og-png-alias.mjs (postbuild) copies each card to a byte-identical
// `.png` sibling and app/ metadata points at that. These assertions are what
// keep the two halves honest: if the alias script stops running, or Next moves
// the convention's output path, the og:image references would silently 404 —
// which is strictly worse than the wrong MIME type it replaced.
// (Truth audit 2026-07-31, finding TA-11 / F-4.)
// ---------------------------------------------------------------------------

describe.runIf(OUT_EXISTS)('Gap 4: referenced image asset existence', () => {
  /**
   * Gap 4 — Referenced image asset existence.
   *
   * This file's own header has documented Gap 4 since it was written, and the
   * test did not exist. That gap is exactly how a live 404 survived: showcase
   * commit `593eebe` deleted `card-flag.{jpg,avif,webp}` while
   * `content/blog.json` kept referencing all three, so
   * `/blog/building-flagstone/` shipped a broken hero to production and every
   * gate stayed green. Nothing validated content images — `static-integrity`
   * covered hrefs and share cards, and `asset-integrity`'s badge check is an
   * `it.todo`.
   *
   * Scope is DELIBERATELY wider than the one bug: any local `<img src>` or
   * `<source srcset>` in the built output. `<source>` matters as much as `<img>`
   * and is the harder half — Chromium picks the AVIF `<source>` and `<picture>`
   * does NOT fall back when it 404s, so a dead `<source>` breaks the image while
   * a perfectly good `<img src>` sits right beside it. That is why the live
   * symptom was one console error per frame rather than three.
   *
   * Note React emits `srcSet` on `<source>`; HTML attribute names are
   * case-insensitive so the browser honours it, and the pattern below is too.
   */
  function collectContentImageRefs(): { route: string; url: string; attr: string }[] {
    const refs: { route: string; url: string; attr: string }[] = [];
    for (const file of collectHtmlFiles(OUT_DIR)) {
      const html = readFileSync(file, 'utf8');
      const route = file.replace(OUT_DIR, '');
      const pattern = /<(?:img|source)\b[^>]*?\b(src|srcset)="([^"]*)"/gi;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(html)) !== null) {
        // srcset may carry a candidate list ("a.jpg 1x, b.jpg 2x") — take each URL.
        for (const cand of m[2].split(',')) {
          const url = cand.trim().split(/\s+/)[0];
          if (url) refs.push({ route, url, attr: m[1].toLowerCase() });
        }
      }
    }
    return refs;
  }

  it('every local <img src> and <source srcset> resolves to a real file in ./out/', () => {
    assertOutDirExists();
    const refs = collectContentImageRefs();
    // Non-vacuity: an empty match set would make this pass by finding nothing.
    expect(refs.length, 'expected the built site to reference content images').toBeGreaterThan(10);

    const missing: string[] = [];
    for (const { route, url, attr } of refs) {
      if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) continue; // off-origin / inline
      const rel = url.split('?')[0].split('#')[0];
      if (!rel.startsWith('/')) continue; // relative paths resolve against the route, not ./out/
      if (!existsSync(join(OUT_DIR, rel))) missing.push(`${route} → ${attr}="${rel}"`);
    }
    expect(missing, `content images that 404:\n${missing.join('\n')}`).toEqual([]);
  });
});

describe.runIf(OUT_EXISTS)('Gap 7: share-card images', () => {
  const SITE_ORIGIN = 'https://skypistudio.com';
  const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

  /** Every og:image / twitter:image content value across the built site. */
  function collectCardImageRefs(): Array<{ route: string; url: string }> {
    const refs: Array<{ route: string; url: string }> = [];
    for (const file of collectHtmlFiles(OUT_DIR)) {
      const html = readFileSync(file, 'utf8');
      const route = file.replace(OUT_DIR, '');
      const pattern =
        /<meta\s+(?:property="og:image"|name="twitter:image")\s+content="([^"]*)"/gi;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(html)) !== null) refs.push({ route, url: m[1] });
    }
    return refs;
  }

  it('every share-card image resolves to a real file in ./out/', () => {
    assertOutDirExists();
    const refs = collectCardImageRefs();
    expect(refs.length, 'expected the built site to reference share-card images').toBeGreaterThan(0);

    const missing: string[] = [];
    for (const { route, url } of refs) {
      if (!url.startsWith(SITE_ORIGIN)) continue; // off-origin cards aren't ours to verify
      const rel = url.slice(SITE_ORIGIN.length).split('?')[0].split('#')[0];
      if (!existsSync(join(OUT_DIR, rel))) missing.push(`${route} → ${rel}`);
    }
    expect(missing, `share-card images that 404:\n${missing.join('\n')}`).toEqual([]);
  });

  // The /404 surface is the one documented exemption. Its card is emitted by
  // the opengraph-image FILE CONVENTION, which outranks any `images` entry
  // inherited from the root layout; overriding it would mean restating the
  // layout's whole openGraph block (a page-level block REPLACES the layout's)
  // and so duplicating the site description a third time. A 404 is an error
  // surface nobody shares on purpose, and its card is unchanged from what
  // shipped before this fix — so the debt is parked, loudly, not silently.
  const CARD_EXEMPT = /^\/404(\.html|\/index\.html)$/;

  it('every share-card image path carries a real image extension (GH Pages sends image/*)', () => {
    const offenders: string[] = [];
    for (const { route, url } of collectCardImageRefs()) {
      if (CARD_EXEMPT.test(route)) continue;
      if (!url.startsWith(SITE_ORIGIN)) continue;
      const rel = url.slice(SITE_ORIGIN.length).split('?')[0].split('#')[0];
      if (!IMAGE_EXT.test(rel)) offenders.push(`${route} → ${rel}`);
    }
    expect(
      offenders,
      `extensionless card paths: GH Pages will serve these as application/octet-stream:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('the homepage’s restated openGraph block has not drifted from its own <title>/description', () => {
    // app/page.tsx must restate the layout's og values verbatim (a page-level
    // openGraph replaces the layout's), which is a live drift risk. Pin it
    // against the document's own title + meta description — the same strings
    // app/layout.tsx generates — so an edit to one and not the other fails here.
    const html = readFileSync(join(OUT_DIR, 'index.html'), 'utf8');
    const docTitle = /<title>([^<]*)<\/title>/i.exec(html)?.[1];
    const docDesc = /<meta\s+name="description"\s+content="([^"]*)"/i.exec(html)?.[1];
    expect(docTitle, 'expected the homepage to render a <title>').toBeTruthy();
    expect(docDesc, 'expected the homepage to render a meta description').toBeTruthy();

    const ogTitleTag = /<meta\s+property="og:title"\s+content="([^"]*)"/i.exec(html)?.[1];
    const ogDescTag = /<meta\s+property="og:description"\s+content="([^"]*)"/i.exec(html)?.[1];
    expect(ogTitleTag, 'homepage og:title drifted from <title>').toBe(docTitle);
    expect(ogDescTag, 'homepage og:description drifted from meta description').toBe(docDesc);
  });

  it('each .png alias is byte-identical to the card the convention generated', () => {
    // The alias must be a copy, never a re-encode: the whole point is that the
    // bytes a strict unfurler finally accepts are the SAME bytes Next rendered.
    const aliases = collectCardImageRefs()
      .filter((r) => r.url.startsWith(SITE_ORIGIN))
      .map((r) => r.url.slice(SITE_ORIGIN.length).split('?')[0])
      .filter((rel) => /\/opengraph-image\.png$|\/twitter-image\.png$/.test(rel));

    const checked = new Set<string>();
    for (const rel of aliases) {
      if (checked.has(rel)) continue;
      checked.add(rel);
      const aliasPath = join(OUT_DIR, rel);
      const originalPath = aliasPath.replace(/\.png$/, '');
      expect(existsSync(aliasPath), `missing alias ${rel}`).toBe(true);
      expect(
        existsSync(originalPath),
        `${rel} has no extensionless original: the convention's output moved`,
      ).toBe(true);
      expect(
        readFileSync(aliasPath).equals(readFileSync(originalPath)),
        `${rel} is not byte-identical to the generated card`,
      ).toBe(true);
    }
    expect(checked.size, 'expected at least one .png card alias').toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Gap 8 — the rename's redirect stubs still redirect
//
// AccessMap was renamed Flagstone on 2026-08-17 and its URLs moved with it.
// `/work/accessmap/` and `/blog/building-accessmap/` are real URLs that were
// live, were in the sitemap, and may be linked from anywhere. They keep
// resolving only because of two hand-written files in public/, which Next
// copies into out/ verbatim.
//
// Nothing else in the build knows those files matter: they are not routes, no
// import references them, and no other test would notice their deletion. A
// tidy-up that removed public/work/ would silently 404 every inbound link to
// the case study, and every gate would stay green — which is exactly the shape
// of failure this suite exists to prevent. Hence: assert them against the
// BUILT artifact, not the source.
// ---------------------------------------------------------------------------

describe.runIf(OUT_EXISTS)('Gap 8: renamed URLs still resolve', () => {
  const SITE_ORIGIN = 'https://skypistudio.com';

  const MOVES = [
    { from: '/work/accessmap/', to: '/work/flagstone/' },
    { from: '/blog/building-accessmap/', to: '/blog/building-flagstone/' },
    // Not a rename — Mutual Mesh was WITHDRAWN 2026-08-18 and has no successor
    // page, so its old URL lands on the work index rather than 404ing. Same
    // stub mechanism, same guard.
    { from: '/work/mutual-mesh/', to: '/work/' },
  ];

  it.each(MOVES)('$from still resolves and points at $to', ({ from, to }) => {
    assertOutDirExists();

    const stub = join(OUT_DIR, from, 'index.html');
    expect(existsSync(stub), `the redirect stub for ${from} is missing from the build`).toBe(true);

    const html = readFileSync(stub, 'utf8');

    // 1. The redirect itself, at zero delay.
    expect(html, `${from} lost its meta refresh`).toMatch(
      new RegExp(`<meta\\s+http-equiv="refresh"\\s+content="0;\\s*url=${to}"`, 'i'),
    );

    // 2. The canonical, so the two URLs consolidate on the new one.
    expect(html, `${from} lost its canonical`).toContain(
      `<link rel="canonical" href="${SITE_ORIGIN}${to}" />`,
    );

    // 3. A real, visible, plain anchor — the fallback for anyone whose meta
    //    refresh is blocked (some privacy extensions, some readers). Without
    //    this the page is a dead end for exactly the users least able to
    //    recover from one.
    expect(html, `${from} has no plain <a> fallback`).toMatch(
      new RegExp(`<a href="${to}">[^<]+</a>`),
    );
  });

  it.each(MOVES)('$to: the destination of $from: actually exists', ({ to }) => {
    expect(existsSync(join(OUT_DIR, to, 'index.html')), `${to} did not build`).toBe(true);
  });

  it('the sitemap lists the new URLs and does not advertise the stubs', () => {
    const sitemap = join(OUT_DIR, 'sitemap.xml');
    expect(existsSync(sitemap), 'expected a built sitemap.xml').toBe(true);
    const xml = readFileSync(sitemap, 'utf8');

    for (const { from, to } of MOVES) {
      expect(xml, `sitemap is missing ${to}`).toContain(`${SITE_ORIGIN}${to}`);
      // A redirect stub is a courtesy to existing links, not a URL to promote.
      expect(xml, `sitemap still advertises the retired ${from}`).not.toContain(
        `${SITE_ORIGIN}${from}`,
      );
    }
  });
});


// ---------------------------------------------------------------------------
// Gap 9 — every rendered date is a real <time> element
//
// THE ROOM Phase J, 2026-08-26. OCD checklist item 8 ("Dates in <time>, one
// format, never 'Aug 16'") was implemented in Phase H (H1), component by
// component, from a list written before Phase D existed. D7 then added
// `captured <date> · <commit>` captions to Flagstone's three shots, and the
// A11yReceipts strip had carried its own "Measured <date>" line all along —
// so three dates on the FLAGSHIP page and two on /accessibility/ were still
// shipping as bare text after H1 declared "no gap left unfilled". Nothing
// caught it, because every H1 guard was a per-component unit test asserting a
// date it already knew about; none of them could see a date nobody had listed.
//
// This is the invariant version of that rule: whatever component renders it,
// an ISO date in the rendered text of an app route must sit inside a <time>.
//
// SCOPE, stated rather than allow-listed away:
//   · <script>/<style>/<head> are stripped — the RSC payload and OG metadata
//     carry raw ISO strings that are data, not rendered text.
//   · out/flagstone/** is excluded: a separately authored static legal surface
//     (Terms/Privacy/Support "Effective <date> · v1.0"), not a Next route, and
//     byte-frozen since before this program.
//   · The three redirect stubs are excluded: <meta refresh> courtesy pages
//     whose single explanatory sentence is byte-frozen.
// ---------------------------------------------------------------------------
describe.runIf(OUT_EXISTS)('Gap 9: rendered dates are <time> elements', () => {
  const EXCLUDED_PREFIXES = ['flagstone/', 'work/accessmap/', 'work/mutual-mesh/', 'blog/building-accessmap/'];
  const ISO_DATE = /\b20\d{2}-\d{2}-\d{2}\b/g;

  it('no ISO date appears in an app route’s rendered text outside a <time>', () => {
    const offenders: { file: string; context: string }[] = [];

    for (const htmlFile of collectHtmlFiles(OUT_DIR)) {
      const rel = htmlFile.replace(OUT_DIR + '/', '');
      if (EXCLUDED_PREFIXES.some((p) => rel.startsWith(p))) continue;

      let body = readFileSync(htmlFile, 'utf8');
      body = body.replace(/<head[\s\S]*?<\/head>/gi, ' ');
      body = body.replace(/<script[\s\S]*?<\/script>/gi, ' ');
      body = body.replace(/<style[\s\S]*?<\/style>/gi, ' ');
      // Remove every <time>…</time> — what remains is text that should carry no date.
      body = body.replace(/<time[\s\S]*?<\/time>/gi, ' ');
      // Hrefs and filenames legitimately contain dates (e.g. the evidence JSON).
      body = body.replace(/(href|src|content)="[^"]*"/gi, ' ');

      for (const m of body.matchAll(ISO_DATE)) {
        const raw = body.slice(Math.max(0, m.index! - 80), m.index! + 30);
        offenders.push({
          file: rel,
          context: raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        });
      }
    }

    expect(
      offenders,
      `bare date(s) outside <time>:\n${offenders.map((o) => `  ${o.file}: …${o.context}`).join('\n')}`,
    ).toEqual([]);
  });

  it('is not vacuous: the flagship page really does render dated evidence', () => {
    const flagstone = readFileSync(join(OUT_DIR, 'work/flagstone/index.html'), 'utf8');
    // The preserved drawer capture + the receipt's own measurement date. The
    // two supplied current-product stills intentionally carry no invented date.
    expect((flagstone.match(/<time[\s>]/gi) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(flagstone).toContain('captured<!-- --> <time dateTime="2026-08-18"');
  });
});
