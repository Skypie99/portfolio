import { ImageResponse } from 'next/og';

// Required for `output: 'export'` — tells Next this route is pre-renderable
// without a running server, so the PNG is emitted at build time.
export const dynamic = 'force-static';

/**
 * Static OG card — desert golden-hour brand.
 *
 * 1200×630 PNG emitted at build time via next/og + satori.
 * Uses inline JSX (no external font fetch) to stay robust under static export.
 * Palette: canvas #FAF8F1, terracotta #B35F40, sand #C2A878, ink #202C2C.
 *
 * Next auto-wires this as the opengraph-image for the root route; we also
 * update layout.tsx metadata.openGraph.images to point at the generated path.
 */

export const alt = 'Sky Halisky — AI developer · accessible, privacy-first tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: 'linear-gradient(160deg, #FAF8F1 0%, #F4ECDD 45%, #EDD9C0 100%)',
          padding: '0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Horizon glow — warm amber band near the bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 260,
            background:
              'linear-gradient(180deg, transparent 0%, rgba(179,95,64,0.12) 60%, rgba(179,95,64,0.22) 100%)',
          }}
        />

        {/* Sun motif — terracotta circle echoing app/icon.svg */}
        <div
          style={{
            position: 'absolute',
            top: 72,
            right: 120,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: '#B35F40',
            opacity: 0.82,
          }}
        />
        {/* Horizon lines — thin strokes below the sun, matching icon.svg */}
        <div
          style={{
            position: 'absolute',
            top: 270,
            right: 56,
            width: 300,
            height: 2,
            borderRadius: 2,
            background: '#A35636',
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 284,
            right: 80,
            width: 230,
            height: 1.5,
            borderRadius: 2,
            background: '#C2A878',
            opacity: 0.55,
          }}
        />

        {/* Left decorative accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 80,
            bottom: 80,
            width: 3,
            borderRadius: 2,
            background: '#B35F40',
            opacity: 0.7,
          }}
        />

        {/* Main text block */}
        <div
          style={{
            position: 'absolute',
            left: 112,
            bottom: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxWidth: 740,
          }}
        >
          {/* Eyebrow label */}
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#B35F40',
              display: 'flex',
            }}
          >
            SKYPISTUDIO.COM
          </div>

          {/* Name */}
          <div
            style={{
              fontFamily: 'serif',
              fontSize: 88,
              fontWeight: 300,
              lineHeight: 1.0,
              color: '#202C2C',
              letterSpacing: '-0.02em',
              display: 'flex',
            }}
          >
            Sky Halisky
          </div>

          {/* Tagline */}
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 26,
              fontWeight: 300,
              color: '#3D4F4F',
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
              display: 'flex',
            }}
          >
            AI developer · accessible, privacy-first tools
          </div>
        </div>

        {/* Bottom-right: domain / branding badge */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            bottom: 52,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* Mini sun badge */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#B35F40',
              opacity: 0.75,
              display: 'flex',
            }}
          />
          <span
            style={{
              fontFamily: 'sans-serif',
              fontSize: 17,
              fontWeight: 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#B35F40',
              opacity: 0.75,
              display: 'flex',
            }}
          >
            AI Portfolio
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
