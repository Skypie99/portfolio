# Design Compile Result: motion-application, 2026-10-22

**Route:** `/motion/` (unlisted, noindex)

**Branch:** `claude/portfolio-motion-application-20261022` (off `origin/main` @ 0933245)

**Worktree:** `/Users/skypie/Portfolio-codex/motion-application-20261022`

**Source:** `~/Downloads/IMG_8826.mov` (1 min 46 s portrait HDR iPhone video; left untouched, same SHA-256 before and after)

**Status:** approved by Sky for publication on 2026-10-22, to be released through a pull request with a CI-gated merge to `main` (no admin bypass). Nothing was sent to anyone; Sky submits the application himself.

## 1. DECISIONS FOR SKY

- [x] **Publish `/motion/`.** Approved by Sky on 2026-10-22: "I authorize publishing the Motion page to production".
  - **Rollback:** `git revert -m 1 <merge-sha>` on `main` and push; CI and Deploy then republish the previous site.
- [x] **0:07.8, "working in technical product support":** confirmed by Sky by ear. The word is "technical", not "tactical". No change needed.
- [x] **1:36.7, "You really have to adopt who you're speaking to":** confirmed by Sky by ear. He said "adopt" (he intended "adapt"), so the captions and transcript keep the spoken "adopt". No change needed.
- [x] **The recording:** approved as recorded (Sky: "I accept the recording exactly as it is, including natural pauses, stumbles, and blinking").
- [x] **Poster frame (closing smile at 105.6 s) and audio level (−16.0 LUFS):** published as reviewed, as part of the approved implementation.

## 2. BLOCKERS / FAIL_FAST

None. Both flagged words were confirmed by Sky on 2026-10-22, so the captions and transcript are owner-verified.

## 3. Summary

The page is a 1:46 introduction video for Motion's Platform Expert application, on an unlisted page in the `/float/` pattern:

- "For the Motion team" label, the "Hi, Motion." heading and one line of introduction;
- the portrait video with captions, a transcript drawer and a download link;
- one understated link to Tokyo Through Time, the AI-assisted film mentioned in the video;
- the existing "the work / write to me" close.

The video was tone-mapped from iPhone HDR to SDR and re-encoded for the web at 31.4 MB, with all camera metadata (including GPS) removed. The captions were transcribed on-device and checked against the shipped audio with two independent recognisers. Contested words were settled by measuring the sound, and every cue boundary was checked against the waveform.

## 4. What Shipped (local commits on the branch)

| File | What |
|---|---|
| `app/motion/page.tsx` | The page: metadata (noindex, nofollow, self-canonical, own OG/Twitter), hero, portrait video and captions track, transcript `<details>`, download link, Tokyo Through Time link, close. |
| `app/__tests__/motion-application.test.tsx` | 13 guards: unlisted (metadata, sitemap, nav, gallery); static server page; native player wiring; runtime and size labels derived from the shipped file; VTT shape; transcript ⇔ captions parity; H.264 High + AAC portrait fast-start MP4; no camera metadata or recording date; not a copy of the Float media and Float still wired to its own; no em dashes; built output exports the route and its media byte-for-byte. |
| `public/videos/hi-motion.mp4` | 1080×1920 H.264 High@4.0, 30 fps, 2-pass 2.2 Mbps, AAC-LC 160 kbps stereo, fast start. 31,393,592 B, 106.134 s. |
| `public/videos/hi-motion.vtt` | 36 WebVTT cues, at most 2 lines of 42 characters, each shown for at least 1 s. |
| `public/images/motion/poster.jpg` | 900×1600 progressive JPEG (mozjpeg q70), 150,414 B, no metadata segments. |
| `qa-reports/2026-10-22_DesignCompile_motion-application.md`, `qa-reports/INDEX.md` | This receipt and the regenerated QA index. |

No existing file outside `qa-reports/INDEX.md` was modified.

### Media pipeline

1. `avconvert -p Preset1920x1080` produced an SDR BT.709 mezzanine with Apple's HDR tone mapping (as /float/).
2. `node_modules/ffmpeg-static` (x264) encoded it:
   - **Video:** `fps=30`, 2-pass ABR 2200k (maxrate 3300k), GOP 60.
   - **Audio:** taken from the source's stereo AAC track, mapped explicitly. In this recording the enabled audio track is 4-channel spatial audio, which ffmpeg cannot decode, so `-map 0:a:0` would be wrong. Then `volume=13.1dB` and `alimiter=limit=0.794:level=false:latency=true`. The limiter's defaults (`level=true`, `latency=false`) would silently undo the −2 dBFS ceiling and delay the audio. Encoded with `aac_at` at 160k.
   - **Output:** every metadata field dropped, bitexact, `+faststart`.
3. Measured results:
   - VMAF against the mezzanine: 86.4 mean, 84.4 at the 5th percentile (/float/: 84.5).
   - A/V offset against the original recording: **0.00 ms** for audio (cross-correlation) and **0 frames** for video.
   - −16.0 LUFS, true peak −1.9 dBFS.

## 5. Verification

| Check | Result |
|---|---|
| `npm run lint` · `npm run typecheck` | clean · clean |
| `npm run build` | static `/motion` route (856 B, same as `/float`) |
| `npm test` (after the build, as CI runs it) | 124 files, **1,148 passed**, 0 failed, 2 skipped (the repo's labelled no-build placeholders) |
| New suite | 13 / 13. Mutation-checked: a wrong runtime label and a changed caption word each fail the intended test. |
| Built `out/motion/index.html` | `noindex, nofollow`; one canonical `https://skypistudio.com/motion/`; own `og:url`; not in `sitemap.xml`; media byte-identical to `public/` |
| Other routes | Pristine `origin/main` build vs candidate: same visible text on all 20 shared HTML pages. Markup differs only in build IDs and chunk hashes. The stylesheet gained one rule (`.mt-3`) and lost none. Sitemap URLs and `robots.txt` are identical. |
| Captions vs spoken audio | Fresh hint-free transcriptions of the **shipped** audio: 300 / 307 caption words identical (SpeechTranscriber), 288 / 307 (DictationTranscriber). Every difference is explained: names, a dropped false start, and words settled by acoustic measurement. |
| Caption timing | All 35 cue boundaries checked against the waveform: 20 at pauses agree with an independent alignment, 15 inside speech are placed on measured landmarks. 35 / 36 cues cover their words (±0.25 s). |
| Camera metadata | Before: GPS and accuracy, make, model, OS version, creation date, timed-metadata track, spatial audio, recording timestamps. After: **0 metadata items**, 2 tracks, all timestamps 0, whole-file byte scan clean. The poster has no APP1 or APP2. |
| Layout: 320 / 375 / 768 / 1024 / 1280 / 1440, light and dark (Chromium); iPhone (WebKit), light and dark | No horizontal overflow; portrait ratio 1.778 kept; transcript beside the video from 1280, stacked below 1280; theme class applied; no autoplay |
| Playback | Chromium: plays H.264/AAC with sound (peak −6.6 dBFS, mean −24.7 dBFS); full playthrough to `ended`, 3,184 of 3,184 frames decoded. WebKit: plays in real time. Both: 36 cues loaded, the correct cue active at every seek point, captions render in the native player. |
| Keyboard | Skip link → rail → native video controls (visible focus ring) → "Read the transcript" (Enter opens, Space closes; 2 px outline) → download → Tokyo Through Time → the work → write to me |
| Reduced motion | Heading at rest (`animation: none`, opacity 1) |
| Reflow / resize | 320 CSS px (400% of 1280), 640 CSS px (200%), 200% text at 1280 and 375: no overflow; video and transcript fit |
| axe-core 4.11 (WCAG 2.0–2.2 A/AA tags) | **0 violations** at 1440 and 375, light and dark. 6 / 4 undecided contrast nodes, the same set as on /float/: site chrome, the ember heading treatment, and a transcript paragraph over the fixed backdrop. |
| Links | Tokyo Through Time, the work and write to me all navigate. The download link serves `video/mp4` (31,393,592 B). |

## 6. LAYER BREAKDOWN

| Layer | Result | Score | Evidence |
|---|---|---|---|
| 1. Tokenization | PASS | — | Existing Tailwind tokens only. The `22rem` portrait column and the arbitrary values are /float/'s. One new spacing utility (`mt-3`) comes from the standard scale. |
| 2. Accessibility Parity | PASS | — | Captions (WCAG 1.2.2), full transcript (1.2.3 media alternative), keyboard (2.1.1), visible focus (2.4.7), reflow 320 px (1.4.10), resize text (1.4.4), named video, link text identifies its target (2.4.4), underlined links (1.4.1), both themes |
| 3. Component Consistency | PASS | Cohesion 18/20 | No new components. Same structure as /float/. The Tokyo line reuses the download line's style. |
| 4. Visual Entropy | PASS | ~86/100 (judgment) | Same three-band rhythm as /float/. The extra Tokyo line is a quiet second link, not a new element type. |
| 5. Luxury UI Score | PASS | ~85/100 (judgment) | The poster's terracotta sun and orange chair sit naturally in the site palette. Copy is short; the transcript reads as quiet prose. |
| 6. Regression Safety | PASS | — | Full and static suites green; built output of all other routes unchanged in content; no shared file touched |
| 7. Compile Decision | **COMMIT** | — | UI done; publication approved by Sky on 2026-10-22 (section 1) |

## 7. Findings and notes

- 🟢 **Fixed during verification:** caption timing. The first cue draft followed SpeechTranscriber's word timings, which run 0.10–0.38 s early in places on this recording, and in one place put "Motion" before a pause it follows. Every boundary was re-measured against the waveform. 12 boundaries were moved, plus 6 cue starts that had missed quiet first consonants and the 2 closing cues. The text was unchanged.
- 🟢 **Fixed during verification:** the first browser rig run measured playback through a reused WebAudio-routed element, which starved the media clock at 8×. Fresh pages play in real time. One later sample was slow under host load; eight repeats were all real time with no buffering events.
- 🟡 **Site-wide, unchanged:** the fixed mobile menu button can overlap the video's top-right corner when the video is scrolled to the top of the screen. This matches every route with media (noted on /float/).
- ⚪ WebKit headless logs "placard" messages for its own media-control icons. These are not site errors and were filtered.
- Copy: "Kelowna, BC, Canada" is spoken, so it appears in the captions and transcript (as on /float/). The Tokyo link says what the film is: "the independent AI-assisted short film I mention in the video". No claim is made about professional work with Motion's product.

## 8. Evidence

`~/SkyPi_Portfolio_Execution_Review/2026-10-22_motion-application-r1/`:

- `README.md` (review package)
- `transcript-for-review.md`
- `captions-vs-audio.md`
- `metadata-before-after.md`
- `media-report.md`
- `screenshots/` (run 3; runs 1–2 kept)
- `rig-report.json`
- `out-diff-baseline-vs-candidate.json`
- `gates/`
- `caption-evidence/`
- `rig/`
