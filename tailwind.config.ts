import type { Config } from 'tailwindcss';

/**
 * Wires Dani's design tokens into Tailwind. Colours mirror app/globals.css:
 * mode-aware semantic tokens are backed by `--rgb-*` triplets (they flip in
 * dark mode AND support opacity modifiers like border-line/70), raw "paint"
 * hexes are fixed. Keep the two files in sync.
 *
 * Token guidance (golden-hour desert palette, 2026-06-02):
 *  - text:    ink / ink-muted / ink-meta   (never raw paint for body copy)
 *  - links:   cool (pine, ≥4.5:1) or accent-ink (warm, ≥4.5:1)
 *  - chrome:  accent (terracotta) for CTAs / graphics / ≥large text + UI
 *  - surface: canvas / canvas-alt / surface ; borders: line / line-strong
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  // class-strategy dark mode — next-themes toggles `.dark` on <html>.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Mode-aware semantic tokens — PREFER THESE ───────────────
        // Backed by --rgb-* triplets in globals.css: flip under html.dark
        // and support opacity modifiers (e.g. border-line/70, bg-accent/10).
        canvas:         'rgb(var(--rgb-canvas) / <alpha-value>)',
        'canvas-alt':   'rgb(var(--rgb-canvas-alt) / <alpha-value>)',
        surface:        'rgb(var(--rgb-surface) / <alpha-value>)',
        'surface-warm': 'rgb(var(--rgb-surface-warm) / <alpha-value>)',
        'surface-mid':  'rgb(var(--rgb-surface-mid) / <alpha-value>)',
        'panel-cool':   'rgb(var(--rgb-panel-cool) / <alpha-value>)',
        'wash-cool':    'rgb(var(--rgb-wash-cool) / <alpha-value>)',
        ink:            'rgb(var(--rgb-ink) / <alpha-value>)',
        'ink-muted':    'rgb(var(--rgb-ink-muted) / <alpha-value>)',
        'ink-meta':     'rgb(var(--rgb-ink-meta) / <alpha-value>)',
        line:           'rgb(var(--rgb-line) / <alpha-value>)',
        'line-strong':  'rgb(var(--rgb-line-strong) / <alpha-value>)',
        accent:         'rgb(var(--rgb-accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--rgb-accent-hover) / <alpha-value>)',
        'accent-ink':   'rgb(var(--rgb-accent-ink) / <alpha-value>)',
        cool:           'rgb(var(--rgb-cool) / <alpha-value>)',
        'cool-deep':    'rgb(var(--rgb-cool-deep) / <alpha-value>)',
        'cool-mid':     'rgb(var(--rgb-cool-mid) / <alpha-value>)',
        'cool-soft':    'rgb(var(--rgb-cool-soft) / <alpha-value>)',
        'gold-glow':    'rgb(var(--rgb-gold) / <alpha-value>)',
        foil:           'rgb(var(--rgb-foil) / <alpha-value>)',
        rose:           'rgb(var(--rgb-rose) / <alpha-value>)',
        'rose-pale':    'rgb(var(--rgb-rose-pale) / <alpha-value>)',
        rail:           'rgb(var(--rgb-rail) / <alpha-value>)',
        earth:          'rgb(var(--rgb-earth) / <alpha-value>)',
        'earth-deep':   'rgb(var(--rgb-earth-deep) / <alpha-value>)',

        // ── Raw brand paint — FIXED hue, does NOT flip ──────────────
        // Decorative fills / tags / gradients only; never body text.
        pine: '#427A6F', emerald: '#4DA978', lagoon: '#57AAAE',
        seafoam: '#89B5A8', sage: '#AEBA94', bone: '#CCCFBE',
        sand: '#C4AD81', gold: '#BF9B5D', caramel: '#A97A4C',
        'rock-lit': '#B25128', 'rock-deep': '#9D2D05', twilight: '#A4A0B2',
        bark: '#5E2F18',

        // ── Legacy names → roles (existing classes flip for free) ───
        // Retire in a later semantic-rename cleanup once components migrate.
        //
        // UP-06 / P10 (2026-08-06) migrated the call sites of FOUR families to
        // the canonical names — charcoal, cream, warm-white and wa-teal*. Their
        // entries below STAY, and deliberately: the showcase-owned files still
        // carry skipped call sites (app/work/[slug]/page.tsx x3 text-charcoal),
        // so deleting these keys would emit no rule and silently drop the paint.
        // Retire each one only after the showcase train merges and those sites
        // are migrated. The other legacy families here were NOT in P10's scope
        // and are still live vocabulary — see DECISIONS §P `P10-CENSUS`.
        //
        // ⚠ TWO OF THE wa-teal ROWS DO NOT FOLLOW THE `wa-teal-* → cool-*`
        // PATTERN. `cool-pale` and `cool-wash` are registered nowhere, so
        // following the pattern emits nothing and the colour vanishes with no
        // type or test failure. The mapping is per-row, below, not a rule.
        cream:          'rgb(var(--rgb-canvas) / <alpha-value>)',      // legacy alias — canonical: canvas; call sites migrated by P10; retire after showcase merge
        'warm-white':   'rgb(var(--rgb-canvas-alt) / <alpha-value>)',  // legacy alias — canonical: canvas-alt; call sites migrated by P10; retire after showcase merge
        blush:          'rgb(var(--rgb-surface) / <alpha-value>)',
        'peach-cream':  'rgb(var(--rgb-surface-warm) / <alpha-value>)',
        amber:          'rgb(var(--rgb-accent-soft) / <alpha-value>)',
        terracotta:     'rgb(var(--rgb-accent) / <alpha-value>)',
        umber:          'rgb(var(--rgb-accent-ink) / <alpha-value>)',
        stone:          'rgb(var(--rgb-line) / <alpha-value>)',
        'stone-strong': 'rgb(var(--rgb-line-strong) / <alpha-value>)',
        pebble:         'rgb(var(--rgb-pebble) / <alpha-value>)',
        'sage-text':    'rgb(var(--rgb-ink-meta) / <alpha-value>)',
        charcoal:       'rgb(var(--rgb-ink-muted) / <alpha-value>)',  // legacy alias — canonical: ink-muted; call sites migrated by P10; retire after showcase merge
        'near-black':   'rgb(var(--rgb-ink) / <alpha-value>)',
        'wa-teal-deep': 'rgb(var(--rgb-cool-deep) / <alpha-value>)',  // legacy alias — canonical: cool-deep; call sites migrated by P10; retire after showcase merge
        'wa-teal':      'rgb(var(--rgb-cool) / <alpha-value>)',  // legacy alias — canonical: cool; call sites migrated by P10; retire after showcase merge
        'wa-teal-mid':  'rgb(var(--rgb-cool-mid) / <alpha-value>)',  // legacy alias — canonical: cool-mid; call sites migrated by P10; retire after showcase merge
        'wa-teal-soft': 'rgb(var(--rgb-cool-soft) / <alpha-value>)',  // legacy alias — canonical: cool-soft; call sites migrated by P10; retire after showcase merge
        'wa-teal-pale': 'rgb(var(--rgb-panel-cool) / <alpha-value>)',  // legacy alias — canonical: panel-cool  ⚠ NOT cool-pale; call sites migrated by P10; retire after showcase merge
        'wa-teal-wash': 'rgb(var(--rgb-wash-cool) / <alpha-value>)',  // legacy alias — canonical: wash-cool  ⚠ NOT cool-wash; call sites migrated by P10; retire after showcase merge
        'wa-rose':      'rgb(var(--rgb-rose) / <alpha-value>)',
        'wa-rose-mid':  'rgb(var(--rgb-rose) / <alpha-value>)',
        'wa-rose-soft': 'rgb(var(--rgb-cool-soft) / <alpha-value>)',
        'wa-rose-pale': 'rgb(var(--rgb-rose-pale) / <alpha-value>)',
        'text-meta':    'rgb(var(--rgb-ink-meta) / <alpha-value>)',
        'border-decorative':  'rgb(var(--rgb-line) / <alpha-value>)',
        'border-interactive': 'rgb(var(--rgb-line-strong) / <alpha-value>)',
        'accent-primary':     'rgb(var(--rgb-accent) / <alpha-value>)',
        'accent-text':        'rgb(var(--rgb-accent-ink) / <alpha-value>)',
        link:                 'rgb(var(--rgb-accent-ink) / <alpha-value>)',
        'link-hover':         'rgb(var(--rgb-accent-hover) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Per Dani §2.2 (display-l / display-m retired in Phase 7 — zero usages; display-s kept 7× active)
        'display-s': ['1.1875rem', { lineHeight: '1.2' }], // 19px
        body: ['1rem', { lineHeight: '1.65' }], // 16px
        prose: ['1.0625rem', { lineHeight: '1.65' }], // 17px — comfortable long-form reading size
        'body-sm': ['0.875rem', { lineHeight: '1.6' }], // 14px
        label: ['0.75rem', { lineHeight: '1.4' }], // 12px
        meta: ['0.6875rem', { lineHeight: '1.4' }], // 11px

        // ── Overhaul 2026-06-03 — modular scale. Sizes are var()-backed by
        //    --fs-* in globals.css (single source of truth; a Vitest parity
        //    test guards it). Registered in lib/cn.ts CUSTOM_FONT_SIZES.
        'step-1': ['var(--fs-step-1)', { lineHeight: '1.55' }], // 20px lead
        'step-2': ['var(--fs-step-2)', { lineHeight: '1.35' }], // 24px sub-head
        // Phase 5 — tight optical kerning on the large serif tiers (the
        // "expensive" display tracking carries its own letter-spacing inline).
        'step-3': ['var(--fs-step-3)', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 31px card title
        'step-4': ['var(--fs-step-4)', { lineHeight: '1.15', letterSpacing: '-0.015em' }], // 39px section head
        'step-5': ['var(--fs-step-5)', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // 49px page title
        // §7.4 TY-8 — display line-height folded 1.1 → 1.05 (every non-test
        // text-display call site overrode to leading-[1.05]; those are removed).
        display: ['var(--fs-display)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        hero: ['var(--fs-hero)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],

        // §7.4 TY-8 — promoted display tokens (var-backed by --fs-* in globals.css;
        // line-height + tracking folded in from the former inline styles).
        // Registered in lib/cn.ts CUSTOM_FONT_SIZES + guarded by token-parity.test.ts.
        'card-numeral': ['var(--fs-card-numeral)', { letterSpacing: 'var(--ls-display)' }],
        'card-title': ['var(--fs-card-title)', { lineHeight: '1.05', letterSpacing: 'var(--ls-card-title)' }],
        'stat-figure': ['var(--fs-stat-figure)', { lineHeight: '1', letterSpacing: 'var(--ls-stat)' }],
        'nav-item': ['var(--fs-nav-item)', { lineHeight: '1.05', letterSpacing: 'var(--ls-display)' }],
        'prose-h2': ['var(--fs-prose-h2)', { lineHeight: '1.1', letterSpacing: 'var(--ls-heading)' }],
        'prose-h3': ['var(--fs-prose-h3)', { lineHeight: '1.15', letterSpacing: 'var(--ls-heading)' }],
        'case-h2': ['var(--fs-case-h2)', { lineHeight: '1.1', letterSpacing: 'var(--ls-heading)' }],
        'case-h3': ['var(--fs-case-h3)', { lineHeight: '1.15', letterSpacing: 'var(--ls-heading)' }],
        'blog-card-title': ['var(--fs-blog-card-title)', { lineHeight: '1.15', letterSpacing: 'var(--ls-heading)' }],
      },
      letterSpacing: {
        body: '0.0156em', // +0.25px
        label: '0.125em', // +2px
      },
      spacing: {
        // §7.4 — honest namespace: numeral × 0.25rem = rendered size (the natural
        // Tailwind ramp). The inverted overrides (5→1.5rem … 20→12.5rem) are gone, so
        // the stock defaults apply (5=1.25 … 16=4 … 24=6 … 32=8rem). Only the two
        // non-default honest keys the call sites need are declared here.
        // Guarded by lib/__tests__/token-parity.test.ts (no inverted literals; monotonic).
        '18': '4.5rem', // 72px  = 18 × 0.25rem
        '50': '12.5rem', // 200px = 50 × 0.25rem
        gutter: '2rem',
        sidebar: '280px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        card: '22px', // liquid-glass card corner (ProjectCard/CaseStudyCard/CertCard)
        pill: '9999px',
      },
      maxWidth: {
        content: '1120px',
        measure: 'var(--measure)',
        'measure-wide': 'var(--measure-wide)',
        'measure-lead': '640px', // lead/intro paragraph width (was a hardcoded max-w-[640px])
      },
      transitionDuration: {
        fast: '180ms',
        base: '280ms',
        slow: '520ms',
        reveal: '900ms',
        // Motion-polish 2026-06-03 — scene tier (var-backed; globals.css)
        transition: 'var(--dur-transition)', // route-change crossfade
        scene: 'var(--dur-scene)', // large section reveal
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
        // Overhaul 2026-06-03 — entrance/exit/snap (var-backed; globals.css)
        entrance: 'var(--ease-entrance)',
        exit: 'var(--ease-exit)',
        snap: 'var(--ease-snap)',
        // Motion-polish 2026-06-03 — golden-hour "camera" easings (globals.css)
        'gh-glide': 'var(--ease-gh-glide)',
        'gh-settle': 'var(--ease-gh-settle)',
        'gh-recede': 'var(--ease-gh-recede)',
        'gh-arrive': 'var(--ease-gh-arrive)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(35,36,32,0.04), 0 4px 12px rgba(35,36,32,0.03)',
        // Overhaul 2026-06-03 — layered warm ramp (var-backed; flips dark
        // via the html.dark override in globals.css). Overrides Tailwind's
        // unused core sm/md/lg/xl with our warm system.
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      borderWidth: {
        // Overhaul 2026-06-03 — hairline divider (decorative only).
        hairline: '0.5px',
      },
    },
  },
  plugins: [],
};

export default config;
