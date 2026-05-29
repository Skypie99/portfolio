'use client';

/**
 * BadgeImage — client component wrapper for certificate badge <img>.
 *
 * Needs to be a client component because the onError event handler
 * (graceful degradation fallback) requires client-side JavaScript.
 *
 * When the real badge file is missing, onError swaps the src to the
 * shared placeholder instead of showing a broken-image icon.
 */

interface BadgeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function BadgeImage({ src, alt, className }: BadgeImageProps) {
  return (
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
}
