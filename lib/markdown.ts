/**
 * Typographic smart-punctuation for long-form body text (case-study + blog).
 *
 * Applied to plain + emphasized text in the inline markdown parser — NEVER
 * inside `code` spans (which must stay literal). Turns the straight ASCII the
 * content is authored in into proper typography:
 *   "  → “ ”   (curly double quotes, context-aware)
 *   '  → ‘ ’   (curly single quotes / apostrophes)
 *   --  → —    (em dash)
 *   ... → …    (ellipsis)
 *
 * Heuristic opener/closer detection: a quote at the start of the string or
 * after whitespace / an opening bracket / an em dash opens; everything else
 * (mid-word, after a letter) closes — which also gives correct apostrophes
 * (it's → it’s, users' → users’).
 */
export function smartPunctuation(text: string): string {
  return text
    .replace(/--/g, '—') // em dash (content already uses — directly; this catches any --)
    .replace(/\.\.\./g, '…') // ellipsis
    .replace(/(^|[\s([{—/])"/g, '$1“') // opening “
    .replace(/"/g, '”') // closing ”
    .replace(/(^|[\s([{—/])'/g, '$1‘') // opening ‘
    .replace(/'/g, '’'); // closing ’ / apostrophe
}

/**
 * Wrap-point etiquette for display titles (TY-6) — binds a single-letter
 * word ("A", "a", "I") to the word that follows with a no-break space so
 * a display line never ends on a lone letter. Presentation-only: visible
 * characters are identical; only the permissible wrap points change.
 * Deliberately NOT applied to body prose — paragraph wraps stay natural.
 */
export function bindSoloLetters(text: string): string {
  return text.replace(/(^|\s)([AaI])\s(?=\S)/g, '$1$2\u00A0');
}

/** Shared className for inline `code` spans in the markdown renderer. */
export const INLINE_CODE_CLASS =
  'font-mono text-[0.85em] rounded px-1.5 py-0.5 bg-[rgb(var(--rgb-ink)/0.06)] text-near-black break-words';
