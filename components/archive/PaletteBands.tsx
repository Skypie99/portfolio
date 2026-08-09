/** The prototype's palette-band placeholder: a stack of colour bands, the first
 *  weighted ~2.2×. Used when an artwork has no photo (or before its thumb signs). */
export function PaletteBands({ palette }: { palette: string[] }) {
  const pal = palette.length ? palette : ['#888'];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {pal.map((c, i) => (
        <div key={`${c}-${i}`} style={{ flex: i === 0 ? 2.2 : 1, background: c }} />
      ))}
    </div>
  );
}
