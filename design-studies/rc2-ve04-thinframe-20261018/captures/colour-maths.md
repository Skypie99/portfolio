# Colour maths — RC2 VE04 thin-frame study

Arithmetic on the token values in `index.html` (= `app/globals.css` at a5854a5). Surface = the `canvas-alt` token, an approximation of the live `world-surface-alt` composite. No conformance claim is made; thresholds are quoted for orientation only (WCAG 1.4.11 non-text 3:1, 1.4.3 text 4.5:1 / large 3:1). CIEDE2000 is the perceptual difference between two colours; ~1 is a just-noticeable difference under ideal viewing, 2–3 is noticeable, 5+ is clearly different.

CIEDE2000 self-check against Sharma et al. (2005): pair 1 = 2.0425 (expected 2.0425), pair 2 = 2.8615 (expected 2.8615).


## Light theme (surface rgb(245 237 222))

| Line | Composited colour | Contrast vs surface | ΔE2000 vs neutral line |
|---|---|---|---|
| Neutral frame line (`line`) | rgb(204 207 190) | 1.36:1 | 0 |
| A rest (accent / 0.70) | rgb(203 140 111) | 2.39:1 | 27.27 |
| B rest (accent / 0.42) | rgb(220 179 156) | 1.65:1 | 19.09 |
| Caption rule (accent-ink / 0.35) | rgb(206 179 160) | 1.71:1 | 15.42 |
| Interactive line (`line-strong`, also the `prefers-contrast: more` frame line) | rgb(140 148 132) | 2.70:1 | 17.06 |
| Focus ring (accent, opaque, 2 px) | rgb(185 99 64) | 3.67:1 | — |

ΔE2000 A rest vs B rest: 11.02 · B rest vs caption rule: 4.15 · A rest vs caption rule: 12.93 · A rest vs line-strong: 26.24 · B rest vs line-strong: 24.54

Focus ring vs A rest line 1.53:1 · vs B rest line 2.23:1 (both are the same hue; the ring is distinguished by weight and offset, not colour).

Text on surface: heading (ink) 11.87:1 · captions (ink-muted) 6.85:1 · labels and provenance (ink-meta) 5.38:1 · kicker (accent-ink) 6.08:1.

Play pill over the poster mean rgb(47 71 93): pill rgb(197 203 210) · icon (ink-meta) vs pill 3.84:1 · pill vs poster 5.91:1 · pill border (line) vs poster 6.07:1 · focus ring vs poster 2.26:1.


## Dark theme (surface rgb(34 28 22))

| Line | Composited colour | Contrast vs surface | ΔE2000 vs neutral line |
|---|---|---|---|
| Neutral frame line (`line`) | rgb(44 52 54) | 1.33:1 | 0 |
| A rest (accent / 0.40) | rgb(103 66 45) | 1.92:1 | 23.39 |
| B rest (accent / 0.30) | rgb(86 56 39) | 1.60:1 | 20.32 |
| Caption rule (accent-ink / 0.35) | rgb(103 82 66) | 2.29:1 | 19.99 |
| Interactive line (`line-strong`, also the `prefers-contrast: more` frame line) | rgb(74 86 82) | 2.20:1 | 11.76 |
| Focus ring (accent, opaque, 2 px) | rgb(207 122 79) | 5.26:1 | — |

ΔE2000 A rest vs B rest: 4.51 · B rest vs caption rule: 8.82 · A rest vs caption rule: 7.57 · A rest vs line-strong: 24.59 · B rest vs line-strong: 23.22

Focus ring vs A rest line 2.74:1 · vs B rest line 3.29:1 (both are the same hue; the ring is distinguished by weight and offset, not colour).

Text on surface: heading (ink) 13.98:1 · captions (ink-muted) 9.17:1 · labels and provenance (ink-meta) 7.43:1 · kicker (accent-ink) 9.17:1.

Play pill over the poster mean rgb(47 71 93): pill rgb(35 46 53) · icon (ink-meta) vs pill 6.13:1 · pill vs poster 1.44:1 · pill border (line) vs poster 1.32:1 · focus ring vs poster 3.00:1.

### B rest alpha candidates (dark)

| alpha | rest colour | ΔE2000 vs neutral line | contrast vs surface |
|---|---|---|---|
| 0.24 | rgb(76 51 36) | 18.46 | 1.44:1 |
| 0.28 | rgb(82 54 38) | 19.71 | 1.54:1 |
| 0.30 | rgb(86 56 39) | 20.32 | 1.60:1 |
| 0.34 | rgb(93 60 41) | 21.55 | 1.72:1 |
| 0.40 | rgb(103 66 45) | 23.39 | 1.92:1 |

Light B rest sits at ΔE 19.09 from its neutral line; the dark candidate closest to that perceptual step is marked in the packet.

