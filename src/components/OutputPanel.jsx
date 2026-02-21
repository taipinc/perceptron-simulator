import { predict } from '../perceptron';

export default function OutputPanel({ scores, labels, onLabelsChange }) {
  const prediction = scores ? predict(scores) : null;

  const handleLabelChange = (idx, value) => {
    const next = [...labels];
    next[idx] = value;
    onLabelsChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Output Layer
      </h2>
      <div className="flex gap-3">
        {[0, 1].map((idx) => {
          const isWinner = prediction === idx;
          return (
            <div
              key={idx}
              className={`flex-1 rounded-lg p-3 border-2 transition-colors ${
                isWinner
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <input
                type="text"
                value={labels[idx]}
                onChange={(e) => handleLabelChange(idx, e.target.value)}
                className="w-full text-sm font-medium bg-transparent border-none outline-none text-center"
                spellCheck={false}
              />
              <div className="text-center mt-1">
                <span className="text-2xl font-mono font-bold">
                  {scores ? scores[idx].toFixed(3) : '—'}
                </span>
              </div>
              {isWinner && (
                <div className="text-center text-xs font-semibold text-blue-500 mt-1">
                  PREDICTED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
