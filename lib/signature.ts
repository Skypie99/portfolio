/**
 * signature.ts — the per-project golden-hour identity, shared (Show-the-work
 * 2026-06-04). Extracted from CardField so the liquid-glass caustic AND the new
 * ProductReveal placeholder/device frame read from ONE source of truth: each
 * product gets a signature warm hue + a device frame true to its medium.
 *
 * Hues are space-separated RGB triplets (so `rgb(var/<alpha>)`-style alpha
 * works at the call site). Behavior for CardField is identical to its previous
 * inline map — same values, same default.
 */

/** The device chrome a product rests in (ProductReveal hero/placeholder). */
export type DeviceFrameKind = 'phone' | 'window' | 'plate' | 'none';

/** Per-project signature hue (warm golden-hour family) for the caustic + world. */
export const SIGNATURE: Record<string, string> = {
  'flagstone': '224 150 90', // terracotta-amber
  'claude-corp': '206 134 78', // deep amber
  'dashboard': '190 146 102', // steel-amber — the navy-and-amber dashboard's quieter light
  'prompt-library': '236 186 118', // gold
  'ghost-code': '72 195 210', // phantom cyan
  'ghost': '72 195 210',
  'mutual-mesh': '202 142 114', // clay-rose
  'mutual': '202 142 114',
  // Certificate issuers — same warm family, distinct per issuer so the
  // credential cards read a touch different without leaving golden-hour.
  'anthropic': '214 132 88', // clay-terracotta
  'google': '236 186 118', // gold
  'university-of-michigan': '202 142 114', // clay-rose
  'deeplearning-ai': '206 134 78', // deep amber
};

/** Soft blue at the far corner — the refracted "prism" edge (a quiet whisper). */
export const BLUE = '150 188 214'; // soft sky-blue

/** The signature hue for a slug/category, defaulting to the warm house amber. */
export function signatureFor(slug: string): string {
  return SIGNATURE[slug] ?? SIGNATURE['flagstone'];
}

/**
 * The device frame a product reads true in — mobile apps get a phone, web
 * tools / CLIs a window, the arcade game a clean plate. Accepts both the full
 * deliverable slug and the short CaseStudyCard category ('ghost', 'mutual').
 */
const FRAME_FOR_SLUG: Record<string, DeviceFrameKind> = {
  'flagstone': 'phone',
  'mutual-mesh': 'phone',
  'mutual': 'phone',
  'prompt-library': 'window',
  'claude-corp': 'window',
  'dashboard': 'window',
  'ghost-code': 'plate',
  'ghost': 'plate',
};

export function frameForSlug(slug: string): DeviceFrameKind {
  return FRAME_FOR_SLUG[slug] ?? 'window';
}
