import { cn } from '@/lib/cn';

/** Per-project warm hue for the ember glow — the golden-hour colour, on dark. */
const HUE: Record<string, string> = {
  'accessmap': '200 104 58', // terracotta
  'claude-corp': '188 120 62', // amber
  'prompt-library': '203 164 94', // gold
  'pacman-code-trainer': '190 86 48', // rust
  'pacman': '190 86 48',
  'mutual-mesh': '184 114 94', // clay-rose
  'mutual': '184 114 94',
};

/** Site film-grain (matches body::after) — crafted, photographic texture. */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)'/%3E%3C/svg%3E\")";

type CardFieldProps = {
  slug: string;
  className?: string;
};

/**
 * CardField — the warm golden-hour "ember" glow for the sleek-dark cards.
 * A soft, moody radial of the project's hue rising from the top (the colour Sky
 * loves, kept as atmosphere on the dark glass) + a faint cream crest + grain.
 * Decorative, absolute; the card content sits above it.
 */
export function CardField({ slug, className }: CardFieldProps) {
  const hue = HUE[slug] ?? HUE['accessmap'];
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `radial-gradient(96% 62% at 50% -10%, rgb(${hue} / 0.4), transparent 62%)`,
            `radial-gradient(70% 44% at 76% 2%, rgb(255 226 184 / 0.13), transparent 60%)`,
          ].join(','),
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.10] mix-blend-soft-light"
        style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }}
      />
    </div>
  );
}
