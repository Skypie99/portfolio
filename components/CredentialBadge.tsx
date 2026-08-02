import Image from 'next/image';
import { cn } from '@/lib/cn';

type CredentialBadgeProps = {
  label: string;
  /**
   * Short, fixed visible text for the verify affordance (L3-01). The card's <h3>
   * already shows the full credential title two lines up, so echoing it in the
   * pill only clipped it mid-word at the card edge on 5 of 9 cards. The full
   * `label` is kept in the accessible name, and the visible verb is contained in
   * that name (Label in Name). Exact wording is Sky's — default kept terse.
   */
  verifyLabel?: string;
  logoUrl?: string;
  logoAlt?: string;
  href?: string;
  className?: string;
};

/**
 * CredentialBadge — Logo + checkmark icon + a short verify label.
 *
 * Container: cream bg, umber 1px border, umber text
 * Hover (280ms): warm-white bg, dark text, subtle elevation
 * Padding: 0.5rem 0.75rem
 *
 * Respects prefers-reduced-motion.
 */
export function CredentialBadge({
  label,
  verifyLabel = 'Verify',
  logoUrl,
  logoAlt,
  href,
  className,
}: CredentialBadgeProps) {
  const content = (
    <div
      className={cn(
        'badge inline-flex items-center gap-2 rounded-pill',
        'bg-[var(--badge-bg)] border border-[var(--badge-border-color)]',
        'px-3 py-2 text-body-sm text-[var(--badge-text)]',
        'transition-all duration-base ease-out',
        href && 'hover:bg-[var(--badge-bg-hover)] hover:text-[var(--badge-text-hover)] hover:shadow-soft',
        // (R6) The old focus-visible classes here were dead code — this div is
        // never the focus target (the wrapper <a> below is) — and carried an
        // unprefixed `rounded-sm` that fought rounded-pill by stylesheet
        // emission order. The global *:focus-visible ring on the wrapper now
        // traces the pill.
        'group',
        className,
      )}
    >
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={logoAlt || label}
          width={16}
          height={16}
          unoptimized
          className="object-contain"
        />
      )}
      {/* Checkmark icon */}
      <svg
        className="w-3.5 h-3.5 text-[var(--badge-accent)] flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="font-mono text-meta tracking-label uppercase whitespace-nowrap">
        {verifyLabel}{' '}
        {/* C-78: the house external-link grammar — ↗ for a new tab (→ is reserved
            for internal nav). aria-hidden; the wrapper <a>'s aria-label already
            carries the "(opens in new tab)" cue, so this adds no SR double-speak. */}
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-base ease-gh-glide group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          ↗
        </span>
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        // rounded-pill so the global focus ring traces the badge's pill shape
        // (the <a> is the focus target, not the pill div it wraps). (R6)
        className="inline-block rounded-pill"
        aria-label={`${verifyLabel} credential: ${label} (opens in new tab)`}
      >
        {content}
      </a>
    );
  }

  return <div className="inline-block">{content}</div>;
}
