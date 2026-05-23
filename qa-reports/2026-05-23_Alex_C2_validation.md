# Alex C2/C3 Validation — Portfolio Site

**Author:** Alex (Accessibility Engineer)
**Date:** 2026-05-23
**Cycle:** Validation of Cycle 2/3 build against `docs/ACCESSIBILITY.md` (Day-0 spec)
**Standard:** WCAG 2.2 Level AA (Constitution v1.3 Art. 7 — non-negotiable)
**Scope:** Read-only validation. No code modified. No live surface touched.
**Verdict:** **PASS WITH FINDINGS** — 0 BLOCKING, 6 non-blocking, 2 decisions for Sky.

---

## TL;DR

The Cycle 2/3 build correctly implements the binding patterns from my Day-0 spec. All three contrast blockers (BLK-1 Sage, BLK-2 Stone-as-interactive-border, BLK-3 Terracotta-as-text) are resolved at the token layer (`tailwind.config.ts` + `app/globals.css`) and consistently honored at the component layer. The skip link, sidebar landmark, hamburger overlay with focus trap, numbered-step Umber numerals, reduced-motion respect, and external-link cues are all in place.

What's left is polish: a handful of focus rings should be a touch stronger on hover surfaces, a few hover-only color shifts to `text-meta` Sage could fall just under contrast in transit (instantaneous, fine), and the Button component's focus ring offset is 2px (Dani's §3.1 specs 3px for buttons specifically). None block the next cycle.

- **BLOCKING (must fix before next cycle):** 0
- **Non-blocking:** 6
- **Decisions for Sky:** 2

The site is safe to keep building on. Shamus's token discipline is excellent.

---

## Validation matrix

Per-component verification against the 10 checks in the task prompt. Legend: ✓ pass · ⚠ pass with finding · ✗ fail.

### 1. Tokens (binding layer)

| Check | Status | Evidence |
|---|---|---|
| Tailwind exposes `text-meta` = `#5C5D54` | ✓ | `tailwind.config.ts:46` |
| Tailwind exposes `link` = `#7F4323` Umber + `accent-text` Umber | ✓ | `tailwind.config.ts:50-51` |
| Tailwind exposes `border-interactive` = `#888879` | ✓ | `tailwind.config.ts:48` |
| Raw `stone` `#DCDCD6` exposed as `border-decorative` only | ✓ | `tailwind.config.ts:47` (aliased to `border-decorative`); used as decorative dividers in `app/page.tsx:45,63,169`, `Footer.tsx:19,119` — never as interactive border |
| `globals.css` `:root` mirrors all tokens 1:1 with Dani §1.1 | ✓ | `app/globals.css:9-106` (16 raw colors + 17 semantic aliases, all match spec) |
| Cycle 2/3 used Terracotta for text anywhere? | ✓ | Grepped — Terracotta `bg-terracotta` only used as 8px graphical dot (`app/page.tsx:83`, `HamburgerNav.tsx:183`) and as `border-color`/`hover` on the hamburger trigger (`HamburgerNav.tsx:107` — `text-` on hover at 11px hit-area glyph; see Finding F-2). Link text uniformly uses `text-accent-text` / `text-link` (Umber). |

**Result: PASS** — token layer is clean. The dual-border split (decorative vs interactive) is faithfully implemented.

### 2. Skip link (Alex §2.2)

| Check | Status | Evidence |
|---|---|---|
| First focusable element in `<body>` | ✓ | `app/layout.tsx:41` — SkipLink is first child of `<body>`, before HamburgerNav and Sidebar |
| Jumps to `#main` | ✓ | `components/SkipLink.tsx:9` (`href="#main"`); target exists at `app/layout.tsx:46` (`<main id="main">`) |
| `<main>` has `tabIndex={-1}` so focus actually lands | ✓ | `app/layout.tsx:47` |
| Visible on focus only | ✓ | `components/SkipLink.tsx:10-20` — `sr-only` + `focus:not-sr-only`; on focus it gets cream bg, 2px Terracotta border (4.33:1 PASS), z-index 9999, fixed top-left |

**Result: PASS.**

### 3. Sidebar (Alex §2)

| Check | Status | Evidence |
|---|---|---|
| Landmark is `<nav aria-label="...">` (not `<aside>`) | ✓ | `Sidebar.tsx:19-20` — `<nav aria-label="Site navigation">` matches my §2.1 ruling |
| Wordmark is `<a href="/">` with visible-text accessible name | ✓ | `Sidebar.tsx:31-34` — `<Link href="/">` rendering `profile.wordmarkText` (WCAG 2.5.3 Label in Name PASS — no diverging `aria-label`) |
| Featured-item link uses Sage-passing text token | ✓ | `Sidebar.tsx:51,54` — uses `text-charcoal` (8.53:1) and `text-accent-text` (Umber 7.30:1) |
| No `aria-current` on wordmark (per §2.5) | ✓ | Not present — correct |
| Sidebar hidden on mobile so its content doesn't tab-trap | ✓ | `Sidebar.tsx:22` — `hidden md:flex` |

**Result: PASS.** Note: the Tailwind `md:` breakpoint defaults to 768px, but Dani's §3.4 spec says ≤960px collapses to hamburger. See Finding F-1 (non-blocking — see below).

### 4. HamburgerNav (Alex §3)

| Check | Status | Evidence |
|---|---|---|
| `aria-expanded` toggles | ✓ | `HamburgerNav.tsx:96` (`aria-expanded={open}`) |
| `aria-controls="primary-menu"` references the overlay | ✓ | `HamburgerNav.tsx:97` ↔ `:137` (`id="primary-menu"`) |
| `aria-label` swaps Open/Close | ✓ | `HamburgerNav.tsx:98` (`open ? 'Close menu' : 'Open menu'`) |
| 44×44 hit area (option 1) | ✓ | `HamburgerNav.tsx:103` — `h-11 w-11` (44×44px) with visual glyph 22×14 inside |
| Focus trap inside overlay | ✓ | `HamburgerNav.tsx:55-69` — Tab/Shift+Tab cycle implemented; first/last computed each press |
| ESC closes | ✓ | `HamburgerNav.tsx:50-54` |
| Focus returns to trigger on close | ✓ | `HamburgerNav.tsx:40-43` — `close()` calls `triggerRef.current?.focus()` |
| Framer Motion respects `useReducedMotion` | ✓ | `HamburgerNav.tsx:35` import; gated on `:141-144` (overlay init/animate/transition) and `:161-167` (per-item stagger). With reduced motion, `initial={false}` skips the start state — end state renders immediately. |
| Active route has `aria-current="page"` | ✓ | `HamburgerNav.tsx:172` |
| Active-route Terracotta dot is `aria-hidden="true"` | ✓ | `HamburgerNav.tsx:182` |
| Body scroll locked while overlay open | ✓ | `HamburgerNav.tsx:81-87` — saves prev overflow, restores on unmount |
| Spec called for non-trapped content behind overlay (`aria-hidden`/`inert`) | ⚠ | Not implemented. See Finding F-3. |

**Result: PASS WITH FINDING** — focus trap and keyboard discipline are correct. Missing `aria-hidden` / `inert` on background while open is the one §3.2(1) gap.

### 5. Hero (Alex §7.2)

| Check | Status | Evidence |
|---|---|---|
| One `<h1>` per page | ✓ | `Hero.tsx:56-70` — single `<motion.h1>`; homepage has exactly one h1, 404 has exactly one h1 |
| Cormorant Light 300 only at ≥24px | ✓ | `Hero.tsx:60-67` — `font-light` + `text-[clamp(2.25rem,7vw,4rem)] md:text-[4rem]` (min 36px, max 64px — all above 24px). 404 page `font-light text-display-l` = 52px (`not-found.tsx:17`). All page-level `font-light` Cormorant headings at `text-display-m` = 36px. PASS comfortably. |
| `font-light` on DM Sans body text is unrelated to Cormorant rule | ✓ | Lines like `font-sans font-light text-body` use DM Sans 300 which is the body spec from Dani §2.2 — not a Cormorant Light issue. |
| Motion respects reduced-motion | ✓ | `Hero.tsx:26-30,48-50,57-59,73-75,87-90` — `useReducedMotion()` short-circuits `initial`, duration, delay |
| Heading-text contrast | ✓ | Near-black `#232420` on cream `#FAF9F5` = 14.82:1 PASS |
| Eyebrow uses `text-meta` (= `#5C5D54`) | ✓ | `Hero.tsx:51` — `text-text-meta` (5.83:1+ on warm bgs) |

**Result: PASS.**

### 6. NumberedStep (Alex §3.6, BLK-3.b)

| Check | Status | Evidence |
|---|---|---|
| Numerals at 19px DM Mono | ✓ | `NumberedStep.tsx:24-26` — `font-mono text-display-s` (= 19px) |
| Numerals use `--color-accent-text` (Umber), NOT raw Terracotta | ✓ | `NumberedStep.tsx:25` — `text-accent-text`. This is the BLK-3.b critical fix and it's correctly applied. Contrast: Umber `#7F4323` on Peach Cream `#FDE9D7` = 6.53:1 PASS. |
| Numeral is `aria-hidden="true"` (ordinal is decorative when title carries semantic) | ✓ | `NumberedStep.tsx:23` |
| Title is `<h3>` | ✓ | `NumberedStep.tsx:33` — `<h3>` Cormorant 400 at 24px (1.5rem). Sits after page `<h1>` and section `<h2>` — heading order OK. |
| Title weight is Regular 400 (not Light 300) per §7.2 | ✓ | `NumberedStep.tsx:33` — `font-normal` (400). PASS. |
| Homepage "Selected work" h3 uses Cormorant 400 at 28/32px | ✓ | `app/page.tsx:78` — `font-serif font-normal text-[1.75rem] md:text-[2rem]`. Both sizes (28px, 32px) above the 24px threshold AND uses Regular 400. PASS. |
| Note: homepage "Selected work" lists also have an ordinal numeral. That ordinal at `text-display-s` (19px) uses `text-accent-text` (Umber) | ✓ | `app/page.tsx:70` |

**Result: PASS.** The most consequential fix from the spec (Umber numerals) is correctly in place in both NumberedStep and the homepage selected-work list.

### 7. Footer

| Check | Status | Evidence |
|---|---|---|
| Lists wrapped in `<ul>` semantics | ✓ | `Footer.tsx:30,91` — site links and elsewhere links both real `<ul>`/`<li>` |
| Link text meaningful out of context | ✓ | "Home", "Work", "Certificates", "About", "Contact" — destination-named. The mailto link uses the actual email as the visible text (`Footer.tsx:97`) — meaningful. |
| External links get `rel="noopener noreferrer"` | ✓ | `Footer.tsx:104-105` — every social link |
| `target="_blank"` on external links | ✓ | `Footer.tsx:104` |
| Visible "(opens in new tab)" cue for SR users | ✓ | `Footer.tsx:110` — `<span className="sr-only">(opens in new tab)</span>` paired with the `↗` `aria-hidden` icon. Exactly the pattern I specced in §4.5. |
| Footer body text contrast | ✓ | `text-charcoal` on `bg-warm-white` = 7.86:1 PASS. `text-text-meta` (#5C5D54) on `bg-warm-white` = 5.83:1 PASS. |
| Column headers are `<h2>` | ✓ | `Footer.tsx:27,76,88` — three `<h2>` "Site", "About", "Elsewhere". See Finding F-4: this collides with the section `<h2>`s on the homepage (heading order). Non-blocking. |

**Result: PASS WITH FINDING** (F-4, see below).

### 8. Button (Alex §6.1)

| Check | Status | Evidence |
|---|---|---|
| Polymorphic `<a>` / `<button>` correctness | ✓ | `Button.tsx:83-105` (renders `<a>` when `href`), `:115-124` (renders `<button>` otherwise). Custom props (`variant`, `fullWidth`, `showDot`, `className`, `children`) stripped before forwarding to DOM. Native `type` is not auto-set on the `<button>` branch — see Finding F-5 (non-blocking). |
| Focus-visible ring | ⚠ | The global `*:focus-visible` in `globals.css:132-136` provides 2px Terracotta outline + 2px offset. Dani's §3.1 *specifically* calls for 3px offset on the primary button. Button.tsx does not override — it falls back to the global 2px offset. PASS WCAG (4.33:1 ratio, 2px is the AA minimum), but doesn't match Dani's intent. See Finding F-6. |
| Dot is `aria-hidden="true"` | ✓ | `Button.tsx:56` |
| Disabled state | ✗ (deferred) | Button has no explicit `disabled` styling; the spec called for `text-pebble` + `dot-stone` when disabled. Not currently used anywhere (no disabled buttons in C2/C3 build), so no live failure — but if Sky adds a disabled state next cycle, the spec must be honored. Decision-for-Sky D-1. |
| Border uses `border-interactive` (NOT decorative Stone) | ✓ | `Button.tsx:44,48` — both primary and ghost use `border-border-interactive` (`#888879`, 3.41:1 PASS) |
| Label-only accessible name | ✓ | `Button.tsx:101,121` — children render inside a `<span>`, dot is `aria-hidden`. |

**Result: PASS WITH FINDINGS** (F-5, F-6).

### 9. Homepage (Alex §4)

| Check | Status | Evidence |
|---|---|---|
| Heading order h1 → h2 → h3, no skipped levels | ⚠ | Page tree: `<h1>` (Hero tagline, `Hero.tsx:56`) → `<h2>` "A handful of recent things…" (`page.tsx:52`) → `<h3>` deliverable titles (`page.tsx:78`) → `<h2>` "Three quiet steps…" (`page.tsx:132`) → `<h3>` NumberedStep titles (`NumberedStep.tsx:33`) → `<h2>` "Have an AI project…" (`page.tsx:173`) → footer `<h2>` × 3 (`Footer.tsx:27,76,88`). The Footer `<h2>` headings landing after the page CTA `<h2>` is correct order. But the section CTA "Have an AI project worth building?" lacks a section landmark wrapper — see Finding F-4. |
| Alt-text policy on `<img>` tags | ✓ | No `<img>` tags rendered in Cycle 2/3 build (placeholder content only, no deliverable hero images yet). When images land, my §4.1 alt-text policy must be enforced. Pre-emptively flagging for Shamus / Quinn's next cycle. |
| `<div>` used where `<button>` belongs? | ✓ | None found. Hamburger trigger is a real `<button>`; cards are not yet built; CTAs are Button component or real `<a>`. |
| CTA mailto link has accessible context | ✓ | `page.tsx:178` — Button labeled "Get in touch" wraps `mailto:` href. Adjacent `<h2>` "Have an AI project worth building? Let's talk." provides the destination context. PASS. |
| Selected-work numerals (`01`, `02`, `03`) use Umber | ✓ | `page.tsx:70` — `text-accent-text` |
| Numerals are `aria-hidden="true"` (ordinal is decorative when list provides order) | ✓ | `page.tsx:69` |
| Featured Terracotta dot is `aria-hidden="true"` | ✓ | `page.tsx:82` |
| Tag pills are `<li>` inside `<ul>` (real list semantics) | ✓ | `page.tsx:90-99` |
| "See all work" link text meaningful | ✓ | `page.tsx:112` — "See all work" is destination-named, not "click here" |

**Result: PASS WITH FINDING** (F-4).

### 10. Global

| Check | Status | Evidence |
|---|---|---|
| `prefers-reduced-motion` media query | ✓ | `globals.css:156-165` — `*` reset of animation/transition durations + scroll-behavior. Matches Dani §5.2 + my §5.1 binding. |
| `:focus-visible` styles (not just `:focus`) | ✓ | `globals.css:132-136` — `*:focus-visible` selector. Correct per my §6.1 (no mouse-click ring flash). |
| Selection color is warm, not jarring blue | ✓ | `globals.css:170-173` — `::selection { background: var(--color-peach-cream); }`. Bonus polish, no contrast concern (selection is short-lived). |
| `<html lang="en">` | ✓ | `app/layout.tsx:37` — required for SR language detection |
| `color-scheme: light` declared | ✓ | `app/layout.tsx:20` — prevents browser dark-mode forced inversion. |

**Result: PASS.**

---

## Non-blocking findings

### F-1 — Sidebar breakpoint is 768px (Tailwind `md:`), spec was 960px

**File:** `components/Sidebar.tsx:22` (`hidden md:flex`), `app/layout.tsx:43` (`flex-col md:flex-row`).
**Issue:** Tailwind's `md:` breakpoint is 768px by default. Dani's §3.4 spec collapses the sidebar at <960px. Between 768px and 960px the sidebar will show at a width (280px) that crowds the main column (then ~488px before gutters). Not a WCAG failure, but a layout-density issue that may cramp body text in landscape tablets.
**Recommended fix:** add a custom Tailwind breakpoint `nav: 960px` in `tailwind.config.ts` and use `nav:flex` / `nav:flex-row` on the Sidebar and Layout. Or use Tailwind's `lg:` (default 1024px) — closer to 960 than `md:` is. Shamus's call.
**Severity:** non-blocking. Doesn't affect a11y, just visual rhythm.

### F-2 — Hamburger trigger hover color goes to Terracotta, with Terracotta on cream at 4.33:1

**File:** `components/HamburgerNav.tsx:107` (`hover:text-accent-primary`).
**Issue:** On hover, the hamburger glyph color shifts from Near Black (14.82:1 — comfortable PASS) to Terracotta `#B35F32` on cream (4.33:1). The 1px line stroke is a non-text UI element subject to 3:1 (PASS — 4.33:1). So this is technically fine. Just flagging because it's the one place where Terracotta-as-color is applied to a 1px line, which is the edge case of "graphical use." If Sky later asks for the trigger to be persistently Terracotta (not just on hover), the 4.33:1 ratio still passes 3:1 for UI but loses some headroom on low-density screens.
**Recommended fix:** none required. PASS as specced.
**Severity:** noted, no action.

### F-3 — Overlay does not set `aria-hidden`/`inert` on background page while open

**File:** `components/HamburgerNav.tsx:133-196`.
**Issue:** My spec §3.2(1) said: "the rest of the page is set `aria-hidden="true"` (or `inert` if browser support allows) so screen-reader virtual cursor can't reach behind the overlay." Current implementation has `role="dialog" aria-modal="true"` which most modern screen readers honor for AT-cursor containment, BUT `aria-modal` is not universally enforced (especially older NVDA + Firefox combinations and VoiceOver web rotor). The full safety net is to also mark sibling elements `inert` or `aria-hidden="true"`.
**Recommended fix:** when overlay opens, set `inert` on the layout's `<div className="flex flex-col md:flex-row min-h-screen">` wrapper (or its children excluding the overlay). React 19 supports `inert` as a prop natively; React 18 needs an effect that toggles the DOM attribute. Body scroll lock is already handled — this is just the rotor / virtual cursor gap.
**Severity:** non-blocking but high-priority for the next polish cycle. Until then, `aria-modal` + focus trap is a reasonable belt-and-suspenders.

### F-4 — Footer column headers are `<h2>` and create heading-tree ambiguity with section h2s

**File:** `components/Footer.tsx:27,76,88`.
**Issue:** The footer uses `<h2>Site</h2>`, `<h2>About</h2>`, `<h2>Elsewhere</h2>` for its three column headers. On the homepage, the page already has multiple `<h2>` section openers ("A handful of recent things…", "Three quiet steps…", "Have an AI project…"). Three more `<h2>`s at the bottom muddy the heading rotor — a SR user scanning by heading hears six h2s, three of which are footer navigation column labels, not page sections.
**Recommended fix:** demote footer column headers to `<h3>` (since they sit within an implicit "Footer" landmark), or wrap them in a `<section aria-labelledby="footer-heading">` with a visually-hidden `<h2 id="footer-heading">Site footer</h2>` and demote the three column titles to `<h3>`. Simpler option: use `<h3>` directly — the `<footer>` landmark itself provides the structural context.
**Severity:** non-blocking. WCAG 1.3.1 (Info and Relationships) is technically satisfied because the columns *do* carry headings; the issue is hierarchy clarity.

### F-5 — Button component does not set `type="button"` on the native `<button>` branch

**File:** `components/Button.tsx:115-124`.
**Issue:** When `href` is omitted, the component renders a native `<button>` without an explicit `type`. The HTML default for `<button>` inside a `<form>` is `type="submit"` — if Sky ever wraps a Button in a form (likely once the contact form lands), clicking it will submit the form unintentionally.
**Recommended fix:** default `type="button"` on the `<button>` branch unless the caller overrides. One-line fix on line 118: `type={(props as ButtonProps).type ?? 'button'}`.
**Severity:** non-blocking — no `<form>` currently exists. Pre-emptive fix for when Quinn approves the contact form.

### F-6 — Global focus-visible offset is 2px; Dani §3.1 specs 3px for the primary button

**File:** `app/globals.css:132-136` (global), `components/Button.tsx` (no override).
**Issue:** Dani's §3.1 primary-button spec says "focus-visible: 2px outline `--color-accent-primary` (Terracotta), offset 3px." The global `:focus-visible` uses 2px offset. The Button has no component-level override, so it inherits the 2px offset. WCAG passes either way (the 4.33:1 ratio is what matters, not the offset distance), and visually 2px is hardly different from 3px on a pill button — but it's a small deviation from Dani's exact spec.
**Recommended fix:** add `focus-visible:outline-offset-[3px]` (or equivalent) to the Button's base classes. Alternatively, ratify the 2px offset with Dani and update §3.1.
**Severity:** non-blocking, cosmetic. WCAG PASS either way.

---

## Decisions for Sky

### D-1 — Button disabled state is undefined; lock the spec before any caller needs it

**Context.** Dani §3.1 says disabled buttons get `text-pebble` (`#B8B8AA`) + `dot-stone` (`#DCDCD6`) + no hover. Pebble on cream is 1.90:1 — fails 4.5:1 as text. That's intentional (WCAG 1.4.3 exempts disabled-state text), but you should consciously choose between:

- **Option A** (Dani's spec): low-contrast disabled — visually obvious that the button is non-actionable, but the label is hard to read at all. WCAG-compliant per the disabled exemption.
- **Option B** (slightly higher contrast): use `text-charcoal` at 50% opacity = ~4.3:1 — still readable, still clearly disabled. WCAG-compliant.

My recommendation: **Option A** matches the editorial restraint Dani designed for. If a button is disabled, the user can't act on it — making the label illegible reinforces "this isn't for you right now."

**Decision:** Sky to ratify A or B. No urgency until a caller needs a disabled button.

### D-2 — Should the F-3 overlay background gating (`inert`) be added now, or deferred?

**Context.** Without `inert` on the background, SR users with older NVDA+Firefox or some VoiceOver configurations can virtual-cursor through the page content "behind" the hamburger overlay. `aria-modal="true"` mitigates this in most modern combinations but is not bulletproof. Cost to add: a small `useEffect` that toggles `inert` on sibling layout nodes — about 15 lines. Risk: very low; `inert` is well-supported in modern browsers, React 19 has it as a JSX prop. Polyfill exists for older browsers if needed.

**My recommendation:** add in the next cycle, alongside any other hamburger-overlay polish. Not urgent enough to block C4, urgent enough to schedule.

**Decision:** Sky to confirm priority — schedule F-3 for C4 or defer further?

---

## Out of scope (deferred)

- **Real images:** no `<img>` tags yet. Once Sky provides deliverable hero images / certificate badges, every image needs alt-text review per my §4.1 policy.
- **Contact form:** not yet built. When it lands, every input uses `border-interactive` (#888879) and gets `<label for=>` association.
- **Detail pages (Work, About, Certificates, Contact):** all currently 404. The 404 page is well-built and accessible; once those routes ship, each page gets its own audit pass.
- **Dark mode:** still out of scope (Dani §8).
- **Lucide icons:** not yet added. When introduced, decorative icons need `aria-hidden="true"`; meaningful icons need `aria-label`.

---

## Sign-off

**This audit PASSES.** No blockers. The Cycle 2/3 build is the first time my Day-0 spec has been validated end-to-end against real code, and Shamus implemented every BLK fix correctly. The 6 non-blocking findings are polish items for the next 1-2 cycles. The 2 decisions for Sky are about how strict to be on disabled state and how soon to add overlay `inert`.

Shamus is unblocked to keep building. Sky can ratify D-1 and D-2 at leisure.

---

**Authority chain:** Constitution v1.3 Art. 7 (accessibility non-negotiable) > role file (`commands/alex.md`) > skill (`accessibility-ux`). No external sends. Read-only on code. No live surface touched. Report written to `/Users/skypie/Portfolio/qa-reports/` per per-project convention.
