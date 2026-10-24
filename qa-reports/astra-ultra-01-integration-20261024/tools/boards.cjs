// Side-by-side before/after boards + pixel comparison for each captured pair.
// usage: node boards.cjs <visualsDir>
const sharp = require(process.env.SHARP);
const fs = require('fs');
const path = require('path');

(async () => {
  const dir = process.argv[2];
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const pairs = {};
  for (const m of manifest) (pairs[`${m.surface}|${m.width}|${m.scheme}`] ||= {})[m.side] = path.join(dir, m.file);
  fs.mkdirSync(path.join(dir, 'boards'), { recursive: true });
  const report = [];
  for (const [key, p] of Object.entries(pairs)) {
    const [surface, width, scheme] = key.split('|');
    const a = sharp(p.before), b = sharp(p.after);
    const [ma, mb] = await Promise.all([a.metadata(), b.metadata()]);
    // Pixel identity (only meaningful when the dimensions match).
    let identical = false, diffPixels = null;
    if (ma.width === mb.width && ma.height === mb.height) {
      const [ra, rb] = await Promise.all([sharp(p.before).raw().toBuffer(), sharp(p.after).raw().toBuffer()]);
      diffPixels = 0; const ch = ma.channels;
      for (let i = 0; i < ra.length; i += ch) { for (let c = 0; c < ch; c++) if (ra[i + c] !== rb[i + c]) { diffPixels++; break; } }
      identical = diffPixels === 0;
    }
    const label = (t, w) => Buffer.from(`<svg width="${w}" height="56"><rect width="100%" height="100%" fill="#1d2422"/><text x="16" y="37" font-family="Helvetica" font-size="26" fill="#f3efe4">${t}</text></svg>`);
    const gap = 24, H = Math.max(ma.height, mb.height) + 56;
    const W = ma.width + mb.width + gap;
    const out = path.join(dir, 'boards', `${surface}-${width}-${scheme}.jpg`);
    await sharp({ create: { width: W, height: H, channels: 3, background: '#888' } })
      .composite([
        { input: label(`BEFORE main 601a402 · ${surface} · ${width}px · ${scheme}`, ma.width), left: 0, top: 0 },
        { input: label(`AFTER candidate · ${surface} · ${width}px · ${scheme}`, mb.width), left: ma.width + gap, top: 0 },
        { input: p.before, left: 0, top: 56 },
        { input: p.after, left: ma.width + gap, top: 56 },
      ])
      .jpeg({ quality: 82 }).toFile(out);
    report.push({ surface, width: +width, scheme, before: path.relative(dir, p.before), after: path.relative(dir, p.after), board: path.relative(dir, out), sameSize: ma.width === mb.width && ma.height === mb.height, identical, diffPixels });
  }
  fs.writeFileSync(path.join(dir, 'pixel-compare.json'), JSON.stringify(report, null, 1));
  for (const r of report) console.log(`${r.surface} ${r.width} ${r.scheme}: ${r.identical ? 'PIXEL-IDENTICAL' : r.sameSize ? `differs (${r.diffPixels} px)` : 'size differs'}`);
})();
