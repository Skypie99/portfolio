# AESTHETIC LOCKFILE — Cinematic Desert 2.5D

**Status:** LOCKED · **Branch:** `feat/cinematic-desert-2.5d` · **Authored:** 2026-06-01 (Archivist)
**Scope:** This file is the aesthetic ground truth for the one-shot scroll-scrubbed desert title scene. Every later stage (build, polish, guard) is measured against it. It does **not** change the engine's mechanics — it tells the engine what to *look* like.

> **THE BAR (Sky's words):** *"extremely cinematic and breathtaking — I want to really stand out with this portfolio."*
> Production build, goes live. Restraint · flawless continuity · real depth · filmic light. Hold this.

**Reference look (locked vocabulary):** warm ochre / faded red / sun-bleached neutrals · deep umber shadow · Wes-Anderson centered symmetry · Villeneuve scale · New-Topographics tonal weight · archival Kodachrome grade. Muted, not saturated. Print, not screen.

---

## 0. SOURCE FRAMES (measured, 3360×1440, Midjourney paid — cleared to ship)

| Beat | File (`public/images/cinematic/source/`) | What it is |
|---|---|---|
| 1 · DAWN | `dawn-vistaHD.png` | Cool blue-hour Monument Valley vista. Big mesa upper-LEFT, butte cluster RIGHT, valley receding to central spires, foreground rock cluster + scrub. Soft blue→lavender→peach horizon. |
| 2 · MID | `mid-approachHD.png` | Same valley, pushed closer, warm low golden-hour. Lit mesa upper-LEFT, big lit butte RIGHT, twin central spires dead-center on horizon. Terracotta foreground, golden grass clump LEFT. |
| 3 · ARRIVAL | `Arrival-Cliff.png` | Golden close-up of a fluted red sandstone cliff WALL filling the frame. Crest ridge upper-left→mid-right. Thin pale-blue sky sliver at top. Talus + sand foreground. |

**Engine state note (for the build stage):** `plates.ts` today ships only `DAWN_SCENE` (3 planes). The 3-beat journey below is the **spec to extend to** — a multi-scene push with two cross-dissolves on the single scrubbed timeline. Keep the existing transform model (`scale` + `yPercent` + opacity `[p0,p1]` over progress `p`); add beats 2 & 3 as plane stacks that ramp in on their dissolve windows. Do not introduce per-frame listeners or a second timeline.

---

## 1. THE 3-BEAT ARC — one continuous camera push, NO cuts

The camera never stops and never cuts. It is a single forward dolly through one place, time-lapsing from blue-hour to gold as it travels. Emotional throughline: **dark / vast → waking → arrival.**

**BEAT 1 — DAWN (`p ≈ 0.00 → 0.40`) · *the deep cold quiet***
Composition: full vista, maximum negative space, the valley receding to central spires. Mood: still, vast, pre-dawn hush — you are small and the land is enormous. Light: lowest exposure of the whole piece; readable **silhouettes only**, cool wash deepening the frame. The eye finds the faint warm horizon and waits.

**↳ DISSOLVE A — dawn → mid (`p ≈ 0.34 → 0.46`) · *near-seamless***
Same valley, same central-spire lock, so this reads as the *light changing and the camera closing distance*, not a scene change. Cross-dissolve mid plane in over this window; dawn planes fade as mid planes resolve. No visible seam, no flash.

**BEAT 2 — MID (`p ≈ 0.40 → 0.72`) · *the waking***
Composition: same valley pushed closer, the central spires now larger and dead-center, foreground terracotta and grass rushing toward us. Mood: warming, momentum, the world coming up. Light: warmer and **lower** than a real daytime photo — graded down so it *bridges* dawn→arrival (see §4). This beat must never spike to bright midday; it is the gentle middle of the ramp.

**↳ DISSOLVE B — mid → arrival (`p ≈ 0.66 → 0.80`) · *the one real leap***
Valley → cliff is the only true subject change. **Sell it, don't cut it:** push + dissolve so the cliff resolves *in through haze and light*. Haze bands swell into this window and clear as the cliff lands; the warm exposure lifts through the dust so the wall emerges already golden. The viewer should feel they *arrived at* the cliff, not that a slide changed.

**BEAT 3 — ARRIVAL (`p ≈ 0.74 → 1.00`) · *the resolve***
Composition: the fluted cliff wall fills the frame, talus settling in foreground, sky sliver at top. Mood: warmth, scale, having reached somewhere. Light: golden raking, the richest of the piece. The title **"SkyPi Studio"** carves in late (`p[0.80, 0.96]`, already wired) and **HOLDS** to `p=1`. The descent ends in gold and stillness.

---

## 2. PALETTE — locked per beat

Muted Kodachrome, never neon. Shadows go **umber**, never black-gray; highlights go **warm bone**, never clinical white. Saturation stays restrained — these are *faded* reds, *sun-bleached* neutrals.

### BEAT 1 — DAWN (cool indigo / plum / peach)
| Role | Hex | Notes |
|---|---|---|
| Sky high | `#2B3A6E` | cool indigo, top of frame |
| Sky mid | `#3A2356` | plum / violet band |
| Horizon glow | `#E8A878` → `#F0C49A` | warm peach band at the central horizon (the *only* warmth in beat 1) |
| Mesa/butte (lit) | `#7A4A3C` | dusty desaturated rose-terracotta |
| Land shadow | `#1B1740` | deep cool umber (matches `--color` pre-dawn fallback `#1B1740`) |
| Foreground rock | `#6E4438` | muted brick, low light |

### BEAT 2 — MID (warm ochre / terracotta)
| Role | Hex | Notes |
|---|---|---|
| Sky | `#5C7CB8` → `#9CC` (soft) | warm-leaning daylight blue with cirrus — **graded down**, not brilliant |
| Lit rock face | `#C06A3A` | terracotta, sunlit |
| Mid butte shadow | `#5A2E1E` | warm umber |
| Foreground earth | `#B85A2E` | saturated-but-faded terracotta |
| Grass clump | `#C8A23C` → `#A8862E` | golden dry grass, left |

### BEAT 3 — ARRIVAL (golden terracotta / umber)
| Role | Hex | Notes |
|---|---|---|
| Cliff highlight (raked) | `#D8843C` | golden terracotta, the warmest plane in the piece |
| Cliff body | `#B5582A` | faded red sandstone |
| Cliff flute shadow | `#5A2E1E` → `#28120A` | umber → near-umber-black in the deepest flutes |
| Sky sliver | `#A8C0D8` | thin pale cool blue at top — the last cool note, by contrast it warms the rock |
| Talus / sand | `#C2754A` | warm sand foreground |
| Title text | `#FFF6EC` | warm bone near-white (already set; ≥4.7:1 over terracotta + shadow) |

**Grade overlay (`--cdesert-grade-mix` 0→1) already encodes this hue arc** — cool wash `rgba(43,58,110)/rgba(58,35,86)/rgba(27,23,64)` at `mix=0`, warm `rgba(255,214,150)/rgba(224,140,82)/rgba(150,84,46)` at `mix=1`. Keep these tones; they ARE the locked palette in motion. Do not brighten the warm endpoint past `0.46` peak alpha (oversaturation guard).

---

## 3. PER-FRAME SUN — where the light actually lives

**Law:** the in-engine glow/bloom must rake **FROM** the sun position that is true for the currently-dominant plate. Light from the wrong place = drift (§7). Positions are fractions of frame W×H, origin top-left.

| Beat | Sun / brightest point (x, y) | Rake direction | In-engine action |
|---|---|---|---|
| 1 · DAWN | **x ≈ 0.50, y ≈ 0.62** (warm glow dead-center on the horizon; sun rising center-of-frame) | bloom emanates UP from center horizon | `.cdesert-sun` must sit **center** (`left:50%`) for the HD dawn plate — see ⚠ below |
| 2 · MID | x ≈ 0.62, y ≈ 0.40 (raking from upper-right; left faces of buttes are the lit faces) | warm key from upper-right, long shadows pulling left | glow drifts toward upper-right as mid dominates; warm side-key, not a centered bloom |
| 3 · ARRIVAL | **x ≈ 0.70, y ≈ 0.30** (warmest band on the upper-right crest; right-facing flutes lit gold, left flanks umber) | hard-ish golden rake from upper-right | sun-bloom + halation crest upper-right as the cliff lands (`p≈0.85`) |

> ⚠ **LOCKED CORRECTION (build stage must apply):** `app/globals.css` currently parks `.cdesert-sun` at `left:17%` / `bottom:6%` — that x≈0.17 was measured against the *old* `dawn-vista.png`. The NEW `dawn-vistaHD.png` rises **center (x≈0.50)**. Move the dawn-phase bloom center to `left:50%` (`margin-left:-35vmax` already centers a 70vmax bloom). Then let the bloom **travel** toward x≈0.70 as the push crosses into MID/ARRIVAL so the light source tracks the dominant plate. A sun parked at 17% over the new center-horizon dawn is a hard BLOCK at guard.

The continuous read: glow is born at the **center** horizon (dawn), drifts **right and up** as we travel into warmer light, and crests at the **upper-right** on the cliff — one sun moving through one sky, never teleporting.

---

## 4. EXPOSURE / GRADE TARGETS — the darken→lighten curve

Sky's explicit request: a **single continuous exposure ramp** that darkens the start and lifts **SLOWLY** to golden across the whole descent. Driven by `--cdesert-expose` (0→1) and `--cdesert-grade-mix` (0→1) on the one scrubbed timeline, both on `sine.inOut` (already wired) so hue + exposure move as one sunrise with no banding.

**Curve shape (authored against `p`):**

```
exposure
(luminance)        ARRIVAL gold ceiling ──────────●  p=1.00
   ▲                                        ╭─────
   │                                   ╭────╯  ← lift accelerates only here (B → arrival)
   │                          MID band ╭╯
   │                    ╭────────╮────╯  ← MID held LOW/WARM: a gentle plateau, NOT a daylight spike
   │            ╭───────╯
   │     ╭──────╯  ← slow lift through dawn (silhouettes only)
   ●─────╯
   └────┬────────┬────────┬────────┬────────┬──▶ p
       0.0      0.2      0.4      0.6      0.8   1.0
   DEEP/COOL/DARK         (DISSOLVE A)   (DISSOLVE B)
```

| `p` | `--cdesert-expose` (≈) | `--cdesert-grade-mix` (≈) | Reads as |
|---|---|---|---|
| 0.00 | 0.00 | 0.00 | deep pre-dawn — cool wash DEEPENS frame; silhouettes only, faint warm horizon |
| 0.20 | 0.12 | 0.12 | first lift; land still reads as shape, not detail |
| 0.40 | 0.30 | 0.34 | dawn handing to mid; warmth arriving at the horizon |
| 0.55 | 0.42 | 0.50 | **MID midpoint — held WARM but LOW**. Graded down vs a real daytime photo so it *bridges*. No bright spike. |
| 0.72 | 0.58 | 0.68 | mid handing to arrival; dust catching gold |
| 0.85 | 0.82 | 0.86 | cliff landed; sun-bloom halation peak; richest warmth blooming |
| 1.00 | 1.00 | 1.00 | full golden — warm wash LIFTS midtones/highlights; glow breathes; title holds |

**Hard rules:**
- **MID must be graded warmer + lower than its raw source.** The raw `mid-approachHD.png` is a bright sunlit photo; on the timeline it must sit on the **gentle plateau** above so the journey reads as one slow sunrise, not day→dusk→day. **No bright-daytime luminance spike anywhere in the middle third.**
- Exposure overlay stays an `overlay` blend (darkens where dark at `p=0`, lifts where light at `p=1`) — never a flat brightness multiply that would wash detail.
- The lift is **monotonic** (never dips back down) and **slow** — most of the gold arrives in the last ~25% (`p>0.74`), so arrival *earns* its warmth.

---

## 5. GRAIN — a whisper, present but never noisy

- Static baked grain (`feTurbulence` `fractalNoise`, 3 octaves, `baseFrequency 0.65`), **opacity locked to ≈ 0.03–0.04 effective texture.** Current `.cdesert-grain { opacity: 0.07; mix-blend-mode: overlay }` — over `overlay` this reads softer than the raw number; the **target perceived grain is 0.03–0.04**. If it ever reads as visible noise/crawl, dial the opacity down (not up). Texture, not snow.
- **Never animate the turbulence** (GPU killer — bake once, leave it). Motion in the grain field = drift.
- Vignette: warm-black archival print falloff (`rgba(30,14,6)`→`rgba(20,9,3)`, corner ≤0.55) — pulls the eye to center, must **not** read as a tunnel/porthole.
- Warm tint (`rgba(255,196,128,0.05)` soft-light) + ≤16 slow dust motes (delicate floating dust catching light — **not** bokeh, **not** snow). Mote count is capped at 16; do not add more.

---

## 6. SYMMETRY / COMPOSITION LAW

- **Centered framing.** The vanishing read and the title are centered. Wes-Anderson stillness: the camera is square to the world, no dutch tilt, no off-axis drift.
- **Vast negative space**, especially in DAWN — the emptiness is the point; resist filling it.
- **CENTRAL-SPIRE LOCK (the continuity hinge):** the twin central spires sit dead-center on the horizon in **both** dawn and mid. This shared anchor is what makes DISSOLVE A read as one continuous move. The build stage must keep the central spires **registered at the same x** across the dawn→mid crossfade — if they jump horizontally, the seam shows. This lock is load-bearing; verify it at guard.
- Title (`top:58%`, centered, Cormorant 300, `letter-spacing 0.06em`) is the only typography. Minimal, cinema-first. No subtitle, no UI chrome, no buttons inside the takeover.
- Horizon stays roughly level across beats (no rolling horizon) so the dolly feels like forward travel, not a pan.

---

## 7. WHAT COUNTS AS DRIFT — the no-list (any one = BLOCK)

A later stage that introduces any of these has drifted from the locked aesthetic:

1. **Modern UI intrusion** — buttons, cards, chips, badges, scrollbars, cursors, or any web-chrome inside the cinematic takeover. It is a film frame, not a page.
2. **Cartoony flatness** — flat vector look, hard poster edges, missing depth/atmosphere, planes that look pasted rather than atmospheric. We want photographic weight (New Topographics), not illustration.
3. **Harsh midday light** — a bright high-sun daytime look anywhere, *especially* a luminance spike in BEAT 2. The middle must stay on the warm/low plateau (§4).
4. **Visible plane seams or halos** — hard cut lines between depth planes, white/dark fringing on transparent PNG edges, or a matte halo around separated subjects. Edges must be feathered into haze.
5. **A hard cut between beats** — any instant scene swap. Both transitions are **cross-dissolves through light/haze** on their `p` windows (Dissolve A `~0.34–0.46`, Dissolve B `~0.66–0.80`). A cut = immediate BLOCK.
6. **Oversaturation** — punchy, neon, Instagram-HDR reds/oranges. Palette is *faded* Kodachrome (§2). If a red glows like candy, it's wrong. Shadows must go umber, not crushed black.
7. **Light from the wrong place** — bloom/rake originating anywhere other than the per-frame sun (§3): dawn ≈ center horizon, mid ≈ upper-right, arrival ≈ upper-right crest. The current `left:17%` sun over the new center-horizon dawn plate is the canonical example of this drift — must be fixed.
8. **Exposure that dips or jumps** — the ramp must be monotonic and slow (§4). Any backward dip in brightness, any sudden step, or gold arriving too early breaks the "one continuous sunrise."
9. **Broken continuity of the central-spire lock** — the dawn↔mid central spires drifting in x across Dissolve A (§6). Reveals the seam.
10. **Grain as noise** — visible/crawling grain, animated turbulence, or grain dialed up past a whisper (§5).
11. **Lost negative space** — clutter or props added to fill the vista; tighter crop that kills the Villeneuve scale.
12. **Title regressions** — title not centered, wrong face (must be Cormorant 300), arriving early/snapping instead of carving `p[0.80,0.96]`, or not holding to `p=1`; contrast below 4.7:1.

---

### CHECKLIST (guard runs this verbatim)
- [ ] One continuous push, **zero cuts**; two cross-dissolves on their `p` windows.
- [ ] Palette matches §2 per beat; faded Kodachrome, umber shadows, no oversaturation.
- [ ] Sun rakes from §3 per beat; dawn bloom **centered** (not 17%), travels right→up into arrival.
- [ ] Exposure monotonic + slow (§4); **MID held warm/low**, no daytime spike; gold lands late.
- [ ] Grain a whisper (≈0.03–0.04 perceived), static, no crawl.
- [ ] Centered symmetry; vast negative space; **central-spire lock holds** dawn↔mid.
- [ ] No modern UI inside the takeover; title carves `p[0.80,0.96]` and HOLDS.
- [ ] Gates green: `npm run typecheck` · `npm test` · `npm run build`.

*This lockfile is the north star. When a downstream choice is ambiguous, choose restraint, continuity, and the warmer/darker read.*
