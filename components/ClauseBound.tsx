import { Fragment } from 'react';

import { CLAUSE_SEPARATOR, splitClauses } from '@/lib/clauses';

import styles from './clauseBound.module.css';

/** The class the LINE (the `<p>` or `<span>` that holds a ClauseBound) must
 *  carry: it makes the line a size container so the hold can release by
 *  width under text enlargement (see clauseBound.module.css). */
export const CLAUSE_LINE_CLASS = styles.line;

/**
 * ClauseBound — renders an interpunct-separated status line so each short
 * clause holds together and a line may break only at the separators
 * (Release 6, R6-A; the rule and its length guard live in lib/clauses.ts).
 * Pure presentation: the text content is byte-identical to `text`, no new
 * characters are inserted, and a clause longer than the guard is emitted as
 * plain text so it can still wrap. The hold itself is width-aware: give the
 * enclosing line `CLAUSE_LINE_CLASS` and it releases when the line is too
 * narrow for the widest admissible clause (text-only zoom, tiny viewports).
 * Used by the home work index, the Record's open-round counts and the wall's
 * CaseStudyCard; every other status render is untouched.
 */
export function ClauseBound({ text }: { text: string }) {
  const clauses = splitClauses(text);
  return (
    <>
      {clauses.map((clause, i) => (
        <Fragment key={i}>
          {i > 0 && CLAUSE_SEPARATOR}
          {clause.bound ? <span className={styles.clause}>{clause.text}</span> : clause.text}
        </Fragment>
      ))}
    </>
  );
}
