'use client';

import { useEffect, useState } from 'react';

/**
 * FooterEmail — renders the contact email link only after hydration.
 * SSR / static HTML: shows "Email me" linking to /contact/ — address-free.
 * After hydration: assembles and displays the real mailto href.
 * Mirrors the ContactEmail obfuscation pattern to prevent bot harvesting.
 */
export function FooterEmail() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = ['skyler', 'halisky'].join('');
    const domain = ['gmail', 'com'].join('.');
    setEmail(`${user}@${domain}`);
  }, []);

  return (
    <a
      href={email ? `mailto:${email}` : '/contact/'}
      /* label-content-name-mismatch: pre-hydration the visible label is "Email me",
         so carry no explicit aria-label (the name = the visible text); post-hydration
         "Send email to <addr>" contains the visible address. */
      aria-label={email ? `Send email to ${email}` : undefined}
      className="link-draw font-sans text-body-sm text-ink break-all"
    >
      {email ?? 'Email me'}
    </a>
  );
}
