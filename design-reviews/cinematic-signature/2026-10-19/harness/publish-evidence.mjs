// publish-evidence.mjs — copy the evidence into the repo folder, PNG frames → JPEG (q82),
// curated frame subset, boards, motion, prototype, a11y, manifests, harness.
//   node publish-evidence.mjs --evidence <scratch evidence dir> --harness <dir> --out <repo dir>
import { mkdirSync, copyFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/portfolio/package.json');
const sharp = require('sharp');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean));
const E = args.evidence, OUT = args.out, H = args.harness;
const mk = (d) => mkdirSync(d, { recursive: true });
const jpg = async (src, dst, q = 82) => { await sharp(src).jpeg({ quality: q, mozjpeg: true }).toFile(dst); };
const sizes = {};
const track = (p) => { sizes[p] = statSync(p).size; };

// boards
mk(join(OUT, 'boards'));
for (const f of readdirSync(join(E, 'boards')).filter((f) => f.endsWith('.jpg'))) { copyFileSync(join(E, 'boards', f), join(OUT, 'boards', f)); track(join(OUT, 'boards', f)); }
// frames: curated subset, all six configs, both builds
const KEEP = ['film-p0.00.png', 'film-p0.55.png', 'film-p0.82.png', 'film-p0.90.png', 'film-p1.00.png', 'handoff-+160.png', 'handoff-+420.png', 'handoff-+720.png'];
for (const [src, name] of [['baseline', 'original'], ['candidate', 'candidate']]) {
  for (const cfg of ['desktop-light', 'desktop-dark', 'mobile-light', 'mobile-dark', 'small-light', 'small-dark']) {
    const d = join(E, src, cfg); if (!existsSync(d)) continue;
    mk(join(OUT, 'frames', name, cfg));
    for (const f of KEEP) if (existsSync(join(d, f))) { const dst = join(OUT, 'frames', name, cfg, f.replace('.png', '.jpg')); await jpg(join(d, f), dst); track(dst); }
  }
  // deterministic light-up frames
  for (const sub of ['opening-anim-desktop', 'opening-anim-mobile']) { const d = join(E, src, sub); if (!existsSync(d)) continue; mk(join(OUT, 'frames', name, sub)); for (const f of readdirSync(d).filter((f) => f.endsWith('.png'))) { const dst = join(OUT, 'frames', name, sub, f.replace('.png', '.jpg')); await jpg(join(d, f), dst); track(dst); } copyFileSync(join(d, 'manifest.json'), join(OUT, 'frames', name, sub, 'manifest.json')); }
  // opening burst (first 4)
  const ob = join(E, src, 'opening-desktop'); if (existsSync(ob)) { mk(join(OUT, 'frames', name, 'opening-desktop')); for (const f of readdirSync(ob).filter((f) => f.endsWith('.png')).sort().slice(0, 4)) { const dst = join(OUT, 'frames', name, 'opening-desktop', f.replace('.png', '.jpg')); await jpg(join(ob, f), dst); track(dst); } copyFileSync(join(ob, 'manifest.json'), join(OUT, 'frames', name, 'opening-desktop', 'manifest.json')); }
}
// motion
mk(join(OUT, 'motion'));
for (const [src, name] of [['baseline', 'original'], ['candidate', 'candidate']]) for (const [cfg, label] of [['desktop-light', 'desktop-1440'], ['mobile-light', 'phone-393']]) {
  const mp4 = join(E, src, 'video-' + cfg, 'scroll-through.mp4'); if (existsSync(mp4)) { const dst = join(OUT, 'motion', `${name}-${label}.mp4`); copyFileSync(mp4, dst); track(dst); }
}
// direction B prototype renders
for (const cfg of ['desktop-light', 'desktop-dark', 'mobile-light']) { const d = join(E, 'direction-b', cfg); if (!existsSync(d)) continue; mk(join(OUT, 'direction-b', cfg)); for (const f of readdirSync(d).filter((f) => f.endsWith('.png'))) { const dst = join(OUT, 'direction-b', cfg, f.replace('.png', '.jpg')); await jpg(join(d, f), dst); track(dst); } }
copyFileSync(join(E, 'direction-b', 'manifest.json'), join(OUT, 'direction-b', 'manifest.json'));
// a11y
mk(join(OUT, 'a11y'));
for (const f of readdirSync(join(E, 'a11y-candidate'))) { const s = join(E, 'a11y-candidate', f); if (f.endsWith('.png')) { const dst = join(OUT, 'a11y', f.replace('.png', '.jpg')); await jpg(s, dst); track(dst); } else copyFileSync(s, join(OUT, 'a11y', f)); }
// manifests
mk(join(OUT, 'manifests'));
copyFileSync(join(E, 'baseline', 'manifest.json'), join(OUT, 'manifests', 'capture-original.json'));
copyFileSync(join(E, 'candidate', 'manifest.json'), join(OUT, 'manifests', 'capture-candidate.json'));
copyFileSync(join(E, 'a11y-candidate', 'report.json'), join(OUT, 'manifests', 'a11y-report.json'));
if (existsSync(join(E, 'boards', 'spec.json'))) copyFileSync(join(E, 'boards', 'spec.json'), join(OUT, 'manifests', 'boards-spec.json'));
// harness
mk(join(OUT, 'harness'));
for (const f of readdirSync(H).filter((f) => f.endsWith('.mjs'))) copyFileSync(join(H, f), join(OUT, 'harness', f));
const total = Object.values(sizes).reduce((a, b) => a + b, 0);
writeFileSync(join(OUT, 'manifests', 'published-files.json'), JSON.stringify(sizes, null, 2));
console.log(`[publish] ${Object.keys(sizes).length} binary files, ${(total / 1048576).toFixed(1)} MB`);
