#!/usr/bin/env python3
"""
colour-maths.py — token arithmetic for the RC2 VE04 thin-frame study.

Computes, from the token values transcribed in ../index.html (which are the
app/globals.css values at baseline a5854a5):

  * the composited colour of every translucent line over the case-body
    surface (canvas-alt token);
  * WCAG 2.x contrast ratios (relative-luminance formula) for line-vs-surface,
    ring-vs-surface, text-vs-surface and the Play control's own pairs;
  * CIEDE2000 colour differences between the settled rest lines and the
    neutral frame line — the objective proxy used for "arrival distinction".

Everything here is ARITHMETIC ON TOKEN VALUES. It is not a measurement of the
live site's composited world backdrop (which sits under the real page), and it
makes no conformance claim. Pixel readings off the rendered captures are in
captures/manifest.json (tools/capture.mjs). Standard library only.

Usage:  python3 -I tools/colour-maths.py  > captures/colour-maths.md
"""
import json, math, sys

LIGHT = {
    "canvas": (250, 248, 241), "canvas-alt": (245, 237, 222), "surface": (255, 255, 255),
    "ink": (32, 48, 44), "ink-muted": (70, 84, 77), "ink-meta": (84, 100, 93),
    "line": (204, 207, 190), "line-strong": (140, 148, 132),
    "accent": (185, 99, 64), "accent-ink": (135, 71, 45),
}
DARK = {
    "canvas": (21, 25, 26), "canvas-alt": (34, 28, 22), "surface": (30, 36, 38),
    "ink": (236, 234, 224), "ink-muted": (182, 194, 187), "ink-meta": (159, 176, 169),
    "line": (44, 52, 54), "line-strong": (74, 86, 82),
    "accent": (207, 122, 79), "accent-ink": (231, 181, 147),
}
# Mean colour of the window-01 poster (report-flow-current.dark.phone-poster.webp),
# computed from the file: a stand-in for "the clip under the Play pill".
POSTER_MEAN = (47, 71, 93)

A_ALPHA = {"light": 0.70, "dark": 0.40}       # shipped VE04 settled edge
B_ALPHA = {"light": 0.42, "dark": 0.30}       # Variant B rest line (study)
B_DARK_CANDIDATES = [0.24, 0.28, 0.30, 0.34, 0.40]
RULE_ALPHA = 0.35                              # caption rule, accent-ink
PILL_ALPHA = 0.72                              # Play pill, surface

def comp(fg, a, bg):
    return tuple(round(bg[i] + a * (fg[i] - bg[i]), 2) for i in range(3))

def lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def lum(rgb):
    r, g, b = (lin(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(c1, c2):
    l1, l2 = lum(c1), lum(c2)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

def to_lab(rgb):
    r, g, b = (lin(v) for v in rgb)
    x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
    xn, yn, zn = 0.95047, 1.0, 1.08883
    def f(t):
        return t ** (1 / 3) if t > (6 / 29) ** 3 else t / (3 * (6 / 29) ** 2) + 4 / 29
    fx, fy, fz = f(x / xn), f(y / yn), f(z / zn)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))

def de2000(lab1, lab2):
    L1, a1, b1 = lab1; L2, a2, b2 = lab2
    C1 = math.hypot(a1, b1); C2 = math.hypot(a2, b2); Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    def hp(a, b):
        if a == 0 and b == 0: return 0.0
        h = math.degrees(math.atan2(b, a))
        return h + 360 if h < 0 else h
    h1p, h2p = hp(a1p, b1), hp(a2p, b2)
    dLp = L2 - L1; dCp = C2p - C1p
    if C1p * C2p == 0: dhp = 0.0
    elif abs(h2p - h1p) <= 180: dhp = h2p - h1p
    elif h2p - h1p > 180: dhp = h2p - h1p - 360
    else: dhp = h2p - h1p + 360
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp / 2))
    Lbp = (L1 + L2) / 2; Cbp = (C1p + C2p) / 2
    if C1p * C2p == 0: hbp = h1p + h2p
    elif abs(h1p - h2p) <= 180: hbp = (h1p + h2p) / 2
    elif h1p + h2p < 360: hbp = (h1p + h2p + 360) / 2
    else: hbp = (h1p + h2p - 360) / 2
    T = (1 - 0.17 * math.cos(math.radians(hbp - 30)) + 0.24 * math.cos(math.radians(2 * hbp))
         + 0.32 * math.cos(math.radians(3 * hbp + 6)) - 0.20 * math.cos(math.radians(4 * hbp - 63)))
    dtheta = 30 * math.exp(-(((hbp - 275) / 25) ** 2))
    RC = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
    SL = 1 + 0.015 * (Lbp - 50) ** 2 / math.sqrt(20 + (Lbp - 50) ** 2)
    SC = 1 + 0.045 * Cbp; SH = 1 + 0.015 * Cbp * T
    RT = -math.sin(math.radians(2 * dtheta)) * RC
    return math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH))

def de(c1, c2):
    return de2000(to_lab(c1), to_lab(c2))

def fmt(c):
    return "rgb(%d %d %d)" % tuple(int(round(v)) for v in c)

def self_check():
    # Sharma, Wu & Dalal (2005) test pairs 1 and 2: expected 2.0425 and 2.8615.
    p1 = de2000((50.0, 2.6772, -79.7751), (50.0, 0.0, -82.7485))
    p2 = de2000((50.0, 3.1571, -77.2803), (50.0, 0.0, -82.7485))
    return p1, p2

rows = []
data = {"selfCheck": {}, "themes": {}}
p1, p2 = self_check()
data["selfCheck"] = {"pair1": round(p1, 4), "expected1": 2.0425, "pair2": round(p2, 4), "expected2": 2.8615}

out = []
out.append("# Colour maths — RC2 VE04 thin-frame study\n")
out.append("Arithmetic on the token values in `index.html` (= `app/globals.css` at a5854a5). Surface = the `canvas-alt` token, an approximation of the live `world-surface-alt` composite. No conformance claim is made; thresholds are quoted for orientation only (WCAG 1.4.11 non-text 3:1, 1.4.3 text 4.5:1 / large 3:1). CIEDE2000 is the perceptual difference between two colours; ~1 is a just-noticeable difference under ideal viewing, 2–3 is noticeable, 5+ is clearly different.\n")
out.append("CIEDE2000 self-check against Sharma et al. (2005): pair 1 = %.4f (expected 2.0425), pair 2 = %.4f (expected 2.8615).\n" % (p1, p2))

for theme, T in (("light", LIGHT), ("dark", DARK)):
    bg = T["canvas-alt"]
    line = T["line"]; strong = T["line-strong"]
    a_rest = comp(T["accent"], A_ALPHA[theme], bg)
    b_rest = comp(T["accent"], B_ALPHA[theme], bg)
    rule = comp(T["accent-ink"], RULE_ALPHA, bg)
    well_edge = comp(T["ink"], 0.12, T["surface"])
    ring = T["accent"]
    pill_on_poster = comp(T["surface"], PILL_ALPHA, POSTER_MEAN)
    th = {
        "surface": fmt(bg),
        "neutralLine": fmt(line),
        "aRest": fmt(a_rest), "bRest": fmt(b_rest), "captionRule": fmt(rule), "ring": fmt(ring),
        "pillOnPoster": fmt(pill_on_poster),
        "ratios": {
            "neutralLine_vs_surface": round(contrast(line, bg), 2),
            "lineStrong_vs_surface": round(contrast(strong, bg), 2),
            "aRest_vs_surface": round(contrast(a_rest, bg), 2),
            "bRest_vs_surface": round(contrast(b_rest, bg), 2),
            "captionRule_vs_surface": round(contrast(rule, bg), 2),
            "ring_vs_surface": round(contrast(ring, bg), 2),
            "ring_vs_aRest": round(contrast(ring, a_rest), 2),
            "ring_vs_bRest": round(contrast(ring, b_rest), 2),
            "ring_vs_pillOnPoster": round(contrast(ring, pill_on_poster), 2),
            "ring_vs_posterMean": round(contrast(ring, POSTER_MEAN), 2),
            "inkMeta_vs_surface (labels, provenance)": round(contrast(T["ink-meta"], bg), 2),
            "inkMuted_vs_surface (captions)": round(contrast(T["ink-muted"], bg), 2),
            "ink_vs_surface (heading)": round(contrast(T["ink"], bg), 2),
            "accentInk_vs_surface (kicker)": round(contrast(T["accent-ink"], bg), 2),
            "playIcon(inkMeta)_vs_pillOnPoster": round(contrast(T["ink-meta"], pill_on_poster), 2),
            "pillOnPoster_vs_posterMean": round(contrast(pill_on_poster, POSTER_MEAN), 2),
            "pillBorder(line)_vs_posterMean": round(contrast(line, POSTER_MEAN), 2),
        },
        "deltaE2000": {
            "aRest_vs_neutralLine": round(de(a_rest, line), 2),
            "bRest_vs_neutralLine": round(de(b_rest, line), 2),
            "aRest_vs_bRest": round(de(a_rest, b_rest), 2),
            "bRest_vs_captionRule": round(de(b_rest, rule), 2),
            "aRest_vs_captionRule": round(de(a_rest, rule), 2),
            "aRest_vs_lineStrong (prefers-contrast more)": round(de(a_rest, strong), 2),
            "bRest_vs_lineStrong (prefers-contrast more)": round(de(b_rest, strong), 2),
        },
    }
    if theme == "dark":
        th["bDarkCandidates"] = {
            str(a): {"rest": fmt(comp(T["accent"], a, bg)),
                     "dE_vs_neutralLine": round(de(comp(T["accent"], a, bg), line), 2),
                     "ratio_vs_surface": round(contrast(comp(T["accent"], a, bg), bg), 2)}
            for a in B_DARK_CANDIDATES
        }
    data["themes"][theme] = th

    out.append("\n## %s theme (surface %s)\n" % (theme.capitalize(), fmt(bg)))
    out.append("| Line | Composited colour | Contrast vs surface | ΔE2000 vs neutral line |\n|---|---|---|---|")
    out.append("| Neutral frame line (`line`) | %s | %.2f:1 | 0 |" % (fmt(line), contrast(line, bg)))
    out.append("| A rest (accent / %.2f) | %s | %.2f:1 | %.2f |" % (A_ALPHA[theme], fmt(a_rest), contrast(a_rest, bg), de(a_rest, line)))
    out.append("| B rest (accent / %.2f) | %s | %.2f:1 | %.2f |" % (B_ALPHA[theme], fmt(b_rest), contrast(b_rest, bg), de(b_rest, line)))
    out.append("| Caption rule (accent-ink / 0.35) | %s | %.2f:1 | %.2f |" % (fmt(rule), contrast(rule, bg), de(rule, line)))
    out.append("| Interactive line (`line-strong`, also the `prefers-contrast: more` frame line) | %s | %.2f:1 | %.2f |" % (fmt(strong), contrast(strong, bg), de(strong, line)))
    out.append("| Focus ring (accent, opaque, 2 px) | %s | %.2f:1 | — |" % (fmt(ring), contrast(ring, bg)))
    out.append("\nΔE2000 A rest vs B rest: %.2f · B rest vs caption rule: %.2f · A rest vs caption rule: %.2f · A rest vs line-strong: %.2f · B rest vs line-strong: %.2f\n" % (
        de(a_rest, b_rest), de(b_rest, rule), de(a_rest, rule), de(a_rest, strong), de(b_rest, strong)))
    out.append("Focus ring vs A rest line %.2f:1 · vs B rest line %.2f:1 (both are the same hue; the ring is distinguished by weight and offset, not colour).\n" % (contrast(ring, a_rest), contrast(ring, b_rest)))
    out.append("Text on surface: heading (ink) %.2f:1 · captions (ink-muted) %.2f:1 · labels and provenance (ink-meta) %.2f:1 · kicker (accent-ink) %.2f:1.\n" % (
        contrast(T["ink"], bg), contrast(T["ink-muted"], bg), contrast(T["ink-meta"], bg), contrast(T["accent-ink"], bg)))
    out.append("Play pill over the poster mean %s: pill %s · icon (ink-meta) vs pill %.2f:1 · pill vs poster %.2f:1 · pill border (line) vs poster %.2f:1 · focus ring vs poster %.2f:1.\n" % (
        fmt(POSTER_MEAN), fmt(pill_on_poster), contrast(T["ink-meta"], pill_on_poster), contrast(pill_on_poster, POSTER_MEAN), contrast(line, POSTER_MEAN), contrast(ring, POSTER_MEAN)))
    if theme == "dark":
        out.append("### B rest alpha candidates (dark)\n")
        out.append("| alpha | rest colour | ΔE2000 vs neutral line | contrast vs surface |\n|---|---|---|---|")
        for a in B_DARK_CANDIDATES:
            c = comp(T["accent"], a, bg)
            out.append("| %.2f | %s | %.2f | %.2f:1 |" % (a, fmt(c), de(c, line), contrast(c, bg)))
        out.append("\nLight B rest sits at ΔE %.2f from its neutral line; the dark candidate closest to that perceptual step is marked in the packet.\n" % de(comp(LIGHT["accent"], B_ALPHA["light"], LIGHT["canvas-alt"]), LIGHT["line"]))

print("\n".join(out))
with open(sys.argv[1] if len(sys.argv) > 1 else "/dev/null", "w") as fh:
    json.dump(data, fh, indent=1)
