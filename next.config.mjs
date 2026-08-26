/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages (per Rory's DEPLOY_PLAN.md)
  output: 'export',

  // K7 (THE ROOM Phase J, 2026-08-26) — pin the workspace root to THIS repo.
  // A stray ~/package-lock.json + ~/node_modules (dated 2026-05-28, three
  // months before this program and nothing to do with it) made Next infer the
  // HOME DIRECTORY as the workspace root and print a warning on every build.
  // Proven not to be this program's doing before silencing it rather than
  // after: `git diff 52bd0ef..HEAD -- next.config.mjs` was empty, and the
  // program's only package.json change was `+ axe-core` (H3). The stray files
  // live outside this repo and are not ours to delete; this is the one-line
  // fix Next's own warning recommends.
  outputFileTracingRoot: import.meta.dirname,

  // GH Pages can't run the Image Optimization API; ship raw <img> tags
  images: { unoptimized: true },

  // Directory-style URLs (so GH Pages serves /work/ via /work/index.html)
  trailingSlash: true,

  reactStrictMode: true,

  // NOTE: headers() is defined here for documentation, but for `output: 'export'`
  // these are NOT applied at runtime — GitHub Pages serves static files only.
  // Steve: production headers (CSP, Permissions-Policy, etc.) must be set at the
  // hosting layer (CDN / GH Pages custom 404 won't add headers either). When/if
  // we migrate off GH Pages, this block will start taking effect automatically.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // MIME type sniffing prevention
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Clickjacking defense. X-Frame-Options is the legacy header; CSP
          // frame-ancestors is its modern replacement, and THIS block is its only
          // possible home — the meta-delivered CSP in app/layout.tsx cannot carry
          // it (the spec drops the directive in <meta> delivery, and browsers log
          // an error for it on every page view). UP-01.
          // Keep BOTH policies: this single-directive header is ADDITIVE to
          // layout.tsx's meta policy, never a replacement — if this block ever
          // starts applying, do not delete the meta CSP as "redundant".
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },

          // Referrer privacy (consistent with meta tag in layout.tsx)
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // XSS filter bypass prevention (legacy, modern CSP preferred)
          { key: 'X-XSS-Protection', value: '1; mode=block' },

          // Permissions Policy (previously Feature-Policy) — disable dangerous APIs
          // This portfolio doesn't use any of these features, so disable all
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'geolocation=()',
              'gyroscope=()',
              'magnetometer=()',
              'microphone=()',
              'payment=()',
              'usb=()',
              'accelerometer=()',
              'ambient-light-sensor=()',
              'document-domain=()',
              'encrypted-media=()',
              'fullscreen=()',
              'picture-in-picture=()',
              'sync-xhr=()',
              'vr=()',
              'xr-spatial-tracking=()',
            ].join(', '),
          },

          // Strict Transport Security (HSTS) — only if deployed on HTTPS
          // GH Pages uses HTTPS, so this is safe. Upgrade insecure requests.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },

          // Cross-Origin policies
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
