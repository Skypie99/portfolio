#!/usr/bin/env python3
"""compose.py — labelled comparison boards from capture.mjs output.

  python3 -I compose.py <captures-root> <boards-out>

Reads <captures-root>/<label>/measurements.json + the capture images and writes:
  board_phone_<theme>.png   BASELINE · 200PX CANDIDATE · 220PX CANDIDATE · SELECTED (393, figure crops)
  legibility_<theme>.png    the report card region at identical pixel scale (DSF 2), no resampling
  board_desktop_<theme>.png 1440 + 1280 baseline vs selected (figure crops)
  board_widths_<theme>.png  selected at 320 / 375 / 393 (figure crops)
Every tile is a real capture; nothing is redrawn. Labels carry the measured numbers.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

def font(size):
    try:
        return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', size)
    except Exception:
        return ImageFont.load_default(size=size)

F_TITLE, F_LABEL, F_SMALL = font(30), font(22), font(18)
INK, PAPER, RULE = (34, 30, 27), (247, 242, 233), (190, 180, 165)

def runs(label):
    p = os.path.join(ROOT, label, 'measurements.json')
    if not os.path.exists(p):
        return {}
    return {r['tag']: r for r in json.load(open(p))['runs']}

def img(label, tag, kind):
    for ext in ('jpg', 'png'):
        p = os.path.join(ROOT, label, f'{tag}_{kind}.{ext}')
        if os.path.exists(p):
            return Image.open(p).convert('RGB')
    return None

def tile(im, title, lines, max_w=None, max_h=None):
    if max_w or max_h:
        s = min((max_w or 1e9) / im.width, (max_h or 1e9) / im.height, 1.0)
        if s < 1:
            im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    pad, lh = 18, 26
    probe = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    text_w = max([probe.textlength(title, font=F_TITLE)] + [probe.textlength(ln, font=F_LABEL) for ln in lines])
    w = max(im.width, int(text_w)) + pad * 2
    h = im.height + pad * 3 + 36 + lh * len(lines)
    t = Image.new('RGB', (w, h), PAPER)
    d = ImageDraw.Draw(t)
    d.text((pad, pad), title, fill=INK, font=F_TITLE)
    y = pad + 40
    for ln in lines:
        d.text((pad, y), ln, fill=INK, font=F_LABEL); y += lh
    y += 10
    t.paste(im, (pad, y))
    d.rectangle([pad - 1, y - 1, pad + im.width, y + im.height], outline=RULE)
    return t

def row(tiles, heading, note=None):
    gap, pad = 28, 28
    w = sum(t.width for t in tiles) + gap * (len(tiles) - 1) + pad * 2
    h = max(t.height for t in tiles) + pad * 2 + 70 + (30 if note else 0)
    b = Image.new('RGB', (w, h), PAPER)
    d = ImageDraw.Draw(b)
    d.text((pad, pad), heading, fill=INK, font=F_TITLE)
    if note:
        d.text((pad, pad + 40), note, fill=INK, font=F_SMALL)
    x = pad; y = pad + 70 + (30 if note else 0)
    for t in tiles:
        b.paste(t, (x, y)); x += t.width + gap
    return b

def fmt(r):
    ic = r.get('imgContent') or {}
    return [
        f"screenshot {ic.get('w', 0):.0f} x {ic.get('h', 0):.0f} css px (scale {ic.get('scale', 0):.3f})",
        f"phone frame {r['frame']['w']:.0f} x {r['frame']['h']:.0f} · well {r['well']['w']:.0f} x {r['well']['h']:.0f}",
        f"letterbox {ic.get('letterboxY', 0):.1f} px · frame→plate {r['gaps']['wellBottomToPlateTop']:.0f} px",
    ]

SETS = {  # label → board title
    'baseline': 'BASELINE (main, built)',
    'c200': '200PX CANDIDATE',
    'c220': '220PX CANDIDATE',
    'final': 'SELECTED IMPLEMENTATION (built branch)',
}

for theme in ('light', 'dark'):
    tag = f'{theme}_393x852'
    tiles = []
    for label, title in SETS.items():
        r = runs(label).get(tag); im = img(label, tag, 'figure')
        if not (r and im):
            continue
        tiles.append(tile(im, title, [f'393 x 852 · {theme}'] + fmt(r), max_h=1500))
    if tiles:
        row(tiles, f'Flagstone first proof · 393px · {theme} · whole figure (well + plate), device scale 2').save(os.path.join(OUT, f'board_phone_{theme}.png'))

    # legibility strip: the report-card region at identical pixel scale (no resampling)
    strips = []
    for label, title in SETS.items():
        r = runs(label).get(tag); fr = img(label, tag, 'frame')
        if not (r and fr and r.get('imgContent')):
            continue
        dpr = r['viewport']['dpr']
        pad = round(min(40, r['viewport']['w'] * 0.06))
        ox, oy = max(0, r['frame']['x'] - pad), r['frame']['y'] - pad
        ic = r['imgContent']
        cx, cy = r['img']['x'] + ic['letterboxX'], r['img']['y'] + ic['letterboxY']
        # the expanded report card: x 19–78 %, y 14–48 % of the capture
        x0, x1 = cx + ic['w'] * 0.19, cx + ic['w'] * 0.78
        y0, y1 = cy + ic['h'] * 0.14, cy + ic['h'] * 0.485
        box = tuple(round((v - o) * dpr) for v, o in ((x0, ox), (y0, oy), (x1, ox), (y1, oy)))
        crop = fr.crop(box)
        strips.append(tile(crop, title.replace(' (built branch)', '').replace(' (main, built)', ''), [f"screenshot {ic['w']:.0f} px wide", f"card {crop.width // dpr} css px wide"]))
    if strips:
        row(strips, f'Legibility · the same report card at identical pixel scale · 393px · {theme}',
            'Each crop is the real render at device scale 2; nothing is resampled, so bigger means bigger on the phone.').save(os.path.join(OUT, f'legibility_{theme}.png'))

    # desktop: baseline vs selected at 1440 and 1280
    tiles = []
    for vp in ('1440x900', '1280x800'):
        for label, title in (('baseline', 'BASELINE'), ('final', 'SELECTED')):
            t = f'{theme}_{vp}'; r = runs(label).get(t); im = img(label, t, 'figure')
            if r and im:
                # the figure crop spans the viewport; keep the well's own column
                dpr = r['viewport']['dpr']; w = r['well']
                x0 = max(0, round((w['x'] - 24) * dpr)); x1 = min(im.width, round((w['x'] + w['w'] + 24) * dpr))
                im = im.crop((x0, 0, x1, im.height))
                tiles.append(tile(im, f'{title} · {vp}', [theme] + fmt(r), max_h=1400))
    if tiles:
        row(tiles, f'Desktop · baseline vs selected · {theme}').save(os.path.join(OUT, f'board_desktop_{theme}.png'))

    # widths: the selected implementation at the three phone widths
    tiles = []
    for vp in ('320x568', '375x667', '393x852'):
        t = f'{theme}_{vp}'; r = runs('final').get(t); im = img('final', t, 'figure')
        if r and im:
            tiles.append(tile(im, f'SELECTED · {vp}', [theme] + fmt(r), max_h=1500))
    if tiles:
        row(tiles, f'Selected implementation across phone widths · {theme}').save(os.path.join(OUT, f'board_widths_{theme}.png'))

print('boards written to', OUT, sorted(os.listdir(OUT)))
