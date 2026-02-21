export default function ControlPanel({
  labels,
  learningRate,
  onLearningRateChange,
  onLearn,
  onReset,
  hasInput,
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Controls
      </h2>

      {/* Learning rate */}
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600">
          Learning rate: <span className="font-mono font-medium">{learningRate.toFixed(2)}</span>
        </span>
        <input
          type="range"
          min={0.01}
          max={1.0}
          step={0.01}
          value={learningRate}
          onChange={(e) => onLearningRateChange(Number(e.target.value))}
          className="w-full"
        />
      </label>

      {/* Learn buttons */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-600">Teach correct class:</span>
        <div className="flex gap-2">
          {labels.map((label, idx) => (
            <button
              key={idx}
              onClick={() => onLearn(idx)}
              disabled={!hasInput}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors cursor-pointer ${
                hasInput
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {!hasInput && (
          <span className="text-xs text-gray-400">Draw or load an input first</span>
        )}
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="py-2 px-3 rounded text-sm bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors cursor-pointer"
      >
        Reset Weights
      </button>
    </div>
  );
}
