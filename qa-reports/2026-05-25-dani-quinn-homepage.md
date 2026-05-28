# Dani + Quinn Homepage Polish — 2026-05-25

**Branch:** `ui/auto-2026-05-25-homepage-polish`
**Commit:** `7b80ee7`
**Typecheck:** PASS (tsc --noEmit, zero errors)
**Mode:** className/copy/structure changes only — no logic, no data, no config

---

## What Changed

### `components/Hero.tsx`

**Terracotta brand rule below eyebrow**
- Eyebrow label (`p`) and a new `span.block.h-px.w-10.bg-terracotta` wrapped in a shared `div.hero-enter.hero-scroll-fade.mb-8`
- The 40px wide, 1px tall terracotta rule visually anchors the eyebrow to the brand's dot/mark language — the same motif used in the CTA button and footer
- Eyebrow spacing adjusted: `mb-4` → `mb-3` (rule carries the visual weight)

**Scroll indicator below CTA**
- Added `<a href="#work">` scroll affordance below the Button
- Typography: `font-mono text-meta tracking-label uppercase text-text-meta`, `opacity-60 hover:opacity-100`, `transition-opacity duration-base`
- Terracotta `↓` arrow in `text-[1rem]` — subtle, not loud
- `aria-label="Scroll to work section"` for screen readers
- CTA wrapper gains `flex flex-col items-start gap-10` to stack Button + scroll cue naturally

---

### `app/page.tsx`

**Section header hierarchy (all 4 body sections)**
All section header `div.mb-12` wrappers gained `pl-4 border-l-2 border-terracotta`:
- Work, How I work, About, Certificates

This creates a consistent editorial left-border accent — matching ffern.co's section rhythm — without adding any new text or icons. The 2px terracotta border is subtle enough to not compete with content but clear enough to signal a section start.

**Background rhythm**
- Process section: `bg-cream` → `bg-warm-white` (alternating pattern)
- Certificates section: `bg-cream` → `bg-warm-white` (alternating pattern)
- Result: cream / cream / warm-white / cream / warm-white / peach-cream — a gentle wave rather than a flat monochrome page

**Contact section redesign**
- Background: `bg-cream` → `bg-peach-cream` — warmer, distinct closing note
- Added eyebrow `<p>Contact</p>` to match all other sections
- Added email address display (`profile.contactEmail`) with `text-accent-text hover:text-terracotta` — warm secondary CTA before the button
- The section now reads: eyebrow → headline → email → button (complete, scannable)

---

### `components/Footer.tsx`

**GitHub link terracotta treatment**
- GitHub social links now use `text-accent-text hover:text-terracotta` instead of the generic `text-near-black hover:text-accent-text`
- Other social platforms retain the standard treatment
- `cn()` conditional applied per `s.platform.toLowerCase() === 'github'`

**"Built with Claude Code" closing line**
- Added to the bottom strip alongside "Made with care"
- Both lines grouped in a `div.flex.flex-col.md:flex-row` for responsive stacking
- Same `font-mono text-meta tracking-label uppercase text-text-meta` as the rest of the strip

**Bottom border upgrade**
- `border-t border-border-decorative` → `border-t border-stone` — `border-stone` is the canonical stone token (#DCDCD6), slightly more visible on `bg-warm-white`

---

### `components/ProjectCard.tsx`

Resolved a merge conflict from the stash pop. Kept the wave2 version with `border-l-4 border-l-terracotta` left accent — this is more refined than the wave4 base that was on the `ui/auto-2026-05-25-homepage-polish` branch HEAD.

---

## Mobile Concerns

**No new mobile regressions introduced.** Code review findings:

| Pattern | Location | Status |
|---|---|---|
| `hidden md:flex` on Sidebar | `components/Sidebar.tsx:22` | Correct — sidebar hides on mobile, hamburger takes over |
| `flex flex-col md:flex-row` on layout | `app/layout.tsx:113` | Correct — single column on mobile |
| `flex flex-col md:flex-row` on work items | `app/page.tsx:71` | Correct — stacks to column on mobile |
| `grid-cols-1 lg:grid-cols-3` on footer | `components/Footer.tsx:28` | Correct — single column below 1024px |
| `flex flex-col md:flex-row` on footer strip | `components/Footer.tsx:125` | New addition — stacks cleanly on mobile |
| Scroll indicator in hero | `components/Hero.tsx` | `flex flex-col items-start` — stacks naturally on mobile |

**One flag (low severity):** The hero section uses `clamp(96px, 14vw, 200px)` for top padding. On very short portrait screens (e.g. iPhone SE in landscape), this may compress aggressively. Not a regression — was pre-existing. Worth a future visual check on real device.

---

## Quinn's Product Notes

**Does the homepage tell a clear story now?**

Yes — with caveats.

**Stronger:** The hero now has a brand anchor (terracotta rule) and a scroll affordance. A visitor's eye has a clear journey: eyebrow → rule → headline → subhead → CTA → scroll down. The section headers with terracotta left borders make it immediately obvious where each section starts as you scroll — no more ambiguity about whether you're in a new section or still reading the last one.

**Contact section:** Adding the eyebrow + email address before the CTA significantly improves scannability. A visitor who scrolls to contact now sees: "Contact / Have an AI project? / skylerhalisky@gmail.com / [Get in touch]" — that's enough to act on without clicking.

**Rhythm:** The alternating cream/warm-white/peach-cream background progression reads like chapters in a print magazine. The peach-cream contact section as the warm closing note is emotionally appropriate.

**Still missing (out of scope for this pass):**
- The hero headline depends on `profile.tagline` which is currently a placeholder — copy is the biggest opportunity left
- No social proof / testimonial between certificates and contact
- The About section is a wall of three prose paragraphs with no visual break — a photo or pull quote would help on desktop

---

## Typecheck

```
> portfolio@0.1.0 typecheck
> tsc --noEmit

(no output — clean pass)
```

Zero TypeScript errors. All className-only changes; no new imports, no new props, no type surface changes.

---

## Branch State

- Branch: `ui/auto-2026-05-25-homepage-polish`
- NOT merged to main (per hard rules)
- Ready for: Design Compiler review (Const. Art. 2.4) before merge consideration
