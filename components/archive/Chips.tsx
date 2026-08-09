'use client';

/** The filter chip row: "All" + present mediums + a dashed "add" chip. */
export function Chips({
  options,
  active,
  onPick,
  addLabel,
  onAdd,
}: {
  options: string[];
  active: string;
  onPick: (value: string) => void;
  addLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="sa-chips">
      {['All', ...options].map((m) => (
        <button
          key={m}
          type="button"
          className={`sa-chip${active === m ? ' on' : ''}`}
          aria-pressed={active === m}
          onClick={() => onPick(m)}
        >
          {m}
        </button>
      ))}
      <button type="button" className="sa-chip add" onClick={onAdd}>
        {addLabel}
      </button>
    </div>
  );
}
