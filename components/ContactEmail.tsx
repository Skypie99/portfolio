'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';

/**
 * ContactEmail — assembles the mailto link at runtime so bots cannot
 * harvest the address from the static HTML.
 *
 * SSR / initial paint: renders a generic "Send me an email" Button with
 * href="#" — functional but address-free.
 * After hydration: swaps in the real assembled address and mailto href.
 *
 * Bot scrapers never execute JavaScript, so the real address never appears
 * in the raw HTML or in Next.js's __NEXT_DATA__ serialisation.
 */
export function ContactEmail() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Parts assembled at runtime — never in static HTML
    const user = ['skyler', 'halisky'].join('');
    const domain = ['gmail', 'com'].join('.');
    setEmail(`${user}@${domain}`);
  }, []);

  const href = email
    ? `mailto:${email}?subject=Hello from your portfolio`
    : '#';

  return (
    <Button href={href}>
      {email ? `Email ${email}` : 'Send me an email'}
    </Button>
  );
}
