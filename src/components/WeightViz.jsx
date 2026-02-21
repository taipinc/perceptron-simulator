import { NUM_ASSOCIATION } from '../perceptron';

const VIZ_COLS = 32;
const CELL = 6;
const GAP = 1;

function weightToColor(w) {
  if (w > 0) {
    const intensity = Math.min(w * 3, 1);
    const g = Math.round(100 + 155 * intensity);
    return `rgb(60, ${g}, 60)`;
  } else if (w < 0) {
    const intensity = Math.min(-w * 3, 1);
    const r = Math.round(100 + 155 * intensity);
    return `rgb(${r}, 60, 60)`;
  }
  return '#b0b0b0';
}

function WeightGrid({ weights, label }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <div
        className="rounded overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${VIZ_COLS}, ${CELL}px)`,
          gap: GAP,
          padding: GAP,
          backgroundColor: '#d1d5db',
          width: 'fit-content',
        }}
      >
        {Array.from({ length: NUM_ASSOCIATION }, (_, i) => (
          <div
            key={i}
            style={{
              width: CELL,
              height: CELL,
              backgroundColor: weights ? weightToColor(weights[i]) : '#b0b0b0',
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function WeightViz({ weights, labels }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Weights
      </h2>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: 'rgb(60, 255, 60)' }} />
          Positive
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: 'rgb(255, 60, 60)' }} />
          Negative
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1].map((idx) => (
          <WeightGrid
            key={idx}
            weights={weights ? weights[idx] : null}
            label={labels[idx]}
          />
        ))}
      </div>
    </div>
  );
}
