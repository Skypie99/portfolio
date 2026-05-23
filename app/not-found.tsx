import Link from 'next/link';

import { Button } from '@/components/Button';

/**
 * 404 page. Quiet editorial styling that matches the rest of the site.
 * Sky-mention: future cycles add /work, /about, /certificates, /contact —
 * until those land, the HamburgerNav links to them will land here.
 */
export default function NotFound() {
  return (
    <section className="px-gutter py-16 md:py-20 lg:py-32 min-h-[60vh] flex items-center">
      <div className="max-w-content mx-auto w-full">
        <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
          404
        </p>
        <h1 className="font-serif font-light text-display-l text-near-black leading-tight mb-6">
          That page hasn{'’'}t been written yet.
        </h1>
        <p className="font-sans font-light text-body text-charcoal max-w-[540px] mb-8 leading-[1.65]">
          The portfolio is still being built. The page you asked for is either
          on the way or never existed. Either way, the homepage is the best
          place to start.
        </p>
        <Button href="/">Back to the homepage</Button>
      </div>
    </section>
  );
}
