#!/usr/bin/env node
/**
 * press-evidence/tables.mjs — before/after measurement tables (markdown) from
 * the two harness runs, so the receipt can cite numbers next to the frames.
 *
 *   node tables.mjs --before ./before --after ./after > tables.md
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const before = JSON.parse(fs.readFileSync(path.join(path.resolve(arg('--before', 'before')), 'measurements.json'), 'utf8'));
const after = JSON.parse(fs.readFileSync(path.join(path.resolve(arg('--after', 'after')), 'measurements.json'), 'utf8'));

const key = (m) => `${m.vp}|${m.theme}|${m.control}|${m.state}`;
const idx = (list) => new Map(list.filter((m) => m.control && !m.skipped).map((m) => [key(m), m]));
const B = idx(before), A = idx(after);

const flags = (m) => [m.active ? 'active' : null, m.hover ? 'hover' : null, m.focusVisible ? 'focus-visible' : null].filter(Boolean).join('+') || '—';
const tf = (m) => (m.transform && m.transform !== 'none' && m.transform !== 'matrix(1, 0, 0, 1, 0, 0)' ? m.transform.replace('matrix(1, 0, 0, 1, ', 'translate(').replace(')', ')') : 'none');
const dot = (m) => (m.dot ? `${m.dot.width} ${m.dot.backgroundColor}` : '—');
const cell = (m) => (m ? `${flags(m)} · border ${m.borderColor} · bg ${m.backgroundColor} · dot ${dot(m)} · transform ${tf(m)} · dur ${m.transitionDuration}` : '(not captured)');

const CONTROLS = ['button', 'button-hero', 'button-dotcolor', 'doorway-flagship', 'doorway-row', 'hamburger-trigger', 'hamburger-close', 'hamburger-item'];
const STATES = ['rest', 'hover', 'focus', 'pressed', 'released', 'cancelled'];
const PROFILES = [...new Set([...B.values()].map((m) => `${m.vp}|${m.theme}`))];

for (const p of PROFILES) {
  const [vp, theme] = p.split('|');
  const sample = [...B.values()].find((m) => m.vp === vp && m.theme === theme);
  console.log(`\n### ${vp} · ${theme} (hover:hover=${sample.media.hoverHover}, pointer:coarse=${sample.media.pointerCoarse})\n`);
  console.log('| control | state | before (main b3e992b) | after (candidate) |');
  console.log('|---|---|---|---|');
  for (const c of CONTROLS) for (const s of STATES) {
    const b = B.get(`${vp}|${theme}|${c}|${s}`), a = A.get(`${vp}|${theme}|${c}|${s}`);
    if (!b && !a) continue;
    console.log(`| ${c} | ${s} | ${cell(b)} | ${cell(a)} |`);
  }
}
