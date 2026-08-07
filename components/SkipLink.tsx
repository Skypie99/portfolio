/**
 * SkipLink — Alex §2.2 binding pattern.
 * Visually hidden until keyboard focus lands; then becomes a real visible
 * link the user can activate. Must be the first child of <body>.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="
        sr-only
        focus-visible:not-sr-only
        focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[9999]
        focus-visible:px-4 focus-visible:py-3
        focus-visible:bg-canvas focus-visible:text-ink
        focus-visible:border-2 focus-visible:border-accent-primary
        focus-visible:rounded-md
        focus-visible:font-mono focus-visible:text-label focus-visible:tracking-label focus-visible:uppercase
        focus-visible:no-underline
      "
    >
      Skip to main content
    </a>
  );
}
