/**
 * support-first-hierarchy.test.ts — Portfolio 3.0 Phase 03 content guards.
 *
 * Phase 03 made senior technical/product support the primary professional
 * identity across the recruiter path, named the Skyler/Sky/SkyPi relationship
 * once, and added the Support Operating Record. These guards keep that
 * hierarchy from drifting back, one invariant per test.
 *
 * WHY A SOURCE SCAN, NOT A BUILT-HTML SCAN: CI runs `npm test` and nothing in
 * CI runs `test:static`, so a guard that needs ./out/ never executes on GitHub
 * (recorded as DECISIONS §P `P3-CI-STATIC-GAP`, cited by both
 * section-nav-anchors.test.ts and smart-punctuation.test.ts). These read source
 * so they run on every push, forever. The trade-off is that source text
 * includes JSX comments, so `stripComments()` below removes them first —
 * otherwise a comment that merely NAMES a forbidden pattern (the Support
 * Operating Record's own docblock names CSAT and SLA to explain why neither is
 * printed) would fail the very guard it is documenting.
 *
 * Companion guards, deliberately not duplicated here:
 *   - em dashes / prohibited product claims → recruiter-copy-truth.test.ts
 *   - straight apostrophes                  → smart-punctuation.test.ts
 *   - rail label vs. rendered eyebrow       → section-nav-anchors.test.ts (T2)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ROUTE_SECTIONS } from '@/lib/sectionNav';

const ROOT = process.cwd();
const read = (p: string): string => readFileSync(resolve(ROOT, p), 'utf8');

/**
 * Remove `/* *\/` block comments and `//` line comments so a guard tests the
 * copy the page SHIPS, not the prose explaining it. Deliberately simple: it
 * does not parse strings, so a `//` inside a URL literal would be trimmed too.
 * That is acceptable here because every assertion below is about human prose,
 * and no assertion depends on a URL surviving the strip.
 */
const stripComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');

/**
 * Collapse every whitespace run to a single space. JSX authors prose wrapped
 * across source lines and the renderer collapses that whitespace, so a guard
 * matching a rendered SENTENCE has to collapse it too. Without this, a purely
 * cosmetic re-wrap of a paragraph would fail a copy guard that the shipped
 * page still satisfies.
 */
const normalize = (src: string): string => src.replace(/\s+/g, ' ');

/** Every page whose copy a recruiter reads on the primary journey. */
const RECRUITER_PAGES = [
  'app/page.tsx',
  'app/about/page.tsx',
  'app/contact/page.tsx',
  'app/certificates/page.tsx',
  'app/work/page.tsx',
  'app/layout.tsx',
];

describe('Phase 03 — the hero keeps its protected support-first sentence', () => {
  /**
   * PR-004. This exact sentence is the site's best 10-second explanation of
   * the professional identity, and Phase 03 was explicitly forbidden from
   * altering or moving it. It is also the SOURCE for three of the five
   * Support Operating Record lanes, so a silent edit here would quietly
   * un-source the record downstream.
   */
  it('carries the PR-004 positioning line byte-identical', () => {
    expect(read('app/page.tsx')).toContain(
      'Senior technical-support specialist. I turn recurring user friction into documentation, QA, and the tools that fix it.',
    );
  });
});

describe('Phase 03 — identity architecture (F-001, F-002)', () => {
  it('uses the owner-approved formal name as the primary portfolio identity', () => {
    const layout = read('app/layout.tsx');
    expect(layout).toMatch(/name:\s*'Skyler Halisky'/);
    expect(layout).toMatch(/alternateName:\s*'Sky'/);
    expect(read('content/profile.json')).toMatch(/"wordmarkText":\s*"Skyler Halisky"/);
  });

  it('states the owner-approved one-person studio credit once, in the hero', () => {
    // Placement is evidence-driven, not stylistic: the Phase 03 blinded
    // 10-second test had 3 of 3 reviewers unable to tell whether "SkyPi
    // Studio" (the largest text on the protected opening frame) was a person
    // or an agency, because the explanation was on /about, ~60 seconds in.
    // It now sits in the homepage hero. Exactly ONE page may carry it
    // (T-043/T-050 forbid repeating it mechanically).
    const marker = 'SkyPi Studio is one person.';
    const pagesWithIt = RECRUITER_PAGES.filter((p) => normalize(read(p)).includes(marker));
    expect(pagesWithIt, `expected exactly one page to carry the relationship sentence, got: ${pagesWithIt.join(', ')}`).toEqual([
      'app/page.tsx',
    ]);
  });

  it('introduces the formal name on the About page without repeating the studio line', () => {
    const about = normalize(read('app/about/page.tsx'));
    expect(about).toContain('I am Skyler Halisky.');
    expect(about, 'the SkyPi relationship line must live in exactly one place').not.toContain(
      'SkyPi Studio is one person.',
    );
  });

  it('never lets SkyPi Studio read as an agency or a team', () => {
    for (const page of RECRUITER_PAGES) {
      const text = stripComments(read(page));
      expect(text, `${page} implies SkyPi Studio has staff`).not.toMatch(
        /the SkyPi Studio team|our team at SkyPi|SkyPi Studio,? (?:a|an) (?:agency|studio of|team)/i,
      );
    }
  });
});

describe('Phase 03 — support leads the professional hierarchy (F-003, F-005)', () => {
  it('retires the "AI Portfolio" site-name framing everywhere it shipped', () => {
    const offenders: string[] = [];
    for (const page of [...RECRUITER_PAGES, 'app/opengraph-image.tsx', 'lib/og.ts']) {
      if (read(page).includes('AI Portfolio')) offenders.push(page);
    }
    expect(offenders, `"AI Portfolio" still present in: ${offenders.join(', ')}`).toEqual([]);
  });

  it('names the occupation as support, never as AI Builder, in structured data', () => {
    const layout = read('app/layout.tsx');
    expect(layout).toMatch(/jobTitle:\s*'[^']*Support[^']*'/);
    expect(layout).not.toMatch(/jobTitle:\s*'[^']*AI Builder/);
  });

  it('leads the root description with support, with AI as a capability that follows', () => {
    const layout = stripComments(read('app/layout.tsx'));
    const match = layout.match(/const description =\s*\n?\s*'([^']+)'/);
    expect(match, 'root description not found in app/layout.tsx').toBeTruthy();
    const description = match![1];
    const supportAt = description.toLowerCase().indexOf('support');
    const aiAt = description.indexOf('AI');
    expect(supportAt, 'root description never mentions support').toBeGreaterThan(-1);
    // AI may appear (it is a real capability) but must not precede support.
    if (aiAt > -1) expect(supportAt).toBeLessThan(aiAt);
  });

  it('claims no non-target role as the professional identity', () => {
    // Contract §12. The negation in About's protected "I am not a trained
    // software engineer" is explicitly allowed, so the engineer pattern is
    // written to require a POSITIVE self-claim.
    const forbidden: RegExp[] = [
      /\bI am an? (?:founder|designer|product manager|software engineer)\b/i,
      /\bAI influencer\b/i,
      /\bfull[- ]stack (?:developer|engineer)\b/i,
    ];
    for (const page of RECRUITER_PAGES) {
      const text = stripComments(read(page));
      for (const re of forbidden) {
        expect(text, `${page} matches non-target role ${re}`).not.toMatch(re);
      }
    }
  });
});

describe('Phase 03 — the Support Operating Record (F-006)', () => {
  const home = read('app/page.tsx');

  it('ships all five lanes', () => {
    for (const lane of [
      'Escalation',
      'Troubleshooting',
      'Documentation and QA',
      'Training',
      'Support to product',
    ]) {
      expect(home, `lane "${lane}" missing`).toContain(`title: '${lane}'`);
    }
  });

  it('invents no support metric, employer, tenure, or scope', () => {
    // Contract §14. Nothing below is sourced, so nothing below may ship.
    const forbidden: RegExp[] = [
      /\b\d+\s*(?:years?|yrs)\b/i, // tenure
      /\bCSAT\b|\bNPS\b|\bSLA\b/i, // support metrics (word-bounded: "translate" contains "sla")
      /\b\d[\d,]*\s*(?:tickets?|cases?|escalations?)\b/i, // volume
      /\bteam of \d+|\bmanaged \d+|\bled a team\b/i, // scope
    ];
    for (const page of RECRUITER_PAGES) {
      const text = stripComments(read(page));
      for (const re of forbidden) {
        expect(text, `${page} asserts an unsourced support fact: ${re}`).not.toMatch(re);
      }
    }
  });

  it('says out loud that the absence of numbers is deliberate', () => {
    // Without this line the record reads as thin rather than as private.
    expect(normalize(home)).toContain('No metrics here.');
  });

  it('does not duplicate The Record: no dates, no open chip, no shared figures', () => {
    const section = home.slice(home.indexOf('id="support-work"'), home.indexOf('id="work"'));
    expect(section).not.toMatch(/\bdate=\{/);
    expect(section).not.toMatch(/\bopen=\{/);
    // The Record's own row figures must not reappear here.
    for (const figure of ['Last defect', 'Round ']) {
      expect(section, `Support record duplicates The Record's "${figure}"`).not.toContain(figure);
    }
  });

  it('is registered in the homepage rail, in document order, before The Work', () => {
    const homeSections = ROUTE_SECTIONS['/'];
    const ids = homeSections.map((s) => s.id);
    expect(ids).toContain('support-work');
    expect(ids.indexOf('support-work')).toBeGreaterThan(ids.indexOf('flagship'));
    expect(ids.indexOf('support-work')).toBeLessThan(ids.indexOf('work'));
    // sectionNav rule 1: the label must be a string the page itself renders.
    const entry = homeSections.find((s) => s.id === 'support-work')!;
    expect(normalize(home)).toContain(entry.label);
  });
});

describe('Phase 03 — contact intent (F-008, partial close by owner decision)', () => {
  /**
   * Sky chose the QUIET option on 2026-09-03: name role intent on /contact
   * only, and leave the homepage closer and the About closing exactly as they
   * were, preserving the recorded 2026-06-18 employer-safe / quiet-search
   * stance. So this suite asserts role intent EXISTS on /contact and
   * deliberately does NOT require it on the homepage or About. If a later
   * phase reopens F-008 for a fuller close, widen this test then.
   */
  it('names role and professional-conversation intent on /contact', () => {
    const contact = stripComments(read('app/contact/page.tsx'));
    expect(contact).toMatch(/\broles?\b/i);
    expect(contact).toMatch(/professional conversations/i);
  });

  it('keeps the contact page out of sales-funnel register', () => {
    const contact = stripComments(read('app/contact/page.tsx'));
    for (const re of [/book a call/i, /hire me\b/i, /\bpricing\b/i, /\bpackages\b/i, /free consultation/i]) {
      expect(contact, `contact page reads as a sales funnel: ${re}`).not.toMatch(re);
    }
  });
});
