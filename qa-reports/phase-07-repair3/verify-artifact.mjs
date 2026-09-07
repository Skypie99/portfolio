import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const repo = '/Users/skypie/Portfolio-codex/portfolio-3.0-phase07-20260905';
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceCommit = 'd6e378a4f5b76682a3a9b821e7d90c12e255be76';
assert.equal(git('diff', sourceCommit, '--', 'app', 'components', 'content', 'lib', 'public'), '');
const walk = dir => readdirSync(join(repo, 'out', dir), { withFileTypes: true }).flatMap(entry => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const files = ['index.html', 'opengraph-image.png', ...walk('_next/static').filter(path => /\.(css|js)$/.test(path))];
const hashes = {};
for (const path of files) hashes[path] = sha256(readFileSync(join(repo, 'out', path)));
const html = readFileSync(join(repo, 'out/index.html'), 'utf8');
assert.ok(html.includes('Skyler Halisky'));
assert.ok(html.includes('SkyPi Studio is one person.'));
assert.ok(!html.includes('SkyPi Studio is Skyler (Sky) Halisky'));
const css = files.filter(path => path.endsWith('.css')).map(path => readFileSync(join(repo, 'out', path), 'utf8')).join('\n');
assert.ok(css.includes('scroll-margin-top:-360px'));
assert.ok(css.includes('scroll-margin-top:-310px'));
const js = files.filter(path => path.endsWith('.js')).map(path => readFileSync(join(repo, 'out', path), 'utf8')).join('\n');
assert.ok(js.includes('bottom top+='));
assert.ok(js.includes('.offsetHeight'));
const url = `http://10.0.0.22:3028/?phase07=${sourceCommit.slice(0, 7)}`;
const response = await fetch(url);
assert.equal(response.status, 200);
assert.equal(response.headers.get('cache-control'), 'no-store');
const servedHash = sha256(Buffer.from(await response.arrayBuffer()));
assert.equal(servedHash, hashes['index.html']);
const manifest = {
  sourceCommit, sourceTree: git('rev-parse', `${sourceCommit}^{tree}`),
  verifiedAt: new Date().toISOString(), url, servedHtmlSha256: servedHash,
  build: 'npm run test:static; final artifact rebuilt after production source changes. Subsequent test cleanup and comment-only edits do not affect exported code.',
  checks: ['source matches commit', 'full primary name', 'one-person credit', 'portrait -360', 'landscape -310', 'pin-height release endpoint', 'HTTP 200', 'served HTML bytes equal out/index.html', 'no-store'],
  hashes,
};
writeFileSync(join(repo, 'qa-reports/phase-07-repair3/artifact.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ sourceCommit, sourceTree: manifest.sourceTree, url, servedHash, checks: manifest.checks, hashedFiles: files.length }, null, 2));
