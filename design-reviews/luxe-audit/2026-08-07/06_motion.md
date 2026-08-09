# LENS 6 — MOTION (banked 2026-08-07)

**Method:** computed transition census (every element, home @1280), stylesheet keyframe/RM-block census, arrival timing observation via frame-pump, WAAPI animation inspection. Live `45f6632`, Chromium. Real-thumb scroll feel and spring physicality remain device rows (D19–D25) — not asserted here.

## Duration + easing census — the template test

- **170 elements carry transitions; durations are a five-step scale: 180ms ×82 · 280ms ×54 · 900ms ×50 · 520ms ×32 · 1200ms ×12. There is not one 300ms on the estate.**
- **Easings: four custom cubics, zero default `ease`/`linear` in interactive use:** glide `(0.22,1,0.36,1)` ×113 · entrance `(0.22,0.9,0.26,1)` ×68 · swift in-out `(0.5,0,0.1,1)` ×44 · accelerate `(0.4,0,1,1)` ×5 — plus named tokens (`--ease-entrance`, `--ease-gh-glide`) at the stylesheet level.
- Transition properties are scoped lists (transform / colors / opacity+transform) — the two remaining `transition-all` sets are enumerated in the stack (UP-05, AFU).
- **Verdict: this is a composed motion system.** Uniform-300ms-template is the tell this lens hunts; the estate passes at census level, emphatically.

## Choreography

- **Entrances stagger** (delay ladder 80/160/240/320/400ms) — no simultaneous pop-in; scene-level reveals at 1.2s entrance bezier, element-level at 900ms.
- **Scroll:** the hero runs on **CSS scroll-driven animations** (`animation-timeline: scroll()` — hero-parallax/fade/bg-drift) — scrubbed by the reader's own thumb, interruptible by construction; modern craft, rare in portfolios. The film is GSAP scroll-scrub (equally reader-driven). Route changes ride root view-transitions (the R4 enfilade).
- **The arrival (load):** the film's mist-lift resolves over ~2.5–3s with the SCROLL cue present from frame one. Inside the intro-lock (protected); its desktop first-frame question is banked for Sky (Lens 1).
- Interruptibility: all CSS-transition surfaces are inherently interruptible; no scroll-capture/snap physics anywhere (the gravity-not-magnetism rider holds).

## Reduced motion — judged as its own designed artifact

- **15 RM-conditional blocks**, majority `no-preference`-gated *additions* (motion is layered onto a resting design, not stripped from a moving one) + a `(pointer:coarse) and (no-preference)` press layer. The RM register even *speaks*: the RM-only bracket line (T9) is live — a sentence only reduced-motion readers receive. That is luxury RM design.
- **The one live RM blemish is known and cured unmerged:** on live, the intro cue + identity mark never retire for RM readers (the guard inverted; `bae49a6` fixes, AFU). Post-merge, RM retirement is 8/8.

## Lens-6 outputs

- **No new ledger item.** The motion system is the estate's strongest measured lens; the ledger's job is to not break it. PROTECT for all items: duration scale + named easings + stagger ladder + RM contract (6-layer).
- AFU observed: UP-05 enumeration · RM retirement fix (`bae49a6`).
- Device rows stand (D19 tap feel · D20 OLED band turn · D22 chevron · D23–25 WebKit family).
