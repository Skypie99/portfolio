/**
 * section-nav-anchors.test.ts — the rail's "On this page" index must tell the
 * truth about the route it is on (UP-10, ui-polish 2026-08-01).
 *
 * lib/sectionNav.ts is a hand-written per-route map, so the only thing standing
 * between it and quiet drift is a guard that checks it against the REAL built
 * pages. This file reads ./out/ and asserts, per indexed route:
 *
 *   T1  every mapped id exists inside that route's <main>            (no dangling anchor)
 *   T2  every mapped label is one of that route's OWN section-name   (no invented copy)
 *       strings — a heading or an eyebrow it actually renders
 *   T3  prose routes: the set of h2[id] in <main> is EXACTLY the      (no forgotten section)
 *       mapped set, both directions
 *   T4  eyebrow routes: the id'd bands in <main> (<section> OR <div>)  (no forgotten section)
 *       are EXACTLY the mapped set plus the declared-unindexed set
 *   T4b no mapped anchor carries `data-band-anchor` — a route never     (no page-in-its-own-toc)
 *       indexes its own title band
 *   T5  the rail rendered into that page lists exactly the mapped     (map == what ships)
 *       labels and hrefs, in order
 *   T6  a DERIVED sweep of every built .html: any route not in the map
 *       carries no "On this page" block at all
 *   T7  long-form routes still leave the slot to SidebarArticleNav
 *
 * Together these fail on: a renamed section heading, a deleted or renamed id, a
 * new markdown ## section, a new id'd band, a label edited to something the page
 * does not say, and a route silently gaining or losing its index.
 *
 * KNOWN LIMIT (deliberate, recorded in the build-plan DECISIONS §P): a brand-new
 * named band added to an eyebrow page WITHOUT an id is invisible here — the
 * index would omit it, which is a lie of omission the built HTML cannot
 * distinguish from an intentionally unindexed closer band. T4 catches it the
 * moment the band is given an id.
 *
 * Why the rail is read from OUTSIDE <main>: the labels also appear inside the
 * rail itself, so checking a label against whole-document text would match
 * itself and be vacuous. Every T2 lookup is scoped to <main>, and the rail sits
 * before <main> in the DOM (app/layout.tsx:214 — Sidebar, then main).
 *
 * IMPORTANT — requires a prior `npm run build`, so it is wired into the script
 * that provides one: `test:static` (build → test) names this file alongside
 * static-integrity.test.ts. With no ./out/ the checks below do not run, and the
 * always-running "guard mode" test above says so loudly rather than leaving a
 * standing skip in the report. NOTE, and it is not this phase's to fix: CI's
 * Test job runs `npm run test` with no prior build and nothing in CI runs
 * `test:static`, so neither this guard NOR the pre-existing static-integrity
 * guard executes on GitHub today — recorded as DECISIONS §P `P3-CI-STATIC-GAP`.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  INDEXED_ROUTES,
  ROUTE_SECTIONS,
  UNINDEXED_ROUTES,
  UNINDEXED_SECTION_IDS,
} from '@/lib/sectionNav';

const OUT_DIR = resolve(process.cwd(), 'out');
const OUT_EXISTS = existsSync(OUT_DIR);

/**
 * static-integrity.test.ts signals the no-build case with a permanently skipped
 * placeholder. This file announces it with an always-RUNNING check instead: the
 * project gate builds before it tests, so a placeholder here would show up as a
 * standing `skipped` in every gate report — exactly the shape a relaxed guard
 * has. This test passes in both modes and shouts in the one that matters.
 */
describe('Sidebar section index — guard mode', () => {
  it('has a map to check, and runs against ./out/ when a build exists', () => {
    expect(INDEXED_ROUTES.length).toBeGreaterThanOrEqual(4);
    if (!OUT_EXISTS) {
      console.warn(
        '[section-nav-anchors] no ./out/ — the built-HTML checks below did NOT run. ' +
          'Use `npm run test:static` (build → test) to exercise them.',
      );
    }
  });
});

/* ── html helpers ─────────────────────────────────────────────────────────── */

/** Decode the entities Next/React actually emits, in one pass (no double-decode). */
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    const named: Record<string, string> = {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
      nbsp: ' ',
    };
    return named[body.toLowerCase()] ?? whole;
  });
}

/** Visible text of an HTML fragment: strip tags FIRST, then decode, then collapse. */
function textOf(fragment: string): string {
  return decodeEntities(fragment.replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function readRoute(route: string): string {
  const file = route === '/' ? join(OUT_DIR, 'index.html') : join(OUT_DIR, route, 'index.html');
  return readFileSync(file, 'utf8');
}

/** The page content only — the rail and the footer are excluded by construction. */
function mainOf(html: string): string {
  const open = html.indexOf('<main');
  const close = html.lastIndexOf('</main>');
  expect(open, 'built page must contain exactly one <main>').toBeGreaterThan(-1);
  expect((html.match(/<main[ >]/g) ?? []).length).toBe(1);
  return html.slice(open, close);
}

/** Everything before <main> — where the persistent rail lives. */
function railRegionOf(html: string): string {
  return html.slice(0, html.indexOf('<main'));
}

function idsIn(fragment: string): string[] {
  return Array.from(fragment.matchAll(/\sid="([^"]+)"/g)).map((m) => m[1]);
}

/**
 * Every id'd BAND in the fragment. Matches <div> as well as <section> on
 * purpose: home's own opening band is `div#hero`, so a section-only scan would
 * be blind to exactly the shape the house already ships, and a new band added
 * as a div would slip past the conservation check below.
 */
function bandIdsIn(fragment: string): string[] {
  return Array.from(fragment.matchAll(/<(?:section|div)[^>]*\sid="([^"]+)"/g)).map((m) => m[1]);
}

function headingsIn(fragment: string): { tag: string; id: string | null; text: string }[] {
  return Array.from(fragment.matchAll(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/g)).map((m) => ({
    tag: m[1],
    id: /\sid="([^"]+)"/.exec(m[2])?.[1] ?? null,
    text: textOf(m[3]),
  }));
}

/** The eyebrow grammar: the small mono uppercase <p> that names a band. */
function eyebrowsIn(fragment: string): string[] {
  return Array.from(fragment.matchAll(/<p([^>]*)>([\s\S]*?)<\/p>/g))
    .filter((m) => /class="[^"]*tracking-label[^"]*"/.test(m[1]) && /uppercase/.test(m[1]))
    .map((m) => textOf(m[2]));
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The name the PAGE gives to the element carrying `id` — the prose grammar's
 * heading text, or the eyebrow that opens an id'd <section> band.
 *
 * Binding the label to its OWN anchor (rather than merely checking the label
 * appears somewhere on the page) is what makes T2 catch a swap: /about renders
 * both "A Brief Account" and "The Work", so a map that pointed #account at "The
 * Work" would pass a page-wide membership check and fail this one.
 */
function nameForAnchor(main: string, id: string): string | null {
  const heading = headingsIn(main).find((h) => h.id === id);
  if (heading) return heading.text;

  const open = main.search(new RegExp(`<(?:section|div)[^>]*\\sid="${escapeRe(id)}"`));
  if (open === -1) return null;
  // These bands are siblings (no nested <section> in any indexed route), so the
  // band runs to the next <section>; the eyebrow always opens it.
  const rest = main.slice(open + 1);
  const next = rest.indexOf('<section');
  return eyebrowsIn(next === -1 ? rest : rest.slice(0, next))[0] ?? null;
}

/** The "On this page" index as it actually shipped into the page. */
function railIndexOf(html: string): { label: string; href: string }[] | null {
  const region = railRegionOf(html);
  const navStart = region.indexOf('aria-label="On this page"');
  if (navStart === -1) return null;
  const navEnd = region.indexOf('</nav>', navStart);
  const nav = region.slice(navStart, navEnd);
  return Array.from(nav.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)).map((m) => ({
    href: m[1],
    label: textOf(m[2]),
  }));
}

/* Routes whose sections are markdown h2s vs. eyebrow-named <section> bands. */
const PROSE_ROUTES = new Set(['/colophon', '/accessibility']);

describe.runIf(OUT_EXISTS)('Sidebar section index tells the truth about its route', () => {
  for (const route of INDEXED_ROUTES) {
    const sections = ROUTE_SECTIONS[route as keyof typeof ROUTE_SECTIONS];

    describe(`${route}`, () => {
      // Lazy + memoized: reading at describe-collection time turns a missing or
      // malformed built page into an unhandled ENOENT during collection instead
      // of a named failure. (Hit for real mid-phase, when a rebuild was in
      // flight.)
      let cache: { html: string; main: string } | null = null;
      const page = () => {
        if (!cache) {
          const html = readRoute(route);
          cache = { html, main: mainOf(html) };
        }
        return cache;
      };

      it('T0 — the route has a built page with exactly one <main>', () => {
        expect(page().main.length).toBeGreaterThan(0);
      });

      it('T1 — every mapped anchor exists on the page', () => {
        const ids = new Set(idsIn(page().main));
        for (const s of sections) {
          expect(ids, `${route} is missing id="${s.id}" (mapped label "${s.label}")`).toContain(
            s.id,
          );
        }
      });

      it('T2 — every label is the name the page gives THAT anchor', () => {
        for (const s of sections) {
          expect(
            nameForAnchor(page().main, s.id),
            `${route}#${s.id} is named differently on the page than in the index ` +
              `(index says "${s.label}"). The index may not invent or reassign names.`,
          ).toBe(s.label);
        }
      });

      if (PROSE_ROUTES.has(route)) {
        it('T3 — the mapped set is EXACTLY the page\'s h2 anchors', () => {
          const h2Ids = headingsIn(page().main)
            .filter((h) => h.tag === 'h2' && h.id)
            .map((h) => h.id as string);
          expect(h2Ids).toEqual(sections.map((s) => s.id));
        });
      } else {
        it('T4 — the page\'s id\'d bands are EXACTLY (indexed + declared-unindexed)', () => {
          // Order-preserving: the indexed ids must appear in document order, and
          // every other id'd band must be declared in UNINDEXED_SECTION_IDS. A
          // new band given an id therefore cannot join the page without someone
          // deciding, in writing, whether the index should mention it.
          const onPage = bandIdsIn(page().main);
          const declaredOut = UNINDEXED_SECTION_IDS[route] ?? [];
          expect(onPage.filter((id) => !declaredOut.includes(id))).toEqual(
            sections.map((s) => s.id),
          );
          expect(onPage.filter((id) => declaredOut.includes(id)).sort()).toEqual(
            [...declaredOut].sort(),
          );
        });
      }

      it('T4b — no mapped anchor is the route\'s title band (rule 3)', () => {
        // `data-band-anchor` is the house marker for a route's opening band —
        // the analogue of home's unlisted `div#hero`. An index entry pointing at
        // one means the page has been put inside its own table of contents,
        // which is the mistake this rule exists to prevent.
        const main = page().main;
        for (const s of sections) {
          const open = main.search(new RegExp(`<(?:section|div)[^>]*\\sid="${escapeRe(s.id)}"`));
          if (open === -1) continue; // prose anchors are h2s, never title bands
          const tag = main.slice(open, main.indexOf('>', open));
          expect(
            tag.includes('data-band-anchor'),
            `${route}#${s.id} is the route's title band — it must not be indexed`,
          ).toBe(false);
        }
      });

      it('T5 — the rail that shipped lists exactly the mapped labels, in order', () => {
        const rendered = railIndexOf(page().html);
        expect(rendered, `${route} should render an "On this page" index`).not.toBeNull();
        expect(rendered?.map((e) => e.label)).toEqual(sections.map((s) => s.label));
        // No basePath is configured today (next.config.mjs has none); endsWith
        // keeps the assertion true if one is ever added.
        rendered?.forEach((e, i) => {
          expect(e.href.endsWith(sections[i].href)).toBe(true);
        });
      });
    });
  }

  it('T6 — every built route that is not indexed renders no "On this page" block', () => {
    // A DERIVED sweep, not an allowlist: walk the whole export, so a brand-new
    // page under app/ cannot be forgotten, and neither can the second 404 file
    // (the export ships BOTH out/404.html and out/404/index.html).
    const offenders: string[] = [];
    const seen: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === '_next') continue;
          walk(full);
        } else if (entry.name.endsWith('.html')) {
          const rel = relative(OUT_DIR, full);
          const route =
            rel === 'index.html' ? '/' : '/' + rel.replace(/\/?index\.html$/, '').replace(/\.html$/, '');
          seen.push(route);
          if (INDEXED_ROUTES.includes(route)) continue; // covered by T1–T5
          if (readFileSync(full, 'utf8').includes('aria-label="On this page"')) offenders.push(rel);
        }
      }
    };
    walk(OUT_DIR);

    // The sweep must actually have swept — a silent zero would pass vacuously.
    expect(seen.length).toBeGreaterThan(INDEXED_ROUTES.length);
    for (const route of UNINDEXED_ROUTES) expect(seen).toContain(route);
    expect(seen).toContain('/404');
    expect(offenders, 'these built pages carry a section index they should not').toEqual([]);
  });

  it('T7 — long-form routes still leave the slot to SidebarArticleNav', () => {
    for (const route of ['blog/building-flagstone', 'work/flagstone']) {
      const html = readFileSync(join(OUT_DIR, route, 'index.html'), 'utf8');
      // The article index is read from the DOM after hydration, so the static
      // HTML carries its height reserve and no section index.
      expect(html.includes('aria-label="On this page"'), route).toBe(false);
      expect(html.includes('sidebar-toc-reserve'), route).toBe(true);
    }
  });
});
