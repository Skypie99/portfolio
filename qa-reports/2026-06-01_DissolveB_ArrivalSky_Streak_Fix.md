# Dissolve-B Arrival-Sky Streak — Cosmetic Polish + Verification — 2026-06-01

**Branch:** `feat/cinematic-desert-2.5d` · **Base HEAD:** `d87ff12` · main untouched, nothing pushed.
**Scope:** One refine-only change to `components/cinematic/plates.ts`. No structural change, no asset regeneration.
**Trigger:** Peter's production verification, `qa-reports/2026-06-01_Peter_3Beat_Descent_Verification.md` §4/§6 — the one cosmetic tell that did not gate the SHIP.

---

## 1. DECISIONS FOR SKY

- [ ] **None blocking.** This polishes the single cosmetic tell Peter flagged (transient arrival-sky streaks during the early part of dissolve B). It does not change the SHIP verdict; it removes the last "worth a future pass" footnote so the production push is flawless. Merge `feat/cinematic-desert-2.5d` → `main` remains **Sky-only** (Const. Art. 1/5); this change is self-contained in `plates.ts`.
- **FYI (concurrent work):** a parallel `perf/auto-2026-06-01` agent is on the shared tree encoding the planes to `.avif/.webp` and has an untracked `scripts/fix-arrival-sky.mjs` — i.e. an attempt at the asset-level **Fix 3** for this *same* streak. My timing fix (below) and an eventual clean `arrival-sky.png` are **complementary**, not conflicting: if the asset is later re-separated streak-free, the 0.70 delay is harmless (it still reads as a clean resolve). See §6.

---

## 2. THE FIX (one number + a comment)

**Chosen: Fix 1 — delay the arrival group's fade-in so the streak-bearing sky plane stays hidden until it is covered.**

```
ARRIVAL_SCENE.fadeIn.start :  0.66  →  0.70      (end stays 0.80)
ARRIVAL_SCENE.range.start  :  0.62  (UNCHANGED — the dolly still begins early)
```

That is the entire functional change. `range` (which drives the cliff's depth push) is untouched, so the forward dolly still begins at p0.62 and runs continuously *under* the dissolve; only the *opacity reveal* of the arrival group moves 4% later.

### Why this works (root cause → mechanism)
The arrival **sky** plane (`public/images/cinematic/arrival-sky.png`) carries faint vertical inpaint streaks at the frame-top — the source cliff reaches the top of frame, so separation had no clean sky to seed there. The engine cross-dissolves the arrival **group** (sky + cliff + fg share one group opacity), so as the group faded in from p0.66 the streak-bearing sky became visible *before* the cliff wall had scaled up enough to cover the upper frame and *before* the haze peaked — exposing the streaks over p~0.65–0.72 (worst ~p0.67). Delaying the group fade-in to p0.70 keeps that plane at **0 opacity through the worst window**, and by the time it appears the haze is already dense and the cliff is rising — so the streaks are never perceptible. MID holds opaque underneath (incoming-only dissolve), so the later reveal opens **no gap**.

### Why not Fix 2 (retime haze) or Fix 3 (re-separate the asset)
- **Fix 2 (haze) was rejected on geometry.** `.cdesert-haze--1` is anchored `bottom:0; height:62%` with its gradient peaking at 45% of that band — the haze lives in the **lower-middle** of the frame. The streaks are in the **upper third**, where the haze barely reaches. Retiming/denser haze would chase a symptom with a veil that doesn't cover where the streaks are. Fix 1 is the geometrically correct fix: it removes the streak-bearing plane from the exposed window entirely.
- **Fix 3 (re-separate `arrival-sky.png` with a cleaner top-row seed) is the best long-term fix**, but it regenerates a committed binary asset and is out of scope for a "refine-only, no structural change" pass. Recommended as a follow-up (a parallel agent may already be on it — see §1). Fix 1 stands on its own and is also a good belt-and-suspenders guard even after Fix 3 lands.

---

## 3. GATES (all green)

| Gate | Result |
|---|---|
| `npm run typecheck` | **PASS** — `tsc --noEmit` clean (exit 0). |
| `npm test` | **PASS** — 17 files, **110 passed / 1 todo** (matches Peter's baseline). Cinematic reduced-motion test green. |
| `npm run build` | **PASS** — static export, all 15 routes; home 51 kB / First Load JS 197 kB (matches baseline). |
| prebuild `validate-assets` | **PASS** — "all 9 cinematic real plate PNG(s) found" + 6 cert badges. |
| `__cdesert` hook stripped from `out/` | **CONFIRMED** — `grep -rl "__cdesert" out/` → 0 files (the lone `.freeze` hit in the bundle is `Object.freeze`, library code, not the dev hook). |

No test asserts the `0.66` value (the cinematic test is scene-agnostic), so the change broke nothing.

---

## 4. VISUAL VERIFICATION (self-launched headless Chrome)

**Method:** Per the Claude_Preview→AccessMap misresolution, I drove a self-launched **system Chrome `--headless=new`** on a dedicated CDP port **9333** with its own `--user-data-dir` (and `--remote-allow-origins=*`, which Chrome 148 now requires for the DevTools WS upgrade). Pure-Node WebSocket CDP driver (reused Peter's machinery, zero deps). `npm run dev` on :3000. Each frame frozen via the dev-only `window.__cdesert.freeze(p)` hook. **Pre-warmed** to p0.85→p1.0 first so the lazy `arrival-sky.png` was decoded *before* sampling — otherwise "no streaks" could be a false pass from an unloaded image. Ground truth read from computed styles; full frames + 2× upper-third crops captured.

### Ground-truth state at the dissolve-B keyframes (AFTER)

| p | arrival group op | sky effective alpha | haze1 | sky img loaded | cliff scale | upper-frame read |
|----|------|------|------|------|------|------|
| 0.65 | 0 | **0** | 0.27 | ✓ (nw 3360) | 1.120 | clean MID sky, no raking |
| 0.67 | 0 | **0** | 0.38 | ✓ | 1.122 | clean MID sky — **the streaks Peter saw here are gone** |
| 0.70 | 0.012 | 0.012 | 0.52 | ✓ | 1.128 | clean; sky plane ~invisible behind dense haze |
| 0.73 | 0.306 | 0.306 | 0.58 | ✓ | 1.148 | cliff resolving **IN through haze** (the vertical texture is the *real fluted sandstone*, not inpaint); clean sky sliver |
| 0.77 | 0.882 | 0.882 | 0.58 | ✓ | 1.210 | fluted wall covers the top, fully resolved — matches Peter's "gone by p0.77" |

- **Decisive:** the streak-bearing `arrival-sky.png` is *confirmed loaded* (naturalWidth 3360) at every keyframe, yet its effective alpha is **exactly 0 at p0.65 and p0.67** — the original worst point is now fully suppressed. By the time it appears (p0.70: 1.2%), haze1 is already ~0.5 dense.
- **Continuity preserved:** the cliff scale climbs monotonically 1.120 → 1.210 across the window (the dolly never stalls), and the leap still "resolves IN through haze" at p0.73 exactly as designed.
- **Console:** **0 errors, 0 warnings** across all five keyframes.

**Screenshots (AFTER):** `/tmp/cdesert-fix/after-p{65,67,70,73,77}.png` + `-top.png` 2× crops. **BEFORE baseline** (the artifact) for A/B: Peter's `/tmp/peter-3beat/extra-p67.png` + `crop-dissolveB-streak.png`. Side-by-side of the p0.67 full frame: the BEFORE shows vertical raking in the sky above the spires; the AFTER shows a clean smooth sky (the streak-bearing plane is at 0 opacity).

---

## 5. VERDICT — **POLISH CONFIRMED**

The transient arrival-sky streak is eliminated across the entire dissolve-B exposed window (p0.65–0.70 now render the streak plane at 0 opacity; p0.73+ reveal it only through dense haze as the cliff covers the top). The descent still reads as one continuous forward dolly, the leap still resolves IN through haze, and all three gates stay green with the dev hook stripped from `out/`. Ready for Sky's production merge.

---

## 6. RECOMMENDED FOLLOW-UP (non-blocking)

- **Fix 3 (asset):** re-run `scripts/separate-scene.mjs` for the arrival beat with a cleaner top-row sky seed / wider inpaint so `arrival-sky.png` has no vertical streaks at rest. This is the permanent fix; the 0.70 timing delay then becomes a harmless safety margin. Coordinate with the `perf/auto-2026-06-01` agent, which already has an untracked `scripts/fix-arrival-sky.mjs` in flight (do not double-apply).
- **Lockfile note:** the named dissolve-B window in `designs/AESTHETIC_LOCKFILE.md` §4 is p~0.66–0.80; this fix starts the *visible reveal* at 0.70 (later, never earlier — cannot trip an "arrives early" drift). Same class of cosmetic doc-number reconcile Peter flagged for the title (carves 0.84 vs named 0.80). Worth reconciling the doc number when convenient.

---

## 7. PROCESS NOTE (shared-tree hygiene)

The shared working tree was switched to `perf/auto-2026-06-01` by a parallel agent mid-task. To land my change on the task's target branch without disrupting that agent, I committed via a **dedicated `git worktree` on `feat/cinematic-desert-2.5d`** (never switched the shared tree's checked-out branch), staged **only my two files** (never `git add -A`), then restored the shared tree's `plates.ts` so no trace was left on `perf/auto`. Did **not** push; did **not** touch `main`.

— Verification pass, last cosmetic polish before Sky's production merge.
