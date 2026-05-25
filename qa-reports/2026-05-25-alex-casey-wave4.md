# Wave 4 QA Report — Alex (Link Audit) + Casey (Copy Polish)
**Date:** 2026-05-25  
**Branch:** `content/auto-2026-05-25-links-and-copy`  
**Files changed:** `content/deliverables.json`

---

## Task A — Alex: Full Link Audit

### All links found across the codebase

| Link text / purpose | URL | Status | File |
|---|---|---|---|
| GitHub profile (socials) | `https://github.com/skypie99` | ✅ REAL | `content/profile.json` |
| LinkedIn profile (socials) | `https://www.linkedin.com/in/sky-halisky/` | ✅ REAL | `content/profile.json` |
| AccessMap — GitHub | `https://github.com/Skypie99/AccessMap` | ✅ REAL | `content/deliverables.json` |
| AccessMap — Live demo | `https://access-map-tau.vercel.app` | ❓ UNVERIFIED | `content/deliverables.json` |
| Claude Corp — GitHub | `https://github.com/Skypie99/Claude_Corp` | ✅ REAL | `content/deliverables.json` |
| Claude Corp — Live demo | `https://skypie99.github.io/Claude_Corp/` | ❓ UNVERIFIED | `content/deliverables.json` |
| Prompt Library — GitHub | `https://github.com/Skypie99/Prompt_Libary` | ✅ REAL (note: "Libary" typo in repo name) | `content/deliverables.json` |
| Prompt Library — Live demo | `https://skypie99.github.io/Prompt_Libary/` | ❓ UNVERIFIED | `content/deliverables.json` |
| Pac-Man Code Trainer — GitHub | `https://github.com/Skypie99/pacman-code-trainer` | ✅ REAL | `content/deliverables.json` |
| Pac-Man Code Trainer — Live demo | `https://skypie99.github.io/pacman-code-trainer/` | ✅ REAL (known live per memory) | `content/deliverables.json` |
| Mutual Mesh — GitHub | `https://github.com/Skypie99/mutual-mesh` | ❓ UNVERIFIED | `content/deliverables.json` |
| Mutual Mesh — Live demo | `https://mutual-mesh.vercel.app` | ❓ UNVERIFIED | `content/deliverables.json` |
| Claude Engineer Certification — Credential | `https://example.com/credentials/anthropic-claude-engineer` | ⚠️ PLACEHOLDER | `content/certificates.json` |
| Google Cloud ML Engineer — Credential | `https://example.com/credentials/google-ml-engineer` | ⚠️ PLACEHOLDER | `content/certificates.json` |
| Prompt Engineering for Developers — Credential | `https://example.com/credentials/deeplearning-ai-prompt-engineering` | ⚠️ PLACEHOLDER | `content/certificates.json` |
| AI Engineering Professional Certificate — Credential | `https://example.com/credentials/ibm-ai-engineering` | ⚠️ PLACEHOLDER | `content/certificates.json` |
| Responsible AI Practices — Credential | `https://example.com/credentials/microsoft-responsible-ai` | ⚠️ PLACEHOLDER | `content/certificates.json` |
| Contact email | `mailto:skylerhalisky@gmail.com` | ✅ REAL | `content/profile.json` (rendered in multiple components) |
| Internal nav links (`/`, `/work/`, `/certificates/`, `/about/`, `/contact/`) | Relative paths | ✅ REAL (internal) | `components/Footer.tsx`, `components/Sidebar.tsx`, etc. |
| Skip link | `#main` | ✅ REAL (anchor) | `components/SkipLink.tsx` |

---

### Placeholder links Sky MUST fill in manually

All 5 are in `content/certificates.json` — `credentialUrl` field:

| Certificate | Field to update | Where to find the real URL |
|---|---|---|
| Claude Engineer Certification (Anthropic) | `credentialUrl` | Your Anthropic account / certificate email |
| Professional Machine Learning Engineer (Google Cloud) | `credentialUrl` | Google Cloud credential portal |
| Prompt Engineering for Developers (DeepLearning.AI) | `credentialUrl` | Coursera or DeepLearning.AI account |
| AI Engineering Professional Certificate (IBM) | `credentialUrl` | Coursera or IBM credential page |
| Responsible AI Practices (Microsoft Learn) | `credentialUrl` | Microsoft Learn profile |

**File:** `/Users/skypie/Portfolio/content/certificates.json`  
Replace each `"https://example.com/credentials/..."` with the real credential verify URL.

---

### Note on unverified deliverable links

URLs marked ❓ UNVERIFIED are plausible (correct GitHub username, real domain patterns) but were not fetched. Sky should spot-check:
- `https://access-map-tau.vercel.app` — may not be deployed yet
- `https://skypie99.github.io/Claude_Corp/` — GitHub Pages must be enabled on the repo
- `https://skypie99.github.io/Prompt_Libary/` — note repo name has typo "Libary" (matches GitHub repo name, so consistent)
- `https://github.com/Skypie99/mutual-mesh` — confirm repo is public
- `https://mutual-mesh.vercel.app` — confirm Vercel deployment is live

---

## Task B — Casey: Deliverables Content Quality Pass

### Changes made to `content/deliverables.json`

All summaries were rewritten to be more specific and direct. All fit within the 160-character schema limit. Changes below show before → after for each project.

---

**AccessMap**

Before:
> "A privacy-respecting accessibility-flagging app helping disabled users navigate the city with care and confidence."

After:
> "Mobile app for flagging accessibility barriers — broken ramps, missing tactile paths — pinned to a real city map. Privacy-first: no tracking, no data sold."

Why: Original was vague ("care and confidence" doesn't tell a recruiter what it does). New copy names the actual barriers, explains the map mechanic, and states the privacy stance plainly.

---

**Claude Corp**

Before:
> "A 14-role multi-agent system with a written Constitution governing how the team collaborates, plans, and ships safely."

After:
> "An 18-role AI team governed by a written Constitution. Each agent owns a domain; an orchestrator runs the cycles. The infrastructure behind this portfolio."

Why: Role count was wrong (18, not 14, per CONSTITUTION v1.11). Added agent domain detail and the "infrastructure behind this portfolio" line — this frames the whole portfolio for recruiters.

---

**Prompt Library**

Before:
> "A solo-built Next.js prompt manager with fifty shipped features, browser-only storage, and an API key that never leaves the user's machine."

After:
> "Local-first prompt manager in Next.js 15. Prompts stay in the browser, API key never leaves the machine. Fifty features shipped across twenty stacked branches."

Why: "browser-only storage" is jargon; "local-first" is clearer and matches the tag. Added "twenty stacked branches" — that's a strong signal of structured, professional workflow.

---

**Pac-Man Code Trainer**

Before:
> "A retro flashcard game for memorizing Claude Code CLI commands and macOS shortcuts. 40 cards, zero dependencies, vanilla HTML/JS."

After:
> "CLI commands turned into a retro arcade game. Forty flashcards covering Claude Code and macOS shortcuts, zero dependencies, runs straight from GitHub Pages."

Why: Led with the concept hook ("turned into a retro arcade game") instead of burying it. "Vanilla HTML/JS" moved out — that info is in the tech stack tags.

---

**Mutual Mesh**

Before:
> "Privacy-first mutual-aid platform connecting neighbours who want to give with neighbours who need a hand."

After:
> "Mutual-aid app connecting neighbours who want to help with those who need it. Privacy-first: a PRIVACY.md gate blocks every new feature before any code ships."

Why: "want to give with neighbours who need a hand" was grammatically awkward. New copy is cleaner. Added the PRIVACY.md gate detail — that's a real differentiator that shows privacy is structural, not marketing.

Also: Added `TypeScript` to Mutual Mesh tech stack (it was missing; app uses Expo/RN/Supabase/TS per project memory).

---

### Tech stack fixes

| Project | Before | After |
|---|---|---|
| Mutual Mesh | `["Expo", "React Native", "Supabase"]` | `["Expo", "React Native", "Supabase", "TypeScript"]` |

All other tech stacks were accurate. No "AI" or "Solo build" entries found in current data.

---

### Tags review

All tags are accurate and appropriate. No missing obvious tags identified.

### Status

All 5 projects correctly reflect 2026 and their current state. No `status` field exists in the schema — status is implied by `year` and description copy.

---

## Build & Test Results

- `npm run typecheck` — PASS (no errors)
- `npm test` — 40/40 PASS

---

## DECISIONS FOR SKY

1. **5 certificate credential URLs** — all placeholder `example.com` links. Must be replaced manually with real credential verify URLs before the certificates page is useful to recruiters. File: `content/certificates.json`.

2. **Prompt Library repo name typo** — the GitHub repo is named `Prompt_Libary` (missing an 'r'). The URL in deliverables.json matches the actual repo name, so the link is correct as-is. Sky should decide whether to rename the GitHub repo to `Prompt_Library` (which would require updating the URL here and the GitHub Pages deployment URL).
