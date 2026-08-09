'use client';

import { hslOf, valueOf } from '@/lib/archive/color';
import {
  biggestHoleLabel,
  hueSpreadLabel,
  mediumCounts,
  mediumPillLabel,
  valueGap,
  VALUE_TICKS,
} from '@/lib/archive/range';

import { useArchive } from './ArchiveProvider';

/** The range map: value coverage ramp, hue wheel, and per-medium tally. */
export function RangeTab() {
  const { state } = useArchive();
  const items = state.supplies;
  const gap = valueGap(items);
  const chrom = items.filter((i) => hslOf(i.hex).s >= 16);
  const counts = mediumCounts(items);

  return (
    <div className="sa-rangewrap">
      <div className="sa-range-h sa-mono">value coverage</div>
      <div className="sa-range-sub sa-serif">
        every colour you own, placed dark → light. holes are shopping targets.
      </div>
      <div style={{ position: 'relative', height: 74, marginTop: 20 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 30,
            height: 10,
            borderRadius: 6,
            background: 'linear-gradient(90deg,#0a0a0c,#f5f2ea)',
            border: '1px solid var(--line)',
          }}
        />
        {items.map((i) => {
          const v = valueOf(i.hex);
          return (
            <div
              key={i.id}
              title={`${i.name} · V${v}`}
              style={{
                position: 'absolute',
                left: `calc(${v}% - 7px)`,
                top: 23,
                width: 14,
                height: 24,
                borderRadius: 3,
                background: i.hex,
                border: '1.5px solid rgba(240,237,226,.85)',
                boxShadow: '0 2px 6px rgba(0,0,0,.5)',
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: `${gap.a}%`,
            width: `${gap.size}%`,
            top: 52,
            height: 8,
            borderLeft: '2px solid var(--sang)',
            borderRight: '2px solid var(--sang)',
            borderBottom: '2px solid var(--sang)',
          }}
        />
        {VALUE_TICKS.map((t) => (
          <span
            key={t}
            className="sa-mono"
            style={{ position: 'absolute', left: `calc(${t}% - 8px)`, top: 64, fontSize: 8, color: 'var(--chalkDim)' }}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="sa-callout sa-mono">{biggestHoleLabel(gap)}</div>

      <div className="sa-range-h sa-mono" style={{ marginTop: 36 }}>
        hue spread
      </div>
      <div className="sa-range-sub sa-serif">{hueSpreadLabel(items)}</div>
      <div style={{ position: 'relative', height: 46, marginTop: 16 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 16,
            height: 10,
            borderRadius: 6,
            background: 'linear-gradient(90deg,#c33,#cc3,#3c3,#3cc,#33c,#c3c,#c33)',
            border: '1px solid var(--line)',
            opacity: 0.85,
          }}
        />
        {chrom.map((i) => {
          const hh = hslOf(i.hex).h;
          return (
            <div
              key={i.id}
              title={i.name}
              style={{
                position: 'absolute',
                left: `calc(${(hh / 360) * 100}% - 8px)`,
                top: 10,
                width: 16,
                height: 16,
                borderRadius: 99,
                background: i.hex,
                border: '2px solid rgba(240,237,226,.9)',
                boxShadow: '0 2px 6px rgba(0,0,0,.5)',
              }}
            />
          );
        })}
      </div>

      <div className="sa-range-h sa-mono" style={{ marginTop: 36 }}>
        by medium
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {counts.map((mc) => (
          <span
            key={mc.medium}
            className="sa-mono"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 9,
              color: 'var(--chalkDim)',
            }}
          >
            {mediumPillLabel(mc)}
          </span>
        ))}
      </div>
    </div>
  );
}
