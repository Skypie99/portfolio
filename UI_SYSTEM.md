# UI System — skypistudio.com (visual single source of truth)

Companion to `MOTION_SYSTEM.md` (motion is LOCKED — reference only, never alter). Studio-grade
visual rules. All values are tokens in `app/globals.css :root` / `html.dark` + `tailwind.config.ts`.
The cinematic intro (globals.css 966→EOF, `--font-cormorant`, `--sidebar-w`) is locked.

## Type scale (modular, 1.25)
`--fs-step-1 … 5` (1.25 → 3.05rem), `--fs-display` (clamp 2.75–4.25rem), `--fs-hero` (clamp 3–5.5rem),
`text-body` 1rem, `text-body-sm` .875rem, `text-label` .75rem, `text-meta` .6875rem.
- **No arbitrary `text-[…]` sizes.** Body copy = `text-body` (or `text-step-1` for a lead). Headings use
  the step/display/hero tiers. Fonts: serif Cormorant (display), DM Sans (body), DM Mono (labels/meta).
- **Line-height:** tighter as size grows (`--lh-tight 1.1` display, `--lh-snug 1.2` sub-head, `1.65` body).
- **Tracking:** negative on large serif (`--ls-hero -0.025em`, `--ls-display -0.02em`); positive on
  caps/labels (`tracking-label .125em`). Use Tailwind `tracking-*`, not inline `style`.
- **Measure:** body prose = `max-w-measure` (**65ch**); long-form = `max-w-measure-wide` (**60ch**,
  re-derived from 72ch, TY-5); lead/intro paragraphs = `max-w-measure-lead` (Phase A: **~545px**,
  Sky's ratified reading-measure ruling — was a hardcoded, un-tokened 640px); section-H2s =
  `max-w-measure-heading` (Phase A: **672px**).
- **Micro-typo:** curly quotes `" "` + em/en dashes `— –` in content; `tabular-nums` on numerals;
  `text-balance` on headings, `text-pretty` on body; `font-optical-sizing: auto` (global).

## Spacing & grid
`--space-1…20` and `--space-50`; sections `py-24 lg:py-32` (the standard rhythm — Phase A codified
this as `--section-y: clamp(6rem,10vw,8rem)`, not yet consumed by any call site since it changes
the rendered value at every width between the two breakpoints, not just the notation); `px-gutter`
(`--gutter` = 2rem); content column `max-w-content` (1120px) centered; gutters never exceed the
content frame.

## Color
Warm-tinted neutrals (never pure #000/#fff) via `--rgb-*` triplets that flip in `html.dark`:
ink / ink-muted / ink-meta (text, AA-tuned), canvas / canvas-alt (page), **surface / surface-mid /
surface-warm** (panels), accent (terracotta — restrained: CTAs, chrome, emphasis), cool (pine),
gold, line / line-strong (borders). Decorative one-offs must be `--rgb-*` triplets so they flip — no
raw hex in components.

**Gold rule (Phase A, measured on the approved system-sheet board, 2026-08-23):** light-mode gold
(`--rgb-gold`) is **2.45:1 on canvas** — below even the 3:1 non-text floor (dark passes at 7.80:1).
Gold never carries text or meaning alone in light mode; ceremony use is always ink-paired.

## Dark mode (DESIGNED, not inverted)
- **Surface ladder:** canvas `21 25 26` < canvas-alt `34 28 22` (warmed, not lifted — UP-20; see the
  in-source comment at its globals.css definition for the full luminance-vs-hue reasoning) <
  **surface-mid `41 48 51`** (raised panels) < surface `30 36 38`. Panels that should "lift" use
  `bg-surface-mid` (light value = cream, so light mode is unchanged; dark value lifts above the section).
- Accent luminance lifted in dark (`--rgb-accent 207 122 79`). Prefer **light hairline borders** over
  heavy shadows for elevation on dark surfaces. Full AA parity with light.

## Radii & elevation
`--radius-sm 4 / md 8 / lg 16 / card 22 / pill 9999` (Phase A: `pill` was `999` — a literal mismatch
against Tailwind's own `9999px`, fixed with zero visual change; `card` promoted from a Tailwind-only
literal to a real CSS var); cards `rounded-card` (liquid-glass, approved). Shadows `--shadow-sm/md/
lg/xl/soft` (warm-tinted light; lighter/contained in dark — Phase A gave `soft` its long-missing dark
twin). One soft, layered ramp — no harsh drop shadows.

## Components (one cohesive set; states complete)
- **Focus ring:** 2px terracotta, 2px offset, consistent across all interactive elements (`:focus-visible`).
- **Button:** primary + ghost; default/hover/active/**disabled** all defined; `h-14`, `rounded-pill`, ≥44px.
- **Pills (Filter/Tag):** constant 1px border (active = color/bg change, **never width** → no CLS).
- **Cards:** liquid-glass (locked material/motion); type/spacing consistent across featured + grid.
- **Links:** `.link-draw` underline-draw (a MOTION — do not add/remove this round); consistent text color.
- Touch targets ≥44px; hairline dividers consistent; pixel-aligned.

## Detail
Custom `::selection` (peach on ink, flips), thin warm scrollbar, terracotta focus ring, per-route
titles + descriptions, dynamic `app/sitemap.ts`, OG image (`opengraph-image.tsx`), `apple-icon`,
`colorScheme: 'light dark'`. No global `scroll-behavior: smooth` (would fight the intro's ScrollTrigger).

## Organic + interactive pass (2026-06-03)
One coherent card system everywhere: **certificates now use the same locked liquid-glass material as
work cards** (`CertCard` = `.glass-card` + per-issuer `CardField` caustic + `useSpotlight`), retiring
the flat blush tier. **Tags render as `TagPill`s** like Tech (the section labels carry the distinction);
the plain-text card tech list is gone. Every route `<h1>` carries the `.ember` gradient and the
`SettleHeading` carve-in (work, certs, about, contact, 404, blog) — no more flat pop-in. Detail-page
hero + gallery images are tactile (`TactileMedia`: hover-scale + scroll-parallax) instead of inert
plates; the off-system `rose-pale`/`teal-soft` gallery section is realigned to the cream/warm-white
rhythm. New components: `CardField` (living caustic), `TactileMedia`, `MagneticButton`, `CertCard`,
`SettleHeading`. TagPill gains a faint inset hover ring (tint-agnostic, no CLS). See `MOTION_SYSTEM.md`
§10 for the motion side. Dead `.work-card` class removed. All new colour use reuses `--rgb-*` tokens
(AA in both modes); the intro scene is untouched.

## WOW continuity pass (2026-06-04)
The desert's **golden light now carries through the whole page** so it reads as one cinematic piece, not
an intro on an ordinary page. The hero wash **blooms in** as the intro releases (light continuity); a warm
`ParallaxWash` is now on **every** major section (the "sun in every room" — homepage Certificates, `/work/`
+ `/certificates/` headers, `/work/[slug]` gallery + "More work"); the **featured** work card reads as a
brighter **focal plane** (`CardField featured` → caustic 0.28); the intro title's **carve-in** (blur→sharp)
recurs on case-study body H2s (`Reveal variant="carve"`); and the closing CTA gains the homepage's
`ambient-drift` warmth. Craft: Process dividers → `.rule-ember`; Contact "Elsewhere" h2 → `.ember` (every
section h2 is now ember). Readability is protected — washes are decorative behind content, carve text is
sharp at rest (RM → instantly sharp), and every new motion is `@supports`/reduced-motion gated. New motion
uses the site's easings only — the intro's quint curve is never reused, and the intro files are
byte-identical. See `MOTION_SYSTEM.md` §11.

## Show the work, cinematically (2026-06-04)
The site now **shows** every product, not just describes it. ONE reusable component —
`ProductReveal` (+ `DeviceFrame`) — renders product media in the golden-hour world, echoing the
locked intro with the site's own (non-GSAP) motion. Two states share ONE reserved frame so a real
screenshot is a **one-line swap** with **zero CLS** (see `SHOW_WORK_PLAN.md`):
- **Placeholder** (no real `src`) — a genuinely beautiful, pure-CSS golden-hour world (`.pr-world`:
  `--rgb-gold` sun-bloom + per-product `--pr-sig` key light + cool prism `150 188 214` + `--rgb-earth`
  → `--rgb-earth-deep` ground) with a `.pr-horizon` hairline, a per-medium **device frame**, and a
  product wordmark (hero) or UI hint (card/shot). Emits **no `<img>`**.
- **Real image** — the screenshot drops into the SAME frame via `<picture>` (AVIF→WebP→`<img>`, reusing
  `TactileMedia`'s parallax layer).
**Contexts + aspect (reserved → no CLS):** hero `aspect-[4/5]` (phone heroes + designed empty states)
or `aspect-[4/3]` (window/plate REAL-shot heroes; data-known at build, real shots widen the frame to
`w-[94%]`), owned by `HeroImageSettle`; work-card band `16/10` atop the glass inscription (Sky's call —
all text stays on glass, AA preserved; card grows with a `min-h` floor); in-body shot `16/10`.
**Device frames** (`lib/signature.ts → frameForSlug`, hero only): `phone` (Flagstone, Mutual Mesh),
`window`/terminal (Prompt Library, Claude Corp), `plate` (Ghost Code). Pure CSS, `.panel-lit`,
`--shadow-lg`, both themes via `--rgb-*`.
**Legibility:** `.pr-scrim` (tokenized `--scrim`) guards ≥4.5:1 for any text over a future bright
screenshot; the hero wordmark is decorative (`aria-hidden` — the real `<h1>` is in the column).
**Data:** `content/deliverables.json` gains optional `heroShot` + `shots[]` (`ShotImageSchema` — `src`
optional, `alt` required, optional `caption`/`avif`/`webp`). `.svg` heroes are treated as placeholders.
**Floor held:** new `.pr-*` CSS lives outside the locked `.cdesert-*` range and only consumes existing
tokens (token-parity green); reduced-motion + `(scripting:none)` show the final image/placeholder
instantly; intro byte-identical. New components: `ProductReveal`, `DeviceFrame`; shared `lib/signature.ts`,
`lib/media.ts`. See `MOTION_SYSTEM.md` §12.

## Continuous world (2026-06-05) — "One continuous world" (Direction A)

The golden-hour desert is now a **persistent backdrop** behind every post-intro surface, evolving
**golden → dusk → night** with scroll. Content rides on the **same panels, now translucent frosted
glass** (`.world-surface` / `-alt` / `-cool` / `-cool-pale` replaced the opaque `bg-cream` /
`bg-warm-white` / `bg-wa-teal-*` site-wide), so the page travels through the living world; the glass
cards refract it. `WorldBackdrop` (fixed, z:-1, `aria-hidden`) is mounted once in `layout.tsx`.

**Two-themes-as-two-halves:** light mode is the **airy daylight** half of the world (high-luminance
golden→blue-hour stops), dark mode is the **deep night** half — the scroll arc plays within each, and
the theme toggle (the user's explicit choice) is what owns every readable surface. New decorative
`--rgb` triplets flip per theme: `--sky-day/dusk/night-1..4`, `--sky-sun`. Panel translucency knobs:
`--surface-alpha` (.62 light / .66 dark), `--surface-alpha-alt` (.79 / .70), `--surface-alpha-cool`
(.77 / .66) — set just above the alpha each surface needs to keep **all text at WCAG AA over every
world state** (verified by contrast pass: light body ≥9.7:1 / small-meta ≥4.5:1; dark all ≥5.2:1).
All additive — `token-parity` green, the `.cdesert-*` / `.cinematic-*` ranges untouched. See
`MOTION_SYSTEM.md` §13 + `CONTINUOUS_WORLD_PLAN.md`.

## UI-polish pass (2026-08-01)

An 11-phase pre-ship polish train (audit `[Fable 5]`; full record in
`design-reviews/ui-polish/2026-08-01/`). It changed **no copy and no motion** — `MOTION_SYSTEM.md` is
byte-untouched by the train, and no `content/*.json` was touched. What follows is the system record for
what it *did* change, so a later window reads these as rules, not drift.

### Token naming — alias → canonical (read as an enumerated table, NOT a pattern)
UP-06 (P10 + P10b) migrated the **call sites** of five alias families onto their canonical role names.
Every alias still resolves to the identical `--rgb-*` triplet as its canonical name (proved naming debt,
not colour: a positional total-computed-style census over 16 routes × 2 themes × 3 widths — 96 frames,
29,826 elements — read 96/96 byte-identical, and failed a planted mutation). Read one row at a time; this
is **not** a `wa-teal-* → cool-*` pattern — two rows break that shape, and `cool-pale`/`cool-wash` are
registered nowhere, so a published pattern rule is a documented way to silently delete paint (Tailwind
emits no rule; no type-check or test catches it).

| Alias (legacy) | Canonical (role) | Commit |
|---|---|---|
| `charcoal` (`text-`/`border-`/`disabled:text-`) | `ink-muted` | `2539303` |
| `cream` (`bg-cream`) | `canvas` | `5fe1a5d` |
| `warm-white` (`hover:bg-warm-white`) | `canvas-alt` | `5fe1a5d` |
| `wa-teal-deep` | `cool-deep` | `3b4c699` |
| `wa-teal` | `cool` | `3b4c699` |
| `wa-teal-mid` | `cool-mid` | `3b4c699` |
| `wa-teal-soft` | `cool-soft` | `3b4c699` |
| `wa-teal-pale` | **`panel-cool`** — ⚠ NOT `cool-pale` | `3b4c699` |
| `wa-teal-wash` | **`wash-cool`** — ⚠ NOT `cool-wash` | `3b4c699` |
| `near-black` (`text-near-black`) | `ink` | `ba4a813` (P10b) |

A sixth, non-colour limb of the same pass folded three off-scale glyphs onto the type scale
(`text-[1rem]`→`text-body`, `text-[1.25rem]`→`text-step-1`; `f653fbd`) — noted here, not an alias→colour
row. The config aliases themselves were **kept and each annotated** with its canonical target and why it
stays (`bd2bd76`, `tailwind.config.ts` ~:80–98).

**Deliberately partial.** Sky scoped this to the four named families (§S 2026-08-06), then ruled
`near-black` in as a fifth (P10b). **289 live legacy call sites across 12 families remain** dual-named
(`accent-text` 70, `text-meta` 64, `terracotta` 63 the largest) — a costed future lane, not a gap. Do
not read the table as complete, and do not inherit REPORT §69's stale "~60".

**Skipped, showcase-owned call sites (11, in `app/work/[slug]/page.tsx`)** — left on the alias on
purpose because the showcase train owns that file (it migrates after that train merges): `text-charcoal`
×3 (:459, :671, :721) and `text-near-black` ×8 (:264, :358, :492, :500, :621, :652, :695, :750). They
are exactly why the `charcoal` and `near-black` config aliases must remain — deleting either key emits no
rule and silently drops paint. (`components/cinematic/**` carries zero in-scope call sites.)

**`lib/cn.ts:15` is knowingly out of sync, and safe.** Its "keep in sync with `tailwind.config.ts`"
comment predates the rename; `CUSTOM_COLOR_TOKENS` still lists aliases and none of the new canonical
names. Measured 30/30 (`bg-`/`text-`/`border-` × 9 pairs + variant-prefixed + Button's ghost override),
canonical names group identically via tailwind-merge's default fallback, so the gap changes no behaviour.
Recorded so no one "fixes" the comment and alters merge behaviour for nothing.

### Tap-target extension — the one-sided stretched `::after` (recipe)
The estate lifts a bare action link to the 44px hit-area floor **without touching its border box** via a
content-less `::after` stretched *one direction only*, into dead space — NOT padding + negative margin.
Shipped for the card action rows in `252eeca` (UP-02/F7-2) on `ProjectCard`/`CaseStudyCard`; it is the
same recipe as the homepage showcase chips (`app/page.tsx:244`, "L3-09").
- Keep the link's `px-1 py-1 -mx-1 -my-1` (the ~23px box is the `gap-y-2` wrap pitch, so wrapped rows
  abut without overlap — load-bearing). Add `relative` plus:
- Leading link (reaches **up** into the dead band above the hairline):
  `after:absolute after:inset-x-0 after:-top-[21px] after:bottom-0 after:content-['']`
- Trailing/external links (reach **down** into the card's bottom padding):
  `after:absolute after:inset-x-0 after:top-0 after:-bottom-[21px] after:content-['']`

**Why one-sided, not padding.** At 375 the row wraps and `py-1`/`-my-1` already spends the 8px line gap
(0.00px clearance), so any extra pixel must come from *outside* the row or it overlaps the neighbour
(F7-3). And `*:focus-visible` (`globals.css:422`) traces the border box, so padding would draw a 44px
ring around a 15px label and straddle the hairline; the `::after` leaves box and ring untouched. Result:
23.391 → 44.391px effective, 0 overlaps, 0.000px layout Δ. Guard: `components/__tests__/TapTargets.test.tsx`.
**Recorded consequence (device/taste, `P2-UP-02-RULE`):** reaching 44px necessarily crosses the
decorative `border-t`, so that hairline becomes hover-reactive — there is no extension that avoids it;
revocation is one commit.

### Section-header idiom — two grammars (UP-22, ruled prose-variant)
The estate has **two** header grammars, and the split is deliberate (Sky ruled the prose variant,
§S 2026-08-06; the taxonomy already lives in `lib/sectionNav.ts:20-28` and is guarded by
`section-nav-anchors.test.ts` — UI_SYSTEM was merely silent).
- **Eyebrow grammar (ruled).** A mono uppercase eyebrow naming a band, then its serif display h2,
  wrapped together in `pl-4 border-l-2 border-terracotta`. The rule signals *this is a section of a
  composed page*. Members: home's four section headers (The Work, Method, A Brief Account, Credentials).
- **Prose grammar (bare).** Long-form pages — `/about`, `/colophon`, `/accessibility`, `/blog/[slug]` —
  set headers bare (eyebrow, then heading, no rule). A reading page is one continuous voice; a rule
  beside every heading would chop it into exhibits.
- **Title bands are neither.** Every route opens with a band carrying `data-band-anchor`; it names the
  PAGE, not a section, and is never indexed. `/work`'s ruled header is a title band, not a section.
- **Cards, credential rows and step numerals are never ruled.** Step numerals carry their own mark —
  `NumberedStep`'s `highlight` tick.

Rejected direction (A) "rule everywhere" was measured to cost real phone-width re-wraps (e.g. `/about`
"Describe the problem." 1→2 lines at 375) for a 16px indent invisible above 752px. A third option — `/about`
alone joins the eyebrow grammar — is recorded in the mockup README, unrendered.

### The "On this page" rail — driven from the route's own anchors (UP-10)
The index is a static per-route map (`lib/sectionNav.ts`), not a homepage list echoed everywhere (its
prior behaviour: 5 of 5 entries pointed at ids the route lacked; the spy lit nothing). Three rules:
1. **Labels are never invented** — each is a string the page renders byte-for-byte (eyebrow-grammar pages
   indexed by their eyebrows, prose-grammar pages by their h2s), asserted against built HTML by
   `section-nav-anchors.test.ts`.
2. **A route with fewer than two listable sections is not indexed at all** — it renders nothing, not an
   empty shell (`/work`, `/certificates`, `/blog`, `/contact`, 404). This supersedes the 2026-06-05
   "always render for consistency" note (recorded as SUPERSEDED; the consistency was of shape only).
3. **A title band is not a section** — guard T4b fails any mapped anchor carrying `data-band-anchor`.
   `/about` therefore ships 4 entries, not 5.

`hrefs` are route-absolute (`/about/#method`) so one grammar covers same-page and cross-page entries;
there is no basePath today — never hardcode one.

### External-link glyph colour (UP-11)
An external-link glyph (`↗`) never carries its own hard-coded colour — it **inherits the colour of the
label beside it** (`CredentialBadge.tsx:81` names this "the house external-link grammar"). Census of all
162 `↗` (10 routes × 2 themes): 100 already tracked, exactly 3 hard-coded `text-text-meta` overrides
existed (`Footer.tsx` ×2 + the byte-identical `app/contact/page.tsx:96`); removing them took it to 162/162
with contrast rising in every case (`7cae293`). *Not applied (NEEDS-SKY):* the footer's lone-accent GitHub
resting treatment (`P4-UP-11-SET`) — a comment records it as deliberate hierarchy, so only the glyph was
unified; the set treatment is Sky's, one commit either way.

### Wrap discipline — four named utilities (UP-14, `8a2fb98`)
All zero-copy — visible characters are byte-identical; only spans/utilities change.
1. **`text-balance` heading family** — added to the eight `text-step-4 … max-w-2xl` section heads that
   lacked it (the three carrying an authored `<br/>` are excluded, since balance can move a line Sky wrote).
2. **`bindSeparatorDash` (TY-6) NBSP-weld** — welds an em-dash to its preceding word so a line never
   *starts* with a dangling separator (this is why a line ending "Flagstone —" is the rule working, not a
   defect).
3. **`text-pretty` on mono figcaptions** — pulls one word down on long uppercase-mono captions; line count
   (and height, and CLS) unchanged.
4. **Nowrap-per-interpunct-segment** — for `·`-separated mono lines, break *between words only*: each word
   is its own `nowrap` span with spaces *outside* the spans, and each `·` bonds into the span of the word
   *after* it (so a separator leads its clause). The audit's whole-segment `nowrap` was measured and
   **rejected** — it overflowed +135px at 320.

### CTA pill materials — `cta/ghost` and `cta/filled` (documented-deliberate, UP-40)
The homepage hero's "See the work." pill reads as **outline-on-transparent** (`cta/ghost`, a mid-page
invitation); the closing email pill reads as **filled with a soft shadow** (`cta/filled`, the final ask).
**Honest mechanism, so no one "fixes" a non-bug:** both call sites render `<Button>` with the **default
`primary` variant** — `variant="ghost"` exists in `Button.tsx` but is used at *zero* CTA call sites. The
difference is **emergent from context**: on the hero the pill's `bg-canvas` fill matches the page canvas
so only the border reads; at the outro the same fill sits over the golden radial gradient, so the base
`hover:shadow-soft hover:-translate-y-px` reads as a lifted, filled pill. Call sites: `Hero.tsx:155`
(`app/page.tsx:168`) and `app/page.tsx:634` → `ContactEmail.tsx:73`. Recorded as named recipes for that
observed behaviour; Sky may re-rule to one material (which *would* be a code change — mapping onto Button's
actual `primary`/`ghost` variants).

### RunwayIdentity mark — the fixed hex is deliberate (UP-07)
`RunwayIdentity.tsx`'s sun glyph paints fixed hex (`#B35F40` disc, `#C2A878` limb/lower-line, `#A35636`
upper clay line) rather than `--rgb-*` tokens. This is **intentional and does not theme-flip**: the mark
rides the intro's fixed golden palette (the favicon's terracotta sun), the same fixed-palette logic the
cinematic scene uses. One comment line at the palette block records this in-source; no colour change.

### Meta-CSP — why `frame-ancestors` is absent from the meta policy (UP-01, `40c1475`)
The production CSP ships as a `<meta http-equiv>` in `<head>` (`PROD_CSP`, `app/layout.tsx:65`, emitted
:149) because GitHub Pages cannot send real CSP headers. **`frame-ancestors` is deliberately absent from
it:** the spec drops `frame-ancestors` when a policy arrives via `<meta>`, so it never protected anything
here — it only logged a red console error on every route ("…'frame-ancestors' is ignored when delivered
via a `<meta>` element", 68/68 frames). Removing it changed no protection and cleared the error
(documented at `app/layout.tsx:52-60`). Its real home is now the `headers()` block in `next.config.mjs`
(:27–36) — CSP `frame-ancestors 'none'` beside the legacy `X-Frame-Options: DENY` — **documentation-only
while on GH Pages** (`output:'export'` never applies `headers()`; CLAUDE.md gotcha 6). The two are
additive: if the header block ever starts applying, the meta CSP must not be deleted as "redundant."

### Decision-log (this addendum)
- **2026-08-01 → 2026-08-06 · UI-polish train (P1–P11).** 46 audited findings → 27 shipped, 4
  verified-no-defect, 7 record-as-deliberate, 5 not-built (source refuted the audit; Sky's call), 1
  parked-needs-asset (UP-18 cert re-exports), 1 routed-to-showcase (UP-15), 1 observed-gated (UP-44).
  Conservation table in `design-reviews/ui-polish/2026-08-01/build-plan/00_master.md` (§ CONSERVATION —
  ACTUAL). Gate bar at the train tip: lint/typecheck/build green, `518 · 1 · 1 · 54`, `check:overflow`
  0/64 frames, 9-route console walk clean.
- **2026-08-06 · UP-22 ruled (B) prose-variant** by Sky; recipe promoted above. Zero code — the current
  state was the proposal.
- **2026-08-06 · P10 scoped to the four named families**, then `near-black` ruled in (P10b); the other 12
  families stay dual-named by decision, not oversight.
- **2026-08-07 · UP-33 built on Sky's pick** — `h-full` on the single 2-up `<CaseStudyCard>` call site
  (`app/work/[slug]/page.tsx`) so the "Continue reading" cards fill their stretched row and both feet line
  up (measured footDelta 0.00, equal heights). Activates the card's own `mt-auto`; tally moves to 28
  shipped / 4 not-built.
- *(This log lives here, not in `DECISIONS_LOG.md`, which carries Morgan's frozen uncommitted edits.)*
