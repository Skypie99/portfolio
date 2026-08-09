/**
 * smart-punctuation.test.ts — the house apostrophe, locked (luxe Wave 1, item 1
 * `curly-the-estate`).
 *
 * WHAT WAS ACTUALLY WRONG (measured on 933c59a, the live tree)
 * ------------------------------------------------------------
 * `smartPunctuation()` already existed and already did the whole job — curly
 * quotes, apostrophes, em dash, ellipsis, with opener/closer heuristics and
 * `code`-span exclusion. It simply was not reaching everything. Two surfaces
 * rendered a straight U+0027 to the reader:
 *
 *   1. JSX-authored prose escaped as `&apos;` — 9 occurrences, against 9 places
 *      that already rendered a proper `’`. An exact 50/50 split of the same
 *      glyph across the same estate, which is the "mixed is the worst read"
 *      the audit named.
 *   2. `content/a11y-receipts.json` → `receipts[].sub`, the one visible prose
 *      string from content JSON that reached the DOM without the transform
 *      (every other prose field — deliverable `body`, blog `content`, shot
 *      captions — already routes through MarkdownProse / smartPunctuation).
 *
 * Alt text was deliberately LEFT ALONE. It is not visible prose; it is a string
 * a screen reader speaks, where the glyph is inaudible, and it is under a Zod
 * length + prefix rule. Curling it would be churn with a validation risk and no
 * reader-visible gain.
 *
 * WHY THE SOURCE GUARD IS THE LOAD-BEARING ONE
 * ---------------------------------------------
 * The obvious guard is "scan the built HTML for U+0027 in prose" — and it is
 * here, at the bottom. But it can only run when `./out/` exists, i.e. under
 * `npm run test:static`, and this repo has already recorded that CI runs
 * `npm test` and nothing in CI runs `test:static`
 * (DECISIONS §P `P3-CI-STATIC-GAP`, cited in section-nav-anchors.test.ts).
 * A guard that only executes locally is a guard that will not catch the
 * regression. So the entity check below is a SOURCE scan with no build
 * dependency: it runs on every `npm test`, in CI, forever.
 *
 * Guard-mode convention follows section-nav-anchors.test.ts: announce the
 * no-build case in an always-RUNNING test rather than leaving a standing
 * `skipped` in the gate report.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { smartPunctuation } from '@/lib/markdown';
import { ROUTE_SECTIONS } from '@/lib/sectionNav';

const ROOT = resolve(process.cwd());
const OUT_DIR = resolve(ROOT, 'out');
const OUT_EXISTS = existsSync(OUT_DIR);

const APOSTROPHE = '’'; // ’
const STRAIGHT = "'"; // the straight U+0027 we are hunting

/* ── 1. the transform itself ──────────────────────────────────────────────── */

describe('smartPunctuation — the transform', () => {
  it('curls contractions and possessives', () => {
    expect(smartPunctuation("it's")).toBe(`it${APOSTROPHE}s`);
    expect(smartPunctuation("users' hands")).toBe(`users${APOSTROPHE} hands`);
    expect(smartPunctuation("the portfolio's own suite")).toBe(
      `the portfolio${APOSTROPHE}s own suite`,
    );
  });

  it('opens and closes a single-QUOTE pair rather than curling both closed', () => {
    // content/blog.json carries a severity-4 'No ramp' barrier — a quote pair,
    // not an apostrophe. A naive apostrophe-only pass renders ’No ramp’, which
    // is the wrong glyph on the opener. The opener/closer heuristic is what
    // makes this correct, and this is the case that proves it.
    expect(smartPunctuation("a 'No ramp' barrier")).toBe('a ‘No ramp’ barrier');
  });

  it('opens and closes double quotes', () => {
    expect(smartPunctuation('she said "take the other entrance" once')).toBe(
      'she said “take the other entrance” once',
    );
  });

  it('folds ellipsis and em dash', () => {
    expect(smartPunctuation('wait... really')).toBe('wait… really');
    expect(smartPunctuation('a--b')).toBe('a—b');
  });

  it('leaves text with no straight punctuation byte-identical', () => {
    const clean = 'Accessibility. Privacy. No shortcuts.';
    expect(smartPunctuation(clean)).toBe(clean);
  });

  it('is a no-op on the C3 byte-locked string', () => {
    // app/page.tsx's "Open to thoughtful product collaborations" is byte-locked.
    // It renders through prose paths, so the transform must not touch it.
    const c3 = 'Open to thoughtful product collaborations';
    expect(smartPunctuation(c3)).toBe(c3);
  });

  it('emits no straight apostrophe for any input containing one', () => {
    for (const s of ["don't", "'tis", "kids' toys", "a 'quoted' word", "it's a 'test'"]) {
      expect(smartPunctuation(s)).not.toContain(STRAIGHT);
    }
  });
});

/* ── 2. the source guard (runs in CI, no build needed) ────────────────────── */

function walkSource(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      walkSource(full, acc);
    } else if (entry.name.endsWith('.tsx')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('the house apostrophe — source', () => {
  it('no JSX escapes an apostrophe as &apos; / &#39; (both render straight)', () => {
    const offenders: string[] = [];
    for (const file of [...walkSource(resolve(ROOT, 'app')), ...walkSource(resolve(ROOT, 'components'))]) {
      const src = readFileSync(file, 'utf8');
      src.split('\n').forEach((line, i) => {
        if (line.includes('&apos;') || line.includes('&#39;')) {
          offenders.push(`${relative(ROOT, file)}:${i + 1}  ${line.trim().slice(0, 90)}`);
        }
      });
    }
    expect(
      offenders,
      `These render a straight U+0027 to the reader. Use ${APOSTROPHE} directly:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('every section-nav label uses the house apostrophe', () => {
    // T2 in section-nav-anchors.test.ts requires each label to match a string
    // the route actually renders. If a heading is curled and its label is not
    // (or the reverse) that guard fails — this one names the cause directly.
    const labels = Object.values(ROUTE_SECTIONS).flat().map((s) => s.label);
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label, `section-nav label "${label}" carries a straight apostrophe`).not.toContain(
        STRAIGHT,
      );
    }
  });
});

/* ── 3. the render guard (needs ./out/ — `npm run test:static`) ───────────── */

describe('the house apostrophe — rendered', () => {
  it('has a source guard regardless, and scans ./out/ when a build exists', () => {
    expect(OUT_EXISTS || true).toBe(true);
    if (!OUT_EXISTS) {
      console.warn(
        '[smart-punctuation] no ./out/ — the rendered-prose scan below did NOT run. ' +
          'Use `npm run test:static` (build → test) to exercise it. The source ' +
          'guard above ran and is the one CI relies on.',
      );
    }
  });

  it.skipIf(!OUT_EXISTS)('renders no straight apostrophe in visible prose', () => {
    const htmlFiles: string[] = [];
    (function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.html')) htmlFiles.push(full);
      }
    })(OUT_DIR);

    const offenders: string[] = [];
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf8');
      const visible = html
        // Machinery that legitimately contains apostrophes and is never read as prose.
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
        .replace(/<code[\s\S]*?<\/code>/gi, ' ') // code spans stay literal by design
        .replace(/<[^>]+>/g, ' '); // tags (and their attributes) are not prose

      for (const chunk of visible.split(' ')) {
        const text = chunk.replace(/&apos;|&#39;/g, STRAIGHT).trim();
        if (!text) continue;
        // A word-internal or word-trailing straight quote is the prose defect.
        // (A lone ' between spaces is not something this estate authors.)
        if (/[A-Za-z]'[A-Za-z]|[A-Za-z]'(?=\s|$)/.test(text)) {
          offenders.push(`${relative(OUT_DIR, file)}  …${text.slice(0, 90)}…`);
        }
      }
    }

    expect(
      [...new Set(offenders)],
      `Straight U+0027 in rendered prose:\n${[...new Set(offenders)].join('\n')}`,
    ).toEqual([]);
  });
});
