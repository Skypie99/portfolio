import { RunwayIdentityRelease } from './RunwayIdentityRelease';

/**
 * RunwayIdentity — the restrained identity mark that holds the top-left corner
 * through the wordless cinematic runway (L1-01 / slate S17).
 *
 * The intro's first frame is an identity vacuum: at >=768 the shell contributes
 * zero pixels while "who is this / what do they build" is deferred ~4 viewport
 * heights below first paint. This mark closes that vacuum WITHOUT touching the
 * locked intro — it mounts as a fixed sibling of <CinematicDesert/> (never a
 * child of it), reusing the site's own `.glass-card` chrome material and the
 * mono-eyebrow voice, with the favicon's terracotta sun glyph.
 *
 * It is a SERVER component: the name + role are in the static HTML at first
 * paint (T=0), during the intro, and over the reduced-motion static frame,
 * with no dependence on hydration. The visible state IS the default (rest floor)
 * — a dropped bundle or reduced motion never hides it. It carries real DOM text
 * (in the a11y tree, not aria-hidden) but no tab stop (pointer-events:none, no
 * tabindex), so the skip-link -> hero-CTA runway focus journey is unchanged.
 * RunwayIdentityRelease retires it when the runway ends.
 */
export function RunwayIdentity({
  name = 'Sky Halisky',
  roleLabel = 'AI Builder',
}: {
  name?: string;
  roleLabel?: string;
}) {
  return (
    <>
      <div className="runway-identity" data-runway-identity>
        <span className="runway-identity-chip glass-card">
          <span aria-hidden="true" className="runway-identity-sun">
            {/* the favicon's terracotta sun, cresting two clay horizon lines */}
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="14.5" r="6.25" fill="#B35F40" />
              {/* minted limb line (art pass) — a whisper of gold on the disc's edge */}
              <circle cx="16" cy="14.5" r="6.25" fill="none" stroke="#C2A878" strokeOpacity="0.55" strokeWidth="0.75" />
              <path
                d="M5.5 22.25H26.5"
                stroke="#A35636"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M9.5 25.75H22.5"
                stroke="#C2A878"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="runway-identity-lines">
            <span className="runway-identity-name">{name}</span>
            <span className="runway-identity-role">{roleLabel}</span>
          </span>
        </span>
      </div>
      <RunwayIdentityRelease />
    </>
  );
}
