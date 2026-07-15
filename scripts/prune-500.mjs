// postbuild — prune the unreachable /500 pages-router ghost from the static export.
//
// Next App Router still emits a pages-router default /500 error page during
// `output: 'export'`. On a static host (GitHub Pages) no server ever serves a
// 500, so the page + its chunk are dead wire. This removes them AFTER the build.
//
// LOAD-BEARING: the /404 pair is what GH Pages actually serves for unmatched
// routes — out/404.html (top-level, GH Pages convention) AND out/404/index.html
// (trailingSlash form). NEVER touch those. This script only removes /500.
//
// Idempotent: safe to run when the targets are already absent (e.g. a future
// Next version that stops emitting /500). Wired as npm `postbuild`, so it runs
// automatically after `next build` via `npm run build` (what CI/deploy calls).
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('out');
const removed = [];

function rm(target, kind) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
  removed.push(`${kind}: ${path.relative(OUT, target) || target}`);
}

// The /500 route in both possible emitted forms (trailingSlash dir + flat html).
rm(path.join(OUT, '500'), 'route-dir');
rm(path.join(OUT, '500.html'), 'route-html');

// The /500 page's own JS chunk (pages-router, page-specific — never a shared runtime chunk).
const chunkDir = path.join(OUT, '_next', 'static', 'chunks', 'pages');
if (fs.existsSync(chunkDir)) {
  for (const f of fs.readdirSync(chunkDir)) {
    if (/^500-.*\.js$/.test(f)) rm(path.join(chunkDir, f), 'page-chunk');
  }
}

if (removed.length) {
  console.log('[prune-500] pruned the unreachable /500 ghost:');
  for (const r of removed) console.log('  - ' + r);
} else {
  console.log('[prune-500] nothing to prune (no /500 artifacts emitted).');
}
// Sanity: never let the 404 pair go missing (that would be a real regression).
for (const keep of ['404.html', path.join('404', 'index.html')]) {
  if (!fs.existsSync(path.join(OUT, keep))) {
    console.warn(`[prune-500] WARNING: expected out/${keep} is missing — the load-bearing 404 pair is incomplete.`);
  }
}
