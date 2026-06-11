# VOICE_PASS_PLAN — content/portfolio-voice-pass-2026-06-10

Phase-0 findings for the C3–C18 copy/voice pass. Every change located and verified
against current source before editing. Full plan: `~/.claude/plans/goal-a-careful-copy-cozy-badger.md`.

## Intro baseline (off-limits set — must stay byte-identical to main)

- Pathset: `components/CinematicIntro.tsx`, `components/cinematic/`, `public/images/cinematic/`, `cinematic-masters/`
- `git diff main -- <pathset>` at start: **empty** ✓
- Blob hash `components/CinematicIntro.tsx` @ main: `6fafe087311f72db22604acab99c90add95e16c1`
- Trees @ main: `components/cinematic` `5c9d47ef…`, `public/images/cinematic` `489260f4…`, `cinematic-masters` `b5b0940…`
- Also untouched: globals.css cinematic range (~1453–1598), cinema tokens, `--font-cormorant`, `--sidebar-w`

## Located targets

| C | File:lines | Current → New (summary) |
|---|---|---|
| C3 | app/page.tsx:87 | "…A command-line trainer." → "…A web-based prompt library." (current is a period list, not the comma list the brief described — kept current style) |
| C4 | app/page.tsx:88 | full subhead → "Six projects built, five live on the open web. Accessibility first, built for everyone." ("Built in public." dropped — standalone sentence; essence moves to C18) |
| C5 | components/Sidebar.tsx:53–63 | role line → "Technology designed with accessibility in mind."; availability status deleted. Extension: HamburgerNav.tsx:249–255 same claim on mobile — mirrored (flagged) |
| C6 | app/page.tsx:41–75, 122–156 | 1,564→1,680 · 50+/features shipped→100%/static · E2E/encrypted→0/data collected + tags Privacy-first/Invite-only/EXIF-strip · NEW "Born accessible" card (2.2 AA / WCAG conformance) · lg:grid-cols-5→3 · comments updated |
| C7 | content/deliverables.json:65,283 | "Architect"→"Solo builder" (flagged), "Lead engineer"→"Solo builder". AccessMap's exact label confirmed "Solo builder" |
| C8 | app/page.tsx:251–274 | Build body + Ship→"Ship & stay curious" + new body. /about method = different section, untouched |
| C9 | app/contact/page.tsx:45–48 | sub-line → "Accessible technology, built with care. …I read every message that comes through." |
| C11 | app/page.tsx:436–444 | h2 → "Passionate about building something special?<br/>Let's talk about it."; sub-copy p deleted; ContactEmail follows directly |
| C14 | components/Footer.tsx:53–69 + profile.json:4 | tagline → "AI tools built with intention." rendered left under name (mono meta, no dot); status line + right-side tagline removed |
| C15 | components/Footer.tsx:187–193 | "Made with care" + dot removed; Okanagan line kept |
| C16 | components/Footer.tsx:181 | "· © {year}" removed; "SkyPi Studio — Est. 2026" kept |
| C17 | components/Sidebar.tsx:122–131 | © {year} / CANADA row under "Write to me." button removed (brief said "contact page" — actual location is the sidebar bottom block; flagged) |
| C18 | components/Footer.tsx:134–138 | About blurb → "…builds small, careful AI tools. Accessible by default, useful by design, so no one's left out. Built in public, honest about what ships — five of six live on the open internet." |

## CountUpStat verification (no code change needed)

`'1,680'`, `'100%'`, `'0'` parse numerically (count-up animates; `%` suffix appears at
completion, same path as `+`). `'2.2 AA'` fails `/^(\d[\d,]*)(\D*)$/` → renders
statically (same path `'E2E'` used). aria-label always reads the final value.
STAT_EMBER cycles `i % 4` → handles 6. `last:odd:col-span-2` self-disables at 6 cards.

## Tests affected

Only `components/__tests__/Footer.test.tsx` (renders real Footer + real profile.json):
the © year test (C16) and the "Made with care" test (C15) — both rewritten for the new
footer. No other test asserts any changed string (verified by grep).

## Honesty flags (found, NOT fixed — for DECISIONS FOR SKY)

1. `content/case-studies.md:90,101` — "End-to-end encrypted" Mutual Mesh claim (known false). Not rendered (no code consumes the file) but a source doc that could re-seed the claim.
2. `content/deliverables.json:227` — Prompt Library case-study body says "Fifty features shipped." (rendered at /work/prompt-library) while the chip retires "50+ features shipped".
3. `app/work/page.tsx:71` — "slowly, documented honestly, sized to a single careful hand." — retired-voice echo of the old tagline.

## Out of scope (verified untouched)

Cinematic intro · certificate verify-links · LinkedIn links · "Correspond → Let's talk"
rename · faint-hairline backdrop bug · /about method section · site metadata (already clean).
