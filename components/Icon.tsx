import type { ReactNode, SVGProps } from 'react';

/**
 * Icon — a tiny hand-picked inline-SVG line-icon set (Lucide-style: 24-box,
 * 1.75 stroke, currentColor) for the section eyebrows. Inline SVG keeps the
 * site dependency-free (no lucide-react) and renders crisp at any DPR. Always
 * decorative (aria-hidden) — the eyebrow text is the accessible label.
 */
export type IconName =
  | 'live'
  | 'work'
  | 'method'
  | 'about'
  | 'credentials'
  | 'contact'
  | 'dispatches';

const PATHS: Record<IconName, ReactNode> = {
  // activity — a live pulse line
  live: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  // layers — stacked plates (the work)
  work: (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>
  ),
  // compass — method / direction
  method: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>
  ),
  // feather — a brief account
  about: (
    <>
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </>
  ),
  // award — credentials
  credentials: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </>
  ),
  // mail — correspond
  contact: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  // rss — dispatches
  dispatches: (
    <>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </>
  ),
};

type IconProps = { name: IconName; className?: string } & SVGProps<SVGSVGElement>;

export function Icon({ name, className = 'w-3.5 h-3.5', ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
