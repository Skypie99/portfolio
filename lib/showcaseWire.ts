/**
 * showcaseWire.ts — pure transforms from the capture factory's manifest
 * (content/showcase.manifest.json) to deliverables.json media patches.
 *
 * The manifest is NOT read at runtime — content/deliverables.json stays the
 * single zod-validated source the site builds from. This module is the bridge:
 * a wiring spec names which captured scene fills which schema field, and the
 * result is validated through DeliverableSchema at wire time, so an alt-law or
 * path-law violation fails HERE, not at the next build.
 */

import { DeliverableSchema, type Deliverable } from './schema';

type ManifestFile = { path: string; bytes: number };
type ManifestClip = {
  id: string;
  mp4?: ManifestFile | null;
  webm?: ManifestFile | null;
  posters?: ManifestFile[];
};
export type ManifestCapture = {
  project: string;
  scene: string;
  theme: 'light' | 'dark' | 'matte';
  viewport: string;
  altText?: string;
  flags?: string[];
  files?: { shipped?: (ManifestFile & { quality?: number })[]; lqip?: string };
  clip?: ManifestClip;
};
export type ShowcaseManifest = { captures: ManifestCapture[] };

export type SceneRef = {
  scene: string;
  viewport?: 'phone' | 'desktop';
  /** Overrides the manifest's draft alt (Sky's refinement wins). */
  alt?: string;
  caption?: string;
  focal?: string;
  chrome?: 'device' | 'float' | 'matte';
};

export type ClipRef = {
  clip: string;
  viewport?: 'phone';
  /** Required for the base video (the clip's accessible description). */
  alt: string;
};

const findStill = (m: ShowcaseManifest, project: string, ref: SceneRef, theme: string) =>
  m.captures.find(
    (c) =>
      c.project === project &&
      c.scene === ref.scene &&
      c.theme === theme &&
      c.viewport === (ref.viewport ?? 'phone') &&
      !c.clip,
  );

const shippedOf = (c: ManifestCapture, ext: string) =>
  c.files?.shipped?.find((f) => f.path.endsWith(ext))?.path;

const findClip = (m: ShowcaseManifest, project: string, id: string, theme: string) =>
  m.captures.find(
    (c) => c.project === project && c.clip?.id === id && c.theme === theme && c.clip?.mp4,
  );

function videoFrom(c: ManifestCapture, alt?: string) {
  const poster = c.clip?.posters?.find((p) => p.path.endsWith('.avif'))?.path ?? c.clip?.posters?.[0]?.path;
  if (!c.clip?.mp4 || !poster) return undefined;
  return {
    mp4: c.clip.mp4.path,
    ...(c.clip.webm ? { webm: c.clip.webm.path } : {}),
    poster,
    ...(alt ? { alt } : {}),
  };
}

/**
 * Build a themed ShotImageSchema-shaped object from the manifest.
 * Light = base (src is the WebP fallback, AVIF rides <source>); dark = twin.
 * A `matte`-theme capture yields a mono entry flagged with the project's kind.
 */
export function themedShot(
  m: ShowcaseManifest,
  project: string,
  ref: SceneRef,
  opts: { matte?: 'light-mono' | 'dark-mono'; video?: ClipRef; darkVideo?: boolean } = {},
) {
  const isMatte = Boolean(opts.matte);
  const light = findStill(m, project, ref, isMatte ? 'matte' : 'light');
  if (!light) throw new Error(`showcaseWire: no ${isMatte ? 'matte' : 'light'} capture for ${project}/${ref.scene}.${ref.viewport ?? 'phone'}`);
  const alt = ref.alt ?? light.altText;
  if (!alt) throw new Error(`showcaseWire: no alt for ${project}/${ref.scene}`);

  const base: Record<string, unknown> = {
    src: shippedOf(light, '.webp'),
    avif: shippedOf(light, '.avif'),
    webp: shippedOf(light, '.webp'),
    lqip: light.files?.lqip,
    alt,
    ...(ref.caption ? { caption: ref.caption } : {}),
    ...(ref.focal ? { focal: ref.focal } : {}),
    ...(ref.chrome ? { chrome: ref.chrome } : {}),
  };
  if (!base.src) throw new Error(`showcaseWire: ${project}/${ref.scene} has no shipped webp (MASTERS-ONLY?)`);

  if (opts.video) {
    const clip = findClip(m, project, opts.video.clip, isMatte ? 'matte' : 'light');
    if (clip) base.video = videoFrom(clip, opts.video.alt);
  }

  if (isMatte) {
    base.matte = opts.matte;
    return base;
  }

  const dark = findStill(m, project, ref, 'dark');
  if (!dark) throw new Error(`showcaseWire: no dark capture for ${project}/${ref.scene}.${ref.viewport ?? 'phone'}`);
  const darkEntry: Record<string, unknown> = {
    src: shippedOf(dark, '.webp'),
    avif: shippedOf(dark, '.avif'),
    webp: shippedOf(dark, '.webp'),
    lqip: dark.files?.lqip,
  };
  if (opts.video && opts.darkVideo) {
    const clip = findClip(m, project, opts.video.clip, 'dark');
    if (clip) darkEntry.video = videoFrom(clip);
  }
  base.dark = darkEntry;
  return base;
}

export type DeliverablePatch = {
  heroShot?: Record<string, unknown>;
  cardImage?: Record<string, unknown>;
  heroPlate?: Record<string, unknown>;
  shots?: Record<string, unknown>[];
  ogTheme?: 'light' | 'dark';
};

/** Apply per-slug patches to a deliverables array; every patched entry is
 *  re-validated through DeliverableSchema (alt law, path law, themed refines)
 *  so violations fail at wire time. Unpatched entries pass through untouched. */
export function applyShowcase(
  deliverables: unknown[],
  patches: Record<string, DeliverablePatch>,
): Deliverable[] {
  return deliverables.map((d) => {
    const entry = d as Record<string, unknown>;
    const patch = patches[String(entry.id)];
    if (!patch) return d as Deliverable;
    const merged = { ...entry, ...patch };
    const parsed = DeliverableSchema.safeParse(merged);
    if (!parsed.success) {
      throw new Error(
        `showcaseWire: patched "${entry.id}" fails DeliverableSchema:\n${parsed.error.issues
          .map((i) => `  ${i.path.join('.')}: ${i.message}`)
          .join('\n')}`,
      );
    }
    return parsed.data;
  });
}
