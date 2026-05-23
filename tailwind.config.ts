import type { Config } from 'tailwindcss';

/**
 * Wires Dani's revised PROJECT_DESIGN.md §1.1 tokens into Tailwind.
 * Every color, font, size, spacing, radius, and motion value here mirrors
 * the CSS variables declared in app/globals.css. Keep the two in sync.
 *
 * Alex BLK-1/2/3 fixes baked in:
 *  - sage-text #5C5D54 for text uses; raw sage #717267 decorative only
 *  - stone-strong #888879 for interactive borders; stone #DCDCD6 decorative only
 *  - accent-text (umber #7F4323) for inline links + 19px numerals
 *  - terracotta #B35F32 for graphics/CTAs/≥24px display only
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Foundations (backgrounds)
        cream: '#FAF9F5',
        'warm-white': '#F0F0EA',
        blush: '#FCF3ED',
        'peach-cream': '#FDE9D7',

        // Terracotta accent scale
        sand: '#FBCFAC',
        amber: '#E2976E',
        terracotta: '#B35F32',
        umber: '#7F4323',
        bark: '#48230F',

        // Neutrals
        stone: '#DCDCD6',
        'stone-strong': '#888879',
        pebble: '#B8B8AA',
        sage: '#717267',
        'sage-text': '#5C5D54',
        charcoal: '#484A43',
        'near-black': '#232420',

        // Semantic aliases (prefer these in components)
        'text-meta': '#5C5D54',
        'border-decorative': '#DCDCD6',
        'border-interactive': '#888879',
        'accent-primary': '#B35F32',
        'accent-text': '#7F4323',
        link: '#7F4323',
        'link-hover': '#B35F32',
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
