#!/usr/bin/env node
/**
 * cut-details.mjs — Release 5 detail crops, cut from the SHIPPED showcase
 * captures (public/showcase/<slug>/…) into public/images/deliverables/<slug>/.
 *
 *   node qa-reports/release5-showcases-20261020/tools/cut-details.mjs [--dry]
 *
 * Every output is an additional, clearly labelled detail of an original capture
 * the site already ships; the originals are never modified. Boxes are pixel
 * coordinates in the shipped file (1290×806 desktop hero captures, 1600×1000
 * desktop shots, 780×1688 phone captures). The factory masters (2880×1800)
 * live only in the owner's gitignored bank, so these cuts are at shipped
 * resolution; the handoff asks the capture factory to re-cut the same boxes
 * from the masters (scale ×2.232 for the 1290-wide files, ×1.8 for the
 * 1600-wide files; phone files are already native) for a crisper final.
 * Writes details.json beside the outputs with every box and byte count.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const DRY = process.argv.includes('--dry');
const THEMES = ['light', 'dark'];

/** name → { from: shipped file pattern ({theme} substituted), box: [left, top, width, height], note } */
const CUTS = {
  'prompt-library': {
    'r5-prompt-open': {
      from: 'showcase/prompt-library/prompt-detail.{theme}.desktop.webp',
      box: [288, 228, 1024, 544],
      note: 'The opened prompt: preview with {{variables}} on the left, the variable fields and run controls on the right.',
    },
    'r5-prompt-variables': {
      from: 'showcase/prompt-library/prompt-detail.{theme}.desktop.webp',
      box: [792, 372, 520, 400],
      note: 'The variables panel only, for the phone reading size.',
    },
    'r5-featured-card': {
      from: 'showcase/prompt-library/home.{theme}.desktop.webp',
      box: [760, 222, 330, 206],
      note: 'The featured prompt card as the library opens: category, title, description and tags (the phone reading size). The 2026-07-31 phone capture of the home was not used: its privacy line predates the truth pass.',
    },
  },
  'claude-corp': {
    'r5-pipeline': {
      from: 'showcase/claude-corp/hero-pipeline.{theme}.desktop.webp',
      box: [150, 488, 990, 298],
      note: 'The orchestration pipeline band from the public site: Sky, Morgan, 15 roles, Safety, main.',
    },
    'r5-team-phone': {
      from: 'showcase/claude-corp/team.{theme}.phone.webp',
      box: [0, 120, 780, 1300],
      note: 'The role grid on a phone: the section head, the role filters and the first two role cards.',
    },
  },
  'dashboard': {
    'r5-disclosure': {
      from: 'showcase/dashboard/command-center.{theme}.desktop.webp',
      box: [200, 0, 1090, 440],
      note: 'The demo seam at reading size: the DEMO badge, the dated snapshot, the command center and the synthetic-data banner.',
    },
    'r5-think-tank': {
      from: 'showcase/dashboard/think-tank.{theme}.desktop.webp',
      box: [248, 76, 1352, 754],
      note: 'The Think Tank board without the sidebar: the triage header, project filters and the first two ideas.',
    },
    'r5-dispatch': {
      from: 'showcase/dashboard/dispatch.{theme}.desktop.webp',
      box: [240, 60, 1360, 800],
      note: 'The Dispatch queue without the sidebar: status filters and the first five queued items.',
    },
    'r5-think-tank-phone': {
      from: 'showcase/dashboard/think-tank.{theme}.phone.webp',
      box: [0, 120, 780, 1440],
      note: 'The Think Tank on a phone: the triage header, project filters and the first idea.',
    },
  },
};

const record = { generatedAt: new Date().toISOString().slice(0, 10), tool: 'qa-reports/release5-showcases-20261020/tools/cut-details.mjs', outputs: [] };

for (const [slug, cuts] of Object.entries(CUTS)) {
  const outDir = path.join(ROOT, 'public', 'images', 'deliverables', slug);
  for (const [name, cut] of Object.entries(cuts)) {
    for (const theme of THEMES) {
      const src = path.join(ROOT, 'public', cut.from.replace('{theme}', theme));
      if (!fs.existsSync(src)) throw new Error(`missing source ${src}`);
      const meta = await sharp(src).metadata();
      const [left, top, width, height] = cut.box;
      if (left + width > meta.width || top + height > meta.height) throw new Error(`${name} ${theme}: box exceeds ${meta.width}×${meta.height}`);
      const base = sharp(src).extract({ left, top, width, height });
      const outs = {
        avif: path.join(outDir, `${name}.${theme}.avif`),
        webp: path.join(outDir, `${name}.${theme}.webp`),
      };
      if (!DRY) {
        fs.mkdirSync(outDir, { recursive: true });
        await base.clone().avif({ quality: 56, effort: 6 }).toFile(outs.avif);
        await base.clone().webp({ quality: 84 }).toFile(outs.webp);
      }
      const bytes = DRY ? null : { avif: fs.statSync(outs.avif).size, webp: fs.statSync(outs.webp).size };
      record.outputs.push({ slug, name, theme, source: cut.from.replace('{theme}', theme), sourceSize: [meta.width, meta.height], box: cut.box, note: cut.note, files: { avif: `/images/deliverables/${slug}/${name}.${theme}.avif`, webp: `/images/deliverables/${slug}/${name}.${theme}.webp` }, bytes });
      console.log(`[cut] ${slug}/${name}.${theme}: ${width}×${height} from ${path.basename(src)}${bytes ? ` · avif ${bytes.avif} B · webp ${bytes.webp} B` : ' (dry)'}`);
    }
  }
}
if (!DRY) fs.writeFileSync(path.join(ROOT, 'qa-reports/release5-showcases-20261020/details.json'), JSON.stringify(record, null, 2));
