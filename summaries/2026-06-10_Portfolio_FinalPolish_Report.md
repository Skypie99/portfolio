# Portfolio Final Polish — 2026-06-10

**Branch:** `polish/portfolio-final-2026-06-10` (7 commits off main `c3087ad`) — **NOT merged, main is yours.**
**Gates on tip `4a6aaf5`:** lint 0 errors / 0 warnings · typecheck 0 · **184 tests** passed (+5 new vs the 179 baseline) · build clean · test:static green.
**Intro:** untouched — marker-to-EOF checksum `4de1a4315b5cc7301071ff38967109c94704b46d` identical to main after every commit; pathset diff over `components/cinematic/**`, `CinematicIntro.tsx`, `fonts.ts`, `tokens-phase2.css`, `cinematic-masters/`, `public/images/cinematic/` is empty; `--sidebar-w` untouched.

---

## DECISIONS FOR SKY

1. **Is the Dashboard product #6?** The copy claimed "Five products live. All open source." in three places while the site now ships six case studies (and /work says "6 deliverables"). I applied the safest reversible fix: **count-free copy** — hero "Every product live on the open internet.", showcase "Real products on the open internet.", footer "Built in public, live on the open internet." All true regardless of how you classify the Dashboard. **If you want it counted:** flip the three strings to "Six…", add a Dashboard GitHub link to `deliverables.json` (needs the repo URL from you — without a public repo, "All open source" would be false), and approve a 6th showcase stat cell (spec ready: one chip object + `lg:grid-cols-6`; you pick the stat).
2. **No-JS grids (follow-up, not done):** `WorkFilterGrid` and `AnimatedCertGrid` still SSR `opacity:0` on their cards (framer useInView). Fine with JS; `scripting:none` visitors see empty grids below now-visible H1s. Fixing it touches the filter/AnimatePresence interaction code, so it's a separate proposal — recommend it as the first item of the accessibility deep-dive.
3. **In-body "See it in motion" galleries** remain designed placeholders on 5 of 6 studies (dashboard has 3 real shots). One-line `deliverables.json` swaps whenever you have screenshots.
4. **SVG OG images on sub-pages** — pre-existing, unchanged, still flagged.

---

## WHAT CHANGED (BEFORE → AFTER)

**1. `fix(settle)` — the one real bug of the pass.** The framer-motion title/hero mount animations SSR'd inline `opacity:0` into every exported page. BEFORE: reduced-motion visitors got **permanently invisible H1s and case-study heroes on every hard load of all 8 routes** (framer's server/client reduced-motion branch mismatch leaves the baked style unpatched — a locked-floor violation that has been live for weeks), and no-JS visitors the same (the `scripting:none` block never reached inline styles). AFTER: HeroSettle is a server component; the identical motion (timings/easings byte-equivalent, from the same tokens) runs as pure-CSS keyframes gated behind `prefers-reduced-motion: no-preference`; markup carries the visible final state. New test guard: no inline opacity may ever reach SSR markup again.

**2. `polish(grids)` — the sixth case study broke every grid rhythm.** BEFORE: Mutual Mesh dangled half-width beside a bare cell on home AND /work; the showcase strip dangled its 5th cell at mobile/tablet; GitHub orphaned onto its own line on mobile cards. AFTER: home's odd trailing card renders in the featured horizontal layout (grid bookends — verified gorgeous in both themes); /work's odd trailing card centers at track width (covers all odd filter counts incl. filtered-to-1); the 5th chip spans its row at 2/3-col; Live+GitHub wrap as one grouped unit. All rules self-disable at even counts.

**3. `polish(pills)`.** BEFORE: the `bg-accent/22` tag variant measured 1.32:1 against the card — REACT/VITEST/HTML read as bare text beside pilled siblings; the same tag changed color across surfaces (blog's lowercase tags hash to different tone buckets); /work offered both TOOLS and TOOLING filters, each matching half the relevant work. AFTER: accent pills at `/30` (family parity 1.46/1.57 vs rose's 1.48/1.58; text 8.3–9.4:1 AA both themes — measured live); blog.json tags cased to match cards; one `tools` filter matching all four projects.

**4. `polish(copy)`.** Count-free product claims (Decision 1); footer SITE column gains **Notes** (was the only nav surface missing it); **GitHub/LinkedIn** proper brand casing (was "Github"/"Linkedin" via CSS capitalize); `/certificates` H1 + metadata → **"Credentials"** (every other surface already said it).

**5. `polish(hero)`.** BEFORE: landscape real-shot heroes floated letterboxed in the portrait 4/5 well — the Dashboard's 3200px screenshot rendered **397px wide, smaller than its own gallery thumbnails**. AFTER: window/plate real-shot heroes get a 4/3 well + 94% frame width (fill goes 47%→79%); phone heroes byte-identical; the two designed empty states verified pixel-unmoved. Zero CLS (aspect is build-time static from JSON-known data).

**6. `chore(params)`.** Both [slug] routes await `params` per Next 15 — dev console clean of deprecation warnings; zero visual delta.

---

## HONESTY-GATE VERDICT

**My own walk misread, corrected by adversarial verification (important):** I initially diagnosed "titles frozen forever on production direct loads for everyone." The 28-agent verification fleet **refuted the universal claim**: Chrome suspends rAF in hidden tabs, and my automation tabs were hidden — my own "frozen" tab settled 1.5 s after being foregrounded. What was *actually* broken (and is now fixed) is narrower but real: RM users permanently, no-JS users permanently, background-opened tabs until first view. The fix is the same; the severity claim is corrected here for the record.

**Checked and deliberately left alone:** the intro (read-only quality bar — byte-identical); the dark footer's terracotta GitHub link (documented intent: "elevated brand presence"); scroll-spy bottom-of-page behavior (correct — my earlier read was mid-transition); contact's "socials below" copy (accurate, links exist); the drop-cap "I've" (standard ::first-letter); reveal timing on real click-navigation (instant — slow reveals were an automation artifact); the four directions, light-reveal alphas, dark arc, spotlight dimming, Notes naming, email obfuscation, 404 surface, tabular numerals, method/about/contact/Notes/post surfaces, hamburger menu, mobile layouts — **walked fresh in both themes at both widths: done.**

## ALEX VERIFICATION (measured)

- **Reduced motion:** built CSS proves settle animations exist *only* inside `@media (prefers-reduced-motion: no-preference)`; live rest-state probe (animation disabled ≡ RM): H1 opacity **1**, letter-spacing −0.02em, hero well opacity **1**, no transform. RM visitors see everything.
- **Contrast (no token/surface/sky values were changed anywhere — full dn-sweep not triggered):** accent pill text-ink vs composited pill: **9.43:1 light / 8.28:1 dark** on card, 8.99/9.28 on canvas — all ≥4.5:1 with margin. Pill presence 1.46/1.57 = family parity.
- **Keyboard:** footer Notes link reachable with visible terracotta focus ring (screenshot-verified); grouped Live/GitHub anchors keep byte-identical `focus-visible` classes.
- **scripting:none:** zero `<h1 style="opacity:0` in the export (grep across out/); the settle entrance is pure CSS so it even *animates* without JS; `.reveal` fallback intact. Remaining known gap = Decision 2 (grid `<li>`s, deferred).
- **Console:** zero messages on walked pages (static export).

## SECOND SWEEP

Full re-walk on the production static export, light + dark, 1440 + 390: hero/showcase copy live, wide Mesh bookend verified both themes, /work lone card centered both themes, single tools filter, 4/3 Dashboard hero with legible screenshot, claude-corp/prompt-library empty states unmoved, accessmap/mutual-mesh phone heroes unchanged, Credentials H1 over the dark world, footer (Notes + casing + copy) verified with focus ring, mobile chip span (159|159 / 319 full-row) and grouped link wrap (Live+GitHub same line) measured. **Nothing further caught — the walk is clean. Stopped.**

## LOCKED FLOOR — HELD OR RAISED

AA contrast both themes incl. over the world (no color/alpha/sky/token edits outside the verified pill; measured where touched) ✓ · **prefers-reduced-motion: RAISED** (was broken for titles/heroes; now correct) ✓ · **scripting:none: RAISED** (H1s/heroes now visible; grids remain as before, flagged) ✓ · dark arc ✓ · light gentle reveal ✓ · whisper card spotlight ✓ (untouched, re-witnessed both themes) · ProductReveal empty states ✓ (pixel-verified) · View Transitions + scroll-spy ✓ (click-navigated throughout) · motion vocabulary ✓ (settle timings byte-equivalent; no new motion systems) · no new dependencies ✓ · intro byte-identical ✓.

## HOW TO REVIEW

```
cd ~/Portfolio
git diff main..polish/portfolio-final-2026-06-10        # 7 commits, ~300 lines
git log --oneline main..polish/portfolio-final-2026-06-10
```
A prod-fidelity build of the branch is being served at **http://localhost:3005** (static export). Live checklist — both themes, both widths, reduced-motion ON for at least one pass:
1. Hard-load `/work/dashboard/` with **Reduce Motion on** (Settings → Accessibility → Display) — title and hero must be visible. This was the bug.
2. Home → scroll the work grid: Mutual Mesh as the full-width closer; hero/showcase/footer copy.
3. `/work/` → filter `tools` (4 results), then any 1-result filter (centered card), then All.
4. `/work/dashboard/` + `/work/ghost-code/` heroes (wider, legible) vs `/work/claude-corp/` + `/work/prompt-library/` (empty states — should look exactly as before) vs `/work/accessmap/` (phone — unchanged).
5. Cards: REACT/VITEST/HTML pills now visibly terracotta; tag colors match between work cards and the Notes post.
6. Footer: Notes link, GitHub/LinkedIn casing. `/certificates/`: "Credentials" H1.
7. 390 px: showcase strip (no bare cell), featured card links (Live+GitHub wrap together).

— Dani (diagnosis + sweeps) · Shamus (implementation) · Alex (verification) · adversarial verification by the diagnosis fleet
