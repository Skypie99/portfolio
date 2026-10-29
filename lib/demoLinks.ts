/**
 * demoLinks — the tab behavior of a project's demo action (hotfix 2026-10-29).
 *
 * OWNER DECISION, recorded here because it is deliberate divergence: for
 * Claude Corp and Claude Corp Dashboard, the demo action ("Read system
 * overview", "Try synthetic demo") no longer FORCES a new tab — it navigates
 * the current tab to its genuine destination, like every other project-opening
 * control on the site. The destination and the visible label are preserved
 * exactly; only the forced `target="_blank"` and its "(opens in new tab)"
 * announcement (now false) drop.
 *
 * Scope is per-project and intentionally narrow: Flagstone ("Open web app"),
 * Prompt Library and Ghost Code keep their new-tab demo actions, and every
 * GitHub, App Store, LinkedIn and external reference link is untouched
 * (Alex §4.5). The `rel` guard stays on ALL external links — the
 * static-integrity suite requires it regardless of target.
 *
 * The ↗ marker stays visible on the de-tabbed actions: the destination is
 * still another site; it is the FORCED TAB that changed, not where the link
 * goes.
 */

/** Deliverable ids whose demo action opens in the current tab. */
const SAME_TAB_DEMO_IDS: ReadonlySet<string> = new Set(['claude-corp', 'dashboard']);

/** Whether this project's demo action keeps the site's new-tab convention. */
export function demoOpensInNewTab(deliverableId: string): boolean {
  return !SAME_TAB_DEMO_IDS.has(deliverableId);
}

/**
 * The anchor props and accessible-label suffix for a demo action. The suffix
 * is present only when the claim is true — a same-tab link must never announce
 * "(opens in new tab)".
 */
export function demoLinkBehavior(deliverableId: string): {
  target: '_blank' | undefined;
  rel: 'noopener noreferrer';
  newTabAnnouncement: ' (opens in new tab)' | '';
} {
  return demoOpensInNewTab(deliverableId)
    ? { target: '_blank', rel: 'noopener noreferrer', newTabAnnouncement: ' (opens in new tab)' }
    : { target: undefined, rel: 'noopener noreferrer', newTabAnnouncement: '' };
}
