import { NUM_ASSOCIATION } from '../perceptron';

const VIZ_COLS = 32;
const VIZ_ROWS = Math.ceil(NUM_ASSOCIATION / VIZ_COLS);
const CELL = 6;
const GAP = 1;

export default function AssociationLayer({ activations }) {
  const numActive = activations ? activations.reduce((s, v) => s + v, 0) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Association Layer
        </h2>
        <span className="text-sm text-gray-500">
          {numActive} / {NUM_ASSOCIATION} active
        </span>
      </div>
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
              backgroundColor: activations && activations[i] > 0 ? '#3b82f6' : '#c8c8c8',
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
