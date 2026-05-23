/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages (per Rory's DEPLOY_PLAN.md)
  output: 'export',

  // Subdir hosting on GH Pages: site lives at /portfolio/ in production
  basePath: process.env.NODE_ENV === 'production' ? '/portfolio' : '',

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
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
