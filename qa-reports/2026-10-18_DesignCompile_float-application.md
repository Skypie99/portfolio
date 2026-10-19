# Design Compile Result — float-application — 2026-10-18

**Route:** `/float/` (unlisted, noindex) · **Branch:** `claude/portfolio-float-application-20261018` (off `origin/main` @ 0cda7c7)
**Worktree:** `/Users/skypie/Portfolio-float-20261018` · **Source:** `~/Downloads/IMG_8776.mov` (66 s, 4K HDR iPhone video; left untouched)
**Status:** approved by Sky for publication on 2026-10-18; published through a pull request with a CI-gated merge to `main` (no admin bypass). Nothing sent to anyone.

## 1. DECISIONS FOR SKY

- [x] **Publish `/float/`** — approved by Sky on 2026-10-18 ("I AUTHORIZE YOU TO PUBLISH THIS PAGE").
  - **Rollback:** `git revert -m 1 <merge-sha>` on `main` and push; CI and Deploy then republish the previous site.
- [x] **Caption word at 0:24–0:26** — final audit kept "outside **of** the workplace": every full-recording pass over the shipped audio (two different on-device models) hears "of", and the audio has two syllables between "outside" and "workplace". No caption changes were needed (audit in the evidence folder, `caption-final-audit.md`).
- [x] **Audio level** — kept at -16.0 LUFS (Sky: keep the improved audio).
- [x] **Poster frame** — the closing smile at 66.2 s, as approved.

## 2. BLOCKERS / FAIL_FAST

None.

## 3. Summary

A one-minute application video for Float, presented on an unlisted page in the `/runway/` pattern: "Hi, Float." heading, one line of intro, the portrait video with captions, a transcript drawer, a download link, and the existing "the work / write to me" close. The video was tone-mapped from iPhone HDR to SDR, re-encoded for the web at 19.7 MB, and stripped of all camera metadata, including GPS. Captions are timed to the speech and were independently checked against a fresh transcription of the shipped audio.

## 4. What Shipped (local commit on the branch)

| File | What |
|---|---|
| `app/float/page.tsx` | the page: metadata (noindex, nofollow, self-canonical, own OG/Twitter), hero, portrait video + captions track, transcript `<details>`, download link, close |
| `app/__tests__/float-application.test.tsx` | 7 guards: unlisted (metadata, sitemap, nav), video wiring, VTT shape, transcript ⇔ captions parity, no camera metadata in MP4/poster, no em dashes |
| `public/videos/hi-float.mp4` | 1080×1920 H.264 High, 30 fps, 2-pass 2.2 Mbps, AAC-LC 160 kbps stereo, fast start, 19,678,868 B |
| `public/videos/hi-float.vtt` | 24 WebVTT cues, at most 2 lines of 42 characters |
| `public/images/float/poster.jpg` | 900×1600 progressive JPEG (mozjpeg q70), 169,599 B, no metadata segments |
| `qa-reports/2026-10-18_DesignCompile_float-application.md`, `qa-reports/INDEX.md` | this receipt + regenerated QA index |

No existing file outside `qa-reports/INDEX.md` was modified.

### Media pipeline

1. `avconvert -p Preset1920x1080` → SDR BT.709 mezzanine (Apple's HDR tone mapping; colour checked against Apple's render of the source).
2. `node_modules/ffmpeg-static` (x264): `fps=30`, 2-pass ABR 2200k (maxrate 3300k), keyint 60; audio `volume=12.9dB,alimiter=limit=0.794` → `aac_at` 160k; `-map_metadata -1`, bitexact, `+faststart`; only the video and stereo AAC tracks mapped.
3. Chosen over a 720×1280 encode at 1.5 Mbps by VMAF 84.5 vs 79.2 and 1:1 face/texture crops.
4. Measured A/V offset vs. the source audio by cross-correlation: **+5.0 ms** (the limiter's look-ahead; imperceptible).

## 5. Verification

| Check | Result |
|---|---|
| `npm run lint` · `npm run typecheck` | clean · clean |
| `npm run test:static` | 55 passed, 1 skipped (same as baseline) |
| `npm test` | 108 files, **956 passed**, 2 skipped (baseline 949 + 7 new) |
| Built `out/float/index.html` | `noindex, nofollow`; exactly one canonical `https://skypistudio.com/float/`; own `og:url`; not in `sitemap.xml` |
| WebKit (Safari engine) playback | `canPlayType` "probably"; 66.475 s, 1080×1920; real playback; seeks to 10/45/65.5 s land with the right caption active; 24 cues loaded; captions render in the player |
| Captions vs. spoken audio | 199 caption words, 192 identical to a fresh hint-free transcription of the **shipped** audio; 8 differences, all explained (name, city, company name, hyphenation, "1st", a dropped false start); 24/24 cues cover their words (±0.25 s); max start offset 0.12 s |
| Camera metadata | before: GPS + accuracy, make, model, iOS version, creation date, 5 timed-metadata tracks, spatial audio; after: **0 metadata items**, 2 tracks, creation times 0; poster has no APP1/APP2 |
| Layout 320 / 375 / 768 / 1024 / 1280 / 1440 × light / dark | no horizontal overflow, 0 console errors; transcript beside the video from 1280, stacked below it under 1280 |
| Keyboard | skip link → chrome → video controls → "Read the transcript" (Enter and Space toggle, 2px focus outline) → download → close links |
| Reduced motion | heading at rest (opacity 1) |
| Mobile identity chip | visible at top, retires after scrolling (opacity 0) |
| axe-core 4.11 (contrast + label-content-name-mismatch on) | **0 violations** at 1440 and 375, light and dark; 17–18 "incomplete" contrast nodes are site chrome, identical to live `/runway/` (which also flags `video-caption`; `/float/` does not) |

## 6. LAYER BREAKDOWN

| Layer | Result | Score | Evidence |
|---|---|---|---|
| 1. Tokenization | PASS | — | Existing Tailwind tokens only. One raw length, `22rem` (the portrait media column), alongside the arbitrary values the sibling routes already use (`shadow-[…]`, `underline-offset-[3px]`). Promotion candidate if a second portrait video appears. |
| 2. Accessibility Parity | PASS | — | Captions (WCAG 1.2.2) + full transcript (1.2.3 media alternative) + keyboard (2.1.1) + visible focus (2.4.7) + reflow 320 px (1.4.10) + named video, in both themes |
| 3. Component Consistency | PASS | Cohesion 18/20 | No new components. `RunwayIdentity` + `RunwayIdentityRelease` pair as on About/Contact/Certificates/Colophon; Runway's video frame; Tokyo's `<details>` summary. One new layout (portrait column beside text from xl). |
| 4. Visual Entropy | PASS | ~86/100 (judgment) | Same three-band rhythm as `/runway/`; the only looseness is the empty space right of the video at 768–1279 in stacked mode |
| 5. Luxury UI Score | PASS | ~85/100 (judgment) | The poster sits in the site's black rounded frame and shadow; the transcript reads as quiet prose; the copy is short |
| 6. Regression Safety | PASS | — | Full suite + static suites green; no shared file touched |
| 7. Compile Decision | **COMMIT** | — | UI DONE; publication approved by Sky on 2026-10-18 (section 1) |

## 7. Findings and notes

- 🟢 **Fixed during verification:** the first layout put the transcript beside the video from `md`. With the desktop rail taking about 312 px, the transcript column measured **50 px** at 768. The side-by-side layout now starts at `xl` (520–652 px column).
- 🟡 **Site-wide, unchanged:** the fixed mobile menu button overlaps the video's top-right corner when the video is scrolled to the top of the screen. This matches every other route with media.
- 🟡 **Observation, out of scope:** `/runway/` and `/tokyo-through-time/` mount `RunwayIdentity variant="page"` without its release leaf, so their mobile chip never retires. `/float/` mounts the pair.
- ⚪ WebKit headless logs "Button failed to load … placard" for its own media-control icons on any video page (8 such lines on live `/tokyo-through-time/`). These are not site errors.
- Copy: "Kelowna" is spoken in the video, so it appears in the captions and transcript; the site footer already says "Okanagan Valley, British Columbia".

## 8. Evidence

`~/SkyPi_Portfolio_Execution_Review/2026-10-18_float-application-r1/`: `screenshots/` (23 captures: Chromium 320–1440 and WebKit iPhone 15, light and dark, full-page and viewport, transcript open, captions rendering), `rig-report.json`, `captions-vs-audio.md`, `metadata-before-after.md`, `gates/` logs.
