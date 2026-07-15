'use client';

/**
 * BadgeImage — client component wrapper for certificate badge <img>.
 *
 * Needs to be a client component because the onError event handler
 * (graceful degradation fallback) requires client-side JavaScript.
 *
 * When the real badge file is missing, onError swaps the src to the
 * shared placeholder instead of showing a broken-image icon.
 *
 * C-02: when optional avif/webp siblings are supplied (the six hand-drawn
 * Anthropic badges), the <img> is wrapped in a <picture> so modern engines
 * fetch the ~5 KB AVIF instead of the ~25 KB PNG — the PNG stays the universal
 * fallback. Badges without siblings (the vendor screenshots) render the plain
 * <img> unchanged, so their onError degradation is byte-for-byte as before.
 */

interface BadgeImageProps {
  src: string;
  alt: string;
  avif?: string;
  webp?: string;
  className?: string;
}

export default function BadgeImage({ src, alt, avif, webp, className }: BadgeImageProps) {
  const img = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      width={400}
      height={400}
      className={className}
      loading="lazy"
      onError={(e) => {
        // Graceful degradation: if the real badge file is missing,
        // show a shared placeholder instead of a broken-image icon.
        // onError never fires once Sky adds the real badge to
        // public/images/certificates/<slug>/badge.png.
        (e.target as HTMLImageElement).src =
          '/images/certificates/placeholder.png';
      }}
    />
  );

  if (!avif && !webp) return img;

  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} />}
      {webp && <source type="image/webp" srcSet={webp} />}
      {img}
    </picture>
  );
}
