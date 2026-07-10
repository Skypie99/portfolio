import { CountUpStat } from '@/components/CountUpStat';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import type { A11yReceipts as A11yReceiptsData } from '@/lib/schema';

/** Home's stat-figure rotation (app/page.tsx STAT_EMBER) — the receipts strip
 *  speaks the exact same grammar, so the same ember cycle applies. */
const STAT_EMBER = ['ember', 'ember-teal', 'ember-gold', 'ember-moss'];

/**
 * A11yReceipts — the dated receipts strip on /accessibility/ (S6 / L6-02
 * enhancement, Treatment A).
 *
 * Publishes MEASURED numbers from a real verification run in the home
 * showcase's stat-chip grammar: the same 3×2 gap-px grid, surface cells, mono
 * labels, and CountUpStat figures (the L6-05 sr-only mechanism — the animated
 * figure is aria-hidden; AT hears only the final value). Honest framing is
 * structural: "measured", the run date, and a link to the evidence JSON anyone
 * can re-run — never "enforced every build" (there is no CI gate yet).
 *
 * Placement contract: the strip sits BEFORE the "What I have not done"
 * section, so the page keeps its honest last word (PROTECT #8).
 */
export function A11yReceipts({ data, className }: { data: A11yReceiptsData; className?: string }) {
  return (
    <div className={className}>
      <Reveal variant="scene">
        {/* The eyebrow is the strip's heading — it joins the statement's h2
            outline so heading-nav users land on the receipts, not past them. */}
        <h2 className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          Measured, not claimed
        </h2>
        <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-measure-lead mb-12 text-pretty">
          Real numbers from a real run — measured {data.measuredDate}, method below. Not a
          live gate yet; a snapshot you can re-run.
        </p>
      </Reveal>

      {/* 3×2 receipts grid — home's showcase grammar verbatim */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-wa-teal-soft/30 border border-wa-teal-soft/50 rounded-lg overflow-hidden shadow-md">
        {data.receipts.map((r, i) => (
          <Reveal
            key={r.label}
            index={Math.min(i, 4)}
            variant="depth"
            className={cn('flex flex-col bg-surface-mid p-8 md:p-7', 'group')}
          >
            <CountUpStat value={r.value} emberClass={STAT_EMBER[i % STAT_EMBER.length]} label={r.label} />
            <p className="font-mono text-label text-sage-text uppercase tracking-label mb-2">
              {r.label}
            </p>
            <p className="font-mono text-meta text-text-meta">{r.sub}</p>
          </Reveal>
        ))}
      </div>

      {/* Method line — the receipt's fine print + the evidence artifact */}
      <p className="mt-6 font-mono text-meta tracking-label uppercase text-text-meta leading-[2]">
        Measured {data.measuredDate}
        <span aria-hidden="true"> · </span>
        <a
          href={data.evidencePath}
          className="link-draw text-accent-text hover:text-accent-text"
        >
          Evidence JSON
        </a>
        {data.method.map((m) => (
          <span key={m}>
            <span aria-hidden="true"> · </span>
            {m}
          </span>
        ))}
      </p>
    </div>
  );
}
