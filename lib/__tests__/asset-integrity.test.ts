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
const PUBLIC_DIR = join(ROOT, 'public');
const CERT_JSON = join(ROOT, 'content', 'certificates.json');

// ---------------------------------------------------------------------------
// Gap 4 — Badge image asset existence
// ---------------------------------------------------------------------------

describe('Gap 4 — badge image asset existence', () => {
  it('every badgeImage.src in certificates.json exists in public/', () => {
    expect(existsSync(CERT_JSON), `content/certificates.json not found at ${CERT_JSON}`).toBe(true);

    const certs: Array<{ id?: string; badgeImage?: { src?: string } }> = JSON.parse(
      readFileSync(CERT_JSON, 'utf8'),
    );

    const missing: Array<{ id: string; src: string; expected: string }> = [];

    for (const cert of certs) {
      const src = cert?.badgeImage?.src;
      if (!src) continue;

      // src is like "/images/certificates/<slug>/badge.png"
      // Strip leading "/" and resolve against public/
      const relPath = src.startsWith('/') ? src.slice(1) : src;
      const fullPath = join(PUBLIC_DIR, relPath);

      if (!existsSync(fullPath)) {
        missing.push({
          id: cert.id ?? '(unknown)',
          src,
          expected: relPath,
        });
      }
    }

    if (missing.length > 0) {
      const report = missing
        .map((m) => `  cert "${m.id}": src="${m.src}" → missing public/${m.expected}`.replace('public//', 'public/'))
        .join('\n');
      expect.fail(
        `${missing.length} missing badge image(s) in public/:\n${report}\n\n` +
          'See qa-reports/2026-05-29_DaniShamus_BadgeImage_Proposal.md for the expected directory structure.\n' +
          'Add the real badge PNGs to public/images/certificates/<slug>/badge.png to fix this.',
      );
    }
  });

  it('certificates.json has at least one entry (sanity check)', () => {
    expect(existsSync(CERT_JSON)).toBe(true);
    const certs = JSON.parse(readFileSync(CERT_JSON, 'utf8'));
    expect(Array.isArray(certs)).toBe(true);
    expect(certs.length).toBeGreaterThan(0);
  });
});
