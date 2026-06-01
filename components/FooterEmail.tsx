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
      aria-label={email ? `Send email to ${email}` : 'Contact page'}
      className="link-draw font-sans text-body-sm text-near-black break-all"
    >
      {email ?? 'Email me'}
    </a>
  );
}
