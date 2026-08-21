# COWORK PROMPT — Truth Pass, Round 2

Paste everything below into a fresh Claude Code session opened in:

`/Users/skypie/Portfolio`

Round 1 shipped on branch `truth/portfolio-pass-2026-08-21` (9 commits, `main` untouched at `cf7148c`).
Its close-out is `design-reviews/truth-pass/2026-08-21/REPORT.md`. **Read it first** — it records what
was already fixed, and four of Round 1's own briefing premises that turned out to be false.

Round 2 exists because Round 1 scoped `content/deliverables.json` and `content/case-studies.md` and
**nothing else**. A sweep afterwards found live false claims in a file it never opened.

---

# MISSION

Finish the truth pass. Same standard as Round 1:

Every user-visible claim should survive the question **"How do you know?"**

Prefer a shorter true sentence to a longer impressive one.

---

# NON-NEGOTIABLES

- Never touch `main`.
- Work on `truth/portfolio-round2-<today>`, branched from `truth/portfolio-pass-2026-08-21`
  (**not** from `main` — Round 1 is not merged yet and this work sits on top of it).
- Sky merges. No pushes. No deploys. No emails. No posts. No external sends of any kind.
- If HEAD is not `truth/portfolio-pass-2026-08-21`, **STOP** and report the branch. Do not switch,
  reset, stash, rebase, or merge.
- `~/Portfolio` has 3 permanently-dirty files (`.claude/launch.json`, `DECISIONS_LOG.md`,
  `PROJECT_STATE.md`). Never stage them. Always `git -c rebase.autoStash=true pull --rebase`, never
  a bare `git pull`.
- Pass `--no-edit` on every merge/revert command you hand Sky. Without it they open `vi` and leave
  the operation staged-but-uncommitted.

---

# EVIDENCE DISCIPLINE — read this twice

Round 1 published a false claim because it verified that a document *said* what it thought, and did
not re-read the code that document described. **Verifying a quote is not verifying a claim.**

Before repeating any statement about the live site, GitHub, Supabase, Vercel, a build, a test count,
a deployment, a user, a launch, a license, or another repo — **check the underlying source or live
service.** Not a runbook. Not a TODO. Not this prompt.

Specifically distrusted, by name, because each has already been wrong:

- `~/AccessMap/APP_STORE_TODO.md` — **stale**; 3 of its 4 Phase-0 blockers are already closed.
- `~/AccessMap/design-reviews/ship-ready/` SR-021 — says "binary-launch evidence NONE **this train**".
  That is a statement about one audit's scope, not about all of history. Round 1 read it as the latter.
- `~/career-arsenal/portfolio-evolution/2026-08-21/` — a good audit that got the ClaudeCorp remote
  wrong and asserted a governance feature that does not exist.
- Any memory file. The index carries corrections the topic files do not.

**If a claim cannot be receipted, REMOVE THE CLAIM.** Do not soften an unverifiable claim into a
vaguer one unless the vague version is itself supported.

**Contradiction rule.** If anything in this prompt is wrong, stale, or backwards: STOP, verify the
source, and report (1) what this prompt claimed, (2) what the source actually says, (3) what you
therefore did. A prompt is not evidence. Round 1 caught four bad premises in its own brief and one
in its own output — expect to find more.

---

# COMMIT DISCIPLINE

One commit per task. After each: run the gates, read the whole diff, check the user-visible copy,
confirm no protected file or unrelated work moved, then commit and record the hash. A task that
cannot be cleanly completed stays uncommitted.

If a gate fails, diagnose whether it is pre-existing, yours, or environmental. Do not attribute a
pre-existing failure to this round.

---

# GATES

Measure the baseline **before the first edit**. Do not inherit these numbers:

```
npm run typecheck
npm run test
npm run lint
npm run build
```

Round 1 finished at: typecheck clean · **656 pass / 1 skip / 1 todo (658)** · 0 ESLint · build 25 pages.
Confirm that is still the state before you start. Any task that moves a number must say which, why,
and whether it was expected.

Two pre-existing `next.config.mjs` advisories (`headers` under `output: export`; multi-lockfile
workspace root) print on every run. They are not yours.

**Do not run `npm run build` while `npm run dev` is live** — it clobbers the dev server's `.next`
chunks and produces a 500 that looks like a code defect. Round 1 lost time to this.

---

# VOICE RULES

Plain, specific, evidence-led. Banned: *leveraged, cutting-edge, revolutionary, seamless, innovative,
ecosystem, transformative, passionate about, journey, empower*, and *platform* unless it literally is
one. Replace "what I claim" with **what happened + what I did + what changed**.

House apostrophe is curly, applied at render by `smartPunctuation` — author **straight** apostrophes
in content JSON and let the transform do it. `lib/__tests__/smart-punctuation.test.ts` must stay green.

---

# TASK 1 — `content/blog.json` (BLOCKING · the reason this round exists)

The one published post, `building-flagstone` (`draft: false`, live at
`https://skypistudio.com/blog/building-flagstone/`, HTTP 200), says under **"What's next"**:

> TestFlight is live. App Store submission is the immediate next step — review is pending.
>
> After that, the features **beta testers have asked for most** are search … and a proper dispute
> resolution flow …

Three claims, none of them verified, and the post carries `relatedDeliverable` pointing at Flagstone —
so once Round 1 merges, this sits **one click from** a project page that says the app has not shipped.
A reader who notices the contradiction is finished with the site.

### 1.1 — Establish what is actually true about the build

**This is a research task before it is an editing task.** The evidence conflicts and Round 1 could
not resolve it:

- `~/AccessMap/design-reviews/evidence-log/2026-08-21/01_SHIP_AUDIT.md:38` — "M-2 · There has never
  been a binary", sourced to SR-021.
- `~/AccessMap/app.json` — `"buildNumber": "15"`. Build numbers advance when builds are made.
- `~/AccessMap/CHANGELOG.md:11` — "the App Store / TestFlight build was erroring with …", which
  presupposes builds.
- Sky's memory index records a TestFlight build installed ~2026-05-29 and Apple accepting build 13.

Check what can actually be checked: EAS build history, App Store Connect state, the git history of
`ios.buildNumber`, `eas.json` profiles, any submit workflow logs, `qa-reports/` mentioning an install.

**Then ask Sky directly** — they know whether a build ever reached another human, and no file will
settle it. Frame the question narrowly: *did a TestFlight build ever go to anyone other than you, and
has anything ever been submitted for App Store review?*

**Do not edit the post until that is answered.** Both possible answers change the copy, and they also
change Round 1's Flagstone page (see Task 2).

### 1.2 — Rewrite "What's next" to match the answer

Whatever survives, "review is pending" must go unless something is genuinely in review, and the
beta-tester claim must go unless testers genuinely exist. If testers *do* exist, that is good news and
Round 1 over-corrected — say so plainly and fix Task 2 in the same breath.

### 1.3 — Sweep the rest of the post

Round 1 never read it. Check every factual claim in `content/blog.json` the way Round 1 checked
`deliverables.json`: numbers, dates, statuses, adoption, anything about users. Report what you checked,
not just what you changed.

---

# TASK 2 — Reconcile the Flagstone page with the answer

Round 1's Phase 1 wrote, on `/work/flagstone/`:

> The iOS app has not shipped — App Store submission is the current work, and **no build has been in a
> stranger's hands.**

That last clause was written on SR-021's authority and **cannot be verified either way**. It is exactly
the class of claim this pass removes — an absolute about the past, stated with no receipt.

Once Task 1.1 answers the question:

- **If no build ever reached anyone:** keep it, and note in the report that it is now receipted.
- **If a build did reach someone:** it is false. Replace it with what is certain — the app is not on
  the App Store — and drop the unverifiable absolute. Do not swap it for a vaguer version of the same
  claim.

Either way the blog post and the project page must agree. That is the deliverable.

---

# TASK 3 — Prompt Library LICENSE, and the copy that depends on it

Sky decided in Round 1: **add MIT.** Not done — it needs a push to a repo with no local clone.

1. Confirm the state first: `gh api repos/Skypie99/Prompt_Library --jq '{license:.license,description}'`.
   Round 1 measured `license: null`, no LICENSE file, description `"prompt libary"` (typo).
2. **Adding the LICENSE and editing the description are writes to a repo — Sky runs those, not you.**
   Give the exact commands. The web UI route is `Add file → Create new file → LICENSE → "Choose a
   license template" → MIT`, which is less error-prone than the API.
3. **Once the LICENSE actually exists** — verified by re-querying the API, not by assuming Sky ran it —
   upgrade `content/deliverables.json` → `prompt-library` → body:
   - now: *"Deployed as a static site on GitHub Pages, source public on GitHub."*
   - then: *"Deployed as a static site on GitHub Pages, source public under MIT."*

   **Do not make that copy change before the license is live.** Shipping it early re-creates F-3, the
   exact claim Round 1 deleted.

---

# TASK 4 — The remaining tagline collision

Round 1 cut one of three competing taglines (the Sidebar/HamburgerNav line). Two remain:

- `content/profile.json` → `tagline` → Footer, every page: *"AI tools built with intention."*
- `app/page.tsx` → hero `positioning`: *"Building accessible, AI-native product. Open to thoughtful
  product collaborations."*

They do not contradict, but the footer line is vague and drops accessibility. **Draft two or three
alternatives for the footer that align with the hero's position. Do not pick one.** Record it as a
Sky decision. Silently choosing site-wide positioning copy is authorship, not a truth fix.

---

# TASK 5 — Content surfaces Round 1 never opened

Apply Round 1's method to the files it skipped. For each: does every user-visible claim survive
"how do you know?"

- `content/certificates.json` — do all `credentialUrl`s resolve? Are issuers and dates accurate?
- `content/a11y-receipts.json` — the `/accessibility` page is PROTECT-36/37 and its **copy** is
  protected, but the receipts feeding it are numbers. Are they still measured and dated?
- `content/profile.json` — location, socials, contact.
- `content/rounds.json`.
- `app/about/page.tsx` — it has its own "How I work" (`#method`) describing fifteen agents and a
  written constitution. Round 1 added a homepage band on the same subject. **Check they agree**, and
  that `/about` carries no claim Round 1 removed elsewhere.

Report what you verified even where nothing changed. "Checked, clean" is a finding.

---

# DO NOT DO THESE THINGS

1. **Do not touch the test-count chip.** `FlagstoneTestReceipt` in `app/work/[slug]/page.tsx` pins
   **2,971, measured 2026-08-16**, from a fresh anonymous clone. The local W4 branch reports 3,286 —
   **do not publish it.** Re-measure only from a fresh clone after the Wave 4 work is merged and pushed.
2. **Do not touch `/accessibility/`.** Its self-downgrading "self-assessed, not certified" language is
   deliberate and protected (PROTECT-36/37).
3. **Do not run `prettier --write`** or bulk-format anything. `content/*.json` round-trips byte-identically
   through `json.dumps(indent=2, ensure_ascii=False)` — that is how Round 1 edited content without
   reflowing files. Use it.
4. **Do not remove or gate the cinematic intro.** Taste call, raise it, do not act.
5. **Do not touch resume or LinkedIn.** Known over-claims live at `~/career-arsenal/06_CROSS_CHECK.md`
   (O-1, O-2). Separate surfaces, separate pass — but **flag them in the report** so they stop being
   invisible.
6. **Do not rewrite historical audit bundles** to make terminology consistent. AccessMap-era records
   stay AccessMap-era records.
7. **Do not add a new id'd `<section>` to a page without registering it.** `lib/sectionNav.ts` is
   guarded: `section-nav-anchors.test.ts` T4 asserts the id'd bands in `<main>` are EXACTLY the mapped
   set plus the declared-unindexed set, and T5 asserts DOM order. Labels must be a string the page
   renders byte-for-byte. Round 1's `#how-i-work` shows the pattern.

---

# PHASE COMPLETION CHECKLIST

For every task:

```
[ ] correct branch      [ ] main untouched      [ ] no push / deploy / external send
[ ] claims verified against source, not documents
[ ] gates run           [ ] whole diff read     [ ] user-visible copy reviewed
[ ] no unrelated files  [ ] committed clean     [ ] hash recorded
```

If any box cannot be truthfully ticked, STOP and say why.

---

# CLOSE-OUT

Write `design-reviews/truth-pass/2026-08-21/REPORT_ROUND2.md`, required even if only Task 1 completes.

1. **Gate results** — baseline, final, delta, explanation. Measured, not inherited.
2. **Conservation tally** — every task in this prompt in a named bucket: FIXED · DELIBERATELY NOT
   FIXED · **PREMISE DIDN'T HOLD** · NEEDS SKY · NOT APPLICABLE. Nothing disappears silently. If this
   prompt was wrong about something, say so plainly and do not fix it from the paragraph.
3. **User-visible copy diff** — a table of every changed string, old and new. Show the strings.
4. **What you verified and did not change** — the checks that came back clean.
5. **Decisions for Sky** — numbered, each with the choice, your recommendation, why, and what stays
   unchanged until they answer.
6. **Rollback** — exact commands using the real hashes you created. **Execute them on a throwaway
   branch and confirm they work before writing them down.** Round 1 asserted a rollback caveat that
   turned out to be wrong about its own mechanism; running it is what caught that.

---

# FINAL STOP

When the report is written: **STOP.** Do not merge, push, deploy, publish, open a PR, send anything,
modify `main`, or start another sweep.

Return: branch name · commits and hashes · gates · files changed · decisions waiting on Sky · report path.
