# FINAL POLISH PLAN — 2026-06-10

The deep final polish pass: fresh-eyes walk of the entire live site (both themes, 1440 + 390, prod static export + dev), every page including all six case studies, click-navigated through the filmic transitions. Every candidate finding below was located in code and **adversarially verified** (28-agent fleet: root-cause, per-territory locators, per-finding refuters). Items that turned out to be intent or measurement artifacts are in the honesty-gate ledger at the bottom — several of my own walk claims were corrected there.

Branch: `polish/portfolio-final-2026-06-10`. Intro protected (checksum `4de1a431…`, marker-based). Gates after every commit.

---

## RANKED FIX LIST

### 1. Settle animations: real invisibility bugs for reduced-motion and no-JS visitors — `fix(settle)` ★ top item
**WHERE:** [components/HeroSettle.tsx](components/HeroSettle.tsx) (all 140 lines) — the single mechanism behind every route H1 (`SettleHeading` ×7 pages + 404) and the case-study hero (`HeroTitleSettle`/`HeroImageSettle`, app/work/[slug]/page.tsx:212,240).
**WHAT (verified, two real bugs):**
- **(a) Reduced-motion + hard load = H1/hero invisible FOREVER.** Framer SSRs the `initial` state inline (`style="opacity:0;…"` baked into every exported HTML file — verified in `out/`). For RM users, `useReducedMotion()` is `null` on the server (motion branch rendered) but `true` on first client render (plain branch rendered); React 18 production hydration does not patch the attribute mismatch, so the baked `opacity:0` survives on an element no animation will ever touch. **This violates the RM locked floor today.**
- **(b) scripting:none hole.** The no-JS fallback at globals.css:739 covers only `.reveal`/`.reveal-carve` — not these framer inline styles. No-JS users get invisible H1s and heroes on all 8 routes.
- (c) Mount tweens are rAF-driven; pages opened in background tabs hold `initial` until first foregrounded (minor UX nicety that the same fix removes).
**FIX:** Convert HeroSettle.tsx to a **server component** rendering plain elements with CSS entrance classes (`.settle-heading`, `.hero-settle-title`, `.hero-settle-img`), per the existing `.hero-enter` idiom (globals.css:442 — itself a prior framer→CSS conversion). One new globals.css block inserted after the `.reveal` scripting:none block (~line 746, far above the protected 1392 boundary): `@keyframes settle-title/settle-img` (from-only keyframes; **rest state = visible final state**), animations gated inside `@media (prefers-reduced-motion: no-preference)`. Timing/easing byte-equivalent via existing tokens: `--ease-entrance` = [0.16,1,0.3,1], `--ease-out` = [0.22,1,0.36,1], `--dur-slow` 520ms, `--dur-reveal` 900ms, 560ms literal, 150ms delay. API + all 8 call sites unchanged (`restLetterSpacing` becomes `--ls-rest` custom property).
**Tests:** rewrite components/__tests__/HeroSettle.test.tsx (drop framer mock; assert classes, h1 tags, `--ls-rest`, and the regression guard: **no inline `opacity` in SSR markup**). Optional static-integrity assertion: no `out/**/index.html` ships `<h1 style="opacity:0`.

### 2. Grid dangles + links wrap — `polish(grids)`
- **Home #work grid lone card** ([app/page.tsx:196](app/page.tsx)): 5 non-featured cards in 2-col → Mutual Mesh half-width beside a bare cell. Fix: odd trailing card gets `md:col-span-2` + ProjectCard's **existing** `wide` prop (the featured horizontal layout, proven full-width two rows up) — grid bookends. Also fixes stale "Remaining 3" comment.
- **/work index lone card** ([components/WorkFilterGrid.tsx:140](components/WorkFilterGrid.tsx)): same dangle, but 9 of 13 filters yield exactly 1 card and CaseStudyCard has no wide variant — a full-width stretch would create a ~700px-tall media band (verifier rescope). Fix: odd trailing `<li>` gets `md:col-span-2 md:w-[calc(50%-1.5rem)] md:justify-self-center` — renders pixel-identical to siblings, centered; covers every odd filter count including filtered-to-1.
- **Showcase stat strip** ([app/page.tsx:129](app/page.tsx)): 5 chips dangle at mobile 2-col and md 3-col. Fix: add `last:odd:col-span-2 lg:last:odd:col-span-1` to the chip cn() — self-disables if a 6th chip lands.
- **ProjectCard footer links orphan** ([components/ProjectCard.tsx:141-165](components/ProjectCard.tsx)): at 390px GITHUB wraps alone. Fix: group Live+GitHub in one `ml-auto flex` span — desktop pixel-identical, mobile wraps as a unit.

### 3. Tag pills — `polish(pills)`
- **Invisible accent variant** ([components/TagPill.tsx:26](components/TagPill.tsx)): `bg-accent/22` measures 1.32:1 (light)/1.38:1 (dark) vs card — below the family's visible floor; REACT/VITEST/HTML read as bare text. Fix: `/22 → /30` = near-exact parity with rose/30 (1.46/1.57 vs 1.48/1.58); text-ink stays 8.3–9.4:1 AA in both themes (measured).
- **Cross-surface tone drift** ([content/blog.json:7](content/blog.json)): lowercase blog tags hash to different tone buckets than the cards' cased tags ("expo"→teal vs "Expo"→rose). Fix data, not hash (case-insensitive hashing would re-bucket pills site-wide): `["accessibility","Expo","React Native","Supabase"]` ("accessibility" stays lowercase — matches deliverables).
- **tools/tooling filter duplication** (content/deliverables.json:115,167 vs 223,272): unify to `tools` (dashboard + claude-corp edits). /work filter count drops 13→12 with one coherent filter matching 4 projects.

### 4. Copy + naming + nav completeness — `polish(copy)`
- **"Five products" ×3** (app/page.tsx:88, app/page.tsx:118, components/Footer.tsx:117) vs 6 deliverables and the data-driven "THE WORK — 6 DELIVERABLES". **Implementing Option B (de-count — safest reversible):** hero → "Every product live on the open internet."; showcase → "Real products on the open internet. Each one accessible by design."; footer → "Built in public, live on the open internet." Option A (count to Six + 6th showcase cell + Dashboard GitHub link) is specced in DECISIONS FOR SKY.
- **Footer SITE column missing Notes** ([components/Footer.tsx:98](components/Footer.tsx)): insert Notes `<li>` (`/blog/`) between A Brief Account and Correspond, matching hamburger order; byte-identical sibling classes.
- **"Github"/"Linkedin" casing** ([components/Footer.tsx:147](components/Footer.tsx)): profile.json platform ids are schema-locked lowercase enums — fix at render: `PLATFORM_LABELS` map (github→GitHub, linkedin→LinkedIn, …) + drop `capitalize`. Case-study LINKS already render "GitHub" — this unifies.
- **"Certificates" H1 vs "Credentials" everywhere** (app/certificates/page.tsx:48 + metadata:13): every nav surface + the page's own eyebrow say Credentials. Fix both strings → "Credentials" (noun-H1 voice = no period, matching "The Work"/"Notes").

### 5. Case-study hero framing for landscape real shots — `polish(hero)`
**WHERE:** app/work/[slug]/page.tsx:212 (`aspect-[4/5]` hardcoded) + components/ProductReveal.tsx:78-82 (`FRAME_PLACEMENT` w-[86%]).
**WHAT:** Dashboard (window) and Ghost Code (plate) heroes float letterboxed in the portrait well — the 3200px dashboard shot renders ~397px wide, smaller than its own in-body gallery shots (632px). Phones fill the well perfectly; the two designed empty states must not move. Verifier confirmed the 4/5 record in UI_SYSTEM.md predates any real landscape hero — no intent evidence.
**FIX:** (1) build-time conditional: `wideHero = Boolean(media.src) && frameForSlug(d.id) !== 'phone'` → `aspect-[4/3]` else `aspect-[4/5]` (zero CLS — class is static per-page from JSON-known data); (2) `FRAME_PLACEMENT_REAL` map: window/plate real shots at `w-[94%]` (placeholders keep 86%; phone byte-identical). Frame fill goes 47%→79% of well height. (3) Doc-comment sync ×4 sites (page.tsx:217 comment, HeroSettle.tsx docblock, ProductReveal.tsx:71, UI_SYSTEM.md:92 — multi-line wrap per rescope).

### 6. Dev-console hygiene: async params — `chore(params)`
app/work/[slug]/page.tsx:108-113,148-150 AND app/blog/[slug]/page.tsx:23-24,127-128 (both files per verifier rescope): Next 15 sync-dynamic-apis warnings. `params: Promise<RouteParams>` + await; generateStaticParams stays sync; output:'export' compatible; zero visual delta.

---

## DECISIONS FOR SKY (proposed, not implemented)
1. **Is the Dashboard product #6?** Implemented the count-free copy (Option B — true either way). If you want it counted: flip the three strings to "Six", add a Dashboard GitHub link to deliverables.json (repo URL needed from you — without it "All open source" is wrong), and approve a 6th showcase cell (spec ready: chip object + `lg:grid-cols-6`; cells get ~17% narrower).
2. **In-body "See it in motion" galleries** remain designed placeholders for flagstone/claude-corp/prompt-library/ghost-code (dashboard has 3 real shots). One-line swaps in deliverables.json when you have screenshots. (Known deferred item — unchanged.)
3. **No-JS grid exposure (follow-up, NOT this pass):** WorkFilterGrid + AnimatedCertGrid also SSR `opacity:0` cards (framer useInView). Recovery works with JS; scripting:none users see empty grids. Fix would touch filter/AnimatePresence interaction code → separate proposal (F5).
4. **SVG OG images on sub-pages** — pre-existing, still out of scope.

## HONESTY-GATE LEDGER (walked, verified, left alone)
- **My own walk misread, corrected by the verification fleet:** the "titles frozen forever on production direct loads" claim was a **hidden-tab measurement artifact** — Chrome suspends rAF in background (automation) tabs; my own frozen tab settled 1.5s after being foregrounded; foreground hard loads settle fine. What's actually broken is narrower but real: RM users (permanent), no-JS users (permanent), background-opened tabs (until foregrounded) — fix #1.
- **Footer GitHub terracotta in dark** — documented intent (Footer.tsx:140 "elevated brand presence (resting)"). Left alone.
- **Scroll-spy at page bottom** — correct (`aria-current` lands on Correspond). My earlier read was mid-transition.
- **Contact "the socials below also work"** — accurate; @skypie99/sky-halisky links exist below the fold.
- **"SUPABASE" spelling** — correct (zoomed and verified).
- **Reveal latency after instant jumps** — automation artifact; real click-nav (sidebar Correspond) reveals instantly. Mobile dev-server reveal freeze = Fast Refresh detritus; prod static reveals correctly.
- **Drop-cap "I've"** on AccessMap body — standard ::first-letter behavior, reads fine.
- **Intro (read-only quality bar), the four directions, light reveal alphas, dark arc, spotlight dimming, Notes naming, email obfuscation, 404 surface, tabular numerals, method/about/certificates/contact sections, blog index + post, hamburger menu, mobile single-column layouts** — walked in both themes at both widths: genuinely done, left alone.

## EXECUTION ORDER (one commit per group, full gates after each)
`fix(settle)` → `polish(grids)` → `polish(pills)` → `polish(copy)` → `polish(hero)` → `chore(params)` → Alex verify → second sweep.
