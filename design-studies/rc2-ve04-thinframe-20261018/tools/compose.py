#!/usr/bin/env python3
"""
compose.py — review boards built from captures/ (no new rendering).

  composites/edge-specimen_{theme}.png   window-01 top-left corner, 4× nearest-neighbour:
                                         baseline rest · A armed · A rest · B armed · B rest · A bleed
  composites/beat-strip_{id}_{theme}.png the prototype settle transition at ~0/100/200/300/420/600 ms
                                         (nearest screenshot frame) with the per-frame computed colour
  composites/focus-board_{theme}.png     keyboard focus on the Play control: A · B · A full-bleed · baseline
  composites/play-rest-board_{theme}.png Play control at rest: baseline · A · B
  composites/AvsB_{theme}_1440.jpg       the two rows stacked at 1440 for a matched read
  composites/phones_{theme}.jpg          A and B at 393 / 375 / 320 side by side

Standard library + Pillow (system). Run from the study folder: python3 -I tools/compose.py
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

STUDY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAP = os.path.join(STUDY, "captures")
OUT = os.path.join(CAP, "composites")
os.makedirs(OUT, exist_ok=True)
M = json.load(open(os.path.join(CAP, "manifest.json")))

SURF = {"light": (245, 237, 222), "dark": (34, 28, 22)}
INK = {"light": (32, 48, 44), "dark": (236, 234, 224)}
META = {"light": (84, 100, 93), "dark": (159, 176, 169)}
try:
    FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    FONT_S = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 11)
except Exception:
    FONT = FONT_S = ImageFont.load_default()

def load(rel):
    p = os.path.join(CAP, rel)
    return Image.open(p).convert("RGB") if os.path.exists(p) else None

def pix_for(file):
    for p in M["pixels"]:
        if p.get("file") == file: return p
    return None

def board(tiles, theme, title, scale=1, pad=18, label_h=34, cols=None):
    """tiles: list of (image, caption). Lays them out in a row (or grid) on the theme surface."""
    tiles = [(im, cap) for im, cap in tiles if im is not None]
    if not tiles: return None
    cols = cols or len(tiles)
    rows = (len(tiles) + cols - 1) // cols
    cw = max(im.width for im, _ in tiles); ch = max(im.height for im, _ in tiles)
    W = pad + cols * (cw + pad); H = pad + 28 + rows * (ch + label_h + pad)
    bg = Image.new("RGB", (W, H), SURF[theme]); dr = ImageDraw.Draw(bg)
    dr.text((pad, pad - 4), title, fill=INK[theme], font=FONT)
    for i, (im, cap) in enumerate(tiles):
        r, c = divmod(i, cols)
        x = pad + c * (cw + pad); y = pad + 28 + r * (ch + label_h + pad)
        bg.paste(im, (x, y))
        for j, line in enumerate(cap.split("\n")[:2]):
            dr.text((x, y + ch + 6 + j * 14), line, fill=META[theme], font=FONT_S)
    return bg

def corner_crop(file, size_css=44, zoom=4):
    """Crop the window-01 frame's top-left corner from a DSF-2 detail capture and magnify it."""
    im = load(file); p = pix_for(file)
    if im is None or p is None: return None
    f = p["frameCss"]; d = 2
    x0 = int((f["x"] - 10) * d); y0 = int((f["y"] - 10) * d)
    box = (max(0, x0), max(0, y0), max(0, x0) + size_css * d, max(0, y0) + size_css * d)
    return im.crop(box).resize((size_css * d * zoom, size_css * d * zoom), Image.NEAREST)

def edge_specimen(theme):
    tiles = []
    for file, cap in [
        (f"detail/w01_baseline_{theme}_rest.png", "Baseline (reconstruction) · rest"),
        (f"detail/w01_A_{theme}_armed.png", "A · armed (neutral line)"),
        (f"detail/w01_A_{theme}_rest.png", "A · rest (VE04 edge)"),
        (f"detail/w01_B_{theme}_armed.png", "B · armed (neutral line)"),
        (f"detail/w01_B_{theme}_rest.png", "B · rest (quiet line)"),
        (f"detail/w01_A_{theme}_bleed.png", "A · rest · full-bleed option"),
    ]:
        p = pix_for(file)
        extra = f"\nline {p['line']} · {p['line_vs_surface']}:1 vs surface" if p else ""
        tiles.append((corner_crop(file), cap + extra))
    b = board(tiles, theme, f"Edge specimen · {theme} · window-01 top-left corner · 4x nearest-neighbour from DSF-2 captures", cols=3)
    if b: b.save(os.path.join(OUT, f"edge-specimen_{theme}.png"))

def beat_strip(id_, theme):
    rec = next((m for m in M["motion"] if m["id"] == id_ and m["theme"] == theme and m["viewport"] == "1440x900"), None)
    if not rec: return
    targets = [0, 100, 200, 300, 420, 600]
    tiles = []
    for t in targets:
        fr = min(rec["frames"], key=lambda f: abs(f["tFromFirstFrame_ms"] - t))
        im = load(fr["file"])
        if im is None: continue
        s = min(rec["trace"], key=lambda s: abs(s["t"] - fr["tFromFirstFrame_ms"]))
        crop = im.crop((0, 0, 170, 170)).resize((340, 340), Image.NEAREST)
        tiles.append((crop, f"frame {fr['k']} · ~{fr['tFromFirstFrame_ms']} ms after first frame\ntrace @{s['t']} ms: {s['color']} ({s['state']})"))
    b = board(tiles, theme, f"Prototype settle transition · {id_} · {theme} · top-left corner, 2x · trace = computed border colour per animation frame", label_h=40)
    if b: b.save(os.path.join(OUT, f"beat-strip_{id_}_{theme}.png"))

def focus_board(theme):
    tiles = []
    for file, cap in [(f"focus/focus_A_{theme}.png", "A · mat"), (f"focus/focus_B_{theme}.png", "B · mat"), (f"focus/focus_A_{theme}_bleed.png", "A · full-bleed option"), (f"focus/focus_baseline_{theme}.png", "Baseline (reconstruction)")]:
        im = load(file)
        if im is None: continue
        rec = next((f for f in M["focus"] if f["file"] == file), None)
        extra = f"\nring {rec['pixels']['ring']} vs backdrop {rec['pixels']['ringBackdrop']} = {rec['pixels']['ring_vs_backdrop']}:1" if rec else ""
        tiles.append((im.resize((im.width // 2, im.height // 2), Image.LANCZOS), cap + extra))
    b = board(tiles, theme, f"Keyboard focus on the Play control · {theme} · real Tab, 2px ring at 2px offset (site rule) · shown at 1x")
    if b: b.save(os.path.join(OUT, f"focus-board_{theme}.png"))

def play_rest_board(theme):
    tiles = []
    for file, cap in [(f"detail/w01_baseline_{theme}_rest.png", "Baseline (reconstruction)"), (f"detail/w01_A_{theme}_rest.png", "A"), (f"detail/w01_B_{theme}_rest.png", "B")]:
        im = load(file); p = pix_for(file)
        if im is None: continue
        extra = f"\nicon:pill {p['icon_vs_pill']}:1 · pill:poster {p['pill_vs_poster']}:1" if p and p.get("icon_vs_pill") else ""
        tiles.append((im.resize((im.width // 2, im.height // 2), Image.LANCZOS), cap + extra))
    b = board(tiles, theme, f"Play control at rest · {theme} · still-first, nothing autoplays · shown at 1x")
    if b: b.save(os.path.join(OUT, f"play-rest-board_{theme}.png"))

def a_vs_b(theme):
    a = load(f"composition/comp_A_{theme}_1440x900.jpg"); b = load(f"composition/comp_B_{theme}_1440x900.jpg")
    if a is None or b is None: return
    W = max(a.width, b.width); H = a.height + b.height + 60
    bg = Image.new("RGB", (W, H), SURF[theme]); dr = ImageDraw.Draw(bg)
    dr.text((20, 6), f"Variant A · keep VE04 · {theme} · 1440", fill=INK[theme], font=FONT); bg.paste(a, (0, 28))
    dr.text((20, a.height + 34), f"Variant B · fold into frame grammar · {theme} · 1440", fill=INK[theme], font=FONT); bg.paste(b, (0, a.height + 56))
    bg.save(os.path.join(OUT, f"AvsB_{theme}_1440.jpg"), quality=88)

def phones(theme):
    tiles = []
    for id_ in ["A", "B"]:
        for vp in ["393x852", "375x667", "320x568"]:
            im = load(f"composition/comp_{id_}_{theme}_{vp}.jpg")
            if im is not None: tiles.append((im, f"{id_} · {vp.split('x')[0]} wide"))
    b = board(tiles, theme, f"Phone stacking · {theme} · A (top row) and B (bottom row) at 393 / 375 / 320 · 1x", cols=3)
    if b: b.save(os.path.join(OUT, f"phones_{theme}.jpg"), quality=85)

for theme in ("light", "dark"):
    edge_specimen(theme); focus_board(theme); play_rest_board(theme); a_vs_b(theme); phones(theme)
    for id_ in ("baseline", "A", "B"): beat_strip(id_, theme)
print("composites:", sorted(os.listdir(OUT)))
