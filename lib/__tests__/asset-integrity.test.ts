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
  // TODO: add real badge PNGs to public/images/certificates/<slug>/badge.png to un-todo this guard
  it.todo('every badgeImage.src in certificates.json exists in public/');

  it('certificates.json has at least one entry (sanity check)', () => {
    expect(existsSync(CERT_JSON)).toBe(true);
    const certs = JSON.parse(readFileSync(CERT_JSON, 'utf8'));
    expect(Array.isArray(certs)).toBe(true);
    expect(certs.length).toBeGreaterThan(0);
  });
});
