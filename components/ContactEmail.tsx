'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { useMagnetic } from '@/lib/motion';

type ContactEmailProps = {
  /**
   * Optional fixed label. When provided, the button always shows this text
   * (e.g. "Get in touch"). When omitted, shows "Email {address}" after
   * hydration and "Send me an email" before.
   */
  label?: string;
  /** Optional mailto subject line. Defaults to a generic greeting. */
  subject?: string;
  /** Optional CSS color for the signature dot (FT-14) — a per-project `--pr-sig`
   *  hue forwarded to the Button's dot. Recolors only the dot background. */
  dotColor?: string;
};

/**
 * ContactEmail — assembles the mailto link at runtime so bots cannot
 * harvest the address from the static HTML.
 *
 * SSR / initial paint: renders a Button with href="#" and a generic or
 * caller-supplied label — address-free in the raw HTML.
 * After hydration: swaps in the real assembled mailto href.
 *
 * Bot scrapers never execute JavaScript, so the address never appears
 * in the static HTML or in Next.js's __NEXT_DATA__ serialisation.
 */
export function ContactEmail({
  label,
  subject = 'Hello from your portfolio',
  dotColor,
}: ContactEmailProps = {}) {
  const [email, setEmail] = useState<string | null>(null);
  const magRef = useMagnetic<HTMLElement>(0.2, 6);

  useEffect(() => {
    // Parts assembled at runtime — never in static HTML
    const user = ['skyler', 'halisky'].join('');
    const domain = ['gmail', 'com'].join('.');
    setEmail(`${user}@${domain}`);
  }, []);

  // Before hydration (and with scripting disabled) the address is never in the
  // HTML, so fall back to the /contact page rather than a dead `#` — keeps the
  // CTA functional for no-JS visitors without exposing the address to scrapers.
  const href = email
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : '/contact/';

  // C-70: the full "Email {address}" label decks over two lines inside the
  // w-full pill at 375. Below md show a short label; restore the full address at
  // md+. Each span toggles via `display`, so the accessible name is exactly the
  // one visible span — no label-content-name-mismatch, and the short label leads
  // its own accessible name (SC 2.5.3). A caller-supplied `label` is left as-is.
  const children =
    label ??
    (email ? (
      <>
        <span className="md:hidden">Email me</span>
        <span className="hidden md:inline">{`Email ${email}`}</span>
      </>
    ) : (
      'Send me an email'
    ));

  return (
    <Button ref={magRef} href={href} dotColor={dotColor}>
      {children}
    </Button>
  );
}
