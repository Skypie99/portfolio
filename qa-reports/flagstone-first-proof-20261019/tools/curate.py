#!/usr/bin/env python3
"""curate.py — build the committed evidence directory from capture.mjs output.

  python3 -I curate.py <captures-root> <boards-dir> <evidence-dir>

Copies a curated, size-conscious subset (figures and close-ups at device scale 2,
whole sections and arrivals downscaled to device scale 1), merges every
measurements.json, and writes MEASUREMENTS.md with the tables the receipt cites.
Nothing is redrawn; every image is a real render, only re-encoded or downscaled.
"""
import json, os, shutil, sys
from PIL import Image

SRC, BOARDS, DST = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(DST, exist_ok=True)

def save(src, dst, scale=1.0, quality=86, png=False):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = Image.open(src)
    if scale != 1.0:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    if png:
        im.save(dst, 'PNG', optimize=True)
    else:
        im.convert('RGB').save(dst, 'JPEG', quality=quality, optimize=True, progressive=True)

def copy_set(label, tags, kinds, outdir, keep_png_for=()):
    for tag in tags:
        for kind in kinds:
            for ext in ('jpg', 'png'):
                p = os.path.join(SRC, label, f'{tag}_{kind}.{ext}')
                if not os.path.exists(p):
                    continue
                if kind in ('section', 'arrival', 'focus-appstore'):
                    save(p, os.path.join(DST, outdir, f'{tag}_{kind}.jpg'), scale=0.5, quality=85)
                elif kind == 'frame' and tag in keep_png_for:
                    save(p, os.path.join(DST, outdir, f'{tag}_{kind}.png'), png=True)
                elif kind == 'frame':
                    save(p, os.path.join(DST, outdir, f'{tag}_{kind}.jpg'), quality=90)
                elif kind == 'figure' and int(tag.split('_')[-1].split('x')[0]) >= 768:
                    # desktop/tablet figures span the viewport: device scale 1 is plenty
                    save(p, os.path.join(DST, outdir, f'{tag}_{kind}.jpg'), scale=0.5, quality=86)
                else:
                    save(p, os.path.join(DST, outdir, f'{tag}_{kind}.jpg'), quality=86)

PHONES = ['393x852', '375x667', '320x568']
DESKS = ['1440x900', '1280x800']
ALL = DESKS + ['768x1024'] + PHONES
themes = ['light', 'dark']
T = lambda vps: [f'{t}_{v}' for t in themes for v in vps]

# baseline (untouched tree, dev server): figure + frame close-up everywhere, sections at 393/1440 for context
copy_set('baseline', T(ALL), ['figure'], 'baseline')
copy_set('baseline', T(['393x852', '1440x900']), ['frame'], 'baseline', keep_png_for={'light_393x852'})
copy_set('baseline', T(['393x852', '1440x900', '1280x800']), ['section'], 'baseline')
# candidates (same DOM, injected sizing): figure at the phone widths, close-up at 393; desktop variants' figures
for lab in ('c200', 'c220', 'c240'):
    copy_set(lab, T(PHONES), ['figure'], f'candidates/{lab}')
    copy_set(lab, T(['393x852']), ['frame'], f'candidates/{lab}')
for lab in ('desk53', 'desk58'):
    copy_set(lab, T(DESKS), ['figure'], f'candidates/{lab}')
copy_set('c220tight', T(['393x852']), ['figure'], 'candidates/c220tight')
# selected implementation (built branch): the full required set
copy_set('final', T(ALL), ['section', 'arrival', 'figure', 'frame'], 'final',
         keep_png_for={'light_393x852', 'dark_393x852'})
copy_set('final', ['light_393x852', 'light_1440x900', 'dark_393x852'], ['focus-appstore'], 'final')
copy_set('final-rm', [f'rm_{t}' for t in T(['393x852', '1440x900'])], ['figure', 'section'], 'final-rm')
copy_set('final-nojs', [f'nojs_{t}' for t in T(['393x852', '1440x900'])], ['figure', 'section'], 'final-nojs')
# motion recordings + frame strips
vid = os.path.join(SRC, 'final-video', 'video')
if os.path.isdir(vid):
    os.makedirs(os.path.join(DST, 'final-video'), exist_ok=True)
    for f in os.listdir(vid):
        if f.endswith('.webm') or f.endswith('.jpg') or f.endswith('.png'):
            shutil.copy(os.path.join(vid, f), os.path.join(DST, 'final-video', f))
# boards
if os.path.isdir(BOARDS):
    for f in os.listdir(BOARDS):
        p = os.path.join(BOARDS, f)
        if f.startswith('legibility'):
            shutil.copy(p, os.path.join(DST, 'boards', f)) if os.path.isdir(os.path.join(DST, 'boards')) else (os.makedirs(os.path.join(DST, 'boards')), shutil.copy(p, os.path.join(DST, 'boards', f)))
        else:
            save(p, os.path.join(DST, 'boards', f.replace('.png', '.jpg')), quality=88)

# merged measurements
merged = {}
for lab in ('baseline', 'c200', 'c220', 'c240', 'c220tight', 'desk53', 'desk58', 'final', 'final-rm', 'final-nojs', 'final-video'):
    p = os.path.join(SRC, lab, 'measurements.json')
    if os.path.exists(p):
        merged[lab] = json.load(open(p))
json.dump(merged, open(os.path.join(DST, 'measurements.json'), 'w'), indent=1)

# MEASUREMENTS.md
def row(r):
    ic = r.get('imgContent') or {}
    return (f"{ic.get('w', 0):.1f} × {ic.get('h', 0):.1f}", f"{ic.get('scale', 0):.4f}", f"{3 * ic.get('scale', 0):.3f}",
            f"{r['frame']['w']:.1f} × {r['frame']['h']:.1f}" if r.get('frame') else '', f"{r['well']['w']:.0f} × {r['well']['h']:.1f}" if r.get('well') else '',
            f"{ic.get('letterboxY', 0):.1f}", f"{r['gaps']['wellBottomToPlateTop']:.0f}" if r.get('gaps') else '', f"{r['section']['h']:.0f}" if r.get('section') else '', str(r.get('docHeight')), str(len(r['overflow']['offenders'])))
def runs(lab):
    return {r['tag']: r for r in merged.get(lab, {}).get('runs', [])}
L = []
L.append('# Measurements · Flagstone first proof (capture-fitted hero exhibit)\n')
L.append('Written by `tools/curate.py` from the `measurements.json` files `tools/capture.mjs` produced. Every value is read from the real page by the browser (Chromium, Playwright), not from a mockup. Pixel values are CSS px; renders were taken at device scale 2 unless noted. "px per UI pt" is 3 × scale: the capture is 1290 px wide for a 430 pt phone screen, so one point of the app\'s own interface renders at that many CSS px on the site.\n')
L.append('Baseline and candidates were rendered on the untouched tree served by `next dev` (candidates inject only the sizing overrides into the same DOM); "final" rows are the built branch (`npm run build`, `out/` served over loopback).\n')
hdr = '| Treatment | Theme · viewport | Screenshot (w × h) | Scale | px per UI pt | Phone frame | Well | Letterbox y | Frame→plate | Section h | Document h | Edge-crossing elements |\n|---|---|---|---|---|---|---|---|---|---|---|---|'
L.append('## 1. Phone widths: baseline, candidates, selected\n'); L.append(hdr)
for vp in PHONES:
    for lab, name in (('baseline', 'BASELINE'), ('c200', '200PX CANDIDATE'), ('c220', '220PX CANDIDATE'), ('c240', '240PX REFERENCE'), ('final', 'SELECTED (built)')):
        for th in themes:
            r = runs(lab).get(f'{th}_{vp}')
            if r: L.append(f"| {name} | {th} · {vp} | " + ' | '.join(row(r)) + ' |')
L.append('\n## 2. Desktop and tablet: baseline vs selected\n'); L.append(hdr)
for vp in DESKS + ['768x1024']:
    for lab, name in (('baseline', 'BASELINE'), ('desk53', '53% (today\'s proportion, capture-fitted)'), ('desk58', '58% in a 4/5 well'), ('final', 'SELECTED (built: 58% in a 3/4 well)')):
        for th in themes:
            r = runs(lab).get(f'{th}_{vp}')
            if r: L.append(f"| {name} | {th} · {vp} | " + ' | '.join(row(r)) + ' |')
L.append('\n## 3. Caption gap variant (393, 220px candidate)\n'); L.append(hdr)
for lab, name in (('c220', '220PX · 48px grid gap'), ('c220tight', '220PX · 28px gap (selected)')):
    for th in themes:
        r = runs(lab).get(f'{th}_393x852')
        if r: L.append(f"| {name} | {th} · 393x852 | " + ' | '.join(row(r)) + ' |')
L.append('\n## 4. Selected implementation: accessibility and modes\n')
L.append('| Mode | Theme · viewport | html.dark | html.js | reduced motion | axe violations (hero section) | axe incomplete | Tab stops to the App Store pill | focus-visible on every stop | Console errors |\n|---|---|---|---|---|---|---|---|---|---|')
for lab in ('final', 'final-rm', 'final-nojs'):
    for r in merged.get(lab, {}).get('runs', []):
        ax = r.get('axe') or {}
        keys = r.get('keys') or []
        stops = next((i + 1 for i, k in enumerate(keys) if 'App Store' in k['name']), None)
        incomplete = ', '.join(f"{i['id']}×{i['nodes']}" for i in ax.get('incomplete', [])) if ax else 'n/a'
        violations = len(ax.get('violations', [])) if ax else 'n/a'
        fv = all(k['matchesFV'] for k in keys) if keys else 'n/a'
        L.append(f"| {lab} | {r['theme']} · {r['viewport']['w']}x{r['viewport']['h']} | {r['html']['dark']} | {r['html']['js']} | {r['html']['reducedMotion']} | {violations} | {incomplete} | {stops if stops else 'n/a'} | {fv} | {len(r.get('consoleErrors', []))} |")
L.append('\n## 5. Image contract (selected, 393 light)\n')
r = runs('final').get('light_393x852')
if r and r.get('imgContent'):
    ic = r['imgContent']
    L.append(f"- currentSrc `{ic.get('currentSrc', '').split('/showcase/')[-1]}` (AVIF chosen by the browser), natural {ic['natural']['w']} × {ic['natural']['h']}, complete {ic['complete']}, loading `{ic['loading']}`, fetchpriority `{ic['fetchpriority']}`.")
    L.append(f"- alt: {ic['alt']}")
open(os.path.join(DST, 'MEASUREMENTS.md'), 'w').write('\n'.join(L) + '\n')
total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(DST) for f in fs)
print(f'evidence written to {DST}: {total / 1e6:.1f} MB')
