// pages/500.tsx — Required so Next.js 15 static export can generate 500.html.
// App Router-only projects never produce .next/server/pages/500.html; without
// this file the build fails with ENOENT when trying to rename it to out/500.html.
export default function Custom500() {
  return null;
}
