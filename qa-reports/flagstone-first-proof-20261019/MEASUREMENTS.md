# Measurements · Flagstone first proof (capture-fitted hero exhibit)

Written by `tools/curate.py` from the `measurements.json` files `tools/capture.mjs` produced. Every value is read from the real page by the browser (Chromium, Playwright), not from a mockup. Pixel values are CSS px; renders were taken at device scale 2 unless noted. "px per UI pt" is 3 × scale: the capture is 1290 px wide for a 430 pt phone screen, so one point of the app's own interface renders at that many CSS px on the site.

Baseline and candidates were rendered on the untouched tree served by `next dev` (candidates inject only the sizing overrides into the same DOM); "final" rows are the built branch (`npm run build`, `out/` served over loopback).

## 1. Phone widths: baseline, candidates, selected

| Treatment | Theme · viewport | Screenshot (w × h) | Scale | px per UI pt | Phone frame | Well | Letterbox y | Frame→plate | Section h | Document h | Edge-crossing elements |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BASELINE | light · 393x852 | 156.4 × 339.9 | 0.1213 | 0.364 | 174.4 × 368.3 | 329 × 411.2 | 5.2 | 48 | 1880 | 14717 | 0 |
| BASELINE | dark · 393x852 | 156.4 × 339.9 | 0.1213 | 0.364 | 174.4 × 368.3 | 329 × 411.2 | 5.2 | 48 | 1880 | 14717 | 0 |
| 200PX CANDIDATE | light · 393x852 | 197.8 × 429.8 | 0.1533 | 0.460 | 215.8 × 447.8 | 329 × 493.5 | 0.0 | 48 | 1962 | 14799 | 0 |
| 200PX CANDIDATE | dark · 393x852 | 197.8 × 429.8 | 0.1533 | 0.460 | 215.8 × 447.8 | 329 × 493.5 | 0.0 | 48 | 1962 | 14799 | 0 |
| 220PX CANDIDATE | light · 393x852 | 217.4 × 472.4 | 0.1686 | 0.506 | 235.4 × 490.4 | 329 × 526.4 | 0.0 | 48 | 1995 | 14832 | 0 |
| 220PX CANDIDATE | dark · 393x852 | 217.4 × 472.4 | 0.1686 | 0.506 | 235.4 × 490.4 | 329 × 526.4 | 0.0 | 48 | 1995 | 14832 | 0 |
| 240PX REFERENCE | light · 393x852 | 237.0 × 515.1 | 0.1838 | 0.551 | 255.1 × 533.1 | 329 × 575.8 | 0.0 | 48 | 2044 | 14881 | 0 |
| 240PX REFERENCE | dark · 393x852 | 237.0 × 515.1 | 0.1838 | 0.551 | 255.1 × 533.1 | 329 × 575.8 | 0.0 | 48 | 2044 | 14881 | 0 |
| SELECTED (built) | light · 393x852 | 217.4 × 472.4 | 0.1686 | 0.506 | 235.4 × 490.4 | 329 × 526.4 | 0.0 | 28 | 1975 | 14812 | 0 |
| SELECTED (built) | dark · 393x852 | 217.4 × 472.4 | 0.1686 | 0.506 | 235.4 × 490.4 | 329 × 526.4 | 0.0 | 28 | 1975 | 14812 | 0 |
| BASELINE | light · 375x667 | 146.9 × 319.1 | 0.1138 | 0.341 | 164.9 × 348.1 | 311 × 388.8 | 5.5 | 48 | 1880 | 14981 | 0 |
| BASELINE | dark · 375x667 | 146.9 × 319.1 | 0.1138 | 0.341 | 164.9 × 348.1 | 311 × 388.8 | 5.5 | 48 | 1880 | 14981 | 0 |
| 200PX CANDIDATE | light · 375x667 | 185.9 × 404.0 | 0.1441 | 0.432 | 203.9 × 422.0 | 311 × 466.5 | 0.0 | 48 | 1957 | 15059 | 0 |
| 200PX CANDIDATE | dark · 375x667 | 185.9 × 404.0 | 0.1441 | 0.432 | 203.9 × 422.0 | 311 × 466.5 | 0.0 | 48 | 1957 | 15059 | 0 |
| 220PX CANDIDATE | light · 375x667 | 204.5 × 444.3 | 0.1585 | 0.476 | 222.5 × 462.3 | 311 × 497.6 | 0.0 | 48 | 1988 | 15090 | 0 |
| 220PX CANDIDATE | dark · 375x667 | 204.5 × 444.3 | 0.1585 | 0.476 | 222.5 × 462.3 | 311 × 497.6 | 0.0 | 48 | 1988 | 15090 | 0 |
| 240PX REFERENCE | light · 375x667 | 223.0 × 484.6 | 0.1729 | 0.519 | 241.0 × 502.6 | 311 × 544.2 | 0.0 | 48 | 2035 | 15136 | 0 |
| 240PX REFERENCE | dark · 375x667 | 223.0 × 484.6 | 0.1729 | 0.519 | 241.0 × 502.6 | 311 × 544.2 | 0.0 | 48 | 2035 | 15136 | 0 |
| SELECTED (built) | light · 375x667 | 204.5 × 444.3 | 0.1585 | 0.476 | 222.5 × 462.3 | 311 × 497.6 | 0.0 | 28 | 1968 | 15070 | 0 |
| SELECTED (built) | dark · 375x667 | 204.5 × 444.3 | 0.1585 | 0.476 | 222.5 × 462.3 | 311 × 497.6 | 0.0 | 28 | 1968 | 15070 | 0 |
| BASELINE | light · 320x568 | 117.6 × 255.4 | 0.0911 | 0.273 | 135.6 × 286.2 | 256 × 320.0 | 6.4 | 48 | 1937 | 16109 | 0 |
| BASELINE | dark · 320x568 | 117.6 × 255.4 | 0.0911 | 0.273 | 135.6 × 286.2 | 256 × 320.0 | 6.4 | 48 | 1937 | 16109 | 0 |
| 200PX CANDIDATE | light · 320x568 | 149.6 × 325.1 | 0.1160 | 0.348 | 167.6 × 343.1 | 256 × 384.0 | 0.0 | 48 | 2001 | 16173 | 0 |
| 200PX CANDIDATE | dark · 320x568 | 149.6 × 325.1 | 0.1160 | 0.348 | 167.6 × 343.1 | 256 × 384.0 | 0.0 | 48 | 2001 | 16173 | 0 |
| 220PX CANDIDATE | light · 320x568 | 164.9 × 358.2 | 0.1278 | 0.383 | 182.9 × 376.2 | 256 × 409.6 | 0.0 | 48 | 2026 | 16199 | 0 |
| 220PX CANDIDATE | dark · 320x568 | 164.9 × 358.2 | 0.1278 | 0.383 | 182.9 × 376.2 | 256 × 409.6 | 0.0 | 48 | 2026 | 16199 | 0 |
| 240PX REFERENCE | light · 320x568 | 180.1 × 391.3 | 0.1396 | 0.419 | 198.1 × 409.3 | 256 × 448.0 | 0.0 | 48 | 2065 | 16237 | 0 |
| 240PX REFERENCE | dark · 320x568 | 180.1 × 391.3 | 0.1396 | 0.419 | 198.1 × 409.3 | 256 × 448.0 | 0.0 | 48 | 2065 | 16237 | 0 |
| SELECTED (built) | light · 320x568 | 164.9 × 358.2 | 0.1278 | 0.383 | 182.9 × 376.2 | 256 × 409.6 | 0.0 | 28 | 2006 | 16179 | 0 |
| SELECTED (built) | dark · 320x568 | 164.9 × 358.2 | 0.1278 | 0.383 | 182.9 × 376.2 | 256 × 409.6 | 0.0 | 28 | 2006 | 16179 | 0 |

## 2. Desktop and tablet: baseline vs selected

| Treatment | Theme · viewport | Screenshot (w × h) | Scale | px per UI pt | Phone frame | Well | Letterbox y | Frame→plate | Section h | Document h | Edge-crossing elements |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BASELINE | light · 1440x900 | 219.9 × 477.8 | 0.1704 | 0.511 | 237.9 × 502.2 | 448 × 560.0 | 3.2 | 48 | 1387 | 9851 | 0 |
| BASELINE | dark · 1440x900 | 219.9 × 477.8 | 0.1704 | 0.511 | 237.9 × 502.2 | 448 × 560.0 | 3.2 | 48 | 1387 | 9851 | 0 |
| 53% (today's proportion, capture-fitted) | light · 1440x900 | 218.4 × 474.5 | 0.1693 | 0.508 | 236.4 × 492.5 | 448 × 560.0 | 0.0 | 48 | 1387 | 9851 | 0 |
| 53% (today's proportion, capture-fitted) | dark · 1440x900 | 218.4 × 474.5 | 0.1693 | 0.508 | 236.4 × 492.5 | 448 × 560.0 | 0.0 | 48 | 1387 | 9851 | 0 |
| 58% in a 4/5 well | light · 1440x900 | 240.7 × 522.9 | 0.1866 | 0.560 | 258.7 × 540.9 | 448 × 560.0 | 0.0 | 48 | 1387 | 9851 | 0 |
| 58% in a 4/5 well | dark · 1440x900 | 240.7 × 522.9 | 0.1866 | 0.560 | 258.7 × 540.9 | 448 × 560.0 | 0.0 | 48 | 1387 | 9851 | 0 |
| SELECTED (built: 58% in a 3/4 well) | light · 1440x900 | 240.7 × 522.9 | 0.1866 | 0.560 | 258.7 × 540.9 | 448 × 597.3 | 0.0 | 48 | 1387 | 9851 | 0 |
| SELECTED (built: 58% in a 3/4 well) | dark · 1440x900 | 240.7 × 522.9 | 0.1866 | 0.560 | 258.7 × 540.9 | 448 × 597.3 | 0.0 | 48 | 1387 | 9851 | 0 |
| BASELINE | light · 1280x800 | 177.2 × 385.1 | 0.1374 | 0.412 | 195.2 × 412.2 | 368 × 460.0 | 4.5 | 48 | 1478 | 9911 | 0 |
| BASELINE | dark · 1280x800 | 177.2 × 385.1 | 0.1374 | 0.412 | 195.2 × 412.2 | 368 × 460.0 | 4.5 | 48 | 1478 | 9911 | 0 |
| 53% (today's proportion, capture-fitted) | light · 1280x800 | 176.0 × 382.3 | 0.1364 | 0.409 | 194.0 × 400.3 | 368 × 460.0 | 0.0 | 48 | 1478 | 9911 | 0 |
| 53% (today's proportion, capture-fitted) | dark · 1280x800 | 176.0 × 382.3 | 0.1364 | 0.409 | 194.0 × 400.3 | 368 × 460.0 | 0.0 | 48 | 1478 | 9911 | 0 |
| 58% in a 4/5 well | light · 1280x800 | 194.3 × 422.1 | 0.1506 | 0.452 | 212.3 × 440.1 | 368 × 460.0 | 0.0 | 48 | 1478 | 9911 | 0 |
| 58% in a 4/5 well | dark · 1280x800 | 194.3 × 422.1 | 0.1506 | 0.452 | 212.3 × 440.1 | 368 × 460.0 | 0.0 | 48 | 1478 | 9911 | 0 |
| SELECTED (built: 58% in a 3/4 well) | light · 1280x800 | 194.3 × 422.1 | 0.1506 | 0.452 | 212.3 × 440.1 | 368 × 490.7 | 0.0 | 48 | 1478 | 9911 | 0 |
| SELECTED (built: 58% in a 3/4 well) | dark · 1280x800 | 194.3 × 422.1 | 0.1506 | 0.452 | 212.3 × 440.1 | 368 × 490.7 | 0.0 | 48 | 1478 | 9911 | 0 |
| BASELINE | light · 768x1024 | 207.1 × 449.9 | 0.1605 | 0.482 | 225.1 × 475.2 | 424 × 530.0 | 3.6 | 48 | 1882 | 12816 | 0 |
| BASELINE | dark · 768x1024 | 207.1 × 449.9 | 0.1605 | 0.482 | 225.1 × 475.2 | 424 × 530.0 | 3.6 | 48 | 1882 | 12816 | 0 |
| SELECTED (built: 58% in a 3/4 well) | light · 768x1024 | 205.7 × 446.9 | 0.1594 | 0.478 | 223.7 × 464.9 | 424 × 530.0 | 0.0 | 28 | 1862 | 12796 | 0 |
| SELECTED (built: 58% in a 3/4 well) | dark · 768x1024 | 205.7 × 446.9 | 0.1594 | 0.478 | 223.7 × 464.9 | 424 × 530.0 | 0.0 | 28 | 1862 | 12796 | 0 |

## 3. Caption gap variant (393, 220px candidate)

| Treatment | Theme · viewport | Screenshot (w × h) | Scale | px per UI pt | Phone frame | Well | Letterbox y | Frame→plate | Section h | Document h | Edge-crossing elements |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 220PX · 48px grid gap | light · 393x852 | 217.4 × 472.4 | 0.1686 | 0.506 | 235.4 × 490.4 | 329 × 526.4 | 0.0 | 48 | 1995 | 14832 | 0 |
| 220PX · 48px grid gap | dark · 393x852 | 217.4 × 472.4 | 0.1686 | 0.506 | 235.4 × 490.4 | 329 × 526.4 | 0.0 | 48 | 1995 | 14832 | 0 |
| 220PX · 28px gap (selected) | light · 393x852 | 217.4 × 472.4 | 0.1686 | 0.506 | 235.4 × 490.4 | 329 × 526.4 | 0.0 | 28 | 1975 | 14812 | 0 |
| 220PX · 28px gap (selected) | dark · 393x852 | 217.4 × 472.4 | 0.1686 | 0.506 | 235.4 × 490.4 | 329 × 526.4 | 0.0 | 28 | 1975 | 14812 | 0 |

## 4. Selected implementation: accessibility and modes

| Mode | Theme · viewport | html.dark | html.js | reduced motion | axe violations (hero section) | axe incomplete | Tab stops to the App Store pill | focus-visible on every stop | Console errors |
|---|---|---|---|---|---|---|---|---|---|
| final | light · 1440x900 | False | True | False | 0 | color-contrast×8 | 15 | True | 0 |
| final | dark · 1440x900 | True | True | False | 0 | color-contrast×7 | 15 | True | 0 |
| final | light · 1280x800 | False | True | False | 0 | color-contrast×4 | 15 | True | 0 |
| final | dark · 1280x800 | True | True | False | 0 | color-contrast×4 | 15 | True | 0 |
| final | light · 768x1024 | False | True | False | 0 | color-contrast×3 | 15 | True | 0 |
| final | dark · 768x1024 | True | True | False | 0 | color-contrast×3 | 15 | True | 0 |
| final | light · 393x852 | False | True | False | 0 | color-contrast×7 | 5 | True | 0 |
| final | dark · 393x852 | True | True | False | 0 | color-contrast×7 | 5 | True | 0 |
| final | light · 375x667 | False | True | False | 0 | color-contrast×7 | 5 | True | 0 |
| final | dark · 375x667 | True | True | False | 0 | color-contrast×7 | 5 | True | 0 |
| final | light · 320x568 | False | True | False | 0 | color-contrast×4 | 5 | True | 0 |
| final | dark · 320x568 | True | True | False | 0 | color-contrast×4 | 5 | True | 0 |
| final-rm | light · 1440x900 | False | True | True | n/a | n/a | n/a | n/a | 0 |
| final-rm | dark · 1440x900 | True | True | True | n/a | n/a | n/a | n/a | 0 |
| final-rm | light · 393x852 | False | True | True | n/a | n/a | n/a | n/a | 0 |
| final-rm | dark · 393x852 | True | True | True | n/a | n/a | n/a | n/a | 0 |
| final-nojs | light · 1440x900 | False | False | False | n/a | n/a | n/a | n/a | 1 |
| final-nojs | dark · 1440x900 | False | False | False | n/a | n/a | n/a | n/a | 1 |
| final-nojs | light · 393x852 | False | False | False | n/a | n/a | n/a | n/a | 1 |
| final-nojs | dark · 393x852 | False | False | False | n/a | n/a | n/a | n/a | 1 |

## 5. Image contract (selected, 393 light)

- currentSrc `flagstone/explore-current.phone.avif` (AVIF chosen by the browser), natural 1290 × 2803, complete True, loading `eager`, fetchpriority `high`.
- alt: Flagstone's Explore map with an expanded verified Steep grade report, a real barrier photograph, orange map pins, map controls, and bottom navigation.
