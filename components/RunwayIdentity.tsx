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
 *
 * -- variant="page" (ui-polish UP-38) ---------------------------------------
 * The same mark, mounted on the SUBPAGES, where measurement found no identity
 * at all before the footer at mobile widths (0 strings visible AND 0 in the
 * a11y tree, on every subpage at 320/375/414 -- the footer is the first time
 * the site says whose it is).
 *
 * Two differences from the runway mount, both forced by measurement:
 *  1. NO retirement. On a route with no cinematic there is nothing to retire
 *     from. RunwayIdentityRelease is therefore NOT imported here at all -- it is
 *     mounted beside this component at home's own call site (app/page.tsx).
 *
 *     THAT PLACEMENT IS LOAD-BEARING AND WAS CORRECTED ON MEASUREMENT. The
 *     first cut kept the import here and rendered it behind a `variant` check,
 *     on the assumption that a conditional render keeps the client component
 *     out of the other routes' bundles. IT DOES NOT: a static import puts it in
 *     the module graph of every route that imports this file, and the built
 *     chunks proved it -- `data-runway-done` appeared in all nine subpage
 *     chunks. Hoisting the mount to the one route that needs it is what
 *     actually makes the claim true, and it costs no new file.
 *  2. Hidden from md up (CSS, `.runway-identity--page`). The desktop rail signs
 *     from exactly 768 -- measured on both sides of the boundary: rail
 *     display:none at 375 and 767, flex at 768; hamburger flex at 375/767, none
 *     at 768. Showing the chip at >=768 would double-sign, the same constraint
 *     /work/[slug]'s byline chip already records for itself (P6-UP-32-BYLINE:
 *     "the sidebar rail signs from md=768 up, so promoting it would double-sign").
 *
 * NOT mounted on `/work/[slug]`: that route ALREADY signs at mobile via its own
 * md:hidden byline chip, measured at viewport y=143.39 -- the fixed chip would
 * render the same string twice, same family, same casing, 121px apart, both
 * inside the first viewport. The exclusion is deliberate and lives in the call
 * sites rather than in a selector so it stays greppable.
 *
 * `name` defaults to the same bytes as content/profile.json's `name` and
 * `wordmarkText` ("Sky Halisky"). The two role lines preserve Technical
 * Support as the primary professional identity and describe the builder side
 * without presenting it as a conventional AI engineering job title.
 *
 * The material is honest about what it does NOT carry over: `.glass-card` is a
 * LENS. Over the dark film it reads as a chip; over a flat page it has almost
 * nothing to refract, and the chip fill measures 1.034:1 (light) / 1.121:1
 * (dark) against the page canvas -- so on the prose pages this reads as the
 * wordmark with a whisper of a panel, not as home's glass object. Recorded, and
 * forked to Sky in DECISIONS section P: it is a taste call, and the revert is
 * one line per call site.
 */
export function RunwayIdentity({
  name = 'Sky Halisky',
  variant = 'runway',
}: {
  name?: string;
  /** 'runway' = home's mark over the cinematic (retires); 'page' = the subpage
      chip (mobile-only, no retirement, no client boundary). */
  variant?: 'runway' | 'page';
}) {
  const onRunway = variant === 'runway';
  return (
    <div
      className={onRunway ? 'runway-identity' : 'runway-identity runway-identity--page'}
      data-runway-identity
    >
      <span className="runway-identity-chip glass-card">
        <span aria-hidden="true" className="runway-identity-sun">
          {/* UP-07 (ui-polish 2026-08-01): these hex are DELIBERATE and NOT tokenized — the mark rides the intro's fixed golden palette and must not theme-flip. See UI_SYSTEM.md "UI-polish pass (2026-08-01)". */}
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
          <span className="runway-identity-role">Technical Support</span>
          <span className="runway-identity-role runway-identity-role--tertiary">AI-assisted Builder</span>
        </span>
      </span>
    </div>
  );
}
