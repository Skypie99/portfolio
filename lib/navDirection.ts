/**
 * The enfilade's direction rule (R4/BP1 · P04) — PREFIX-PARENT ONLY.
 *
 * Directional meaning exists only when one pathname is an ancestor of the
 * other along one axis (`/work/` ↔ `/work/accessmap/`, `/` ↔ `/work/`):
 * going deeper is a DESCEND, stepping back up through a link is an ASCEND.
 * Every other pair — cross-section jumps, equal-depth hops — returns null
 * and keeps the plain gold dissolve, because fabricated architecture would
 * corrode the exact spatial memory the move exists to build.
 *
 * Pure pathname reasoning; query/hash never reach it (the interceptor passes
 * `url.pathname`). Trailing slashes are normalized (the export uses
 * `trailingSlash: true`, but dev and hand-typed hrefs may omit it).
 */
export type NavDirection = 'descend' | 'ascend';

export function navDirection(from: string, to: string): NavDirection | null {
  const a = segments(from);
  const b = segments(to);
  if (a.length === b.length) return null;
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] !== longer[i]) return null;
  }
  return b.length > a.length ? 'descend' : 'ascend';
}

function segments(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}
