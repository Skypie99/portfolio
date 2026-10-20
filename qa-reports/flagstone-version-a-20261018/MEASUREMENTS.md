# Measurements · Flagstone Version A candidate

Generated 2026-10-19T02:02:47.981Z by `tools/capture.mjs` from the built `out/` served over loopback. Renderer: Chromium 141.0.7390.37 (pre-installed Playwright build). Every value below is read off the real Next.js page, not a prototype. Pixel readings are medians over 24 samples at device scale 2. Contrast is WCAG 2.x relative-luminance contrast.

## 1. Geometry, overflow and click-to-play per viewport

| Theme | Viewport | Frames (w × h @ x) | Gaps | Stacked | Grid tracks | Row width | scrollWidth / innerWidth | Edge-crossing elements | VE04 before scroll → trace | Tabs to Play | Enter plays → Enter pauses | Clip |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| light | 1920×1080 | 340×400 @ 540 · 340×400 @ 904 · 340×400 @ 1268 | 24 / 24 | false | 340px 340px 340px | 1068 | 1920 / 1920 | 0 | armed → armed@2ms → settling@47ms → settled@918ms | 18 (focus-visible true) | paused at rest → playing (t=1.098s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| light | 1440×900 | 340×400 @ 312 · 340×400 @ 676 · 340×400 @ 1040 | 24 / 24 | false | 340px 340px 340px | 1068 | 1440 / 1440 | 0 | armed → armed@10ms → settling@37ms → settled@927ms | 18 (focus-visible true) | paused at rest → playing (t=1.108s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| light | 1280×800 | 296×348.2 @ 312 · 296×348.2 @ 632 · 296×348.2 @ 952 | 24 / 24 | false | 296px 296px 296px | 936 | 1280 / 1280 | 0 | armed → armed@8ms → settling@44ms → settled@941ms | 18 (focus-visible true) | paused at rest → playing (t=1.107s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| light | 1024×768 | 210.7×247.8 @ 312 · 210.7×247.8 @ 546.7 · 210.7×247.8 @ 781.3 | 24 / 24 | false | 210.656px 210.672px 210.672px | 680 | 1024 / 1024 | 0 | armed → armed@0ms → settling@31ms → settled@917ms | 18 (focus-visible true) | paused at rest → playing (t=1.099s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| light | 393×852 | 329×387 @ 32 · 329×387 @ 32 · 329×387 @ 32 | -329 / -329 | true | 329px | 329 | 393 / 393 | 0 | armed → armed@7ms → settling@40ms → settled@924ms | 8 (focus-visible true) | paused at rest → playing (t=1.102s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| light | 375×667 | 311×365.9 @ 32 · 311×365.9 @ 32 · 311×365.9 @ 32 | -311 / -311 | true | 311px | 311 | 375 / 375 | 0 | armed → armed@14ms → settling@41ms → settled@930ms | 8 (focus-visible true) | paused at rest → playing (t=1.112s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| light | 320×568 | 256×301.2 @ 32 · 256×301.2 @ 32 · 256×301.2 @ 32 | -256 / -256 | true | 256px | 256 | 320 / 320 | 0 | armed → armed@0ms → settling@26ms → settled@917ms | 8 (focus-visible true) | paused at rest → playing (t=1.105s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| dark | 1920×1080 | 340×400 @ 540 · 340×400 @ 904 · 340×400 @ 1268 | 24 / 24 | false | 340px 340px 340px | 1068 | 1920 / 1920 | 0 | armed → armed@7ms → settling@32ms → settled@941ms | 18 (focus-visible true) | paused at rest → playing (t=1.088s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| dark | 1440×900 | 340×400 @ 312 · 340×400 @ 676 · 340×400 @ 1040 | 24 / 24 | false | 340px 340px 340px | 1068 | 1440 / 1440 | 0 | armed → armed@9ms → settling@42ms → settled@942ms | 18 (focus-visible true) | paused at rest → playing (t=1.111s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| dark | 1280×800 | 296×348.2 @ 312 · 296×348.2 @ 632 · 296×348.2 @ 952 | 24 / 24 | false | 296px 296px 296px | 936 | 1280 / 1280 | 0 | armed → armed@16ms → settling@49ms → settled@949ms | 18 (focus-visible true) | paused at rest → playing (t=1.099s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| dark | 1024×768 | 210.7×247.8 @ 312 · 210.7×247.8 @ 546.7 · 210.7×247.8 @ 781.3 | 24 / 24 | false | 210.656px 210.672px 210.672px | 680 | 1024 / 1024 | 0 | armed → armed@9ms → settling@34ms → settled@925ms | 18 (focus-visible true) | paused at rest → playing (t=1.099s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| dark | 393×852 | 329×387 @ 32 · 329×387 @ 32 · 329×387 @ 32 | -329 / -329 | true | 329px | 329 | 393 / 393 | 0 | armed → armed@4ms → settling@41ms → settled@937ms | 8 (focus-visible true) | paused at rest → playing (t=1.097s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| dark | 375×667 | 311×365.9 @ 32 · 311×365.9 @ 32 · 311×365.9 @ 32 | -311 / -311 | true | 311px | 311 | 375 / 375 | 0 | armed → armed@1ms → settling@32ms → settled@935ms | 8 (focus-visible true) | paused at rest → playing (t=1.107s, "Pause animation") → paused | report-flow-current.dark.phone.webm |
| dark | 320×568 | 256×301.2 @ 32 · 256×301.2 @ 32 · 256×301.2 @ 32 | -256 / -256 | true | 256px | 256 | 320 / 320 | 0 | armed → armed@1ms → settling@32ms → settled@934ms | 8 (focus-visible true) | paused at rest → playing (t=1.097s, "Pause animation") → paused | report-flow-current.dark.phone.webm |

Beat trace columns: the first sample of each lifecycle state relative to the moment the scroll was issued. The 900ms safety flip to `settled` is the ProofArrival timer; the colour reaches its rest value earlier (see §2).

## 2. VE04 beat colour samples (window 01 border, computed, every animation frame)

| Theme | Viewport | at 0 | 100 | 200 | 300 | 420 | 600 | 900 ms after `settling` | Final value first reached |
|---|---|---|---|---|---|---|---|---|---|
| light | 1920×1080 | rgb(204, 207, 190) | rgba(195, 154, 128, 0.827) | rgba(187, 112, 79, 0.725) | rgba(185, 101, 66, 0.706) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | 379 ms |
| light | 1440×900 | rgb(204, 207, 190) | rgba(195, 154, 128, 0.827) | rgba(187, 112, 79, 0.725) | rgba(185, 101, 66, 0.706) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | 373 ms |
| light | 1280×800 | rgb(204, 207, 190) | rgba(197, 166, 142, 0.863) | rgba(188, 116, 83, 0.737) | rgba(185, 102, 67, 0.706) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | 397 ms |
| light | 1024×768 | rgb(204, 207, 190) | rgba(193, 143, 116, 0.8) | rgba(187, 108, 75, 0.72) | rgba(185, 100, 65, 0.706) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | 353 ms |
| light | 393×852 | rgb(204, 207, 190) | rgba(191, 134, 105, 0.776) | rgba(185, 102, 67, 0.706) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | 251 ms |
| light | 375×667 | rgb(204, 207, 190) | rgba(191, 134, 105, 0.776) | rgba(185, 102, 67, 0.706) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | 256 ms |
| light | 320×568 | rgb(204, 207, 190) | rgba(189, 123, 93, 0.753) | rgba(185, 100, 66, 0.706) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | rgba(185, 99, 64, 0.7) | 241 ms |
| dark | 1920×1080 | rgb(44, 52, 54) | rgba(86, 70, 60, 0.72) | rgba(168, 105, 73, 0.467) | rgba(200, 119, 78, 0.41) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | 409 ms |
| dark | 1440×900 | rgb(44, 52, 54) | rgba(86, 70, 60, 0.72) | rgba(168, 105, 73, 0.467) | rgba(200, 119, 78, 0.41) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | 404 ms |
| dark | 1280×800 | rgb(44, 52, 54) | rgba(86, 70, 60, 0.72) | rgba(168, 105, 73, 0.467) | rgba(200, 119, 78, 0.41) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | 400 ms |
| dark | 1024×768 | rgb(44, 52, 54) | rgba(117, 83, 65, 0.596) | rgba(183, 112, 75, 0.44) | rgba(204, 121, 79, 0.404) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | 375 ms |
| dark | 393×852 | rgb(44, 52, 54) | rgba(132, 90, 68, 0.553) | rgba(200, 119, 78, 0.41) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | 279 ms |
| dark | 375×667 | rgb(44, 52, 54) | rgba(132, 90, 67, 0.553) | rgba(200, 119, 78, 0.41) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | 269 ms |
| dark | 320×568 | rgb(44, 52, 54) | rgba(152, 98, 71, 0.5) | rgba(203, 120, 78, 0.404) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | rgba(207, 122, 79, 0.4) | 253 ms |

## 3. Play control: pixel readings and contrast

| Theme | Viewport | Tabs | :focus-visible | Computed outline / halo | Rest: hairline : clip | hairline : body | body : clip | icon : body | Focus: ring : halo | ring : clip | halo : clip | Button rect | Pill → frame edge (right, bottom) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| light | 1440×900 | 18 | true | 2px solid rgb(185, 99, 64), offset 2px; rgb(250, 248, 241) 0px 0px 0px 2px | 5.74 | 1.05 | 5.49 | 3.41 | **3.87** | 2.31 | 8.91 | 44×44 | 33, 33 |
| light | 393×852 | 8 | true | 2px solid rgb(185, 99, 64), offset 2px; rgb(250, 248, 241) 0px 0px 0px 2px | 5.77 | 1.07 | 5.39 | 3.44 | **3.82** | 2.24 | 8.54 | 44×44 | 33, 33 |
| dark | 1440×900 | 18 | true | 2px solid rgb(207, 122, 79), offset 2px; rgb(21, 25, 26) 0px 0px 0px 2px | 3.14 | 4.73 | 1.51 | 6.19 | **5.17** | 3.02 | 1.71 | 44×44 | 33, 33 |
| dark | 393×852 | 8 | true | 2px solid rgb(207, 122, 79), offset 2px; rgb(21, 25, 26) 0px 0px 0px 2px | 3.3 | 4.92 | 1.49 | 6.07 | **5.17** | 2.93 | 1.77 | 44×44 | 33, 33 |

Sampled colours (median rgb):

| Theme | Viewport | Pill body | Hairline | Ring | Halo | Clip beside ring | Clip beside pill (rest) |
|---|---|---|---|---|---|---|---|
| light | 1440×900 | rgb(195 197 203) | rgb(200 203 190) | rgb(184 102 68) | rgb(248 246 239) | rgb(51 70 94) | rgb(53 71 95) |
| light | 393×852 | rgb(194 197 202) | rgb(202 205 190) | rgb(185 103 69) | rgb(248 246 239) | rgb(53 73 96) | rgb(54 72 95) |
| dark | 1440×900 | rgb(40 45 50) | rgb(150 151 148) | rgb(206 125 84) | rgb(29 33 34) | rgb(52 71 95) | rgb(54 73 96) |
| dark | 393×852 | rgb(40 46 49) | rgb(154 155 151) | rgb(206 125 85) | rgb(29 33 34) | rgb(55 73 96) | rgb(54 73 96) |

## 4. Window-01 edge, neutral frame line, caption rule (settled rest state)

| Theme | Viewport | Window 01 edge (pixel) | Computed | Neutral line (window 02) | Caption rule | Surface beside | Edge : surface | Neutral : surface | State |
|---|---|---|---|---|---|---|---|---|---|
| light | 1440×900 | rgb(202 140 112) | rgba(185, 99, 64, 0.7) 1px r8px | rgb(203 206 190) (rgb(204, 207, 190)) | rgb(202 169 144) (rgba(135, 71, 45, 0.35)) | rgb(243 229 211) | 2.26 | 1.29 | settled |
| light | 393×852 | rgb(202 138 109) | rgba(185, 99, 64, 0.7) 1px r8px | rgb(203 206 190) (rgb(204, 207, 190)) | rgb(204 172 150) (rgba(135, 71, 45, 0.35)) | rgb(241 226 206) | 2.24 | 1.26 | settled |
| dark | 1440×900 | rgb(117 78 60) | rgba(207, 122, 79, 0.4) 1px r8px | rgb(51 59 61) (rgb(44, 52, 54)) | rgb(139 109 84) (rgba(231, 181, 147, 0.35)) | rgb(57 45 43) | 1.84 | 1.16 | settled |
| dark | 393×852 | rgb(120 79 60) | rgba(207, 122, 79, 0.4) 1px r8px | rgb(51 58 60) (rgb(44, 52, 54)) | rgb(131 101 82) (rgba(231, 181, 147, 0.35)) | rgb(65 50 45) | 1.73 | 1.05 | settled |

## 5. Modes

- **reducedMotion_light**: `{"atHydration":{"arrival":"settled","edge":"rgba(185, 99, 64, 0.7)","transition":"none 0s"},"beat":{"samples":98,"states":[{"t":1,"state":"settled"}],"settlingAt":null,"settledAt":1,"colours":[],"first":[1,"settled","rgba(185, 99, 64, 0.7)"],"last":[1604,"settled","rgba(185, 99, 64, 0.7)"]},"inView":{"paused":true,"currentTime":0,"motion":"paused","label":"Play animation: Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.","readyState":4,"src":"report-flow-current.dark.phone.webm"},"afterDeliberatePlay":{"paused":false,"currentTime":1.007,"motion":"playing","label":"Pause animation: Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.","readyState":4,"src":"report-flow-current.dark.phone.webm"}}`
- **themeFlip_light_to_dark**: `{"beforeFlip":{"paused":true,"currentTime":0,"motion":"paused","label":"Play animation: Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.","readyState":4,"src":"report-flow-current.dark.phone.webm","theme":"light"},"afterFlip":{"paused":true,"currentTime":0,"motion":"paused","label":"Play animation: Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.","readyState":4,"src":"report-flow-current.dark.phone.webm","theme":"dark"},"edgeBefore":"rgba(185, 99, 64, 0.7)","edgeAfter":"rgba(207, 122, 79, 0.4)","playAfter":{"bg":"rgba(30, 36, 38, 0.85)","border":"rgba(236, 234, 224, 0.6)"}}`
- **reducedMotion_dark**: `{"atHydration":{"arrival":"settled","edge":"rgba(207, 122, 79, 0.4)","transition":"none 0s"},"beat":{"samples":98,"states":[{"t":1,"state":"settled"}],"settlingAt":null,"settledAt":1,"colours":[],"first":[1,"settled","rgba(207, 122, 79, 0.4)"],"last":[1603,"settled","rgba(207, 122, 79, 0.4)"]},"inView":{"paused":true,"currentTime":0,"motion":"paused","label":"Play animation: Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.","readyState":4,"src":"report-flow-current.dark.phone.webm"},"afterDeliberatePlay":{"paused":false,"currentTime":1.007,"motion":"playing","label":"Pause animation: Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.","readyState":4,"src":"report-flow-current.dark.phone.webm"}}`
- **themeFlip_dark_to_light**: `{"beforeFlip":{"paused":true,"currentTime":0,"motion":"paused","label":"Play animation: Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.","readyState":4,"src":"report-flow-current.dark.phone.webm","theme":"dark"},"afterFlip":{"paused":true,"currentTime":0,"motion":"paused","label":"Play animation: Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.","readyState":4,"src":"report-flow-current.dark.phone.webm","theme":"light"},"edgeBefore":"rgba(207, 122, 79, 0.4)","edgeAfter":"rgba(185, 99, 64, 0.7)","playAfter":{"bg":"rgba(255, 255, 255, 0.72)","border":"rgb(204, 207, 190)"}}`
- **noJavaScript_light**: `{"js":false,"arrivalAttr":"armed","edgePainted":"rgba(185, 99, 64, 0.7)","nativeControls":true,"overlayButton":false,"autoplayAttr":false,"paused":true}`

## 6. Arrival clauses on the real page

```json
{
  "firstVisitBeforeScroll": "armed",
  "consumedAfterTrigger": "1",
  "afterReload": {
    "state": "settled",
    "navType": "reload"
  },
  "afterBack": {
    "state": "settled",
    "navType": "back_forward"
  },
  "hashArrival": {
    "state": "settled",
    "hashAfterHydration": "",
    "hostTop": 602,
    "hostBottom": 1099,
    "innerHeight": 900,
    "target": true,
    "hashAtLoad": {
      "hash": "#the-approach",
      "seat": true,
      "js": true
    }
  }
}
```

## 7. axe-core on the proof block

- light 1440×900 (axe 4.11.4): **0 violations**, 3 incomplete, 17 rules passed.
  - incomplete `aria-prohibited-attr`: Elements must only use permitted ARIA attributes — .my-8
  - incomplete `color-contrast`: Elements must meet minimum color contrast ratio thresholds — .mb-6; .text-step-2.mb-8; figure[data-proof-window="01"] > .text-label.text-text-meta; figure[data-proof-window="01"] > .border-accent-ink\/35.pt-2\.5; figure[data-proof-window="02"] > .text-label.text-text-meta; figure[data-proof-window="02"] > .border-accent-ink\/35.pt-2\.5
  - incomplete `video-caption`: <video> elements must have captions — video
- light 393×852 (axe 4.11.4): **0 violations**, 3 incomplete, 17 rules passed.
  - incomplete `aria-prohibited-attr`: Elements must only use permitted ARIA attributes — .my-8
  - incomplete `color-contrast`: Elements must meet minimum color contrast ratio thresholds — .mb-6; .text-step-2.mb-8; figure[data-proof-window="01"] > .text-label.text-text-meta; figure[data-proof-window="01"] > .border-accent-ink\/35.pt-2\.5; figure[data-proof-window="02"] > .text-label.text-text-meta; figure[data-proof-window="02"] > .border-accent-ink\/35.pt-2\.5
  - incomplete `video-caption`: <video> elements must have captions — video
- dark 1440×900 (axe 4.11.4): **0 violations**, 3 incomplete, 17 rules passed.
  - incomplete `aria-prohibited-attr`: Elements must only use permitted ARIA attributes — .my-8
  - incomplete `color-contrast`: Elements must meet minimum color contrast ratio thresholds — .mb-6; .text-step-2.mb-8; figure[data-proof-window="01"] > .text-label.text-text-meta; figure[data-proof-window="01"] > .border-accent-ink\/35.pt-2\.5; figure[data-proof-window="02"] > .text-label.text-text-meta; figure[data-proof-window="02"] > .border-accent-ink\/35.pt-2\.5
  - incomplete `video-caption`: <video> elements must have captions — video
- dark 393×852 (axe 4.11.4): **0 violations**, 3 incomplete, 17 rules passed.
  - incomplete `aria-prohibited-attr`: Elements must only use permitted ARIA attributes — .my-8
  - incomplete `color-contrast`: Elements must meet minimum color contrast ratio thresholds — .mb-6; .text-step-2.mb-8; figure[data-proof-window="01"] > .text-label.text-text-meta; figure[data-proof-window="01"] > .border-accent-ink\/35.pt-2\.5; figure[data-proof-window="02"] > .text-label.text-text-meta; figure[data-proof-window="02"] > .border-accent-ink\/35.pt-2\.5
  - incomplete `video-caption`: <video> elements must have captions — video

## 8. Other case studies and the Tokyo route

- `dashboard`: `{"slug":"dashboard","present":true,"listTag":"UL","proofRow":false,"breakout":false,"gridTemplateColumns":"301.906px 301.922px","items":2,"labelsAboveMedia":false,"motion":null}`
- `ghost-code`: `{"slug":"ghost-code","present":true,"listTag":"UL","proofRow":false,"breakout":false,"gridTemplateColumns":"651.828px","items":1,"labelsAboveMedia":false,"motion":"paused"}`
- `claude-corp`: `{"slug":"claude-corp","present":true,"listTag":"UL","proofRow":false,"breakout":false,"gridTemplateColumns":"651.828px","items":1,"labelsAboveMedia":false,"motion":null}`
- `tokyo-through-time`: `{"slug":"tokyo-through-time","title":"Tokyo Through Time: Skyler Halisky","videos":2,"proofRow":false}`

## 9. Files

- `captures/boards/desktop_light-over-dark_1440.jpg` (179 KB)
- `captures/boards/phones_dark.jpg` (92 KB)
- `captures/boards/phones_light.jpg` (90 KB)
- `captures/boards/play-control_dark.png` (367 KB)
- `captures/boards/play-control_light.png` (293 KB)
- `captures/composition/comp_dark_1024x768.jpg` (83 KB)
- `captures/composition/comp_dark_1280x800.jpg` (99 KB)
- `captures/composition/comp_dark_1440x900.jpg` (130 KB)
- `captures/composition/comp_dark_1920x1080.jpg` (172 KB)
- `captures/composition/comp_dark_320x568.jpg` (19 KB)
- `captures/composition/comp_dark_375x667.jpg` (25 KB)
- `captures/composition/comp_dark_393x852.jpg` (33 KB)
- `captures/composition/comp_light_1024x768.jpg` (78 KB)
- `captures/composition/comp_light_1280x800.jpg` (91 KB)
- `captures/composition/comp_light_1440x900.jpg` (120 KB)
- `captures/composition/comp_light_1920x1080.jpg` (155 KB)
- `captures/composition/comp_light_320x568.jpg` (19 KB)
- `captures/composition/comp_light_375x667.jpg` (24 KB)
- `captures/composition/comp_light_393x852.jpg` (32 KB)
- `captures/detail/edge_w01_dark_1440.png` (26 KB)
- `captures/detail/edge_w01_dark_393.png` (26 KB)
- `captures/detail/edge_w01_light_1440.png` (22 KB)
- `captures/detail/edge_w01_light_393.png` (22 KB)
- `captures/detail/play_focus_dark_1440.png` (79 KB)
- `captures/detail/play_focus_dark_393.png` (79 KB)
- `captures/detail/play_focus_light_1440.png` (66 KB)
- `captures/detail/play_focus_light_393.png` (66 KB)
- `captures/detail/play_rest_dark_1440.png` (76 KB)
- `captures/detail/play_rest_dark_393.png` (77 KB)
- `captures/detail/play_rest_light_1440.png` (64 KB)
- `captures/detail/play_rest_light_393.png` (65 KB)
- `captures/modes/nojs_light_1440.jpg` (115 KB)
- `captures/modes/rm_dark_1440.jpg` (134 KB)
- `captures/modes/rm_light_1440.jpg` (119 KB)
- `captures/others/claude-corp_light_1440.jpg` (34 KB)
- `captures/others/dashboard_light_1440.jpg` (25 KB)
- `captures/others/ghost-code_light_1440.jpg` (37 KB)
- `captures/others/tokyo-through-time_light_1440.jpg` (147 KB)
- `captures/row/row_dark_1024x768.jpg` (49 KB)
- `captures/row/row_dark_1280x800.jpg` (64 KB)
- `captures/row/row_dark_1440x900.jpg` (81 KB)
- `captures/row/row_dark_1920x1080.jpg` (81 KB)
- `captures/row/row_dark_320x568.jpg` (40 KB)
- `captures/row/row_dark_375x667.jpg` (46 KB)
- `captures/row/row_dark_393x852.jpg` (50 KB)
- `captures/row/row_light_1024x768.jpg` (48 KB)
- `captures/row/row_light_1280x800.jpg` (62 KB)
- `captures/row/row_light_1440x900.jpg` (78 KB)
- `captures/row/row_light_1920x1080.jpg` (78 KB)
- `captures/row/row_light_320x568.jpg` (39 KB)
- `captures/row/row_light_375x667.jpg` (45 KB)
- `captures/row/row_light_393x852.jpg` (49 KB)
