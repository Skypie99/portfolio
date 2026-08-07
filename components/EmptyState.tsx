import { Reveal } from '@/components/Reveal';

type EmptyStateProps = {
  /** The serif headline (e.g. "No posts yet."). */
  title: string;
  /** A calm supporting sentence below the headline. */
  note: string;
};

/**
 * EmptyState — the quiet, composed "nothing here yet" treatment shared by the
 * Work, Notes, and Credentials lists. An empty list should read as intentional
 * (a short ember rule + serif line + a calm note, echoing the 404's care)
 * rather than a bare placeholder paragraph. Purely presentational + static; the
 * page keeps its own sr-only section heading for the a11y heading rotor.
 */
export function EmptyState({ title, note }: EmptyStateProps) {
  return (
    <Reveal className="flex flex-col items-start gap-5 max-w-measure-lead">
      <span aria-hidden="true" className="rule-ember block w-16" />
      <p className="font-serif font-light text-display-s text-ink leading-[1.2]">
        {title}
      </p>
      <p className="font-sans font-light text-prose text-ink-muted leading-[1.65] text-pretty">
        {note}
      </p>
    </Reveal>
  );
}
