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
        cream:          'rgb(var(--rgb-canvas) / <alpha-value>)',
        'warm-white':   'rgb(var(--rgb-canvas-alt) / <alpha-value>)',
        blush:          'rgb(var(--rgb-surface) / <alpha-value>)',
        'peach-cream':  'rgb(var(--rgb-surface-warm) / <alpha-value>)',
        amber:          'rgb(var(--rgb-accent-soft) / <alpha-value>)',
        terracotta:     'rgb(var(--rgb-accent) / <alpha-value>)',
        umber:          'rgb(var(--rgb-accent-ink) / <alpha-value>)',
        stone:          'rgb(var(--rgb-line) / <alpha-value>)',
        'stone-strong': 'rgb(var(--rgb-line-strong) / <alpha-value>)',
        pebble:         'rgb(var(--rgb-pebble) / <alpha-value>)',
        'sage-text':    'rgb(var(--rgb-ink-meta) / <alpha-value>)',
        charcoal:       'rgb(var(--rgb-ink-muted) / <alpha-value>)',
        'near-black':   'rgb(var(--rgb-ink) / <alpha-value>)',
        'wa-teal-deep': 'rgb(var(--rgb-cool-deep) / <alpha-value>)',
        'wa-teal':      'rgb(var(--rgb-cool) / <alpha-value>)',
        'wa-teal-mid':  'rgb(var(--rgb-cool-mid) / <alpha-value>)',
        'wa-teal-soft': 'rgb(var(--rgb-cool-soft) / <alpha-value>)',
        'wa-teal-pale': 'rgb(var(--rgb-panel-cool) / <alpha-value>)',
        'wa-teal-wash': 'rgb(var(--rgb-wash-cool) / <alpha-value>)',
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
        // Per Dani §2.2
        'display-l': ['3.25rem', { lineHeight: '1.15' }], // 52px
        'display-m': ['2.25rem', { lineHeight: '1.15' }], // 36px
        'display-s': ['1.1875rem', { lineHeight: '1.2' }], // 19px
        body: ['1rem', { lineHeight: '1.65' }], // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.6' }], // 14px
        label: ['0.75rem', { lineHeight: '1.4' }], // 12px
        meta: ['0.6875rem', { lineHeight: '1.4' }], // 11px
      },
      letterSpacing: {
        body: '0.0156em', // +0.25px
        label: '0.125em', // +2px
      },
      spacing: {
        // Dani §1.1 — overlays Tailwind's defaults where they differ
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.5rem',
        '6': '2rem',
        '8': '3rem',
        '10': '4rem',
        '12': '6rem',
        '16': '8rem',
        '20': '12.5rem',
        gutter: '2rem',
        sidebar: '280px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        pill: '9999px',
      },
      maxWidth: {
        content: '1120px',
      },
      transitionDuration: {
        fast: '180ms',
        base: '280ms',
        slow: '520ms',
        reveal: '900ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(35,36,32,0.04), 0 4px 12px rgba(35,36,32,0.03)',
      },
    },
  },
  plugins: [],
};

export default config;
