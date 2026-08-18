'use client';

import { useEffect, useRef } from 'react';

import type { ShowcaseMatte, ThemedVariant } from '@/components/ProductReveal';
import { cn } from '@/lib/cn';

/**
 * ThemedShowcase — a project image that matches the ACTIVE site theme and
 * changes with it (showcase/theme-sync).
 *
 * MECHANISM — CSS-gated dual layers, deliberately NOT a resolvedTheme swap:
 * ThemeToggle flips `html.dark` SYNCHRONOUSLY inside its startViewTransition
 * callback while paint is suspended (ThemeToggle.tsx:80-91), so only a pure
 * CSS gate keyed on that class swaps INSIDE the snapshot — the showcase rides
 * the site's own 420ms `--dur-transition` dissolve: one crossfade, whole page,
 * zero parallel animation system. A React-state src swap would be captured in
 * the OLD snapshot and pop after the dissolve. The `.ts-layer` CSS carries no
 * transition/animation of its own, ever — reduced-motion inherits the site's
 * 0.01ms view-transition guard and gets an instant cut for free.
 *
 * WEIGHT — the inactive twin loads LAZILY:
 * both <img>s are `loading="lazy"`; the CSS-hidden layer has no box, so the
 * browser never fetches it. For in-viewport showcases the twin is ARMED
 * (flipped to eager at low fetchpriority + decoded) on idle after first
 * intersection, or immediately on toggle INTENT (hovering/focusing the theme
 * toggle dispatches `ts:theme-intent`). If the user out-runs the arm, each
 * layer's own theme-true inline LQIP (zero requests, always in the HTML) keeps
 * the dissolve flash-free while the twin sharpens on decode. Off-screen
 * showcases get no machinery at all — they swap plainly and lazy-load on
 * approach. Upfront transferred weight is unchanged; the twin is deferred
 * transfer and is counted in the train's weight arithmetic.
 *
 * A11y — `display`-gating removes the hidden layer from the accessibility
 * tree, so exactly one img/alt is exposed at any time (one scene, one
 * accessible name, both variants share the base alt).
 *
 * No-JS / first paint — both layers are full SSR markup; the gate is pure CSS,
 * so the correct variant shows from the first frame in every path (next-themes
 * stamps `html.dark` pre-hydration; no-JS visitors get light, which is the
 * base). MONO projects (`matte`) render one layer on an exhibit mat built from
 * site tokens (.ts-matte) — a photograph of a dark product on the light site
 * is designed and honest, never a fake recolor.
 */

export type ThemedShowcaseProps = {
  /** The light/base variant (paths from the capture factory's manifest). */
  light: ThemedVariant & { src: string };
  /** The dark twin. Absent + no matte → single-variant passthrough. */
  dark?: ThemedVariant;
  /** Mono-theme project: the single capture, matted. Names what the capture IS. */
  matte?: ShowcaseMatte;
  /** Shared accessible name for the scene (theme is not semantic). */
  alt: string;
  fit: 'cover' | 'contain';
  /** CSS object-position (focal crop) — shared by both variants. */
  position?: string;
  /** Above-fold hero: fetchpriority=high on the visible layer. Both layers stay
   *  `loading="lazy"` (the hidden twin must never double-fetch); the themed
   *  hero's early bytes come from ThemedHeroPreload's head link. */
  eager?: boolean;
  sizes?: string;
  className?: string;
};

/** How long after first intersection before the idle arm gives up waiting for
 *  a real idle slot (ms). */
const ARM_IDLE_TIMEOUT = 2000;

type VariantLayerProps = {
  variant: ThemedVariant & { src: string };
  theme: 'light' | 'dark';
  alt: string;
  fit: 'cover' | 'contain';
  position?: string;
  eager?: boolean;
  sizes?: string;
  imgRef?: React.Ref<HTMLImageElement>;
};

/** One theme's full <picture> stack — the StaticShot grammar (LQIP paint under
 *  avif/webp sources under the img) rebuilt for layered, ref-armed use. */
function VariantLayer({ variant, theme, alt, fit, position, eager, sizes, imgRef }: VariantLayerProps) {
  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain';
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={variant.src}
      alt={alt}
      width={1280}
      height={800}
      loading="lazy"
      decoding="async"
      {...(eager ? { fetchPriority: 'high' as const } : {})}
      style={position ? { objectPosition: position } : undefined}
      className={cn('absolute inset-0 h-full w-full', fitClass)}
    />
  );
  return (
    <div className={cn('ts-layer', theme === 'dark' ? 'ts-layer--dark' : 'ts-layer--light')}>
      {variant.lqip && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${variant.lqip}")`,
            backgroundSize: fit === 'cover' ? 'cover' : 'contain',
            backgroundPosition: position ?? 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      {variant.avif || variant.webp ? (
        <picture>
          {variant.avif && <source type="image/avif" srcSet={variant.avif} {...(sizes ? { sizes } : {})} />}
          {variant.webp && <source type="image/webp" srcSet={variant.webp} {...(sizes ? { sizes } : {})} />}
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  );
}

export function ThemedShowcase({
  light,
  dark,
  matte,
  alt,
  fit,
  position,
  eager = false,
  sizes,
  className,
}: ThemedShowcaseProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const lightImgRef = useRef<HTMLImageElement>(null);
  const darkImgRef = useRef<HTMLImageElement>(null);
  const armedRef = useRef(false);

  // The twin-arm pipeline (themed showcases only): IO → idle → eager+decode,
  // or immediately on `ts:theme-intent`. Idempotent; after one cycle both
  // variants are cached and every later toggle is free.
  useEffect(() => {
    if (!dark) return undefined;
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver !== 'function') return undefined;

    let intersecting = false;
    let idleHandle: number | null = null;

    const arm = () => {
      if (armedRef.current) return;
      const isDark = document.documentElement.classList.contains('dark');
      const twin = isDark ? lightImgRef.current : darkImgRef.current;
      if (!twin) return;
      armedRef.current = true;
      twin.setAttribute('fetchpriority', 'low');
      // Attribute (not IDL property): the attribute is what the loader reads,
      // and jsdom doesn't reflect the `loading` property back to it.
      twin.setAttribute('loading', 'eager'); // eager images load even while display:none
      const done = () => {
        twin.decode?.().catch(() => {});
        host.dataset.twin = 'ready';
      };
      if (twin.complete) done();
      else twin.addEventListener('load', done, { once: true });
    };

    const scheduleIdleArm = () => {
      if (armedRef.current || idleHandle !== null) return;
      const ric: typeof requestIdleCallback | undefined =
        typeof requestIdleCallback === 'function' ? requestIdleCallback : undefined;
      idleHandle = ric
        ? ric(() => arm(), { timeout: ARM_IDLE_TIMEOUT })
        : (setTimeout(arm, ARM_IDLE_TIMEOUT) as unknown as number);
    };

    const io = new IntersectionObserver(
      (entries) => {
        intersecting = entries.some((e) => e.isIntersecting);
        if (intersecting) scheduleIdleArm();
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(host);

    const onIntent = () => {
      if (intersecting) arm();
    };
    window.addEventListener('ts:theme-intent', onIntent);

    return () => {
      io.disconnect();
      window.removeEventListener('ts:theme-intent', onIntent);
      if (idleHandle !== null && typeof cancelIdleCallback === 'function') cancelIdleCallback(idleHandle);
    };
  }, [dark]);

  // MONO project: one layer on the token-built exhibit mat.
  if (matte) {
    return (
      <div
        ref={hostRef}
        data-themed-showcase="matte"
        data-matte={matte}
        className={cn('ts-matte absolute inset-0', className)}
      >
        <div className="ts-matte-well">
          <VariantLayer
            variant={light}
            theme="light"
            alt={alt}
            fit={fit}
            position={position}
            eager={eager}
            sizes={sizes}
          />
        </div>
      </div>
    );
  }

  // Themed pair (or single-variant passthrough when dark is absent).
  return (
    <div ref={hostRef} data-themed-showcase={dark ? 'themed' : 'single'} className={cn('absolute inset-0', className)}>
      <VariantLayer
        variant={light}
        theme="light"
        alt={alt}
        fit={fit}
        position={position}
        eager={eager}
        sizes={sizes}
        imgRef={lightImgRef}
      />
      {dark?.src && (
        <VariantLayer
          variant={{ ...dark, src: dark.src }}
          theme="dark"
          alt={alt}
          fit={fit}
          position={position}
          eager={eager}
          sizes={sizes}
          imgRef={darkImgRef}
        />
      )}
    </div>
  );
}
