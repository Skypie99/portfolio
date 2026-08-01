// postbuild — give every generated OG card a real `.png` path.
//
// Next's opengraph-image file convention emits its PNG at an EXTENSIONLESS
// path (out/opengraph-image, out/accessibility/opengraph-image). GitHub Pages
// resolves content-type from the file extension alone, so those bytes go out
// as `application/octet-stream` — verified live 2026-07-31:
//
//   /opengraph-image               -> content-type: application/octet-stream
//   /images/.../card-flag.jpg      -> content-type: image/jpeg
//
// The bytes are a valid 1200x630 PNG either way, so sniffing unfurlers render
// the card fine — but a strict unfurler that trusts content-type over sniffing
// can refuse it, and the share card is the pre-click claim a recruiter reads
// before the site ever loads. (Truth audit 2026-07-31, finding TA-11 / F-4.)
//
// This copies each generated card to a `.png` sibling, BYTE-IDENTICAL, and the
// metadata in app/ points og:image at the `.png`. The extensionless original is
// deliberately LEFT IN PLACE: anything already scraped or shared still resolves.
//
// Idempotent, and safe to run when the targets are absent (a future Next that
// emits a different path just yields "nothing to alias" — the assertion below
// is what makes that loud instead of silent). Wired as npm `postbuild`, so it
// runs automatically after `next build` via `npm run build` (what CI calls).
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('out');
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Generated OG/Twitter cards, by Next's file-convention basenames. */
const CARD_BASENAMES = new Set(['opengraph-image', 'twitter-image']);

const aliased = [];

/**
 * Walk out/ for extensionless card files. `_next/` is skipped outright: it
 * holds a JS chunk that shares the `opengraph-image` basename (the route's
 * compiled module), and copying that to .png would ship a lie.
 */
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_next') continue;
      walk(full);
      continue;
    }
    if (!CARD_BASENAMES.has(entry.name)) continue;

    // Belt and braces: only copy something that really is a PNG.
    const bytes = fs.readFileSync(full);
    if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
      console.warn(`[og-png-alias] SKIP ${path.relative(OUT, full)} — not PNG bytes.`);
      continue;
    }

    const target = `${full}.png`;
    fs.writeFileSync(target, bytes);
    aliased.push(`${path.relative(OUT, full)} -> ${path.relative(OUT, target)} (${bytes.length} B)`);
  }
}

walk(OUT);

if (aliased.length) {
  console.log('[og-png-alias] gave each OG card a real .png path (image/png on GH Pages):');
  for (const a of aliased) console.log('  - ' + a);
} else {
  // Loud, not silent: metadata in app/ references the .png paths, so if the
  // convention ever stops emitting these, the share cards would 404 quietly.
  console.warn(
    '[og-png-alias] WARNING: no OG card files found under out/. ' +
      'app/ metadata points og:image at .png paths — if Next changed the ' +
      'opengraph-image output path, those references are now dead.',
  );
}
