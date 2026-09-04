# Phase 03 Copy and Placement Specification (APPROVED by Sky, 2026-09-03)

**Prompt:** `SKYPI-PORTFOLIO-3.0-P03-LEAD`
**Date:** 2026-09-03
**Base:** `622797ebc42085bf0138a2ded6925f5c9c6e4bc6` / tree `dca3dd238162ddb6e7814bc0575e036faa933d90`
**Worktree:** `/Users/skypie/Portfolio-3.0-baseline`, branch `claude/portfolio-3.0-phase00-baseline-20260903`
**Authority:** Phase 01 `docs/IDENTITY_AND_CLAIM_CONTRACT.md` (Sky-approved 2026-09-03)

> **Status: APPROVED. Sky signed off in-session on 2026-09-03; see §8 for the exact decisions and the owner-supplied facts.** This document is the lead's conversion of the Phase 01 contract into an implementable copy/placement spec. Per the prompt, Sky's approval is required before implementation, and specifically before: the final copy specification, any sensitive support wording, contact intent, and the integration commit.

---

## 0. Three corrections to the prompt's premises (evidence-backed)

The prompt's task list was written against the planning baseline. Direct source verification at the current SHA finds three of its premises inaccurate. Recording them rather than implementing against a stale assumption.

### C-1 — T-048's "Credentials `AI Builder` masthead" does not exist

T-048 says: *"Replace or contextualize the Credentials `AI Builder` masthead."*

There is no `AI Builder` string on `/certificates`. The masthead is:
- eyebrow `Credentials: {count}` (`app/certificates/page.tsx:78`)
- H1 `Credentials` (`app/certificates/page.tsx:83`)
- subtitle: *"Selected credentials and certifications. A short paper trail of the things I've studied formally: most of the learning happens in the work, not on paper."* (`app/certificates/page.tsx:85-89`)

That subtitle **already** subordinates credentials to the work, which is precisely what T-048 asks for. The same subordinating language is repeated in the empty state (`:110-111`), so it is a deliberate phrase family, not a one-off.

The only capitalised `AI Builder` in live code is invisible structured data: `jobTitle: 'Technical Support · AI Builder'` (`app/layout.tsx:206`), inherited by every route.

**Resolution:** T-048 collapses into T-042 (fix the JSON-LD `jobTitle`), plus one optional clause adding support context to the Credentials subtitle. The existing subordinating sentence is treated as **protected language** and carried forward unchanged.

### C-2 — Support-first role ordering already exists, site-wide, and is a prior deliberate decision

`components/RunwayIdentity.tsx:103-107` renders, in document order:

```
Sky Halisky
Technical Support                 ← primary line
AI-assisted Builder               ← explicit `--tertiary` style class
```

Its own docblock (`:52-54`) states the intent: *"preserve Technical Support as the primary professional identity and describe the builder side without presenting it as a conventional AI engineering job title."* A regression test already forbids the bare string: `components/__tests__/RunwayIdentity.test.tsx:17` asserts `/AI Builder$/` is **not** in the document.

This chip is mounted on every page and is the **first identity text painted**, ahead of `app/page.tsx`'s own DOM.

**Resolution:** F-005 is narrower than stated. The support-first hierarchy is not absent; it fails specifically in **(a) metadata/structured data, (b) the About page H1, (c) the closing invitations**. This spec targets those three and leaves `RunwayIdentity` alone. Any change here must keep that test passing.

### C-3 — The contact-intent flip reverses a documented, deliberate owner stance

Contract §15 (approved 2026-09-03) rules: hiring/interviews first, collaboration secondary. But the current wording is not an oversight; it is a recorded decision:

- `app/contact/page.tsx:94-95`: *"the quiet career-document pointer — employer-safe wording, deliberately NOT a résumé PDF (Sky's quiet-search stance)."*
- `components/Footer.tsx:178-179`: *"Deliberately NOT a résumé PDF (Sky's employer-safe, quiet-search stance)."*
- `qa-reports/2026-06-18_AttributionPass_Portfolio.md:25`: positioning chosen as *"soft / employer-safe per Sky's 2026-06-18 decision."*

Two Sky decisions, four months apart, point different directions. §15 is newer and explicit, so it governs — but **how loud** the flip should be is a live owner judgment, not something this spec should assume. See Decision **D2**.

---

## 1. Hard constraints every proposed string obeys

| Constraint | Source | Effect on copy |
|---|---|---|
| **Zero em dashes** (`—`) in recruiter copy, source *and* rendered | `lib/__tests__/recruiter-copy-truth.test.ts` | No proposed string contains `—`. Use periods, colons, commas. |
| **No `--`** in bodies (renderer converts it) | same guard | none used |
| **Curly apostrophe `’`**, never straight `'` | `lib/__tests__/smart-punctuation.test.ts` | all possessives/contractions use `’` |
| **Section ids must register in the rail** | `lib/sectionNav.ts` rule 1 + `lib/__tests__/section-nav-anchors.test.ts` T2/T4/T5 | any new `<section id>` on `/` needs a `ROUTE_SECTIONS['/']` entry whose label is **verbatim** the section's own eyebrow, in document order |
| **`components/cinematic/**` untouched** | PR-001, `CLAUDE.md:38` | verified by `git diff -- components/cinematic` returning empty |
| **Hero positioning line unchanged** | PR-004 | byte-identical; guarded by a new test |
| **`EXPECTED_SITE_NAME` pin** | `lib/__tests__/static-integrity.test.ts:437` | must be updated in the same commit as the siteName change |
| **No new visual system** | prompt out-of-scope | reuse `LedgerRow` in a `CalibrationRecord`-shaped section |

---

## 2. The Support Operating Record — sourcing (T-045)

### 2.1 The sourcing standard

Contract §13 sets it explicitly: *"The publishable fact bank draws only from already-live, already-public Portfolio copy."* Its table enumerates three facts, all surveyed from `app/about/page.tsx`.

**The survey was incomplete.** It did not include the homepage hero positioning line, which is equally live, equally public, and is additionally **preserve-protected as PR-004** — the contract's own register (§26) ratifies it as the best support-first statement on the site:

> `app/page.tsx:328` — *"Senior technical-support specialist. I turn recurring user friction into documentation, QA, and the tools that fix it."*

That single sentence names three of the five required lanes.

### 2.2 Lane-by-lane source trace (T-055)

| # | Lane | Sourced from | Verbatim source string | Strength |
|---|---|---|---|---|
| 1 | Escalation | `app/about/page.tsx:100-101` (contract §13 fact 1) | "the escalation point for enterprise accounts" | **Strong** — explicit |
| 2 | Troubleshooting | `app/page.tsx:328` (PR-004) | "recurring user friction" | **Thin** — one clause; see D1 |
| 3 | Documentation and QA | `app/page.tsx:328` (PR-004) | "into documentation, QA" | **Thin** — one clause; see D1 |
| 4 | Training and coaching | `app/about/page.tsx:101` (contract §13 fact 2) | "I train and coach teammates" | **Strong** — explicit |
| 5 | Support to product | `app/page.tsx:328` + `app/about/page.tsx:223-225` (contract §13's named chain) | "and the tools that fix it" + "Flagstone exists because disabled people deserve navigation tools designed for them, not adapted for them" | **Strong** — contract names this the one sourced chain |

**Lanes 2 and 3 are honest but thin**: both derive from a single clause of a single sentence. Presenting five equally-weighted "lanes" risks implying more evidentiary depth than exists — which is exactly the failure mode the preserve register (PR-009) protects against. This is Decision **D1**.

### 2.3 Nothing invented

Per contract §14, the record asserts **no** employer name, tenure, team size, ticket volume, CSAT/NPS/SLA figure, named customer, past job title, or certification. It carries **no numbers at all** — deliberately, because no support metric is sourced.

---

## 3. Placement (T-044, T-046)

### 3.1 Current homepage order

| # | id | eyebrow (= rail label) | H2 |
|---|---|---|---|
| — | `hero` | *(unindexed)* | — |
| 1 | `flagship` | Featured: the flagship | *(Flagstone plate)* |
| 2 | `work` | The Work | … |
| 3 | `record` | The Record | "The last thing I got wrong is in here too." |
| 4 | `how-i-work` | How the work gets made | "I direct AI agents, and I built the system that keeps them honest." |
| 5 | `about` | A Brief Account | "The work is careful. The record is honest." |
| 6 | `contact` | Let’s talk | "Have something worth building? / Let’s talk about it." |

### 3.2 Proposed placement: immediately after `#flagship`, before `#work`

**Rationale.** T-046 requires the record to strengthen the hero → proof → Flagstone journey *without displacing the flagship*. Master-plan invariant 9 requires Flagstone to remain **first**. Those two together rule out inserting before `#flagship`. Placing it directly after gives:

> hero states the support identity → the flagship proves the capability → **the support record explains what that day job actually consists of** → the rest of the work

It also sits three sections away from `#record`, minimising the duplicate-ledger reading T-046 warns about.

**Alternative considered and rejected:** between `#work` and `#record`. Rejected because two adjacent ledger-shaped bands, one named "The Record", is precisely the duplication T-046 forbids.

### 3.3 Non-duplication with "The Record" (T-046)

| | The Record (`#record`) | Support Operating Record (proposed) |
|---|---|---|
| Subject | project defects and audit rounds | professional support practice |
| Shape | bespoke `<ul>`: figure / what / when-or-open | `LedgerRow` list: decorative numeral / mono lane title / prose line |
| Numbers | yes (round counts, contrast ratios, percentages) | **none** |
| Dates / state | yes (dated or `open` chip) | **none** |
| Component | page-local bespoke markup | `components/LedgerRow.tsx` (existing primitive) |

Structurally and semantically distinct.

### 3.4 Primitive choice (T-044 — "existing primitives, not a new dashboard or badge grid")

Use **`components/LedgerRow.tsx`** inside a `CalibrationRecord`-shaped section. Grounds:

- `LedgerRow` props are `{numeral, title, date?, open?, numeralLabel?, after?, className?}`; it renders a bare `<li>` and the caller owns the `<ul role="list">`. The `numeralLabel` and `after` props exist *specifically* so a second consumer could use a different noun and a trailing line (`components/LedgerRow.tsx:25-33`).
- Its register is: serif decorative numeral (aria-hidden) + **mono** title + mono date/chip — the site's established "instrument/ledger" register.
- `Receipt` is wrong: it is a single evidence **card** for one measured figure with a tier and a method link. The support record has no figures.
- `NumberedStep` and `Exhibit` are **dead code** (zero live JSX call sites; `Exhibit`'s docblock says "Not yet wired into any page", and `app/__tests__/flagstone-first-impression.test.ts:38` asserts it stays unimported). Not used.

Set `numeralLabel="Lane"`; omit `date` and `open` entirely.

---

## 4. Proposed copy — exact strings

### 4.1 Metadata and structured data (T-041, T-042 — closes F-001, F-003)

| Field | File(s) | Current | Proposed |
|---|---|---|---|
| root `title` | `app/layout.tsx:117` | `Sky Halisky: AI Portfolio` | `Sky Halisky: Senior Technical Support` |
| `openGraph.siteName` (×13 routes) | `layout.tsx:129`, `page.tsx:54`, `about:28`, `work:29`, `work/[slug]:318`, `certificates:34`, `contact:33`, `blog:35`, `blog/[slug]:189`, `accessibility:33`, `colophon:29`, `runway:48` | `Sky Halisky: AI Portfolio` | `Sky Halisky: Senior Technical Support` |
| `openGraph.siteName` (archive) | `app/archive/page.tsx:38` | `Sky Halisky — AI Portfolio` *(em dash)* | `Sky Halisky: Senior Technical Support` *(also removes an em dash)* |
| `EXPECTED_SITE_NAME` | `lib/__tests__/static-integrity.test.ts:437` | `'Sky Halisky: AI Portfolio'` | `'Sky Halisky: Senior Technical Support'` |
| root `description` | `app/layout.tsx:114-115` | `Sky Halisky is an AI builder crafting accessible, privacy-first tools from the Okanagan Valley, BC. Creator of Flagstone, the Prompt Library, and more.` | `Sky Halisky is a senior technical-support specialist who turns recurring user friction into documentation, QA, and the AI-assisted tools that fix it.` |
| homepage `description` | `app/page.tsx:45-46` | *(identical to root)* | *(same replacement)* |
| about `description` | `app/about/page.tsx` | `Sky Halisky. AI builder. Okanagan Valley, British Columbia.` | `Sky Halisky. Senior technical-support specialist. Okanagan Valley, British Columbia.` |
| work `description` | `app/work/page.tsx` | `Projects by Sky Halisky: AI builder. Accessibility mapping, ...` | `Projects by Sky Halisky, senior technical-support specialist. Accessibility mapping, multi-agent systems, prompt management, and more.` |
| contact `description` | `app/contact/page.tsx:17-18` | `Write to Sky Halisky: AI builder based in the Okanagan Valley, British Columbia.` | *(see D2)* |
| JSON-LD `jobTitle` | `app/layout.tsx:206` | `Technical Support · AI Builder` | `Senior Technical Support Specialist` |
| JSON-LD `alternateName` | `app/layout.tsx` (absent) | — | **add** `Skyler Halisky` |
| JSON-LD `description` | `app/layout.tsx:207-208` | `AI builder based in the Okanagan Valley, British Columbia. Creator of ...` | `Senior technical-support specialist in the Okanagan Valley, British Columbia. Builds AI-assisted accessibility and developer tools, including Flagstone, Claude Corp, and the Prompt Library.` |
| OG image eyebrow | `app/opengraph-image.tsx:214` | `AI Portfolio` | `Senior Technical Support` |
| OG image alt | `app/opengraph-image.tsx:21`, `lib/og.ts:44` | `Sky Halisky: AI builder · accessible, privacy-first tools` | `Sky Halisky: senior technical support · accessible, privacy-first tools` |

**On `alternateName: 'Skyler Halisky'`** — authorised explicitly by contract §5, and it is not a new public claim: `content/profile.json` already ships the LinkedIn URL `https://www.linkedin.com/in/skyler-halisky`, so the formal name is already public and machine-linkable. This closes **F-001**. The visible wordmark stays `Sky Halisky` (contract §6 — no change).

**Art direction preserved** (T-042): only the two text strings inside the OG image change. Layout, dimensions, Cormorant Light face, terracotta dot, colours, crop behaviour are untouched.

### 4.2 The Skyler / SkyPi relationship statement — stated ONCE (T-043 — closes F-002)

**Location:** About page opening, immediately after the H1, before the existing support paragraph. Highest leverage: it is the page a recruiter opens to find out who this is, and contract §5 names "the About page's opening identification" as a sanctioned place for the formal name.

**Proposed string:**

> I am Skyler Halisky. Most people call me Sky. SkyPi Studio is the name I build and publish under: one person, not an agency.

Satisfies contract §4 (all three tiers), §7 (kills the agency reading, and makes the relationship explicit in the same section it appears). Stated once; **not** repeated on other pages (T-043, T-050).

### 4.3 About page opening hierarchy (T-047 — closes F-005)

| Element | Current | Proposed |
|---|---|---|
| H1 | `I build things with AI.` (`app/about/page.tsx:94`) | **`I work in support. The tools come from the work.`** |
| new ¶ (after H1) | — | the §4.2 identity sentence |
| ¶1 | `By day, I’m a senior technical-support specialist: the escalation point for enterprise accounts, and I train and coach teammates. I came to software through problems I wanted to solve. Most of them involved accessibility: tools that should have been better but weren’t. I decided to make some that were.` | **unchanged** — this is the protected accessibility origin story |
| pull-quote | `Accessibility is not an add-on. It is where you begin.` | **unchanged** |

The support paragraph is already first in the body; only the heading above it inverted the hierarchy. This is the minimum change that closes F-005 on this surface.

### 4.4 Role family, named once (T-050 — closes F-007)

**Location:** About page, once, in the `#currently` band. Not repeated anywhere else.

> The work I am aimed at is senior technical and product support: escalation, support tooling, support operations. Adjacent to it, and evidenced by the projects above: QA, accessibility, and privacy-aware systems work.

Matches contract §10 (primary) and §11 (adjacent) exactly. No non-target role (§12) is implied anywhere.

### 4.5 Credentials context (T-048, as corrected by C-1)

`app/certificates/page.tsx:85-89`, one clause added, existing subordinating sentence preserved verbatim:

> Selected credentials and certifications, alongside senior technical-support work. A short paper trail of the things I’ve studied formally: most of the learning happens in the work, not on paper.

### 4.6 The Support Operating Record section (T-044, T-045, T-046)

- `<section id="support-work">`, placed after `#flagship`, inside `<ContentReveal>` (post-intro boundary, `app/page.tsx:323`)
- eyebrow (**= rail label, verbatim**): `The support work`
- H2: `This is the job the projects come from.`
- `ROUTE_SECTIONS['/']` gains `{ id: 'support-work', label: 'The support work', href: '/#support-work' }`, inserted between `flagship` and `work`

Lane copy (see D1 for the 5-lane vs 3-lane decision):

| Numeral | Lane title (mono) | Line (`after`) |
|---|---|---|
| 01 | ESCALATION | The escalation point for enterprise accounts. |
| 02 | TROUBLESHOOTING | Recurring user friction, worked back to what is actually causing it. |
| 03 | DOCUMENTATION AND QA | The finding turned into documentation and QA, not just a closed ticket. |
| 04 | TRAINING | Training and coaching teammates. |
| 05 | SUPPORT TO PRODUCT | And the tools that fix it. Flagstone is the clearest case: accessibility software built because disabled people deserve navigation tools designed for them, not adapted for them. |

Closing line under the list (mono, method register):

> No metrics here. Employer, account and volume detail stays private.

That line is doing real work: it explains the absence of numbers as a deliberate privacy choice rather than a gap, and it forecloses any reader inference of scale.

### 4.7 Closing invitations (T-049 — closes F-008)

Subject to **D2**. Recommended (employer-safe register, hiring named first):

| Surface | Current | Proposed |
|---|---|---|
| Homepage `#contact` H2 (`app/page.tsx:1006-1010`) | `Have something worth building?` / `Let’s talk about it.` | **`Hiring, or building something?`** / `Let’s talk about it.` *(second line byte-identical)* |
| Contact page body (`app/contact/page.tsx:84-88`) | `Accessible technology, built with care. Thoughtful product collaborations. Learning out loud, one project at a time. I read every message that comes through.` | **`Open to senior support roles and interviews.`** ` Accessible technology, built with care. Thoughtful product collaborations. I read every message that comes through.` |
| About closing (`app/about/page.tsx:281-284`) | `I am looking for collaborators and clients who read the documentation, ask good questions, and care how things turn out. Write to me if that sounds like you.` | **`I am looking for teams that read the documentation, ask good questions, and care how things turn out. Roles, interviews, collaborations: write to me if that sounds like you.`** |
| Contact `description` | `Write to Sky Halisky: AI builder based in the Okanagan Valley, British Columbia.` | `Write to Sky Halisky, senior technical-support specialist in the Okanagan Valley, British Columbia. Open to roles and professional conversations.` |

Hiring leads in every one; collaboration survives in every one; none reads as a sales funnel; none uses the loud register ("Hire me", "Available for work", a résumé download) that the quiet-search stance rejects.

### 4.8 Not changed, deliberately

- `components/cinematic/**` — PR-001
- `app/page.tsx:328` hero positioning line — PR-004, byte-identical
- `components/RunwayIdentity.tsx` — already support-first (C-2); its guard test stays green
- `content/profile.json` `name` / `wordmarkText` — contract §6
- Nav labels, `SidebarRailLinks` "Write to me.", footer credit line — no client/build ambiguity found (T-052 returns a negative result; recorded, not invented into a change)
- `about` H1 "every interface" WCAG claim (`:223`) — contract §25 flags it for narrowing, but that is an accessibility-claim fix, **not** recruiter-path work. Carried forward to the phase that owns claim narrowing.

---

## 5. Content tests to add (T-053)

New file `lib/__tests__/support-first-hierarchy.test.ts`, following the source-scan convention of `recruiter-copy-truth.test.ts`:

1. **PR-004 guard** — `app/page.tsx` still contains the hero positioning line byte-identical.
2. **Identity** — root JSON-LD carries `alternateName` `Skyler Halisky`; `jobTitle` matches `/Support/` and never `/AI Builder/`.
3. **Metadata hierarchy** — no file under `app/` contains `AI Portfolio`; every route description that names a role names support before any "AI".
4. **Relationship statement** — `app/about/page.tsx` contains the Skyler/Sky/SkyPi sentence, and it appears on exactly one page.
5. **Prohibited role labels** — no surface claims founder / designer / product manager / AI influencer / "software engineer" as a self-description (regex must not trip on the existing, protected "I am **not** a trained software engineer").
6. **Contact intent** — homepage `#contact` H2, `/contact` body, and About closing each match `/hiring|roles?|interview/i`.
7. **No invented support facts** — scan every recruiter surface for employer-shaped and metric-shaped patterns: `/\d+\s*(years?|yrs)/`, `/CSAT|NPS|SLA/i`, `/\d+\s*(tickets?|cases?)/i`, `/team of \d+/i`, `/managed \d+/i`.
8. **Non-duplication** — `#support-work` carries no date, no `open` chip, and none of `#record`'s four row figures.
9. **Rail registration** — `ROUTE_SECTIONS['/']` contains `support-work` and its label equals the section's rendered eyebrow.

---

## 6. Decisions required from Sky

### D1 — Support Operating Record: how many lanes?

Lanes 2 (troubleshooting) and 3 (documentation/QA) rest on one clause of one sentence (§2.2). Options:

- **(a) Five lanes as specified.** Every lane stays strictly inside live public copy. Honest, but two lanes are thin, and five equally-weighted lanes imply more evidence than exists.
- **(b) Three lanes** (escalation, training, support-to-product) — only the strongly-sourced facts. Most conservative; under-delivers against T-045's five-lane requirement, which becomes an explicit, recorded deferral.
- **(c) Five lanes, with real anonymised facts you supply** for troubleshooting and documentation/QA. Best outcome. Needs one or two sentences each, no employer, no customer, no numbers — e.g. what a recurring-issue investigation actually looks like, and what you actually document or QA. I will not write these for you and will not infer them.

**Recommendation: (c) if you can supply the facts now; otherwise (a).**

### D2 — Contact intent: how loud?

Contract §15 says hiring-first. Your own recorded stance (2026-06-18, and the two in-code comments) says quiet and employer-safe. §4.7 above is my attempt at both: hiring named first, in a restrained register, no résumé download, no "available for work" banner.

- **(a) As specified in §4.7** — hiring named first, quiet register. *(recommended)*
- **(b) Quieter** — keep collaboration-first wording, add only "Open to roles" on `/contact`. Under-delivers F-008.
- **(c) Louder** — an explicit "Open to senior support roles" line in the homepage hero region too. Reverses the quiet-search stance outright.

### D3 — The site-name replacement string

`Sky Halisky: Senior Technical Support` replaces `Sky Halisky: AI Portfolio` in 14 places. It is instantly classifiable for a recruiter, but it drops the word "Portfolio" from tab titles and unfurls.

- **(a) `Sky Halisky: Senior Technical Support`** *(recommended)*
- **(b) `Sky Halisky: Senior Technical Support · Portfolio`** — keeps the portfolio signal, longer in a tab
- **(c) something you prefer**

### D4 — The About H1

`I build things with AI.` → `I work in support. The tools come from the work.`

Alternatives in the same register: `Support is the work. The tools come from it.` / `I work in support. I build what fixes it.`

---

## 7. What happens after approval

1. **P03-A** implements exactly this spec in bounded files. No copy invented at implementation time.
2. **P03-B** runs an independent, read-only timed review: blinded 5 / 10 / 15 / 30 / 60-second passes, at least three reviewers, mobile and desktop captures.
3. **Lead** verifies the evidence directly, reruns `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:static`, and `git diff -- components/cinematic` (must be empty), then integrates and issues the gate.

**No `RECRUITER_PATH_GATE` verdict will be issued until every acceptance criterion and preserve check has passed with recorded evidence.**

---

## 8. Sky's decisions, recorded verbatim (2026-09-03, in-session)

| ID | Decision | Effect |
|---|---|---|
| **D1** | *"You supply the 2 facts"* — Sky then supplied both. | Support Operating Record ships **five** lanes, all sourced. |
| **D2** | **Quieter.** | Only `/contact` gains role intent. Homepage closer and About closing are **unchanged**. F-008 recorded as a **partial close by explicit owner decision**, not as fully met. |
| **D3** | `Sky Halisky: Senior Technical Support` | Replaces `AI Portfolio` in 14 places. |
| **D4** | Sky wrote their own H1, overriding all three offered options. | Implemented **verbatim**, not restyled. |

### D4 — the About H1, exactly as Sky wrote it

> Support is the work and inspiration, building tools to solve problems and reduce friction.

Implemented byte-for-byte. Not split into the house two-sentence pattern, not shortened. Recorded here so a later phase does not "correct" it back toward the shorter sibling headings.

### D1 — the owner-supplied facts, verbatim as received

**Troubleshooting**
> When I see a recurring issue, I compare multiple cases to separate one-off user error from a repeatable pattern, then reproduce the behavior where possible and isolate variables such as app state, device behavior, account state, connectivity, or workflow steps until I can identify the likely cause or the right escalation path.

**Documentation / QA**
> I document reproducible steps, expected versus actual behavior, relevant conditions, and any workaround or known limitation. I also verify fixes and workflows against the original support scenario and nearby edge cases before treating the issue as resolved or ready to hand back.

**Screened against contract §14 before use.** Neither contains an employer, a customer, a date, a tenure, a team size, or any metric. **Nothing was stripped.**

**Condensed for the ledger register** (the band is a compact record, not prose). Every substantive element is carried over and nothing is added:

| Element in Sky's text | Present in lane 02? |
|---|---|
| compare multiple cases | yes — "Compare cases" |
| separate one-off user error from a repeatable pattern | yes, verbatim |
| reproduce the behavior where possible | yes — "Reproduce where possible" |
| isolate variables: app state, device behavior, account state, connectivity, workflow steps | yes, all five named |
| identify the likely cause **or** the right escalation path | yes — "a likely cause, or the right escalation path" |

| Element in Sky's text | Present in lane 03? |
|---|---|
| reproducible steps | yes, verbatim |
| expected versus actual behavior | yes, verbatim |
| relevant conditions | yes — "the conditions that matter" |
| any workaround or known limitation | yes, verbatim |
| verify fixes and workflows against the original support scenario | yes, verbatim |
| nearby edge cases | yes — "its nearby edge cases" |
| before treating the issue as resolved | yes — "before anything is called resolved" |

The only element not carried is "or ready to hand back", dropped for length; it is entailed by "called resolved" and adds no claim.
