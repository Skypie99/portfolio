# Portfolio Voice Pass — 2026-06-10

**Branch:** `content/portfolio-voice-pass-2026-06-10` (5 commits, NOT merged — main is yours)
**Scope:** C3–C18 content/copy pass + the one specified stats-grid layout change.
**Gates:** lint 0 errors / 0 warnings · typecheck 0 · 184 tests passing · build + static-integrity clean — after every commit.
**Intro:** byte-identical to main, verified before and after (details in §6).

---

## 1. DECISIONS FOR SKY

### D1 — Mutual Mesh chip: I shipped `0 / addresses stored`, not `0 / data collected` ⚠️ read first

The spec said `"0" / "data collected"`. The second sweep (three independent reviewers,
each adversarially verified) found that **your own case study contradicts it one click
away**: `/work/mutual-mesh` says *"The platform deliberately collects the minimum: a
chosen handle… a three-character postal prefix… a per-resource contact handle."*
Minimum isn't zero — and the pass exists to retire over-claims from this exact slot
(the false E2E line). Per the honesty hard rule I used the claim the case study makes
verbatim (*"a neighbourhood, never an address"*): **stat `0`, label `addresses stored`**.
Your `0` stat, tags, and card design are unchanged.
**To revert to spec:** change one word at `app/page.tsx:68` (`'addresses stored'` →
`'data collected'`). Alternative also supported by the body: `'real names required'`.

### D2 — C4 hero subtext, exact final string
`"Six projects built, five live on the open web. Accessibility first, built for everyone."`
"Built in public." was dropped — it was a standalone sentence (not part of a surrounding
sentence), and its essence now lives in the new footer blurb ("Built in public, honest
about what ships…"). Note: you specified "open **web**" here and "open **internet**" in
C18's footer blurb — both applied exactly as written; the homepage showcase sub-line
(unchanged) also says "open internet," so the hero is the one outlier. One-word
harmonization available either way if you want it.

### D3 — C6 new-card project label: chose **"Born accessible"**
Reads best in the serif slot and avoids a second "AccessMap …" card (AccessMap owns
card #1). Trade-off the sweep surfaced: the other five cards name real products, so a
slogan sits in a product's seat, and "2.2 AA WCAG conformance" with no project name
reads as a portfolio-wide conformance claim (the formal WCAG term) — defensible from
the Alex audits but not formally audited across all six. The alternative
"AccessMap a11y" scopes the claim to AccessMap (strongly supported: 1,680 tests, Alex
audits to WCAG 2.2 AA) but duplicates AccessMap and uses insider jargon. Yours to call;
swap is one line at `app/page.tsx:75`.

### D4 — C7: Claude Corp previously said **"Architect"** — a genuinely different role
Spec said make every project match AccessMap's "Solo builder," so it now does. But
Claude Corp's "Architect" read as intentional (you architected a 15-agent org rather
than built it solo). Flag per your instruction; revert is `content/deliverables.json:65`.

### D5 — C5 extended to the mobile nav (judgment call)
The hamburger overlay carried the same claim ("Available for work · 2026" + pulsing
dot). Leaving it would have kept the availability claim alive on mobile only, so it now
mirrors the sidebar: "Technology designed with accessibility in mind." (no dot).

### D6 — C17 was in the sidebar, not the contact page
The "© 2026 / CANADA" pair lives under the sidebar's "Write to me." button
(`components/Sidebar.tsx`), which is the button that reaches the contact page. Applied
your intent there. Note: after C16 + C17, **no © notice remains anywhere on the site**
— consistent with the spec, just making it explicit.

### D7 — Voice observations on your exact-specified strings (applied as written, flagged per the sweep)
All of these are **live on the branch exactly as you specified them**; the second sweep
rated them worth surfacing. Take or leave:
- **C11 CTA** "Passionate about building something special? / Let's talk about it." —
  reviewers read "passionate"/"something special" as recruiter-register against the
  restrained voice, and it breaks the site's "Write to me." CTA loop (sidebar button,
  /contact H1, work/about pages all still say "Write to me."). The old heading was
  already on-voice. If you want the quiet version back: `app/page.tsx:443`.
- **C8** "Ship & stay curious" — breaks the one-beat rhythm of "Discover / Build" under
  a heading that promises "Three *quiet* steps." And "The work speaks for itself."
  gently contradicts the unchanged homepage About block ("I keep a written record… The
  documentation is part of the deliverable"). Suggested trims if wanted: title "Ship",
  end the body at "…earns its place."
- **Tagline echo** — "AI tools built with intention." (footer) sits on the same page as
  the unchanged Work heading "A handful of things, made with intention."
- Nits, recorded only: "built" lands twice in the C4 subhead; contact sub-line stacks
  three fragments; footer blurb "no one's left out" echoes the Build step's "leave
  people out"; Prompt Library chip + tags now say "static" three ways; "44pt targets"
  vs the blog's "44px" (44pt is the correct iOS unit, so likely fine).

### D8 — Other stale/false copy FOUND, NOT fixed (honesty rule: flag only)
1. **`public/og-image.svg` — a nest of stale claims** broadcast as the social-share
   card for /about, /work, and /blog: "AVAILABLE FOR WORK" pill, the retired tagline
   "AI tools, built slowly. Documented honestly.", "VANCOUVER, BC" (site says Okanagan),
   "4 LIVE PROJECTS" (it's five), "ALL OPEN SOURCE". A partial fix would leave it
   incoherent and a full fix is a design-asset redesign — recommend a dedicated refresh
   next pass. (The homepage's auto-generated OG image is clean.)
2. **`app/about/page.tsx` "Mutual Mesh is built the same way"** — inherits "no backend,
   no account, no server" from the Prompt Library sentence; false (Mesh runs Supabase
   auth/data/storage). Same root over-claim as D1.
3. **`content/deliverables.json:183`** — Prompt Library tech pill says "Vercel" but the
   body says (and the live host is) GitHub Pages.
4. **`content/deliverables.json:227`** — Prompt Library body still says "Fifty features
   shipped." while the chip retires "50+ features shipped".
5. **`content/case-studies.md:90,101`** — still claims Mutual Mesh is "End-to-end
   encrypted" (the known-false claim). Not rendered anywhere, but it's a source doc
   that could re-seed the claim.
6. **`app/work/page.tsx:71`** — "slowly, documented honestly…" retired-voice echo.
7. **`app/about/page.tsx` "Right now" list** — names five projects, omits the Dashboard
   (your current top focus); appending it naively would break "All of them open source."
8. **`app/globals.css` `.hero-status-ping`** — now orphaned (its only consumers were the
   removed availability dots). Left alone: globals.css untouched per the intro rule.

---

## 2. BEFORE → AFTER (every change)

**C3 — Hero positioning line** · `app/page.tsx:93`
- ⊖ "An accessibility map. A multi-agent system. A command-line trainer."
- ⊕ "An accessibility map. A multi-agent system. A web-based prompt library."
- Note: current text was a period list (not the comma list the brief described) —
  kept the existing style, swapped only the third item.

**C4 — Hero subtext** · `app/page.tsx:94`
- ⊖ "Built in public. Documented from the first commit. Six projects built, five live on the open internet."
- ⊕ "Six projects built, five live on the open web. Accessibility first, built for everyone."

**C5 — Sidebar identity** · `components/Sidebar.tsx` (+ `HamburgerNav.tsx`, see D5)
- ⊖ "AI engineer · Accessibility" + "● Available for work" (pulsing dot)
- ⊕ "Technology designed with accessibility in mind." — no status line.

**C6 — Stats strip** · `app/page.tsx` — see §3.

**C7 — Role labels** · `content/deliverables.json`
- ⊖ Mutual Mesh "Lead engineer", Claude Corp "Architect"
- ⊕ All six projects: "Solo builder" (AccessMap's exact casing, confirmed).

**C8 — Method steps** · `app/page.tsx`
- 01 Discover: unchanged, as specified.
- 02 Build ⊖ "…documented enough to learn from." ⊕ "One slice at a time. Type-safe,
  accessible from the first line, no shortcuts that leave people out."
- 03 ⊖ "Ship" / "…The documentation is the deliverable." ⊕ "Ship & stay curious" /
  "Get it into the world, notice what's not working and what could be, and keep
  refining until it earns its place. The work speaks for itself."

**C9 — Contact page sub-line** · `app/contact/page.tsx`
- ⊖ "AI engineering. Accessibility. Thoughtful product collaborations. I reply to most messages within a few days."
- ⊕ "Accessible technology, built with care. Thoughtful product collaborations.
  Learning out loud, one project at a time. I read every message that comes through."
- "Write to me." heading and "The socials below also work…" kept.

**C11 — Homepage contact CTA** · `app/page.tsx`
- ⊖ "Have something worth building? / Write to me." + reply-time paragraph
- ⊕ "Passionate about building something special? / Let's talk about it." — nothing
  below; the email button follows directly. "Correspond" label untouched.

**C14 — Footer top row** · `components/Footer.tsx` + `content/profile.json`
- ⊖ Left: "● CANADA · Open to work" · Right: "AI tools, built slowly. Documented honestly."
- ⊕ Left: name + "AI tools built with intention." (tagline updated in profile.json,
  rendered in the same quiet mono-caps style, no dot) · Right: empty.

**C15 — Footer bottom right** · ⊖ "● MADE WITH CARE" removed ⊕ "BUILT IN THE OKANAGAN
VALLEY, BRITISH COLUMBIA." kept (all-caps render unchanged).

**C16 — Footer bottom left** · ⊖ "SKYPI STUDIO — EST. 2026 · © 2026" ⊕ "SKYPI STUDIO — EST. 2026".

**C17 — "Write to me." button surround** · `components/Sidebar.tsx` (see D6)
- ⊖ "© 2026" (bottom-left) and "CANADA" (bottom-right) under the button
- ⊕ The clean "● WRITE TO ME." button alone, with its space.

**C18 — Footer About blurb** · `components/Footer.tsx`
- ⊖ "Sky Halisky builds AI tools. Small surfaces, real users, documented from the first commit. Built in public, five of six live on the open internet."
- ⊕ "Sky Halisky builds small, careful AI tools. Accessible by default, useful by
  design, so no one's left out. Built in public, honest about what ships — five of six
  live on the open internet."

**Test updates (legitimate, copy-driven):** `components/__tests__/Footer.test.tsx` —
the © year test and the "Made with care" test were rewritten for the new strip (asserts
"SkyPi Studio — Est. 2026" with no ©; asserts new tagline + Okanagan line, asserts
"made with care"/"open to work" absent). Suite total unchanged: 184 passing.

---

## 3. The stats strip (C6 result)

3-col grid (`lg:grid-cols-5` → `lg:grid-cols-3`; mobile 2-col and md 3-col kept) —
a clean **3×2** with no bare cells; the `last:odd:` span rule kept (self-disables at
six cards); stale "4-col"/"5-up" comments rewritten.

| # | Stat | Label | Project | Tags |
|---|------|-------|---------|------|
| 1 | **1,680** (was 1,564) | tests passing | AccessMap | Mobile · WCAG AA · Open source |
| 2 | 15 | AI agents | Claude Corp | MCP · Real commits *(unchanged)* |
| 3 | **100%** (was 50+) | **static** (was features shipped) | Prompt Library | No backend · Browser-only |
| 4 | 56 | command cards | Ghost Code | Vanilla JS · Zero deps *(unchanged)* |
| 5 | **0** (was E2E) | **addresses stored** (spec: data collected — see D1) | Mutual Mesh | **Privacy-first · Invite-only · EXIF-strip** |
| 6 | **2.2 AA** *(new)* | WCAG conformance | Born accessible | Screen-reader · 44pt targets · Reduced-motion |

Mechanics verified in `CountUpStat`: `1,680`, `100%`, `0` parse numerically and count
up (the `%` suffix appears at completion, same path as `+`); `2.2 AA` correctly renders
statically (the same code path "E2E" used — no broken scramble); screen readers always
get the final value via `aria-label`; the 4-hue ember cycle handles six cards.

---

## 4. Alex verification (Phase 2)

- **Both themes, three widths** — strip inspected at 375px (2-col ×3), 768px (3-col ×2),
  1280/1440px (3×2), in light and dark; all six cards render stat + label + project +
  tags in both themes. Screenshots taken during the session (desktop light + dark strip,
  CTA + footer light + dark, mobile dark strip).
- **Contrast** — zero color classes, tokens, or backgrounds were changed in this pass;
  every edited element reuses the exact styles audited AA in the 2026-06-10 FinalPolish
  pass, and the new card is markup-identical to the five audited cards (its ember hue,
  `ember-teal`, is the same audited pairing as the Claude Corp card). Visual check in
  both themes confirmed dark-on-cream / light-on-ink rendering throughout.
- **Keyboard / focus** — email CTA takes focus with a visible 2px outline; sidebar
  button, footer links, socials unchanged structurally.
- **Reduced-motion / no-JS floor (the raised floor held)** — built `out/index.html`:
  hero `<h1>` present in static HTML with **no** inline `opacity:0` (pure-CSS classes
  only); cinematic "SkyPi Studio" title present for no-JS visitors; all new copy in the
  static HTML; `CountUpStat` SSR paints final values (no flash of 0); reduced-motion
  code paths untouched.
- **Console** — zero errors or warnings on the changed pages.
- **DOM-wide stale sweep** — rendered site contains no instance of: "Available for
  work", "Open to work", "Made with care", "command-line trainer", "Documented from the
  first commit", "E2E", "encrypted", "©", "Lead engineer", "reply to most".
- One environment note: count-up animations stall in the headless preview because it
  suspends `requestAnimationFrame` between captures — observed mid-count progression
  (0 → 96 → …) proves the animation runs; real browsers complete the 900 ms ramp.

---

## 5. Second sweep (what it caught)

Run as a four-lens multi-agent review — voice cohesion, honesty/claims, C3–C18 spec
compliance, cross-section consistency — with every non-nit finding adversarially
verified against the files (19 agents total; zero findings refuted).

- **Fixed on the branch:** the Mutual Mesh chip over-claim (D1) and a stale
  "All 4 deliverables" code comment in `app/page.tsx`.
- **Spec compliance:** all of C3–C18 confirmed implemented exactly; no out-of-scope
  edits found; step 01 confirmed untouched.
- **Everything else it raised** is logged in D7/D8 rather than changed — they are
  either your exactly-specified strings or surfaces outside this pass.

---

## 6. Intro + locked floor + untouched list

- **Intro byte-identical, before AND after:** `git diff main -- components/CinematicIntro.tsx
  components/cinematic/ public/images/cinematic/ cinematic-masters/` → empty at branch
  creation and at the final commit. Blob hash `components/CinematicIntro.tsx` =
  `6fafe087311f72db22604acab99c90add95e16c1` (identical to main); the
  `components/cinematic`, `public/images/cinematic`, and `cinematic-masters` trees match
  main's hashes exactly. `app/globals.css` (including the cinematic range), cinema
  tokens, `--font-cormorant`, `--sidebar-w`: zero diff.
- **Left untouched for the next pass, verified in the diff:** certificate verify-links ·
  LinkedIn links (Footer + contact, exact same lines) · every "Correspond" label
  (sidebar nav, homepage eyebrow, contact eyebrow, footer Site column) · the
  faint-hairline backdrop (footer hairline-glow div not in the diff) · `/about` ·
  site metadata.

---

## 7. How to review

```bash
cd ~/Portfolio
git diff main..content/portfolio-voice-pass-2026-06-10        # full proofread
git diff main -- app/page.tsx                                  # hero, strip, method, CTA
npm run dev                                                    # then http://localhost:3000
```

Live checklist (both themes — sidebar toggle):
1. Scroll past the intro → **hero**: new third item + new subhead (C3/C4).
2. **Shipped strip**: six cards, 3×2 on desktop; resize to ~768 (3-col) and ~375
   (2-col). Watch 1,680 / 100% / 0 count up; "2.2 AA" sits static. Check the Mesh card
   reads honest to you ("0 addresses stored" — see D1).
3. **Sidebar**: brand line, no availability dot, clean "Write to me." with nothing
   under it (C5/C17). Open the mobile hamburger — same line there (D5).
4. **Method**: Build + "Ship & stay curious" (C8) — and weigh D7's notes.
5. **CTA near the email**: "Passionate about building something special? / Let's talk
   about it." with the button directly below (C11) — weigh D7.
6. **Footer**: tagline under your name, empty right, new About blurb, bottom strip
   "SKYPI STUDIO — EST. 2026" + Okanagan only (C14–C16, C18).
7. **/contact**: new sub-line, everything else untouched (C9).
8. Any project page → role reads "Solo builder" (C7).

Merge when satisfied — main is yours. Recommended next-pass items: og-image.svg refresh
(D8.1), the About-page Mesh sentence (D8.2), the Vercel pill (D8.3), plus the already
planned links/rename/hairline work.
