/**
 * clauses.ts — wrap-point etiquette for short status lines (Release 6, R6-A).
 *
 * The status strings are interpunct-separated clauses ("On the App Store ·
 * US and Canada · Sept 2026"). Left to the line-breaker, a narrow column
 * splits a clause in the middle ("PUBLIC / SYNTHETIC DEMO") or a month from
 * its year ("Sept / 2026"), which the Release 6 brief names as the defect
 * (M-VIS-023/029). The repair is presentation only: the string is split into
 * its clauses so the renderer can keep each SHORT clause on one line and let
 * the break fall at the interpunct. Visible characters are byte-identical.
 *
 * Why a length guard: UI_SYSTEM.md (UP-14 #4) measured whole-segment nowrap
 * overflowing a 320px column by 135px on a long caption. A clause is only
 * made unbreakable when it is short enough to fit the narrowest column this
 * site renders a status in (the 320px phone index row, ~208px of text width
 * at 11px mono), so a future long clause degrades to ordinary wrapping
 * rather than overflowing. 24 characters at 11px DM Mono +0.125em tracking
 * measures ~192px, inside that floor.
 */

export const CLAUSE_SEPARATOR = ' · ';

/** The longest clause that is held on one line. */
export const MAX_BOUND_CLAUSE = 24;

export type Clause = { text: string; bound: boolean };

/** Split a status line into its interpunct clauses, marking the ones short
 *  enough to hold unbroken. A string without the separator is one clause. */
export function splitClauses(text: string, max: number = MAX_BOUND_CLAUSE): Clause[] {
  return text.split(CLAUSE_SEPARATOR).map((clause) => ({
    text: clause,
    bound: clause.length > 0 && clause.length <= max && !clause.includes('\n'),
  }));
}
