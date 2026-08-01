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
  it.skip('skipped — needs ./out/; run `npm run test:static` (build → test) to exercise these', () => {});
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
 *   /portfolio/work/accessmap/
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

describe.skipIf(!OUT_EXISTS)('Gap 2 — internal link resolution', () => {
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

describe.skipIf(!OUT_EXISTS)('Gap 3 — external link rel attributes', () => {
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
describe.skipIf(!OUT_EXISTS)('Gap 5 — reveal failure floor guard', () => {
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

describe.runIf(OUT_EXISTS)('Gap 5 — new-tab links announce themselves', () => {
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

describe.runIf(OUT_EXISTS)('Gap 6 — share-card identity', () => {
  const SITE_ORIGIN = 'https://skypistudio.com';
  const EXPECTED_SITE_NAME = 'Sky Halisky — AI Portfolio';

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

  function realRoutes(): string[] {
    return collectHtmlFiles(OUT_DIR).filter((f) => !IS_404(f));
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
      if (siteName !== EXPECTED_SITE_NAME) {
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

