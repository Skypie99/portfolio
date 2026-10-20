#!/usr/bin/env node
/**
 * axe-check.mjs — axe-core over the two Release 6 surfaces, both themes, from a
 * BUILT export. Uses the repository's own axe-core devDependency; nothing is
 * installed and nothing leaves loopback.
 *
 *   node axe-check.mjs --dir <export dir> --out <dir> [--themes light,dark] [--sizes 1440x900@1,393x852@2]
 *
 * Each page is loaded, walked once so reveals rest visible, then axe runs on
 * the whole document (WCAG 2.x A/AA tags) and again scoped to the surface.
 * Writes axe.json (every violation with its nodes) and prints a summary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { opt, parseSizes, resolveChromium, serve, chromium, makeContext, load, scrollThrough, ROOT } from './lib.mjs';

const require = createRequire(import.meta.url);
const AXE_SRC = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const AXE_VERSION = require('axe-core/package.json').version;

const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out'));
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = parseSizes(opt('sizes', '1440x900@1,393x852@2'));
const PORT = Number(opt('port', 3291));
const BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });

const SURFACES = [
  { name: 'work', route: '/work/', scope: 'main' },
  { name: 'home-work', route: '/', scope: '#work' },
];

const engine = resolveChromium();
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
const results = [];
try {
  for (const surf of SURFACES) {
    for (const theme of THEMES) {
      for (const size of SIZES) {
        const ctx = await makeContext(browser, { ...size, theme, mode: 'normal' });
        const page = await ctx.newPage();
        await load(page, BASE + surf.route);
        await scrollThrough(page);
        await page.addScriptTag({ content: AXE_SRC });
        const run = async (context) =>
          page.evaluate(
            async ({ context }) => {
              const r = await window.axe.run(context, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
              return {
                violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, tags: v.tags, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary, html: n.html.slice(0, 200) })) })),
                passes: r.passes.length,
                incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
              };
            },
            { context },
          );
        const whole = await run('html');
        const scoped = await run(surf.scope);
        const row = { surface: surf.name, route: surf.route, theme, size: size.tag, whole, scoped };
        results.push(row);
        console.log(`[axe ${AXE_VERSION}] ${surf.name} ${theme} ${size.tag}: page violations ${whole.violations.length} (${whole.violations.map((v) => v.id).join(', ') || 'none'}) · scoped ${scoped.violations.length} · passes ${whole.passes} · incomplete ${whole.incomplete.length}`);
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
fs.writeFileSync(path.join(OUT, 'axe.json'), JSON.stringify({ axe: AXE_VERSION, dir: DIR, at: new Date().toISOString(), results }, null, 2));
