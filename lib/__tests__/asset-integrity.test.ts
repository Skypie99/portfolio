/**
 * asset-integrity.test.ts — Portfolio static asset integrity checks (Gary / Shamus).
 *
 * Gap 4 — Badge image asset existence
 *   Every badgeImage.src path referenced in content/certificates.json must
 *   exist in public/. Missing files mean broken images on the live site.
 *
 * Unlike static-integrity.test.ts, this test reads content JSON and the
 * public/ directory directly — no prior build required. It can run as part
 * of `npm test` and will fail fast if any badge is missing.
 *
 * The same check also runs at build time via scripts/validate-assets.mjs
 * (wired as a `prebuild` npm script) to block deploys before they happen.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd());
const CERT_JSON = join(ROOT, 'content', 'certificates.json');

// ---------------------------------------------------------------------------
// Gap 4 — Badge image asset existence
// ---------------------------------------------------------------------------

describe('Gap 4 — badge image asset existence', () => {
  /**
   * J6 (THE ROOM Phase J, 2026-08-26) — this was `it.todo`, with the comment
   * "add real badge PNGs … to un-todo this guard". The badges arrived: the
   * prebuild's own validate-assets.mjs reports "all 9 certificate badge
   * image(s) found in public/" on every build, and I1 added AVIF/WebP
   * siblings for one of them. The blocker named in that TODO stopped being
   * true some time ago, so the guard has been sitting disabled while the
   * thing it guards has been correct — a disabled guard is a claim of
   * coverage that isn't there. Enabled, with the sibling formats checked too,
   * since I1 made that a real code path (BadgeImage.tsx reads avif/webp off
   * the JSON when present).
   */
  it('every badgeImage.src in certificates.json exists in public/', () => {
    const certs = JSON.parse(readFileSync(CERT_JSON, 'utf8')) as {
      id: string;
      badgeImage: { src: string; avif?: string; webp?: string };
    }[];
    const missing: string[] = [];
    for (const c of certs) {
      for (const path of [c.badgeImage.src, c.badgeImage.avif, c.badgeImage.webp]) {
        if (!path) continue;
        if (!existsSync(join(ROOT, 'public', path))) missing.push(`${c.id}: ${path}`);
      }
    }
    expect(missing, `badge image(s) referenced but not in public/:\n  ${missing.join('\n  ')}`).toEqual([]);
  });

  it('is not vacuous — it really did check every certificate', () => {
    const certs = JSON.parse(readFileSync(CERT_JSON, 'utf8')) as { badgeImage: { src: string } }[];
    expect(certs.length).toBeGreaterThanOrEqual(9);
    expect(certs.every((c) => typeof c.badgeImage?.src === 'string')).toBe(true);
  });

  it('certificates.json has at least one entry (sanity check)', () => {
    expect(existsSync(CERT_JSON)).toBe(true);
    const certs = JSON.parse(readFileSync(CERT_JSON, 'utf8'));
    expect(Array.isArray(certs)).toBe(true);
    expect(certs.length).toBeGreaterThan(0);
  });
});
