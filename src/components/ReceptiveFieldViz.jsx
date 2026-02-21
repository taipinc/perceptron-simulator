import { useMemo } from 'react';
import { RETINA_SIZE, NUM_PIXELS } from '../perceptron';

const CELL_SIZE = 14;
const GAP = 1;
const GRID_PX = RETINA_SIZE * (CELL_SIZE + GAP) + GAP;

function valueToColor(val, maxAbs) {
  if (maxAbs === 0) return '#b0b0b0';
  const normalized = val / maxAbs; // -1 to 1
  if (normalized > 0) {
    // Green channel: stronger positive → brighter green
    const t = normalized;
    const r = Math.round(240 - 180 * t);
    const g = Math.round(240 - 40 * t);
    const b = Math.round(240 - 180 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Red channel: stronger negative → brighter red
    const t = -normalized;
    const r = Math.round(240 - 20 * t);
    const g = Math.round(240 - 180 * t);
    const b = Math.round(240 - 180 * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function FieldGrid({ field, label }) {
  const maxAbs = useMemo(() => {
    if (!field) return 0;
    let m = 0;
    for (let i = 0; i < NUM_PIXELS; i++) {
      const a = Math.abs(field[i]);
      if (a > m) m = a;
    }
    return m;
  }, [field]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-gray-600 font-medium">{label}</span>
      <div
        className="rounded overflow-hidden"
        style={{
          width: GRID_PX,
          height: GRID_PX,
          backgroundColor: '#d1d5db',
          padding: GAP,
          display: 'grid',
          gridTemplateColumns: `repeat(${RETINA_SIZE}, ${CELL_SIZE}px)`,
          gap: GAP,
        }}
      >
        {Array.from({ length: NUM_PIXELS }, (_, i) => (
          <div
            key={i}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: field ? valueToColor(field[i], maxAbs) : '#e0e0e0',
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ReceptiveFieldViz({ receptiveFields, labels }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Receptive Fields
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Weights projected back onto the retina — shows what each output "looks for"
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: 'rgb(60, 200, 60)' }} />
          Excitatory
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: 'rgb(220, 60, 60)' }} />
          Inhibitory
        </span>
      </div>
      <div className="flex gap-6 flex-wrap">
        {[0, 1].map((idx) => (
          <FieldGrid
            key={idx}
            field={receptiveFields ? receptiveFields[idx] : null}
            label={labels[idx]}
          />
        ))}
      </div>
    </div>
  );
}
