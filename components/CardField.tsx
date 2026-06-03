import { cn } from '@/lib/cn';

/**
 * Per-project warm STONE palette (sun-baked cards). A refined, gallery-smooth
 * clay/sandstone — all in the desert family. hi = sun-lit top, mid = body,
 * lo = the shadowed base (deep umber so cream ink/title clears WCAG AA there),
 * vein = a faint mineral mottle.
 */
const STONE: Record<string, { hi: string; mid: string; lo: string; vein: string }> = {
  'accessmap': { hi: '201 141 95', mid: '164 97 59', lo: '38 22 12', vein: '120 64 36' }, // terracotta
  'claude-corp': { hi: '193 145 86', mid: '151 103 53', lo: '36 24 12', vein: '116 78 40' }, // deep ochre
  'prompt-library': { hi: '209 171 113', mid: '173 132 80', lo: '40 30 16', vein: '134 98 54' }, // pale sandstone
  'pacman-code-trainer': { hi: '190 118 76', mid: '150 80 46', lo: '36 20 11', vein: '120 56 30' }, // rust
  'pacman': { hi: '190 118 76', mid: '150 80 46', lo: '36 20 11', vein: '120 56 30' },
  'mutual-mesh': { hi: '192 140 118', mid: '153 103 85', lo: '37 24 19', vein: '120 80 64' }, // clay-rose
  'mutual': { hi: '192 140 118', mid: '153 103 85', lo: '37 24 19', vein: '120 80 64' },
};

/** Site film-grain (matches body::after) — the stone's tooth. */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)'/%3E%3C/svg%3E\")";

type CardFieldProps = {
  slug: string;
  className?: string;
};

/**
 * CardField — the sun-baked stone slab (the whole card's surface). A refined,
 * gallery-smooth clay tablet: lit at the top, deepening into shadow at the base
 * where the inscription sits. All layers are static and baked once — EXCEPT the
 * warm "sheen" which is the moving sun (positioned by --mx/--my, gated on
 * --hover, both set by useSpotlight on the card root). Decorative; the carved
 * content sits above it (z-10).
 */
export function CardField({ slug, className }: CardFieldProps) {
  const s = STONE[slug] ?? STONE['accessmap'];
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* Lithology — sun-lit top → deep shadowed base. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(177deg, rgb(${s.hi}) 0%, rgb(${s.mid}) 30%, rgb(${s.mid}) 46%, rgb(${s.lo}) 82%, rgb(${s.lo}) 100%)`,
        }}
      />
      {/* Inscription shadow — guarantees the lower stone is deep (AA for ink/title). */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to top, rgb(${s.lo}) 6%, rgb(${s.lo} / 0.62) 36%, transparent 62%)`,
        }}
      />
      {/* Minimal mineral mottling — refined, barely there. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(120% 80% at 24% 16%, rgb(${s.vein} / 0.04), transparent 60%), radial-gradient(90% 70% at 82% 38%, rgb(18 10 4 / 0.04), transparent 55%)`,
        }}
      />
      {/* Static raking key-light (the resting sun, upper-left) + base occlusion. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(140% 110% at 16% -12%, rgb(255 234 196 / 0.26), transparent 46%), radial-gradient(120% 80% at 50% 122%, rgb(18 10 4 / 0.30), transparent 60%)`,
        }}
      />
      {/* Moving sun — a warm sheen at the cursor, gated on hover. The only moving layer. */}
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          backgroundImage: `radial-gradient(58% 70% at var(--mx, 18%) var(--my, 6%), rgb(255 236 198 / calc(0.42 * var(--hover, 0))), transparent 62%)`,
        }}
      />
      {/* Fine grain — the stone's tooth. */}
      <div
        className="absolute inset-0 opacity-[0.09] mix-blend-soft-light"
        style={{ backgroundImage: NOISE, backgroundSize: '170px 170px' }}
      />
      {/* Chamfered stone bevel — the slab is a physical object. */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            'inset 1px 1px 0 0 rgb(255 244 224 / 0.18), inset -1px -2px 7px 0 rgb(18 10 4 / 0.30), inset 0 0 0 1px rgb(18 10 4 / 0.10)',
        }}
      />
    </div>
  );
}
