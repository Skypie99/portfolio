# PORTFOLIO COOK OUT - PROMPT 8 FINAL ACCEPTANCE RECEIPT

Session PORTFOLIO-COOKOUT-P8-FINAL-ACCEPTANCE-20260902 · 2026-09-02 · Claude Fable 5.1 · mode: final acceptance, recruiter simulation, cross-repo truth verification, UX and accessibility acceptance, freeze gate.
Not pushed, not merged, not deployed. Sky reviews first.

Method in one paragraph: the locked base was verified before anything else; the whole evidence pass was read-only (four subagent lanes plus direct verification of every claim they raised, five external repos read only through git show at their expected SHAs, live surfaces fetched with cache-busters); an internal ledger was completed before any mutation; every proven Portfolio blocker was then fixed with the smallest evidence-backed change, verified against a fresh build, and committed once. Browser work used real navigation in headless Chromium (playwright-core with the repo's cached chromium_headless_shell 1228) at 375x812, 768x1024 and 1440x900 in both themes, under reduced motion, and with view transitions removed. No screen reader and no WebKit were run; the receipt says so wherever it matters.

## Verdict

PASS WITH NOTES

Notes: (1) five concrete final-acceptance defects were proven and fixed in one commit (see Changes); none remains. (2) The known discretion items are all accepted, each with its reason below. (3) Nineteen non-blocking notes are recorded for the freeze file; none is a trigger on its own.

## Git identity

locked P8 base:
7dc04ff2be3d8754516cb218bc4f4a08079dfcd3

starting HEAD:
7dc04ff2be3d8754516cb218bc4f4a08079dfcd3

starting tree:
ac7adaf89ed19e9313140c0ba891787a92515f27

origin/main:
7dc04ff2be3d8754516cb218bc4f4a08079dfcd3 (fetched at start; re-read by ls-remote at the end, unchanged)

worktree:
/Users/skypie/Portfolio/.claude/worktrees/portfolio-commit-recovery-ac1236 (the auto-created session worktree; used only after its identity was verified: HEAD equal to the locked base, tracked tree clean, branch owned by no other session and absent from the remote)

branch:
claude/portfolio-final-acceptance-e4afda (auto-created name; the preferred claude/portfolio-cookout-p8-acceptance-20260902 was not applied because renaming a harness-owned worktree branch buys nothing for an unpushed branch)

clean at start:
YES (git status --short --untracked-files=no empty)

base drift:
NONE (origin/main equal to the locked base at start and at the end)

## Final ecosystem identities

Portfolio main:
expected: 7dc04ff2be3d8754516cb218bc4f4a08079dfcd3
actual: 7dc04ff2be3d8754516cb218bc4f4a08079dfcd3

Ghost Code main:
expected: bb1ba5e708c9547ef50bc9c050c75fba511f409b
actual: bb1ba5e708c9547ef50bc9c050c75fba511f409b (accepted P4 c1c72b8 proven ancestor)

Prompt Library main:
expected: 78b961ec6f3dd05c5ffc8dae4c948a76eb1ab8c4
actual: 78b961ec6f3dd05c5ffc8dae4c948a76eb1ab8c4

Dashboard main:
expected: 66f3def891bd7a7ec0440e03fae88448d3d61731
actual: 66f3def891bd7a7ec0440e03fae88448d3d61731 (accepted P6 ed26a7d proven ancestor; private deployment not touched or queried)

Claude Corp main:
expected: 9612389bdfdb6cab1613f266c207ebfb8eb00c70
actual: 9612389bdfdb6cab1613f266c207ebfb8eb00c70 (accepted P7 5314e8a proven ancestor)

Flagstone submitted source:
f5594171e75bc5ec92a87d0392c361601ddedfba (present in /Users/skypie/AccessMap; read only via git show)

Flagstone approved web descendant:
ebf091c21066d39898160b1357bde0aa35bdb8bf (f5594171 proven ancestor)

## P7.5 intake

P7.5 receipt read:
YES (/Users/skypie/Portfolio/qa-reports/2026-09-02_PortfolioCookOut_P7.5_Integration_Receipt.md, untracked in the main checkout)

P7.5 P8_READY:
YES

all intended P1-P7 changes integrated:
YES (P1, P2, P2 dark-shot, P3 ancestors of 7dc04ff2; P4, P6, P7 ancestors of their mains; P5 already merged)

all required deployments current:
YES (all five live surfaces HTTP 200; Portfolio last-modified 2026-09-02 20:19 GMT; Ghost Code and Claude Corp live index.html md5-identical to origin/main; Prompt Library and Dashboard verified by identifying strings)

## Read-only audit ledger summary

total observations: 54
ACCEPT: 26
NONBLOCKING NOTE: 19
PORTFOLIO P8 BLOCKER: 5 (all fixed)
EXTERNAL BLOCKER: 0
FALSE POSITIVE: 4

The five blockers, each with its evidence:

1. Ghost Code descriptive strings contradicted the shipped game. The title-screen alt named an arcade cabinet, glowing controls and a Settings button; the shipped title screen (public/showcase/ghost-code/title.light.desktop.webp, and the live game) is a bordered card with Press Start and a Theme control. Four strings put the tokens in a maze; the word maze occurs zero times in Ghost Code at bb1ba5e (index.html, README) and the board is the Phantom at the centre of four N/E/S/W tokens (index.html:1921-1935). The clip alt put the prompt below the board; it sits above. The Learn-mode order was reversed against index.html:2407-2429 and :2592-2595 (hint arrives with the first retry). "nothing is sent anywhere" was an absolute of the exact shape the truth register bans while the page loads Google Fonts (index.html:96-105). Fixed in content/deliverables.json and the wiring overrides; guarded.

2. Forward navigation to /work/flagstone/ from any scrolled page kept the departing offset. Reproduced with real clicks at 375, 768 and 1440, both themes, reduced motion, and with document.startViewTransition removed, from the homepage room and rows, the About card, the blog article and a neighbour card; the other four case studies reset to 0 every time. Mechanism confirmed in node_modules/next/dist/client/components/layout-router.js: the scroll walk starts at the segment's first DOM node and gives up when nextElementSibling is null; React 19 hoists the preload link into head. Fixed by rendering the body-level JSON-LD script first; post-fix every arrival lands at 0; guarded.

3. Printing or saving to PDF before scrolling printed the scroll-reveals at opacity 0: home 25 of 25 blocks, /about/ 11 of 11, /work/flagstone/ 30 of 31, /work/ghost-code/ 17 of 18, /colophon/ 8 of 12 (measured under print media emulation plus real PDFs). The @media print block never restored the html.js reveal state. Fixed with the same override the reduced-motion block carries; post-fix 0 hidden on all six probed routes; guarded.

4. Two share cards carried claims their products retracted: prompt-library/og-card.jpg read "your key and prompts never leave your browser" and claude-corp/og-card.jpg read "builds software autonomously ... and deploy". Recut from the live sites (byte-identical to their origin/main) through scripts/og-cards.mjs.

5. The on-site hero stills for the same two projects (case-study hero and work card, light and dark) carried the same retracted claims; the Claude Corp headline was legible at hero size beside copy saying "bounded". Recaptured with the factory geometry (1440x900, DSF 2, theme seeds) and re-encoded with scripts/encode-proof.mjs; the four manifest rows record the 2026-09-02 captures and their masters were banked in the main checkout's gitignored masters bank.

## Known discretion items

### Hero / target-role positioning

current recruiter interpretation:
A senior technical-support specialist who builds. The positioning line states the day job; the H1 three lines below ("An accessibility map. A multi-agent system. A web-based prompt library.") and the dated receipts state the body of work; the "How the work gets made" band and the About page state the operating model, the limit ("I am not a trained software engineer") and the ask ("collaborators and clients").

target role clear:
YES

material ambiguity:
NO

action:
ACCEPT

evidence:
The support-first line is Sky's ratified decision, not drift: qa-reports/2026-08-28_Runway_Recruiter_Patch.md records the hero moving from AI-first to support-first, grounded verbatim in the resume, with building kept additive. The runway chip and the JSON-LD jobTitle ("Technical Support · AI Builder") agree with it. The independent recruiter lane read the hero and About cold and concluded a recruiter would not shortlist for the wrong role. The remaining choice (whether to lead with the target rather than the history) is a strategy decision for Sky, listed under freeze triggers, not a P8 defect.

### Claude Corp qualified "always on"

phrase still live:
YES (CTA band: "always on, always scoped, always accountable to Sky"; live index.html md5 1db224c19f552325f9ad93f9ed0c00cb equals origin/main 9612389)

reasonable uptime/autonomy overclaim:
NO

verdict:
ACCEPT

reason:
The phrase is the first term of a triad that bounds itself in the same breath, on a page whose hero says "governed, not unattended", whose Background Mode card says agents run "autonomously on a schedule ... capped at one reversible change" with a halt sentinel, and whose merge card says merging needs Sky except one audited exception. Scheduled unattended cycles are real under Constitution Art. 12, so "always on" is partially literal and correctly bounded rather than a claim of continuous unsupervised production authority. The Portfolio itself never uses the phrase; lib/__tests__/recruiter-copy-truth.test.ts bans it there. Optional external tightening ("always scoped, always accountable to Sky") is recorded as a note, not required.

### Dashboard CI guard

known red CI state reproduced:
YES (run 33677778374 on 66f3def: Typecheck passed; "Demo privacy guard" failed with "[guard:demo] BLOCKED: Refusing to build the public Dashboard without NEXT_PUBLIC_DEMO_MODE=1"; unit tests skipped after it; "E2E (Playwright, demo)" passed 21 tests)

classification:
B. Pre-existing CI configuration debt. scripts/guard-demo.mjs:31 treats CI=true as a deploy context and ci.yml:30-32 sets no demo env, so the guard refuses a non-demo build, which is exactly its job. Nothing in the failure touches real data, credentials, or the demo lock.

runtime/privacy confidence:
HIGH. The Vercel demo build runs the same guard with NEXT_PUBLIC_DEMO_MODE=1 and deployed; the live demo self-labels synthetic, serves generatedAt 2026-09-02T10:35:44Z equal to the committed snapshot, shows coherent rolling metrics, and has zero leak markers; all seven write routes short-circuit on IS_DEMO in source; the E2E job builds in demo mode and passes.

Portfolio impact:
NONE. The Portfolio makes no CI claim for the Dashboard. Narrow follow-up for the Dashboard repo: set NEXT_PUBLIC_DEMO_MODE=1 on the guard step, or run the guard twice expecting pass and refusal.

### Flagstone dated 2,971-test measurement

rendered context clear:
YES ("2,971 tests passing · measured 2026-08-16, method" and "That run reported 204 suites, 2,971 passing, 32 todo, 0 failing. The homepage receipt says 2,900+ because the suite grows most weeks"; homepage receipt "2,900+ tests passing: Flagstone reported 2026-08-16 · method")

could be mistaken for current Build 33 all-green count:
NO (the figure is bound to a dated run, scoped to "that run", says the suite grows, and is nowhere tied to Build 33; AccessMap's own later records at 70b52a3 show 207 suites / 3,061 passing / 0 failing on 2026-08-18, so the receipt understates in the conservative direction)

action:
ACCEPT

## Cross-repo truth matrix

| Project | Authoritative source | Portfolio truth | Live truth | Verdict |
|---|---|---|---|---|
| Flagstone | AccessMap f5594171 (Build 33 source): app.json name Flagstone 4.1.1; release/current.json submitted_for_review, iosBuild 33; RLS from the first migration; MapScreen.tsx:578-596 parallel list; accessibility.ts hooks; theme.ts:684 44pt; lighthouserc accessibility error at 0.9 on PR; app.json foreground-only location; flags.ts filter on both paths, MAX_PHOTO_BYTES, verifyExifStripped fail-closed; delete-account functions; no analytics SDK; 1,924 commits; sim-walk 48/46/2 present at f5594171 | "App Store review submitted · August 2026"; body keeps "has not shipped" and "approval ... not established"; every architecture and privacy claim confirmed; anecdote about the blocked background-location keys VERIFIED in AccessMap DECISIONS_LOG.md (2026-05-29, PLIST-JORDAN-BLOCKED) and qa-reports/2026-05-29_Jordan_BackgroundLocationGate.md | flagstone.skypistudio.com serves the Expo web build (onboarding renders in a real browser); skypistudio.com Flagstone routes text-identical to the base | PASS (notes: exact date "August 31, 2026" and the single-tester sentence are first-party facts the repo does not record; README at f5594171 still says WCAG 2.1 while code and tests say 2.2) |
| Ghost Code | ghost-code bb1ba5e: README "calm, modern terminal-command trainer"; cards.js 20/20/16 with 3 decoys each; arcade spirits; learn phases; masteredScore >= 3 with weighted draw; key map; swipe; theme-boot script; gc.v1; no fetch; ci.yml validator; live region, reduced motion, forced-colors | Terminal-trainer identity and every product claim confirmed; the descriptive strings (cabinet, Settings, maze, prompt position, learn order, absolute) were wrong and are fixed | ghostcode.skypistudio.com index.html md5 94b25e5d7d5ff0a1dd76a8f6b5239b8d equals origin/main; cards.js identical | PASS (fixed) |
| Prompt Library | Prompt_Library 78b961e: localStorage keys; output export; anthropic.ts direct call with the direct-browser-access header; hand-parsed SSE; ClaudeErrorKind auth/rate-limit/overloaded/network; retry-after countdown with manual retry only; AbortController; variables, runs, transfer; Fuse.js; safe-subset markdown; models and maxTokens; shortcuts modal; aria-live; CI on pull_request; Pages deploy; MIT | Every claim confirmed; no privacy absolute anywhere; retry wording matches the implementation exactly | prompts.skypistudio.com serves "No account, no backend, your library stays in this browser; runs go directly to Anthropic."; zero "never leave" in HTML and all served chunks | PASS (share card and hero still recaptured) |
| Dashboard | Dashboard 66f3def: proxy.ts single-account gate; IS_DEMO short-circuits in every reader; approve and the other six write routes no-op in demo; guard-demo.mjs refuses public non-demo and real-without-auth builds; next-auth present; demo features present; snapshot.demo.json generatedAt 2026-09-02T10:35:44Z | Private operator app vs public synthetic demo stated in summary, status, body and role; no synthetic figure presented as a business metric | dashboard.skypistudio.com self-labels demo, dates its snapshot 2026-09-02, coherent metrics, zero leak markers, zero 2026-06-19; CI guard job red for the config reason above | PASS (note: the demo names the project by its repo name AccessMap) |
| Claude Corp | ~/.claude/CONSTITUTION.md v1.12 and 15 role files; Claude_Corp 9612389 index.html | 15 roles, authority order, Art. 1/2.4/4.5.5/8.6/8.7.4/9.1/11/12/17 claims all confirmed; bounded autonomy wording; "summarized publicly but not published in full" true (no constitution file in the public repo) | claudecorp.skypistudio.com md5 1db224c19f552325f9ad93f9ed0c00cb equals origin/main; hero "governed, not unattended"; one qualified "always on" (accepted) | PASS (share card and hero still recaptured; the "three commits behind" anecdote is unsourced) |
| Studio Archive | app/archive, lib/archive, UNINDEXED_ROUTES | Not a deliverable, not linked from any public chrome, described in the Colophon only as an unnamed private catalogue | /archive/ serves noindex, nofollow; zero href="/archive" in the export or on live; absent from the sitemap | PASS |

## Recruiter simulation

5-second impression:
At both 1440x900 and 375x812 the first screen is the pinned desert film. The only text is the runway chip ("Sky Halisky / Technical Support / AI-assisted Builder"), "Scroll" and a real "Skip intro" control. What Sky does is not yet stated; the first proof signal is craft, not a claim. Would continue, via Skip intro. This is a deliberate design choice with a labelled escape, not a defect.

15-second impression:
The hero answers what Sky builds in one line, the subhead states five public projects and one App Store submission, and three dated, tiered receipts (2,900+ reported, axe 0 measured, calibration round open with one held item) arrive with the introduction. Generic: "Accessibility first, built for everyone." Unusually strong: a receipt row that names its scope, date and tier, and a calibration line that admits a held item. Still unclear: whether Sky writes code, and what Sky is available for.

60-second impression:
Each of the five projects opens with a distinct reason to exist; four case studies split "Mine / The agents' / What I check" and Ghost Code folds the same split into its approach; AI assistance is quantified rather than apologised for ("effectively all of the implementation ... across more than 1,900 commits"); technical depth names failure mechanisms (the EXIF library returning undefined, the moved closing tag, the three-layer demo seam, the hand-parsed SSE client); product judgement is visible (verify and celebrate fixes; the deliberately unpatched anonymous filter); accessibility is mechanism-level; progression is legible from the first build to a submitted product. Would interview.

target role perceived:
AI-assisted product builder with accessibility and governance depth, arriving from a senior technical-support background; not a straight senior software-engineer requisition, and the site does not claim one.

strongest reason to interview:
End-to-end ownership with cost-aware judgement on a submitted product and four public demos, published beside its own defect ledger, dated receipts and a reproducible test command.

strongest reason not to interview:
Nothing has users yet, the site says the agents wrote most of the code, and About says "I am not a trained software engineer"; a hands-on implementation role would need to probe unaided coding depth.

hardest interview question:
"Open a Flagstone file, explain what it does, and change it while I watch."

portfolio defensible under that question:
YES (the portfolio asked it first: it never claims to have written the code, quantifies what the agents did, and names what Sky checks and decides)

## Recruiter journeys

Rig: real clicks and browser Back in headless Chromium (playwright-core, chromium_headless_shell 1228), served from this worktree's build on :3005; departure scroll recorded at click time; popups captured for external links. "pre" = locked base, "post" = after the fix commit.

| Journey | Viewport | Theme | Result | Notes |
|---|---:|---|---|---|
| A | 1440x900 / 768x1024 / 375x812 | dark / dark / light (+1440 light reduced motion, 1440 dark no view transitions) | pre: FAIL at Flagstone arrival; post: PASS | Skip intro lands #hero at 0 and strips the hash; Live demo opens flagstone.skypistudio.com in a new tab with rel noopener noreferrer and a named control; Back restores the exact departure offset every time |
| B | 1440x900 / 375x812 | dark / light | pre: FAIL for row 01 only; post: PASS all five | every row arrives at 0 post-fix; Back exact; focus after client navigation rests on body |
| C | 1440x900 / 375x812 | dark / light | PASS | all five title links arrive at 0; Live demo and GitHub open new tabs to the labelled hosts; Back exact |
| D | 1440x900 / 375x812 | dark / light | pre: FAIL at Flagstone arrival; post: PASS | About card arrives at 0 post-fix; Back exact |
| E | 1440x900 / 375x812 | dark / light | PASS | 9 verification links, each target _blank, rel noopener noreferrer, name "Verify credential: ... (opens in new tab)"; all 25 unique external hosts 200 (LinkedIn 999 bot-block) |
| F | 1440x900 / 375x812 | dark / light | pre: FAIL at Flagstone arrival; post: PASS | rail Read the notes to /blog/, article top; built article carries "Status as of May 29, 2026"; article hands off to the current case study |
| G | 1440x900 / 375x812 | dark / light | PASS | mailto hydrates to hello@skypistudio.com with a subject; LinkedIn opens a new tab with the sr-only cue |
| H | 1440x900 / 768x1024 / 375x812 | dark / dark / light | pre: FAIL for the neighbour that is Flagstone; post: PASS all five | Back restores the exact departure offset |

## Navigation acceptance

forward route starts top:
PASS after the fix (all five case studies from every tested entry point; pre-fix the Flagstone arrival failed from every scrolled entry point)

Back restores context:
PASS (exact offset match in every case at 375 and 1440 once departure was recorded at click time)

anchors:
PASS (/#work, /#about, /#contact, /#how-i-work land the section at 0; /work/flagstone/#what-went-wrong, #flagstone-test-count-method, /colophon/#calibration, /accessibility/#receipts land inside their scroll margin)

hash cleanup:
PASS (location.hash empty after every anchor arrival; Back still exact)

reduced motion:
PASS (1440x900 light with reducedMotion reduce: navigation identical, no data-nav-direction ever set, Flagstone clip paused with a "Play animation" control, content visible at rest; homepage under reduced motion renders the static frame with identical text per Lane C)

focus:
PASS with a note (after client navigation focus rests on body, or on the persistent rail or footer link that was activated; the skip link then leads into main; mobile menu returns focus to its trigger)

transition race:
PASS (two rapid clicks settle on one sane route with the direction attribute cleared, with and without view transitions)

external-link behavior:
PASS (every target _blank link carries rel noopener noreferrer, a visible arrow marked aria-hidden, and a screen-reader cue; popups opened to the labelled hosts)

## CTA acceptance

VIEW PROJECT:
PASS (home room and rows, /work/ cards, About cards, neighbour cards; accessible names "View project: X case study")

LIVE DEMO:
PASS (every case-study hero pill "Live demo ↗", named "Live demo for X (opens in new tab)"; work cards "Live ↗")

GITHUB:
PASS (source links say GitHub; cards name "View X source on GitHub")

stale doorway hits:
0 (no "Read the case study", "Live map", "Open it" doorways, or "Read more" outside the blog index in rendered recruiter copy)

justified exceptions:
the blog index "Read more" (editorial); the sidebar Featured widget "Open it" (frozen rail copy); the lowercase "X: read the case study" accessible name on card title links (Prompt 2 accepted pattern)

## Public truth hygiene

prohibited claim hits:
0 on every rendered recruiter route (the only matches are negations or legitimate uses: "not certified", "rather than anything adaptive", "no agent applies one to production", "production build")

current AccessMap naming hits:
0 in visible recruiter text (occurrences are the GitHub repo URL, the two redirect stubs that explain the rename, and RSC payload data)

open-source absolute hits:
0

privacy absolute hits:
0 (the Ghost Code "nothing is sent anywhere" absolute was tightened to a claim about progress data)

autonomy absolute hits:
0

App Store overclaim hits:
0

PUBLIC_EM_DASHES_INTRODUCED:
0

EDITED_PUBLIC_COPY_EM_DASHES_REMAINING:
0

PUBLIC_RECRUITER_EM_DASH_GATE:
PASS (source sweep: zero em dashes and zero double hyphens in every edited string; rendered sweep of the rebuilt export: zero em dashes in visible text, attributes and raw HTML on all 16 recruiter routes; the recruiter-copy-truth suite enforces both. Disclosure: the recaptured screenshots of the two external sites reproduce those sites' own typography, which includes em dashes inside the images; they are captures of Sky's products as deployed, not Portfolio text.)

## UX / visual acceptance

375x812 light:
PASS (hero landing pad, nameplate, H1, flagship room, work rows, /work/ cards, every case-study first screen, About, Credentials, Contact, footer; 0 overhang, 0 console errors)

375x812 dark:
PASS (same frames; themed media swaps to the dark twins)

768x1024 light:
PASS (rail visible from 768; /work/ cards in the horizontal md grammar)

768x1024 dark:
PASS

1440x900 light:
PASS (hero, receipts, flagship room, case-study heroes with the recaptured stills reading "governed, not unattended" and the corrected Prompt Library line)

1440x900 dark:
PASS

200% zoom/reflow:
PASS (720x450 and 320x568 element-level right-edge census on home, /work/, two case studies, About and Accessibility: 0 elements cross the viewport; overflow census at 720 across all 25 routes clean; Lane C measured 0px at 320 and 256)

homepage first 900px:
PASS (film, then Skip intro, then nameplate, positioning, H1, subhead, CTA and three receipts)

case-study first screens:
PASS (breadcrumb, kickers, title, summary, Live demo pill, hero well; Flagstone plate and status line)

mobile menu:
PASS (44x44 trigger, opaque dialog, first link focused, wrap-around trap including the theme toggle and close button, Escape and close button return focus to the trigger, link activation closes and navigates)

tablet rail:
PASS (rail at 768 with a 488px content column; hamburger at 767)

media:
PASS (dark twins swap on every themed shot; Flagstone matte clip visible in both themes; the Ghost Code clip plays its light or dark twin; the two recaptured heroes render and swap on the case studies and the work cards)

footer:
PASS (brand block, three columns, external cues, "No analytics. No cookies.")

overflow:
PASS (overflow census: 200 frames across 25 routes, 2 themes, widths 320/375/414/720, no element crosses the viewport edge, instrument non-vacuity proven on every frame)

layout shifts:
PASS by construction (reserved aspect wells and mount settles; no CLS regression introduced; the only layout-affecting change is print-only)

visual changes required:
NO (the media replacement changes image content, not layout; the print rule changes paper output only)

## Accessibility acceptance

keyboard:
PASS (skip link first, every control reachable, card rows one stop per neighbour, mobile menu trap correct)

focus:
PASS (2px terracotta ring in both themes per the stylesheet and axe; focus after client navigation rests on body or the activated persistent link)

mobile-menu focus return:
PASS (verified: Escape and the close button return focus to the trigger; activation closes the dialog, restores body scroll and leaves focus on the trigger)

reduced motion:
PASS (CSS override rests every reveal; navigation degrades to instant cuts; clips do not autoplay and expose a Play control; homepage static frame carries identical text)

zoom/reflow:
PASS (see UX)

link purpose:
PASS with a note (card links are specific; the case-study links list renders "GitHub (opens in new tab)" without the project name, satisfied in context, recorded as a note)

external cues:
PASS (arrow glyph aria-hidden plus sr-only or aria-label cue on every target _blank link; 0 exceptions across 26 built files)

alts:
PASS (schema-enforced 4 to 200 chars; zero built images without alt; the 10 empty alts are figure images whose figcaption carries the description; the Ghost Code alts now describe the real captures)

captions:
PASS (figure and figcaption 1:1 wherever present; the /runway/ film has no captions or transcript, recorded as a note)

headings:
PASS (exactly one h1 on every route except the private archive shell and the three redirect stubs; no level skips)

landmarks:
PASS (one main with tabindex -1, labelled navs, top-level contentinfo, zero duplicate ids, zero dangling aria references)

touch targets:
PASS (chrome controls 44x44; zero WCAG 2.5.8 failures at 375 with the spacing and inline exceptions computed)

contrast:
PASS on portfolio routes (axe color-contrast enabled, 0 violations both themes); the Flagstone legal and support microsite under public/flagstone/ fails 1.4.3 in light theme on brand blue, recorded as a note

axe:
PASS (axe-core 4.11.4, defaults plus color-contrast plus label-content-name-mismatch, 1440x900 DSF 2, reduced motion, scroll-settled: 0 violations across 20 portfolio routes x 2 themes = 40 scans, run on the rebuilt post-fix export; the 5 remaining violations are all the /flagstone/* microsite in light theme)

screen-reader verification actually run:
NO
details: no VoiceOver or other screen reader was run. What was verified instead: dialog semantics and focus movement by DOM measurement, accessible names computed from the built HTML, landmark and heading structure by parser, aria references by parser, axe strict rules.

WebKit/Safari actually run:
NO
details: Chromium headless only (playwright-core, chromium_headless_shell 1228). No WebKit binary is available without a download, which this session did not perform.

## Metadata acceptance

titles:
PASS (every route titled; case studies "X: Sky Halisky")

descriptions:
PASS (from the corrected summaries; no stale product wording)

canonicals:
NOTE (no rel canonical on any real route; only the three redirect stubs carry one; SEO consolidation only, not a truth issue)

OG:
PASS (og:title, description, type, url, site_name, locale, image on every route; the two recut cards now match their products; live head metadata identical to the build on all 14 compared routes)

Twitter:
PASS (summary_large_image on every route)

JSON-LD:
PASS for truth (Person on every route; SoftwareApplication per project named Flagstone; no App Store overclaim; all blocks parse). NOTE: no WebSite node; SoftwareApplication omits applicationCategory, operatingSystem and offers

sitemap:
PASS (14 URLs once each, trailing slashes, excludes /archive/, /runway/, 404, the stubs and /flagstone/*)

robots:
PASS (allow all; sitemap referenced)

noindex:
PASS (/archive/ noindex nofollow; /runway/ noindex nofollow; 404 noindex)

project names:
PASS (Flagstone everywhere current-facing; Ghost Code; Prompt Library; Claude Corp Dashboard; Claude Corp)

project statuses:
PASS (submitted, not approved; private app and public synthetic demo; live and evolving; complete and live; in active use)

share images:
PASS after the fix (home and accessibility cards clean; Flagstone card honest with a cosmetic mid-sentence crop; Ghost Code card shows the real Arcade mode; Prompt Library and Claude Corp cards recut; Dashboard card is a dated, demo-labelled 2026-07-31 capture that shows the repo name AccessMap and the pre-P6 degraded metrics, recorded as a note)

## Live/source parity

| Surface | Expected source | HTTP | Source/live parity | Verdict |
|---|---|---:|---|---|
| Portfolio | 7dc04ff2be3d8754516cb218bc4f4a08079dfcd3 | 200 | 13 routes: stripped text identical, head metadata identical, byte diffs confined to four chunk hashes (the build is not bit-reproducible); sitemap same 14 locs; robots md5 identical; last-modified 2026-09-02 20:19 GMT | PASS (live equals the locked base; the P8 commit is not yet published) |
| Ghost Code | bb1ba5e708c9547ef50bc9c050c75fba511f409b | 200 | index.html md5 94b25e5d7d5ff0a1dd76a8f6b5239b8d identical; cards.js identical | IDENTICAL |
| Prompt Library | 78b961ec6f3dd05c5ffc8dae4c948a76eb1ab8c4 | 200 | live HTML carries the HomeClient.tsx hero and privacy sentences at 78b961e; served chunk carries api.anthropic.com and the direct-browser-access header; zero "never leave" in HTML and all served chunks | PASS |
| Dashboard | 66f3def891bd7a7ec0440e03fae88448d3d61731 | 200 | live generatedAt equals snapshot.demo.json at 66f3def; demo labels present; zero 2026-06-19; zero leak markers | PASS |
| Claude Corp | 9612389bdfdb6cab1613f266c207ebfb8eb00c70 | 200 | index.html md5 1db224c19f552325f9ad93f9ed0c00cb identical | IDENTICAL |

## P2 / P3 preservation

navigation:
PRESERVED and strengthened (ViewTransitions.tsx untouched; hash strip, Back restoration, reduced-motion and no-VT branches verified live; the Flagstone forward-top gap that predated P2 is closed by an order-only change with its own guard)

CTA vocabulary:
PRESERVED (View project / Live demo / GitHub verified in the export and by test)

keyboard ownership:
PRESERVED (one stop per neighbour card; tests pass)

Flagstone matte:
PRESERVED (data-themed-motion matte, clip visible and playing in both themes, one 44x44 control)

shot.dark forwarding:
PRESERVED (page.tsx media object unchanged; shot-dark-forwarding test passes)

Claude Corp dark shot:
PRESERVED (team.dark shown in dark, hidden in light)

Dashboard dark shots:
PRESERVED (think-tank.dark and dispatch.dark swap)

Prompt Library dark shot:
PRESERVED (prompt-detail.dark swaps)

Ghost Code dark clip:
PRESERVED (round.dark.phone clip in dark, light clip in light)

project stories:
PRESERVED (only the Ghost Code descriptive strings changed, to match the shipped product)

Colophon truth:
PRESERVED (static site with one private Supabase-backed exception, unchanged)

Prompt Library privacy:
PRESERVED (no absolute anywhere; share card and hero still now agree with the copy)

Dashboard split:
PRESERVED

Claude Corp autonomy:
PRESERVED (bounded wording; share card and hero still now agree with the copy)

Ghost Code identity:
PRESERVED (terminal trainer; arcade-era imagery removed from the descriptions)

Flagstone status:
PRESERVED ("App Store review submitted · August 2026"; test-pinned)

Studio Archive:
PRESERVED (private, unlisted, noindex, unlinked)

em-dash gate:
PRESERVED (zero on every rendered recruiter route)

## Quality gates

diff-check:
PASS (git diff --check clean before and after the commit)

lint:
PASS on the project config (npx eslint --no-eslintrc -c .eslintrc.json over app, components and lib: exit 0, no warnings). Note: `npm run lint` itself aborts in this nested worktree because ESLint also loads the parent checkout's .eslintrc.json ("Plugin @next/next was conflicted"), a known worktree-location artefact, not a code finding.

typecheck:
PASS (tsc --noEmit exit 0)

tests:
PASS (npm test: 90 files, 826 passed, 2 skipped; the accepted baseline was 88 files, 820 passed, 2 skipped; the six additions are the two new guard files and the media-description test; the two skips are the labelled build-dependent placeholders)

static:
PASS (npm run test:static: 53 passed, 1 pre-existing skip, 2 files, on a fresh build)

build:
PASS (next build, 26 routes, three times this session; prebuild validate-assets OK on 9 badges, 5 plates, 107 proof siblings, 3 blog figures; postbuild prune-500 and og-png-alias OK)

content/schema:
PASS (Zod validation at build and in the content tests; every edited alt within 4 to 200 chars and not starting with "image of")

truth guards:
PASS (recruiter-copy-truth including the new media-description test, flagstone-release-status, shot-dark-forwarding, shot-matte-forwarding, matte-theme-invariance, case-study-arrival-top, print-reveal-visibility)

a11y:
PASS (axe 0 violations, 40 portfolio scans, post-fix export; source and built-output audit clean)

browser/E2E:
PASS (journeys A to H at 1440/768/375 in both themes plus reduced-motion and no-VT contexts; print probe on six routes; theme toggle swaps; no console errors on any route in any run)

links:
PASS (413 internal links and 28 anchors resolve in the export; 25 of 26 unique external URLs 200, LinkedIn 999 bot-block; static-integrity link gates green)

assets/showcase:
PASS (validate-assets prebuild; asset-integrity in the suite; the eight replaced stills and two cards match their referenced paths and dimensions, 1290x806 and 1200x630)

metadata:
PASS (static-integrity share-card identity and resolution gates; Lane D per-route audit)

overflow:
PASS (census 200 frames at 320/375/414/720 on the base export; post-fix census at 320/375 on the rebuilt export: 100 frames across 25 routes and 2 themes, no element crosses the viewport edge, non-vacuity plant caught on every frame)

## Changes

P8 Portfolio changes required:
YES

finding fixed:
1. Ghost Code media descriptions and two body sentences corrected to the shipped product (content/deliverables.json, scripts/showcase/wiring.mjs).
2. Case-study forward navigation now starts at the top for Flagstone: the JSON-LD script renders before the hoisted preload link (app/work/[slug]/page.tsx).
3. Print and save-to-PDF rest every scroll-reveal visible (app/globals.css print block).
4. Prompt Library and Claude Corp share cards recut from the live products (public/showcase/*/og-card.jpg via scripts/og-cards.mjs).
5. Prompt Library and Claude Corp hero stills recaptured and re-encoded with the factory pipeline; manifest rows and LQIPs updated (public/showcase/*, content/showcase.manifest.json, content/deliverables.json).
Guards added: lib/__tests__/case-study-arrival-top.test.ts, lib/__tests__/print-reveal-visibility.test.ts, and one test in lib/__tests__/recruiter-copy-truth.test.ts.

files changed:
app/globals.css; app/work/[slug]/page.tsx; content/deliverables.json; content/showcase.manifest.json; lib/__tests__/recruiter-copy-truth.test.ts; lib/__tests__/case-study-arrival-top.test.ts (new); lib/__tests__/print-reveal-visibility.test.ts (new); scripts/showcase/wiring.mjs; public/showcase/claude-corp/hero-pipeline.{light,dark}.desktop.{avif,webp}; public/showcase/claude-corp/og-card.jpg; public/showcase/prompt-library/home.{light,dark}.desktop.{avif,webp}; public/showcase/prompt-library/og-card.jpg (18 files, 213 insertions, 57 deletions; no dependency, config, architecture or design-system change; package-lock untouched)

commit SHA:
435e122d06db9f471d292af6ccd2b9541afa7895 "fix(portfolio): close final acceptance findings"

final tree:
f5abcc286f7227499b1c04e170af12adb26294e5 (the docs-only commit carrying this receipt follows; its SHA and tree are in the session output)

clean after commit:
YES

Outside the repo, disclosed: the four recaptured masters were written into the main checkout's gitignored masters bank (design-reviews/showcase-refresh/masters/{prompt-library,claude-corp}/), replacing the stale 2026-07-31 masters for those four stems, so the manifest rows are true and scripts/og-cards.mjs regenerates the recut cards. Nothing else outside this worktree was modified; every other repo was read only.

## External blockers

NONE

Non-blocking external notes for the freeze file (no repair authorised or attempted):
- Claude Corp public site: the qualified "always on" triad is accepted; "always scoped, always accountable to Sky" would lose nothing if Sky wants it tighter.
- Dashboard repo: the "Types · Unit · Guard" job is red because the guard step has no demo env; the public demo names the project AccessMap (its repo name) in the synthetic snapshot; a display-name change to Flagstone would let the Portfolio's Dashboard share card be recaptured without the retired name.
- AccessMap README at f5594171 says WCAG 2.1 AA while the code, tests and the Portfolio say 2.2; release/current.json records submittedAt null while the Portfolio states August 31, 2026 from Sky's own record.
- Flagstone legal and support microsite (public/flagstone/*): light-theme brand-blue text measures 4.1 to 4.4:1; the pages ship their own high-contrast control; not a portfolio route and not in the a11y receipts' scope.

## Final recruiter verdict

Would a skeptical recruiter understand what Sky builds:
YES

Would they understand why each project exists:
YES

Would they understand Sky's personal role:
YES

Would they see evidence rather than unsupported claims:
YES

Would the AI-assisted workflow feel defensible:
YES

Would the body of work justify an interview:
YES

## Freeze

P8_FREEZE_READY:
YES

If YES:

FREEZE_TRIGGER_POLICY:
ACTIVE

NO_FURTHER_AESTHETIC_TINKERING:
YES

NO_FURTHER_SPECULATIVE_COPY_POLISH:
YES

REAL_TRIGGER_REQUIRED_FOR_NEXT_CHANGE:
YES

Freeze notes carried forward (each is a note, not a trigger): the Flagstone submission-date and single-tester sentences are first-party facts; the Claude Corp "three commits behind" anecdote is unsourced in any repo; canonical links and the richer JSON-LD fields are absent; /accessibility/ lacks og:image:alt and the 404 page's og:image is the extensionless path; the case-study links list names "GitHub" without the project; the mobile menu stays open across a browser Back while open; /runway/ has a sound film with no captions (the standing human hold); the Ghost Code heroImage illustration is the pre-uplift render but is never rendered; the Ghost Code phone-variant stills and the unreferenced manifest phone rows remain July captures; the Dashboard share card is a dated demo capture; focus after client navigation rests on body.

## Final status

P8_FINAL_VERDICT:
PASS WITH NOTES

P8_SAFE_TO_INTEGRATE:
YES

P8_SAFE_TO_PUBLISH:
YES (after Sky merges the P8 commit through the usual gated pull request; live currently serves the locked base without the five fixes)

P8_FREEZE_READY:
YES

UNRESOLVED_ITEMS:
None blocking. Nineteen non-blocking notes recorded above; four external notes for their own repos.

RECOMMENDED_NEXT_ACTION:
Sky reviews the diff and this receipt on branch claude/portfolio-final-acceptance-e4afda, merges via the CI-gated pull request, confirms the Deploy run publishes, and declares the freeze. No external merge needs to precede it.
