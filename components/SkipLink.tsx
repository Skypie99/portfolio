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
        focus:not-sr-only
        focus:fixed focus:left-4 focus:top-4 focus:z-[9999]
        focus:px-4 focus:py-3
        focus:bg-cream focus:text-near-black
        focus:border-2 focus:border-accent-primary
        focus:rounded-md
        focus:font-mono focus:text-label focus:tracking-label focus:uppercase
        focus:no-underline
      "
    >
      Skip to main content
    </a>
  );
}
