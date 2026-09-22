# Identity and Claim Contract — Portfolio 3.0 Phase 01

**Status: APPROVED BY SKY (2026-09-03, in-session sign-off — see §28).** `IDENTITY_CLAIM_GATE: PASS`. Nothing in this document authorizes any public copy, metadata, README, GitHub profile, or other source change — it is the vocabulary and fact contract that later phases will implement against.

**Prompt ID:** SKYPI-PORTFOLIO-3.0-P01
**Date:** 2026-09-03
**Author:** Claude (Sonnet 5), acting as Phase 01 editorial authority, in `/Users/skypie/Portfolio-3.0-baseline`

---

## 1. Contract identity and date

This is the Phase 01 (Identity, Role and Claim Architecture) contract for Portfolio 3.0, produced per `SKYPI-PORTFOLIO-3.0-P01`. It supersedes no prior document; it formalizes decisions that were previously implicit in live copy and in the master plan's own proposed defaults. Dated 2026-09-03.

## 2. Verified source/base identities

| Repo | Remote | Local path | HEAD at verification | Clean? |
|---|---|---|---|---|
| Portfolio | `github.com/Skypie99/portfolio` | `/Users/skypie/Portfolio-3.0-baseline` | `19d946c9c48b325bce5d3a9f292d2cb48450cf01` (== accepted Phase 00 base, == `origin/main`) | Yes — only the 4 untracked Phase 00 evidence files |
| AccessMap | `github.com/Skypie99/AccessMap` | `/Users/skypie/AccessMap` | `94d86239fed85e9e9135522e5271af813d6dfc90` | No — modified `CLAUDE.md`, several untracked dirs |
| Dashboard | `github.com/Skypie99/Dashboard` | `/Users/skypie/Dashboard` | `2b4a39ac2c9bc2fc0fe95fac6bf769bcb384e50b` | No — modified state/config files |
| Claude Corp (public) | `github.com/Skypie99/Claude_Corp` | `/Users/skypie/Claude_Corp` | `7e961a3357a0db6bdb652fa3127be0b398dec95f` | Mostly — one untracked dir |
| Claude Corp (governance) | `github.com/Skypie99/ClaudeCorp-governance` | `/Users/skypie/ClaudeCorp` | `fdabf28bd497fe14a3d38c47a6fbc2e3704a339b` | No — untracked specs/reports |
| Prompt Library | `github.com/Skypie99/Prompt_Library` | `/Users/skypie/Prompt_Library` | `c6cfa1f43362665d8696b14028a79f0f29706b29` | Yes |
| ghost-code | `github.com/Skypie99/ghost-code` | Not present at `~/ghost-code`; live source is `~/Games/pacman-code-trainer` per the repo's own truth manifest (§1) | Not re-verified in this pass | — |
| studio-archive | — | **No such repository exists.** The Studio Archive is `app/archive/` inside the Portfolio repo itself, not a separate project. | — | — |

**Divergence from the prompt's audit-time references:** none of AccessMap, Dashboard, Prompt Library, or Claude Corp (public) are currently at the SHA the assignment names as its "audit-time reference." All have advanced. This is expected — Phase 01 makes no source change to any of those repos and only defines vocabulary; the divergence matters for whichever later phase actually edits their public copy, and should be re-verified there. Recorded here, not treated as a Phase 01 blocker. See §29 for the "studio-archive repo does not exist" item, which **is** presented as a blocker/clarification (§29, §28).

## 3. Phase 00 evidence inherited

Accepted verbatim, per the accepted handoff:
- `BASELINE_LOCK: PASS`, `VERIFIED_BASE 19d946c9c48b325bce5d3a9f292d2cb48450cf01`, `VERIFIED_TREE ee0be9130c2b4f9de5de956c6cdc33b9d151c682`.
- Carry-forwards not touched here: reduced motion (UNVERIFIED), Lighthouse/CWV (UNVERIFIED), additional baseline widths (DEFERRED), missing canonicals (OPEN), sitemap/indexability gaps (OPEN), `NEW-P00-001` Skip Intro pin-spacer (OPEN, routed to intro/navigation phase), 16 dependency advisories (routed to technical-integrity phase).
- No Phase 00 finding was reopened or fixed here.

## 4. Human/studio identity architecture

Three-tier relationship, ratified from what the live site already implies but never states outright:

1. **Skyler Halisky** — the person. The candidate/professional being evaluated by any reader.
2. **Sky / Sky Halisky** — the familiar public short form of that same person. Not a different entity, not a pseudonym for anonymity — a shortened first name, the way most people go by a shortened form socially and professionally.
3. **SkyPi Studio** — Skyler's authored umbrella practice: the name under which the work is built, signed, and hosted (`skypistudio.com`). It is currently visible only as a mark — the cinematic intro's title card (`components/cinematic/CinematicDesert.tsx:627`, `StaticDesertFrame.tsx:109`: `"SkyPi Studio"`) and the footer's `"SkyPi Studio: Est. 2026"` (`Footer.tsx:84`) — with no copy anywhere stating what it *is* or how it relates to Sky. That gap is F-002 and this section is its resolution: SkyPi Studio is explanatory of the person, not a stand-in for one. It must never read as an employer, a team, or an agency with staff.

## 5. Formal-name rule

**Skyler Halisky** is the canonical formal name. Use it in: this contract and its receipt; any future structured-data `alternateName`; any formal professional/bio context (e.g., a future LinkedIn-style "About the author" line); any legal or compliance-adjacent text.

**Current state check:** `content/profile.json` and the JSON-LD `Person` block (`app/layout.tsx`) currently use only `"Sky Halisky"` — "Skyler Halisky" appears nowhere in shipped Portfolio copy today. This contract does not change that (no public source touched in Phase 01); it rules that a later phase may add `"Skyler Halisky"` as `alternateName` in structured data and in the About page's opening identification, without replacing the visible "Sky Halisky" wordmark.

## 6. Familiar-name rule

**Sky Halisky** (or, in running first-person prose, simply **Sky**) remains the visible name across the Portfolio: page titles, the wordmark, headings, first-person voice, social handles' display context. This ratifies current live behavior — it is not a proposed change. First-person body copy ("I build things with AI," "Write to me") is unaffected.

## 7. SkyPi Studio rule

SkyPi Studio may be used only in contexts that are unambiguously *about the practice*, not about identity substitution: the cinematic title card, the footer credit line, a future "About this studio" aside, structured-data `Organization`/`worksFor`-style fields if ever added. It must never appear as a byline in place of Sky's name, never as "the SkyPi Studio team," and never imply headcount, clients-as-employer, or agency status beyond what §4 states. Any future copy introducing SkyPi Studio in body text must, in the same section or the one immediately following, make the Skyler/Sky relationship explicit — it cannot stand alone the way it does today in the cinematic intro (which is exempt from this requirement per the Preserve register, §26, PR-005 and the protected cinematic first frame).

## 8. One-sentence professional positioning

> Sky Halisky is a senior technical-support specialist who also designs and ships AI-assisted software — accessibility tooling, developer tools, and internal systems — documenting the process honestly.

Grounded in live About-page copy ("By day, I'm a senior technical-support specialist... I train and coach teammates") plus the deliverables' own framing (Flagstone, Prompt Library, Claude Corp, Ghost Code, Dashboard).

## 9. Five-sentence professional positioning

> Sky Halisky is a senior technical-support specialist — the escalation point for enterprise accounts, and someone who trains and coaches teammates. That work is the primary professional identity; the projects on this site are what happens alongside it. Sky builds AI-assisted software: an accessibility-reporting map (Flagstone), a governed multi-agent development system (Claude Corp), a local-first prompt manager (Prompt Library), and smaller tools built to learn by doing. The throughline from the support work to the building work is the same instinct — investigate a real friction point, fix it carefully, document what was done and why. Sky is not a trained software engineer by background; the software comes from wanting the tools to exist and being willing to learn in public to make them.

## 10. Primary role family

**Senior technical/product support**, specifically the family: Senior Product Support · AI Product Support · Support Tools/Support Systems · Senior Technical Support · Support Operations/Enablement · Technical Support Engineer. This matches the live About-page self-description. It is also consistent with Sky's current private job-search signal (Tier 2 technical/product-support titles, per the connected resume profile) — used here only to confirm the emphasis is correctly aimed, never quoted or published as site copy (see §13/§14).

## 11. Adjacent role families

QA / testing, accessibility engineering, privacy-aware systems work, internal tooling and support-systems engineering, AI-product support and enablement. These are secondary — evidenced by the work shown (Flagstone's accessibility engineering, Dashboard's privacy-gated architecture, Claude Corp's governance/QA framing) but never presented as the primary occupation.

## 12. Explicit non-target roles

Generic software engineer (no formal engineering background — About page says so directly: "I am not a trained software engineer"), founder, designer, product manager, AI influencer. None of these should be implied as the primary identity anywhere on the site.

## 13. Source-approved Support Operating Record fact bank

**Sky's 2026-09-03 sign-off:** approved with the resume-connector-sourced facts dropped. The publishable fact bank draws only from already-live, already-public Portfolio copy — nothing from the connected resume/job-profile data source is published or quoted as site content. No employer name, title, date range, team size, or quantitative metric is asserted anywhere below.

| Fact | Source | Privacy classification |
|---|---|---|
| Senior technical-support specialist; escalation point for enterprise accounts | `app/about/page.tsx` (live, shipped copy) | Public-safe (already public) |
| Trains and coaches teammates | `app/about/page.tsx` (live, shipped copy) | Public-safe (already public) |
| Not a trained software engineer; came to coding through wanting to build things | `app/about/page.tsx` (live, shipped copy) | Public-safe (already public) |

**Job-search signal (not published):** the resume connector (Indeed profile) shows Sky is currently seeking Tier 2 Technical Support / Tier 2 product-and-technical-service-representative roles, remote, day shift, min. CAD 70,000/year. Per Sky's explicit sign-off, this is **sensitive, internal-only data** — usable exclusively to confirm the role-family emphasis in §10 is correctly aimed. It must never be quoted, paraphrased as "Tier 2," or have the salary figure surfaced in any public copy.

**Anonymized support-to-product chain (T-016 requirement):** the strongest available real example is Flagstone itself, whose own copy already states the causal link honestly: accessibility tooling built because "disabled people deserve navigation tools designed for them, not adapted for them" (`app/about/page.tsx`), following directly from support work involving people with vision/hearing loss. This is the one chain currently sourced. No specific escalation ticket, specific caller story, or specific employer-side incident is available or invented.

## 14. Prohibited/unsupported support fact bank

**PROHIBITED UNTIL SOURCED** — none of the following may be published anywhere, because no primary source in this session supports them:

- Any employer name, current or past.
- Any specific years of experience, start date, or tenure length.
- Any team size, headcount managed, or management scope.
- Any specific ticket volume, CSAT/NPS number, SLA figure, or other quantitative support metric.
- Any named customer, account, or industry vertical.
- Any specific job title held in the past (only the *currently sought* title family in §13 is sourced, and that is search intent, not a held title).
- Any claim of certification, accreditation, or formal training in accessibility, support, or software engineering beyond the certificates already listed in `content/certificates.json`.

## 15. Contact-intent contract

**Approved rule (Sky sign-off, 2026-09-03): primary invitation is hiring / interviews / professional conversations, with restrained collaboration as secondary — not client-sales-first.**

This is a *change* from current live copy, not a ratification of it: the Contact page today opens with "Accessible technology, built with care. Thoughtful product collaborations. Learning out loud, one project at a time," and the About page's closing line is "I am looking for collaborators and clients who read the documentation, ask good questions, and care how things turn out." Both currently read collaboration/client-first, which is exactly F-008. This contract's binding rule for later phases: professional/interview conversations lead, collaboration follows, and neither reads as a sales funnel. Implementation (the actual Contact/About copy edit) is out of scope for Phase 01 and belongs to a later phase — this section only ratifies the target wording direction.

## 16. Accessibility claim vocabulary

- Permitted: *"Built and tested against WCAG 2.2 AA"* with a date and scope when one is available (e.g., "as of the last audit pass, `qa-reports/…`"). This phrasing is directly lifted from the repo's own prior truth-audit (`docs/PORTFOLIO_TRUTH_MANIFEST.md` §8), which found it supportable — implementation evidence, automated component tests, and dated manual `qa-reports/*A11y*` audits exist, but no whole-app automated conformance-scan artifact does.
- Prohibited: any claim of formal certification, "fully accessible," "on every interface" as a universal without a scope/date qualifier, or "WCAG [x] AA compliant" (compliance implies certification; "built and tested against" does not).
- Known defect handling: a known defect (e.g., a contrast failure on a deployed Flagstone utility surface, F-021) does not have to be listed inline with every accessibility claim, but the claim must not be phrased as a completeness guarantee that the defect would falsify. "Every interface" is exactly such a phrasing and must be narrowed.
- This vocabulary governs Portfolio's own claims about itself and about Flagstone. It does not require or authorize any AccessMap source change (per this prompt's explicit out-of-scope list) — the version-number inconsistency between Portfolio's blog ("2.2 AA") and AccessMap's own README ("2.1 AA") remains open, flagged, and unfixed here.

## 17. AI contribution vocabulary

Distinguish, in any future copy:
- **Problem selection and architecture/policy** — Sky's. What gets built, the constraints it must satisfy, the written rules agents operate under.
- **Agent implementation/diagnosis** — Claude/agents. Actual code, actual debugging, actual drafting, done by AI under those constraints.
- **Human verification** — Sky. Review, testing, judgment calls on ambiguous cases.
- **Merge/release/deploy authority** — Sky, exclusively, except the one standing carve-out already on record elsewhere (Rory's gated Prompt Library merge, which is Claude Corp's own internal governance and not a Portfolio claim).
- **Prompt/process limits** — governance is written rules, prompts, and tests; it is not runtime enforcement unless a specific technical control (a CI gate, a branch protection rule, a build guard like `guard-demo.mjs`) is named. See §18.

Never phrase this as "Sky wrote it" when an agent implemented it, and never phrase it as "the AI decided" when Sky made the call.

## 18. Governance/enforcement vocabulary

This directly resolves F-022, confirmed present in the live public Claude Corp README (`~/Claude_Corp/README.md:60`: *"currently v1.12; all roles inherit it as hard law"*; `:33`: *"Enforces Constitution safety rules"*).

Required distinctions for any future governance copy:
- **Written rules** (a Constitution, a role file) are policy, not enforcement.
- **Prompts/runtime instructions** given to an agent are process controls an agent can be instructed to follow — not a technical guarantee it cannot deviate.
- **Tests** verify specific, checked conditions — not open-ended safety.
- **Review gates** (a human or another role reviewing output) are procedural controls.
- **Branch controls** (protected branches, required reviews) are platform-enforced and may be described as such.
- **Platform controls** (CI gates that block a merge, a build guard that refuses to build) are the only category that may use words like "enforces" or "blocks" without qualification — and only when a specific named mechanism backs the claim (e.g., Dashboard's `guard-demo.mjs`, which genuinely refuses to build for a public target outside demo mode, is a legitimate example of provable enforcement).
- "Hard law" and "enforces every safety gate" conflate written policy with technical enforcement and must not be used for the Constitution/role-file layer. This is a **Claude Corp public-repo finding**, not a Portfolio finding — Portfolio's own copy does not currently make this error (per `docs/PORTFOLIO_TRUTH_MANIFEST.md` §6 item 5 and §12). No Claude Corp source change is authorized by this phase; the vocabulary rule is recorded for whichever future phase or role edits `Skypie99/Claude_Corp`.

## 19. Product-status vocabulary

- **Submitted** — sent for review, no outcome yet. Not currently true for any project (Flagstone's submission completed; see **Released**).
- **Approved** — a platform has affirmatively approved, distinct from submitted. True for Flagstone as of 2026-09-15.
- **Released** — publicly available through the relevant store/channel. **True for Flagstone as of 2026-09-15**, in the US and Canada storefronts only. "Released" does not license any adoption claim; see §20.
- **Live web** — reachable at a public URL right now (Portfolio, Ghost Code, Prompt Library, Claude Corp public site, Dashboard's public demo).
- **Private** — not publicly reachable at all (the Dashboard operator app itself; the Studio Archive).
- **Public** — reachable without authentication.
- **Synthetic** — the data shown is fabricated/demo data, not real records (Dashboard's public demo).
- **View-only** — read access without write/edit capability. Not currently applicable to any live public surface (see §22's Studio Archive finding).
- **In progress** — actively being built, no public claim of completeness.
- **Historical** — a past state, explicitly dated, not implied current.
No project may be described with a stronger status word than its most recent primary-source record supports (`release/current.json` for Flagstone; a project's own live URL response for "live"; a repo's own README/state file otherwise).

## 20. Flagstone release-status rule

Current, verified status: **live on the App Store, US and Canada, since 2026-09-15** (`content/deliverables.json`: `"status": "On the App Store · US and Canada · Sept 2026"`, `"verifiedDate": "2026-09-17"`). Updated by P1.A (`qa-reports/2026-09-17_P1A_FlagstoneReleaseTruth.md`), which inverted this section's previous rule.

**Primary source for the release**, checked directly on 2026-09-17: the iTunes lookup for bundle `com.accessmap.app` returns `trackId 6774709116`, `version 4.1.1`, `formattedPrice Free`, `releaseDate 2026-09-15T21:21:25Z`, `sellerName Skyler Halisky`. Storefront scope was checked against twelve storefronts: `us` and `ca` return a result, `gb au de fr jp mx nz ie in br` return none. The app is therefore **not worldwide**, and copy must not imply it is.

**What may now be stated:** approval, release, and public availability, scoped to the US and Canada.

**What still may not be stated, and this is now the load-bearing half of the rule:** any adoption, download, install, rating, ranking, chart-position or user-count claim, in any rounded or qualified form. The same lookup reports `userRatingCount 0` and `averageUserRating 0` in both storefronts. There is no usage to describe, and the recent launch is precisely the moment the temptation to invent some is highest. Copy must say plainly that metrics are not yet meaningful and will be published when real usage exists.

This status remains **date-sensitive** — but note the failure this section already recorded once: between 2026-09-15 and 2026-09-17 the site published "the iOS app has not shipped" while the app was public, and two test files actively *enforced* that untruth. A pin on a time-bound fact must be inverted in the same commit as the copy it guards. Re-check the store record, not this document's snapshot, before publishing.

## 21. Test-count rule

Any exact test-count figure must carry: the project, the date it was measured, the method/command used, and its scope (e.g., "2,971 tests passing, measured 2026-08-16 via `npm test`, AccessMap repo"). Rounded, conservative figures (e.g., Portfolio's homepage "2,900+" floor against a more precise 2,971 measurement) may stand without re-stating the full receipt every time, per the existing pattern Portfolio already uses. Historical counts (a number from a past, superseded state) must be labeled as historical, not presented as current. Per the repo's own truth manifest §5, Portfolio's own self-reported count is currently *internally inconsistent* (567/611 in `README.md` vs. 763 in `content/a11y-receipts.json`) — this is low-stakes (not shown to visitors) but should be reconciled at the source in a later technical phase, not here.

## 22. Dashboard public/private/synthetic vocabulary

Two genuinely distinct things, and copy must always distinguish them:
1. **The real Dashboard** — a private, local-only operator application, gated by Sky's own governance for reading real cross-project QA data.
2. **The public demo** at `dashboard.skypistudio.com` — a separately engineered, synthetic-data-only build (`IS_DEMO` flag, `snapshot.demo.json`, a no-op write path, a build guard that refuses any public-target build outside demo mode). This is what Portfolio links to and what any visitor sees.
Portfolio's current copy already gets this right (`docs/PORTFOLIO_TRUTH_MANIFEST.md` §7.1: "fully correct and, if anything, undersells" it) — this section ratifies the existing framing as the permanent rule, not a proposed change.

## 23. Studio Archive private/public/view-only vocabulary

**Current verified state, as of this phase's direct source check (2026-09-03):** the Studio Archive (`app/archive/`) is a single surface — private, magic-link-authenticated, registered in `UNINDEXED_ROUTES` (`lib/sectionNav.ts:209`), `noindex`, absent from `app/sitemap.ts`'s explicit route list, and hides all site chrome via `ChromeGate`. **No separate public, indexable, or view-only edition exists anywhere in the current Portfolio source.** The one "read-only" reference found in the codebase (`components/archive/AuthGate.tsx:122-123`) is a code-review protection marker ("the /archive island stays PROTECT read-only otherwise") about a specific UI element, not a product feature, and does not describe a second surface.

This directly conflicts with this phase's assigned finding **F-023**, which asserts "a separate public indexable view-only edition exists." Per the current-truth-verification instructions in this prompt (reconcile material divergence rather than silently accepting a stale premise), this document does **not** ratify F-023's premise. It is recorded as an open item requiring Sky's clarification in §28/§29 — either F-023 refers to something not present in this repo/branch (a different deployment, a not-yet-merged branch, a plan rather than a shipped feature), or the finding is stale and should be closed as not-reproduced.

**Vocabulary rule pending that clarification:** until a second surface is confirmed, all Studio Archive references use only: *"a private, authenticated art catalogue — not part of the public portfolio."* No "public edition," "view-only edition," or similar phrase may be introduced without new primary evidence.

## 24. Claim-to-surface map

| Surface | What this contract governs there |
|---|---|
| Portfolio `/` , `/about`, `/contact`, `/work/*`, `/certificates` | Name usage (§5–7), positioning (§8–9), support facts (§13–14), contact intent (§15), accessibility/AI/status vocabulary (§16, §17, §19–20) |
| Portfolio metadata (`<title>`, `<meta description>`, OG/Twitter cards, `Person` JSON-LD) | Name usage (§5–6), F-003's "AI Portfolio" foregrounding — see §25 adversarial review |
| Portfolio README / `docs/*` (this repo's own docs) | Test-count rule (§21), accessibility vocabulary (§16) |
| GitHub profile / repo front doors (`Skypie99/*` READMEs) | Governance vocabulary (§18, Claude Corp specifically); product-status vocabulary (§19) for any repo card that states a status |
| Flagstone (AccessMap, as referenced *from* Portfolio only — no AccessMap source touched) | Flagstone status rule (§20), accessibility vocabulary (§16) |
| Dashboard (as referenced from Portfolio) | §22 |
| Claude Corp public repo (as referenced from Portfolio, and as its own future public-sync target) | Governance vocabulary (§18) |
| Prompt Library (as referenced from Portfolio) | Product-status vocabulary (§19); Portfolio's own copy is already clean per the truth manifest |
| Studio Archive | §23 |

## 25. Universal/superlative/enforcement-verb adversarial review

| Phrase found | Where | Verdict |
|---|---|---|
| "I build and test against WCAG 2.2 AA on **every interface**" | `app/about/page.tsx` | **Narrow.** "Every" is a universal not currently provable (F-021: a known contrast failure exists on a deployed Flagstone utility surface). Replace with scoped language per §16. |
| "there is no server, no database, and no account: nothing to run, and nothing to breach" | `lib/content.ts:290` (Colophon) | **Narrow/fix at source.** Already flagged in the repo's own truth manifest as a confirmed factual contradiction with `/archive`. Not re-litigated here; carried forward as an open item for the copy-implementation phase. |
| "all roles inherit it as hard law" / "Enforces Constitution safety rules" | `Claude_Corp/README.md` (public repo) | **Narrow.** See §18. |
| "AI Portfolio" as the site's own self-description (page-title suffix, JSON-LD `jobTitle: "Technical Support · AI Builder"`) | `app/layout.tsx` | **Reorder, don't remove.** Not false, but per F-003 it foregrounds a trend label over the primary professional identity. §5–10 already establish the correct hierarchy; a later phase should lead metadata with Sky/support, AI as capability. |
| "On the App Store · US and Canada · Sept 2026" | `content/deliverables.json` | **Proven.** Verified 2026-09-17 against the App Store record itself (id6774709116, v4.1.1, released 2026-09-15; `us`/`ca` only). Supersedes the previous "App Store review submitted" row, which was true when written and false from 2026-09-15. |
| "Community map... Privacy-first: no ads, no analytics, no trackers" | `content/deliverables.json` (Flagstone) | **Proven** for the technical claims (no analytics SDKs present); "no data sold" portion is a business claim not independently verifiable from code, per the truth manifest — leave as is, not strengthened. |
| "shipped across 20 stacked branches" (Prompt Library) | `content/deliverables.json:355` | **Unverified**, per truth manifest §5. Not re-verified in this pass; flagged, not removed (out of scope to fix in Phase 01), for the technical-integrity phase to confirm or soften. |
| "48 findings... accounted for every one" / "1,700+ commits" (Flagstone) | `content/deliverables.json` | **Prohibited from strengthening**, per truth manifest §6 item 4 — already flagged there, carried forward, not re-implemented here. |

## 26. Preserve register (checked against this contract)

| ID | Check | Result |
|---|---|---|
| PR-004 (support-first hero sentence) | Not edited by this phase | PASS — untouched |
| PR-005 (human-first identity, SkyPi as authored world not agency) | §4, §7 | PASS — contract explicitly forbids the agency reading |
| PR-007 (Flagstone conservative status) | §20 | PASS — the status is now "released", which is the conservative reading of the store record; the conservatism moved to the adoption ban, where the evidence is still absent |
| PR-009 (dated, method-specific evidence) | §21 | PASS — rule requires exactly this |
| PR-010 (honest AI contribution partition) | §17 | PASS |
| PR-011 (human authority, bounded autonomy) | §17, §18 | PASS |
| PR-012 (public/private/synthetic boundaries) | §19, §22, §23 | PASS — Studio Archive section is *more* conservative than the assigned finding, not less |

No preserve item is weakened by this contract.

## 27. Prohibited future wording

In addition to §14, §16, §18, §25: no future copy may state or imply Apple approval/release for Flagstone; no future copy may name an employer, ex-employer, or specific customer; no future copy may claim formal accessibility certification for any project; no future copy may describe Claude Corp's governance as technically self-enforcing beyond the named platform controls in §18; no future copy may introduce a "public Studio Archive edition" without new primary evidence per §23.

## 28. Owner decisions and exact Sky approvals

Recorded 2026-09-03, in-session, via direct structured sign-off:

1. **Identity architecture (§4–§7)** — APPROVED as drafted. Skyler Halisky = the person; Sky/Sky Halisky = familiar public short form (no change to the visible site name); SkyPi Studio = explanatory umbrella practice only, never an agency/team.
2. **Primary role hierarchy and non-targets (§10–12)** — APPROVED as drafted.
3. **Support-fact bank (§13)** — APPROVED **with the resume-connector-sourced facts dropped**. Only already-live, already-public About-page facts remain in the publishable bank. See §13 for the resulting list.
4. **Job-search signal (§13, §14)** — APPROVED to be used strictly as private, internal role-family-targeting evidence (§10) — never published, never quoted as "Tier 2" or with the salary figure, on any public surface.
5. **Contact intent (§15)** — APPROVED: flip to hiring/interviews/professional-conversation-first, restrained collaboration secondary. This is a binding rule for a later implementation phase, not itself a copy change.
6. **Accessibility (§16), AI contribution (§17), governance (§18), product-status (§19), Flagstone (§20), test-count (§21), Dashboard (§22) vocabularies** — APPROVED as drafted, no amendments requested.
7. **Studio Archive / F-023 (§23)** — Sky chose to **leave it open** rather than resolve it now. No second public surface has been found in current source; the contract's single-surface, private-only vocabulary rule stands as the default, and F-023 is neither closed nor confirmed — carried forward as an explicitly Sky-approved deferral (§29).
8. **Commit authorization** — Sky approved committing this contract and its receipt to the branch now (contract + receipt only; still no push, merge, or deploy).

## 29. Open blockers or approved deferrals

- **F-023 (§23)** — **Sky-approved deferral**, not a blocker. Current source shows one private, auth-gated, unlisted Studio Archive surface and no second public/view-only edition; the contract's vocabulary rule (single-surface, private-only) governs until either new evidence surfaces a second surface or Sky closes F-023 as not-reproduced in a later phase.
- **"Skypie99/studio-archive" does not exist as a separate repository** (§2) — recorded as a correction for later phases; the Studio Archive is a route inside the Portfolio repo, not its own repo. Not raised as a question in this sign-off round; flagging again here so a later phase doesn't go looking for a repo that isn't there.
- Every carry-forward item from Phase 00 (§3) remains open and correctly un-fixed.
- Repo SHA drift for AccessMap, Dashboard, Prompt Library, and Claude Corp (public) versus the prompt's audit-time references (§2) — not reconciled here; flagged for whichever phase next touches each repo's own public copy.
- Contact-intent implementation (the actual Contact/About copy rewrite per the now-approved §15 rule) is **not** performed in Phase 01 — out of scope by this prompt's own terms (no public copy changes in this phase). It is ready for a later implementation phase to execute against.

## 30. Implementation authority for later phases

This contract, once signed, is binding vocabulary and fact authority for every later phase that touches Portfolio public copy, Portfolio metadata/structured data, the Portfolio README, GitHub repo front doors, or the Claude Corp/Dashboard/Studio Archive language referenced from Portfolio. No later phase may introduce a name form, role claim, support fact, or status word that contradicts this document without a new, explicitly Sky-approved amendment. It does not itself authorize any implementation — §15's contact-intent change, in particular, requires its own later implementation phase even after sign-off here.

## 31. Phase gate evidence

See the accompanying Phase 01 receipt (`qa-reports/2026-09-03_PHASE01_IDENTITY_CLAIM_RECEIPT.md`) for commands run, sources checked, and full sign-off record.

```
IDENTITY_CLAIM_GATE: PASS
```
