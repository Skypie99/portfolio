import { Fragment } from 'react';

import { CLAUSE_SEPARATOR, splitClauses } from '@/lib/clauses';

/**
 * ClauseBound — renders an interpunct-separated status line so each short
 * clause holds together and a line may break only at the separators
 * (Release 6, R6-A; the rule and its length guard live in lib/clauses.ts).
 * Pure presentation: the text content is byte-identical to `text`, no new
 * characters are inserted, and a clause longer than the guard is emitted as
 * plain text so it can still wrap. Used by the home work index and the
 * wall's CaseStudyCard; every other status render is untouched.
 */
export function ClauseBound({ text }: { text: string }) {
  const clauses = splitClauses(text);
  return (
    <>
      {clauses.map((clause, i) => (
        <Fragment key={i}>
          {i > 0 && CLAUSE_SEPARATOR}
          {clause.bound ? <span className="whitespace-nowrap">{clause.text}</span> : clause.text}
        </Fragment>
      ))}
    </>
  );
}
