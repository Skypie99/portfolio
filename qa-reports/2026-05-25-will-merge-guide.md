# Portfolio Wave 2–5 Merge Guide for Sky
Generated: 2026-05-25 by Will (documentation)

---

## Before you start — two blockers to fix first

### BLOCKER A: Wave 5 branch is empty — recover the orphaned commit

`fix/auto-2026-05-25-wave5-final` currently points to the same commit as Wave 2
(`fca7a28`). The real Wave 5 work (profile tagline + two a11y fixes) was committed
as `efe3e4c` but is orphaned — it exists in the repo but no branch points to it.

**Fix this before merging anything:**

```bash
git -C ~/Portfolio branch -f fix/auto-2026-05-25-wave5-final efe3e4c
```

This fast-forwards the branch pointer to the real commit. It is non-destructive (no
files change; you are just labelling a commit that already exists).

What `efe3e4c` contains:
- `content/profile.json` — tagline updated to "I build privacy-first apps with
  Claude Code — learning in public." (replaces the generic placeholder)
- `components/Footer.tsx` — `aria-label` added to the mailto link (WCAG 2.4.6)
- `components/HamburgerNav.tsx` — `aria-hidden="true"` on the decorative wordmark
  `<p>` inside the nav overlay (prevents duplicate context in screen-reader dialog
  announcement)

### BLOCKER B: Three uncommitted stashes need a decision

Run `git -C ~/Portfolio stash list` to confirm. As of this report, three stashes exist:

| Index | Branch when stashed | Files |
|-------|--------------------|----|
| `stash@{0}` | `assets/auto-2026-05-25-project-images` (at `68d6654`) | `app/page.tsx`, `components/ProjectCard.tsx` |
| `stash@{1}` | `ui/auto-2026-05-25-homepage-polish` (at `148edaa`) | `app/page.tsx`, `components/Footer.tsx`, `components/Hero.tsx`, `components/ProjectCard.tsx`, `components/__tests__/ProjectCard.test.tsx` |
| `stash@{2}` | `ui/auto-2026-05-25-homepage-polish` (at `04260c5`) | `content/deliverables.json` |

**What to do:**
- `stash@{0}` — the Dani wave5 homepage changes in this stash are **already committed**
  in `ui/auto-2026-05-25-homepage-polish` as commit `7b80ee7`. The stash is superseded.
  Drop it: `git -C ~/Portfolio stash drop stash@{0}`
- `stash@{1}` — intermediate work that led to the committed `7b80ee7`. Superseded.
  Drop it: `git -C ~/Portfolio stash drop stash@{1}` (after dropping stash@{0}, the
  index renumbers — verify with `git stash list` before each drop)
- `stash@{2}` — intermediate deliverables.json work that was committed to
  `content/auto-2026-05-25-links-and-copy` and then extended by the assets branch.
  Superseded. Drop it.

**Safe drop sequence (order matters because indexes shift):**
```bash
# After running each drop, re-check with: git -C ~/Portfolio stash list
git -C ~/Portfolio stash drop stash@{0}   # Dani wave5 homepage (assets branch stash)
git -C ~/Portfolio stash drop stash@{0}   # former stash@{1} — component work on homepage-polish
git -C ~/Portfolio stash drop stash@{0}   # former stash@{2} — deliverables.json on homepage-polish
```

If any stash seems unfamiliar, inspect before dropping:
```bash
git -C ~/Portfolio stash show -p stash@{0}
```

---

## Branch inventory

| Branch | Tip SHA | Status | Unique additions (beyond Wave 2) |
|--------|---------|--------|----------------------------------|
| `fix/auto-2026-05-25-portfolio-wave2` | `fca7a28` | Ready | About page bio, Pac-Man entry, SkipLink a11y, OG meta, mobile wordmark |
| `test/auto-2026-05-25-gary-portfolio-tests` | `5f9a4a3` | Ready | `lib/__tests__/cn.test.ts`, `lib/__tests__/schema.test.ts`, QA report |
| `ui/auto-2026-05-25-dani-warmth` | `fca7a28` | **SKIP** — identical to Wave 2 | Nothing beyond Wave 2 |
| `ui/auto-2026-05-25-homepage-polish` | `7b80ee7` | Ready | Dani wave5: page rhythm, Hero, Footer, ProjectCard warmth |
| `assets/auto-2026-05-25-project-images` | `68d6654` | Ready | 5 SVG hero files + `deliverables.json` img paths `.jpg`→`.svg` |
| `content/auto-2026-05-25-links-and-copy` | `9c4293c` | Ready | `deliverables.json` summary copy + `qa-reports/alex-casey-wave4.md` |
| `ui/auto-2026-05-25-shamus-card-upgrade` | `a0029ab` | Ready (merge after homepage-polish) | Updated `ProjectCard.test.tsx` + QA reports |
| `fix/auto-2026-05-25-wave5-final` | `efe3e4c` (**after fix**) | Ready after BLOCKER A | Profile tagline, Footer aria-label, HamburgerNav aria-hidden |

---

## Conflict map

Two file-level conflicts exist between the Wave 4 branches:

### Conflict 1 — `content/deliverables.json`
Touched by: `content/auto-2026-05-25-links-and-copy` AND `assets/auto-2026-05-25-project-images`

**Nature:** Both branches rewrite the deliverable summaries with identical text.
The assets branch also flips all `heroImage.src` values from `.jpg` to `.svg`. The
content branch does not touch `heroImage.src`.

**Resolution:** Merge `content` first, then `assets`. When assets is merged, git will
detect that the summary text matches (already landed via content), and only the
`heroImage.src` changes will show as new. Conflict is minimal — only `src` lines
differ between the two branches' versions of the file.

If git stops with a conflict on `content/deliverables.json` during the assets merge:
1. Open the file
2. Keep the `src` values from the assets branch (`*.svg` paths)
3. Keep the rest from the content branch (summaries, tech stack, mutual-mesh TypeScript addition)
4. The correct resolved file has `.svg` sources AND the rewritten summaries

### Conflict 2 — `components/ProjectCard.tsx`
Touched by: `ui/auto-2026-05-25-homepage-polish` AND `ui/auto-2026-05-25-shamus-card-upgrade`

**Nature:** Both branches make the same functional changes to ProjectCard (next/Image
swap, terracotta border, gradient fallback, smaller pills). The differences are
cosmetic: Shamus uses `→` and `§` in ASCII form (`->`, section numbers without `§`),
while homepage-polish uses Unicode. The QA report on `homepage-polish` explicitly
states "The pre-commit hook (Shamus wave2) also landed in this commit."

**Resolution:** Merge `homepage-polish` first (it contains the canonical version).
Then merge `shamus-card` — its unique additions are the **updated test file**
(`components/__tests__/ProjectCard.test.tsx` with Shamus wave2 assertions) and two
QA report files. Git will conflict on `ProjectCard.tsx` but the correct resolution
is to **keep homepage-polish's version** (the one already in main after step 4).

If git stops with a conflict on `ProjectCard.tsx` during the shamus-card merge:
```bash
git checkout --ours -- components/ProjectCard.tsx
git add components/ProjectCard.tsx
# then continue the merge
git merge --continue
```

---

## Merge Order (run these in sequence)

**Before starting:** confirm you are on `main` and it is clean:
```bash
git -C ~/Portfolio checkout main
git -C ~/Portfolio status   # should show nothing to commit
```

---

### Step 1 — Wave 2 base (About page + fixes)
**Branch:** `fix/auto-2026-05-25-portfolio-wave2`

What it contains:
- `app/about/page.tsx` — full About page rewrite (unique bio, how I build, values, learning)
- `app/layout.tsx` — OpenGraph + Twitter Card meta tags
- `components/HamburgerNav.tsx` — Sky Halisky wordmark in mobile overlay
- `components/SkipLink.tsx` — `focus:` → `focus-visible:` (keyboard-only skip link)
- `content/deliverables.json` — Pac-Man entry added; Prompt Library tech fixed

Conflicts expected: **none** (two commits ahead of main; clean fast-forward eligible but use --no-ff for traceability)

```bash
git -C ~/Portfolio merge fix/auto-2026-05-25-portfolio-wave2 --no-ff -m "merge: Wave 2 — About page, OG meta, SkipLink, Pac-Man entry"
```

---

### Step 2 — Gary Wave 3 tests
**Branch:** `test/auto-2026-05-25-gary-portfolio-tests`

What it contains:
- `lib/__tests__/cn.test.ts` — unit tests for `cn()` custom-color merge fix
- `lib/__tests__/schema.test.ts` — Zod schema validation tests (happy path + edge cases)
- `qa-reports/2026-05-25-peter-gary-wave3.md` — audit report

Conflicts expected: **none** (only touches new test files not present on main)

```bash
git -C ~/Portfolio merge test/auto-2026-05-25-gary-portfolio-tests --no-ff -m "merge: Wave 3 — cn() and schema unit tests"
```

---

### Step 3 — Content copy polish
**Branch:** `content/auto-2026-05-25-links-and-copy`

What it contains:
- `content/deliverables.json` — all 5 deliverable summaries rewritten (recruiter-readable,
  within 160-char limit); Mutual Mesh TypeScript added to tech stack
- `qa-reports/2026-05-25-alex-casey-wave4.md` — link audit + copy polish report

Note: This intentionally lands before the assets branch so that `.jpg`→`.svg` changes
can merge cleanly on top.

Conflicts expected: **none** (deliverables.json on main still has the old summaries)

```bash
git -C ~/Portfolio merge content/auto-2026-05-25-links-and-copy --no-ff -m "merge: Wave 4 content — copy polish, Mutual Mesh TypeScript"
```

---

### Step 4 — Dani wave5 homepage polish
**Branch:** `ui/auto-2026-05-25-homepage-polish`

What it contains:
- `app/page.tsx` — terracotta left-border accents on section headers, alternating section
  backgrounds, peach-cream contact section, email display
- `app/certificates/page.tsx`, `app/contact/page.tsx`, `app/work/page.tsx`,
  `app/work/[slug]/page.tsx` — warm token pass
- `components/Footer.tsx` — GitHub links terracotta, "Built with Claude Code" strip
- `components/Hero.tsx` — terracotta brand rule, scroll indicator arrow
- `components/ProjectCard.tsx` — next/Image, terracotta left-border, gradient fallback,
  warm card surface, tighter pills (canonical Shamus wave2 + Dani wave4 integrated version)
- `qa-reports/2026-05-25-dani-wave4-warmth.md`

Conflicts expected: **possible on `content/deliverables.json`** if git detects
the summary text already landed (step 3). If git pauses:
- Check with `git diff --cached` — the deliverables.json conflict will be the
  same text in both versions (summaries match); keep the step-3 version
- `git checkout --ours -- content/deliverables.json && git add content/deliverables.json`

```bash
git -C ~/Portfolio merge ui/auto-2026-05-25-homepage-polish --no-ff -m "merge: Wave 4 UI — Dani warmth pass, homepage rhythm, ProjectCard upgrade"
```

---

### Step 5 — SVG hero assets
**Branch:** `assets/auto-2026-05-25-project-images`

What it contains:
- `public/images/deliverables/accessmap/hero.svg`
- `public/images/deliverables/claude-corp/hero.svg`
- `public/images/deliverables/mutual-mesh/hero.svg`
- `public/images/deliverables/pacman-code-trainer/hero.svg`
- `public/images/deliverables/prompt-library/hero.svg`
- `content/deliverables.json` — `heroImage.src` changed from `.jpg` → `.svg` for all 5

Conflicts expected: **`content/deliverables.json` conflict is likely** because both
step 3 and this branch touched the file.

If git pauses with a conflict on `content/deliverables.json`:
1. Open the file in an editor
2. The resolved version should have:
   - All summaries from step 3 (already in main — keep ours)
   - All `heroImage.src` values pointing to `.svg` (from this branch — take theirs)
3. Manual resolution guide — for each project's `heroImage` block, keep:
   ```json
   "heroImage": {
     "src": "/images/deliverables/<project-id>/hero.svg",
     "alt": "..."
   }
   ```
4. Stage and continue:
   ```bash
   # After editing to resolve:
   git add content/deliverables.json
   git merge --continue
   ```

```bash
git -C ~/Portfolio merge assets/auto-2026-05-25-project-images --no-ff -m "merge: Wave 4 assets — SVG hero images + deliverables.json src update"
# If conflict: resolve deliverables.json (keep svg paths), then: git add content/deliverables.json && git merge --continue
```

---

### Step 6 — Shamus ProjectCard test + QA reports
**Branch:** `ui/auto-2026-05-25-shamus-card-upgrade`

What it contains (unique beyond what homepage-polish already merged):
- `components/__tests__/ProjectCard.test.tsx` — updated for Shamus wave2 (next/Image,
  terracotta border-l-4, first-letter initial assertions)
- `qa-reports/2026-05-25-alex-casey-wave4.md` — same file as in content branch (no conflict)
- `qa-reports/2026-05-25-shamus-card-upgrade.md` — Shamus wave2 documentation

Conflicts expected: **`components/ProjectCard.tsx` WILL conflict** because homepage-polish
already modified it. The resolution is to keep the homepage-polish version (already in main).

```bash
git -C ~/Portfolio merge ui/auto-2026-05-25-shamus-card-upgrade --no-ff -m "merge: Wave 4 Shamus — ProjectCard test update + QA reports"
# Expected conflict on ProjectCard.tsx — resolve by keeping ours:
# git checkout --ours -- components/ProjectCard.tsx
# git add components/ProjectCard.tsx
# git merge --continue
```

---

### Step 7 — Wave 5 final pass (profile tagline + a11y)
**Branch:** `fix/auto-2026-05-25-wave5-final` (must have BLOCKER A fixed first)

What it contains:
- `content/profile.json` — tagline: "I build privacy-first apps with Claude Code — learning in public."
- `components/Footer.tsx` — `aria-label="Send email to skylerhalisky@gmail.com"` on mailto link
- `components/HamburgerNav.tsx` — `aria-hidden="true"` on decorative wordmark `<p>`

Conflicts expected: **possible on `components/Footer.tsx`** and `components/HamburgerNav.tsx`
because homepage-polish (step 4) modified both. Check the diffs if git pauses.
- Footer conflict: keep both changes (wave5 adds `aria-label`; homepage-polish adds terracotta
  GitHub links + "Built with Claude Code" strip — these are different lines, may auto-resolve)
- HamburgerNav conflict: keep both changes (wave5 adds `aria-hidden`; wave2 added the wordmark
  text itself — again different lines, may auto-resolve)

```bash
git -C ~/Portfolio merge fix/auto-2026-05-25-wave5-final --no-ff -m "merge: Wave 5 — profile tagline, Footer aria-label, HamburgerNav aria-hidden"
```

---

## Branch to skip

| Branch | Reason |
|--------|--------|
| `ui/auto-2026-05-25-dani-warmth` | Identical tip SHA to `fix/auto-2026-05-25-portfolio-wave2` (`fca7a28`). Contains zero unique commits. Merging it would be a no-op. Skip entirely. |

---

## Sky's manual to-dos after all merges

1. **Verify the 5 SVG files render correctly.** Load the `/work` page locally
   (`npm run dev`) and confirm each project card shows the SVG hero rather than
   a broken-image fallback. The SVG files are in
   `public/images/deliverables/<project-id>/hero.svg`.

2. **Verify live demo links.** The link audit (qa-reports/2026-05-25-alex-casey-wave4.md)
   flagged two live demo URLs as UNVERIFIED:
   - AccessMap: `https://access-map-tau.vercel.app`
   - Claude Corp: `https://skypie99.github.io/Claude_Corp/`
   Open each in a browser and confirm they load. Update `content/deliverables.json`
   if either is a redirect or dead.

3. **Fill in certificate credentialUrls.** Five `credentialUrls` in
   `content/certificates.json` are still placeholder/empty — flagged in the link
   audit. Update with real URLs when available.

4. **Review the 3 stashes and drop the superseded ones** (see BLOCKER B above).

5. **Optional — tag the merged state:** after all merges pass verification,
   consider tagging so you have a rollback point before deploying:
   ```bash
   git -C ~/Portfolio tag v0.2.0-wave5 -m "All Wave 2-5 work merged"
   ```

---

## After all merges: verify

Run these in order on `main` after step 7:

```bash
# Type check
npx tsc --noEmit --project ~/Portfolio/tsconfig.json

# Tests (should show 40+ passing)
cd ~/Portfolio && npm test

# Static export build (confirms no broken imports or missing files)
cd ~/Portfolio && npm run build
```

If typecheck fails on `components/ProjectCard.tsx`, the most likely cause is a
merge that kept the older `<img>` instead of the `<Image>` import — check that
`import Image from 'next/image'` is present at the top of the file.

If the build fails with a missing SVG file error, confirm step 5 (assets branch)
was merged and the 5 `.svg` files exist under `public/images/deliverables/`.

---

*Will (documentation) — read-only analysis. No branches were merged or modified
to produce this report.*
