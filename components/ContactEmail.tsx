'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';

type ContactEmailProps = {
  /**
   * Optional fixed label. When provided, the button always shows this text
   * (e.g. "Get in touch"). When omitted, shows "Email {address}" after
   * hydration and "Send me an email" before.
   */
  label?: string;
  /** Optional mailto subject line. Defaults to "Hello from your portfolio". */
  subject?: string;
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
export function ContactEmail({ label, subject = 'Hello from your portfolio' }: ContactEmailProps = {}) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Parts assembled at runtime — never in static HTML
    const user = ['skyler', 'halisky'].join('');
    const domain = ['gmail', 'com'].join('.');
    setEmail(`${user}@${domain}`);
  }, []);

  const href = email
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : '#';

  const children = label ?? (email ? `Email ${email}` : 'Write to me.');

  return <Button href={href}>{children}</Button>;
}
