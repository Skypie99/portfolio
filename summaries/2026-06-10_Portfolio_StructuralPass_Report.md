# Portfolio Structural Pass — Report
**Date:** 2026-06-10 · **Branch:** `structural/portfolio-links-rename-2026-06-10` (off main `8f94da4`)
**Commits:** `dc8f321` (plan) → `e5089e4` (certs) → `0a05182` (LinkedIn) → `3bb190a` (rename) → `6af0b53` (honesty) → `9d36062` (hairline) → this report
**Scope:** certificate verify links + 3 additions, LinkedIn correction, "Correspond" → "Let's talk", five honesty fixes, world-horizon hairline. No copywriting — every visible string was supplied. **No merge — main is your gate.**

---

## DECISIONS FOR SKY

1. **Hairline verdict — confirmed `.world-horizon`, softened (your pre-approval).**
   Diagnosis was rigorous: a full-DOM audit found exactly ONE viewport-fixed 1px element
   (`.world-horizon`, `app/globals.css:1041`); a marker test painted that same element
   bright and it appeared precisely at the reported position (full-width, fixed, 60% of
   viewport); computed style matched every symptom (peaked at opacity 1.0 × alpha 0.4 in
   the day range — the artifact). It sits in the editable world range, NOT locked
   territory. Softened per your call: opacity ceiling `1 → 0.35`, gradient alpha
   `0.4 → 0.22` (peak effective alpha ~0.077, 81% softer). Scroll grading, the 0.12
   night floor, and the `--day-night-rest` no-JS fallback all preserved; verified at
   375/768/1280, both themes, top/middle/bottom scroll. The rule has no animation, so
   reduced-motion is unaffected. **Please eyeball it live — if you want it softer or
   brighter, it's a 2-number tune.**

2. **3 new certificates + Dani badge artwork (your pre-approval).** Introduction to
   Model Context Protocol, Claude Code in Action, Claude Code 101 — inserted after
   Claude 101 in the JSON; the page itself sorts by issue date, so MCP (June) leads.
   Dani designed three 500×500 transparent-PNG badges matching the hand-drawn ink
   family (sampled ink `rgb(20,20,19)` + cream `#E3DACC` from your existing badges; one
   cream accent each): **plug-meets-socket** (MCP), **terminal with speed lines + cream
   lightning bolt** (Code in Action), **laptop with prompt + the cream apple quoted from
   Claude 101** (Code 101). Verified live in the CertCard well. SVG masters are parked
   in `/tmp/dani-badges/` — say the word if you want them archived in the repo.

3. **LinkedIn handle rename (mechanical consistency).** The handle field
   (`sky-halisky → skyler-halisky`) renders as the contact page's visible link text; it
   was derived character-for-character from your supplied URL. Note the supplied URL
   also drops the old trailing slash — applied verbatim.

4. **Issuer "(Coursera)" suffixes NOT applied.** The directive table's "(Coursera)"
   suffixes were identification metadata, not supplied copy — issuer strings on the site
   are unchanged (Google / University of Michigan / DeepLearning.AI).

5. **Credentials surfaces grew 6 → 9 rows automatically** (certificates grid + homepage
   Credentials list). No layout changes were needed; no test asserts counts.

6. **D-2 / D-3 / D-4 exact results** — see before→after table below.

7. **Sweep oddities (flagged, nothing changed):**
   - **LinkedIn returns 405/999 to automated checks** — that's LinkedIn's bot-blocking,
     not a dead link. The URL is your supplied string char-for-char; please click it
     once live.
   - **Dashboard deliverable has no GitHub link** (5 repo links + 6 demos, not 6+6).
     Looks intentional; left alone.
   - **Dark-mode badge wells:** ALL badge images (old and new) are black-ink-on-
     transparent and nearly invisible against the dark card well. Pre-existing behavior,
     identical treatment for new badges — logged for a future pass (e.g. a light well or
     `invert` filter in dark theme).
   - **Homepage credential links** say "View credential: <title> from <issuer>" but
     don't textually announce "(opens in new tab)" (the /certificates page version
     does). Pre-existing pattern, compliant, logged for a future pass.
   - **Locked-range line number shifted:** my 2 comment lines above `.world-horizon`
     move the cinematic block start from globals.css line 1438 → **1440**. The block
     itself byte-compares identical to main. Future audits should anchor on content,
     not the literal 1438.

---

## Before → after (every link, label, and D-item)

### Section A — certificate verify links (content/certificates.json)

| Cert | Before | After |
|---|---|---|
| AI Fluency Framework & Foundations | `https://www.anthropic.com/credentials/ef3fxd6rptc5` | `https://verify.skilljar.com/c/ef3fxd6rptc5` |
| Introduction to Claude Cowork | `…/credentials/rgnu9r9tyfoj` | `https://verify.skilljar.com/c/rgnu9r9tyfoj` |
| Claude 101 | `…/credentials/9twktanftgpq` | `https://verify.skilljar.com/c/9twktanftgpq` |
| Google Prompting Essentials Specialization | (already exact) | unchanged — verified |
| Programming for Everybody | `…/accomplishments/certificate/LNNCK1O38M7U` | `…/accomplishments/records/LNNCK1O38M7U` |
| AI For Everyone | `https://www.deeplearning.ai/verify/5Z1UGVB7BO2N` | `https://www.coursera.org/account/accomplishments/records/5Z1UGVB7BO2N` |

**Added** (after Claude 101; existing relative order untouched):

| id | title | issued | credentialId | URL |
|---|---|---|---|---|
| `anthropic-mcp-intro-2026` | Introduction to Model Context Protocol | 2026-06-01 | `397oybawccv4` | `https://verify.skilljar.com/c/397oybawccv4` |
| `anthropic-claude-code-in-action-2026` | Claude Code in Action | 2026-05-01 | `ad8ot95z543s` | `https://verify.skilljar.com/c/ad8ot95z543s` |
| `anthropic-claude-code-101-2026` | Claude Code 101 | 2026-05-01 | `cxrwvg7sz5w6` | `https://verify.skilljar.com/c/cxrwvg7sz5w6` |

Alt text follows the existing formula ("Anthropic <title> credential badge"); tags
mechanical/non-rendered; `validate-assets` passes all 9 badges.

### Section B — LinkedIn

| Location | Before | After |
|---|---|---|
| `content/profile.json:16` (feeds Footer + contact page) | `https://www.linkedin.com/in/sky-halisky/` | `https://www.linkedin.com/in/skyler-halisky` |
| `content/profile.json:15` handle (contact-page link text) | `sky-halisky` | `skyler-halisky` |
| `app/layout.tsx:146` JSON-LD `sameAs` | `https://www.linkedin.com/in/sky-halisky/` | `https://www.linkedin.com/in/skyler-halisky` |

### Section C — rename (6 locations; `id: 'contact'`, `/#contact` hrefs, `aria-label="On this page"` all untouched)

| Location | Before | After |
|---|---|---|
| `components/SidebarSectionNav.tsx:43` | `'Correspond'` | `"Let's talk"` |
| `components/HamburgerNav.tsx:32` | `'Correspond'` | `"Let's talk"` |
| `app/page.tsx` eyebrow | `Correspond` | `Let&apos;s talk` |
| `app/contact/page.tsx` eyebrow | `Correspond` | `Let&apos;s talk` |
| `components/Footer.tsx` SITE column | `Correspond` | `Let&apos;s talk` |
| `SidebarSectionNav.test.tsx:32,54` | `'Correspond'` | `"Let's talk"` |

Casing inherited from parents' `uppercase` utilities (verified: zero hardcoded
"LET'S TALK" anywhere in the build). Built `out/`: **0** exact-case "Correspond" hits
(the only case-insensitive hit is React's internal `correspondingUseElement` — framework
identifier, not user-visible).

### Section D — honesty fixes

| # | File | Before | After |
|---|---|---|---|
| D-1 | `content/deliverables.json` (Prompt Library tech) | `"Vercel"` | `"GitHub Pages"` |
| D-2 | same, body | "…favorites, bulk import/export, and dark mode. **Fifty features shipped.** Zero backend. Deployed as a static site…" | "…favorites, bulk import/export, and dark mode. Zero backend. Deployed as a static site…" |
| D-3 | `app/about/page.tsx` | "…no backend, no account, no server. **Mutual Mesh is built the same way.** If the data is not necessary, do not collect it." | "…no backend, no account, no server. If the data is not necessary, do not collect it." |
| D-4a | `content/case-studies.md:90` (non-rendered, zero imports) | "End-to-end encrypted Expo app." | "Privacy-first Expo app." |
| D-4b | same, line 101 bullet | "E2E encryption enables the requests that platforms would suppress" | "Privacy-first design enables the requests that platforms would suppress" (your approved smoothing) |
| D-5 | `.github/workflows/deploy.yml:52` + `ci.yml:38,50,62,75` | `node-version: 20` ×5 | `node-version: 24` ×5 — YAML parse-verified; exercised on next push; local gates already ran on Node v24.15.0 |

### Section E — hairline (app/globals.css, `.world-horizon` only)

| Property | Before | After |
|---|---|---|
| opacity | `clamp(0.12, calc(1 - --day-night), 1)` | `clamp(0.12, calc(1 - --day-night), 0.35)` |
| gradient alpha | `rgb(--sky-sun / 0.4)` | `rgb(--sky-sun / 0.22)` |

Verified after: capped 0.35 across day/golden-hour, 0.12 floor at night, full-width at
60% on 375/768/1280, both themes, top/middle/bottom scroll; world arc/grade/sun visually
unchanged; single diff hunk (lines 1037–1054), zero locked-token mentions.

---

## 11-URL verification table (HEAD/GET, live)

| URL | Status |
|---|---|
| verify.skilljar.com/c/ef3fxd6rptc5 | 200 ✓ |
| verify.skilljar.com/c/rgnu9r9tyfoj | 200 ✓ |
| verify.skilljar.com/c/9twktanftgpq | 200 ✓ |
| verify.skilljar.com/c/397oybawccv4 | 200 ✓ |
| verify.skilljar.com/c/ad8ot95z543s | 200 ✓ |
| verify.skilljar.com/c/cxrwvg7sz5w6 | 200 ✓ |
| coursera.org/…/specialization/MIQJBUVPS86V | 200 ✓ |
| coursera.org/…/records/LNNCK1O38M7U | 200 ✓ |
| coursera.org/…/records/5Z1UGVB7BO2N | 200 ✓ |
| linkedin.com/in/skyler-halisky | 405/999 — LinkedIn bot-block; **manual click-through needed** |
| github.com/skypie99 | 200 ✓ |

Also swept: all 11 deliverables.json links (5 GitHub repos + 6 demos) — **all 200**.
Mailto: both email components assemble `mailto:` from `profile.contactEmail`
(`skylerhalisky@gmail.com`) — label and destination share one source, no mismatch.
Built `out/` contains each of the 9 cert URLs + LinkedIn char-for-char; zero hits for
the old `anthropic.com/credentials` pattern or `sky-halisky`.

---

## Gate results per commit

| Commit | lint (errors/warnings, baseline 0/0) | typecheck | tests |
|---|---|---|---|
| `e5089e4` certs | 0 / 0 ✓ | ✓ | 184 pass ✓ |
| `0a05182` LinkedIn | 0 / 0 ✓ | ✓ | 184 pass ✓ |
| `3bb190a` rename | 0 / 0 ✓ | ✓ | 184 pass ✓ |
| `6af0b53` honesty | 0 / 0 ✓ | ✓ | 184 pass ✓ |
| `9d36062` hairline | 0 / 0 ✓ | ✓ | 184 pass ✓ |
| final | `npm run test:static` (full build + static-integrity) ✓ | | |

**Accessibility pass on changed surfaces:** all 9 credential links are real anchors with
`target="_blank"` + `rel="noopener noreferrer"` and accessible names announcing
destination + new-tab ("<title> credential (opens in new tab)"); programmatic focus
lands on each; global `:focus-visible { outline: 2px solid … }` supplies the visible
ring; renamed nav keeps `aria-label="On this page"`, `/#contact` lands (verified live);
label swaps inherit existing token styles so AA contrast is unchanged; `.world-horizon`
has no animation (reduced-motion unaffected) and `--day-night-rest` no-JS fallback
verified present. New badge alt text passes the schema's alt-text rule.

**Adversarial verification fleet (4 agents):** a11y built-output, rename integrity,
full-diff audit, char-for-char data fidelity — **all pass, zero blockers**. The diff
audit byte-compared the locked cinematic CSS block against main: identical.

---

## Intro byte-identity (the lock held)

- `git diff main..HEAD -- components/CinematicIntro.tsx components/cinematic/ public/images/cinematic/ cinematic-masters/` → **empty** ✓ (verified at branch start AND after final commit)
- Blob hash `components/CinematicIntro.tsx`: `6fafe087311f72db22604acab99c90add95e16c1` ✓ unchanged
- globals.css: single hunk at 1037–1054 (world range); cinematic block byte-identical, now starting at line 1440 (+2 from the added comment)
- `--font-cormorant`, `--sidebar-w`, cinema tokens: zero mentions in the diff ✓

---

## For a future pass (found, not touched)

- og-image.svg redesign
- About "command-line trainer" prose (+ open question: de-emphasize About to match hero?)
- `work/page.tsx` "slowly, documented honestly" echo
- Orphaned `.hero-status-ping`
- Dashboard in About "Right now" list
- Dark-mode badge wells: all ink badges near-invisible in dark theme (pre-existing)
- Homepage credential aria-labels don't announce "(opens in new tab)" (the /certificates version does)
- Badge SVG masters live in `/tmp/dani-badges/` — archive in repo if wanted

---

## Sky's review guide

```
cd ~/Portfolio
git diff main..structural/portfolio-links-rename-2026-06-10
```

Live click-through (after you merge & deploy, or via `npm run dev` on the branch):
1. `/certificates` — 9 cards; the 3 new badges (plug/socket, terminal+bolt, laptop+apple); click each "verify" pill → opens the right verify page in a new tab.
2. Homepage Credentials list — 9 rows, same links.
3. **LinkedIn** (footer ELSEWHERE + contact page) → should land on *your* profile (`in/skyler-halisky`) — the one link automation couldn't confirm.
4. Sidebar + hamburger + footer + both eyebrows → "Let's talk"; sidebar item still scrolls to the contact section.
5. `/about` privacy paragraph — Mutual Mesh sentence gone, paragraph reads cleanly.
6. `/work/prompt-library` — tech chips show GitHub Pages; body no longer claims fifty features.
7. Scroll the homepage slowly in both themes — the horizon line should read as a faint designed glow, never a stray hairline.

Branch left clean on `structural/portfolio-links-rename-2026-06-10`. **No merge performed — main is your gate.**
