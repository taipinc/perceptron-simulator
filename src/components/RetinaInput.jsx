import { useState } from 'react';
import DrawableGrid from './DrawableGrid';
import { NUM_PIXELS } from '../perceptron';

function BrushControls({ tool, onToolChange, brushSize, onBrushSizeChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 bg-gray-200 rounded p-0.5">
        <button
          onClick={() => onToolChange('brush')}
          className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
            tool === 'brush'
              ? 'bg-white text-gray-900 shadow-sm font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Brush
        </button>
        <button
          onClick={() => onToolChange('eraser')}
          className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
            tool === 'eraser'
              ? 'bg-white text-gray-900 shadow-sm font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Eraser
        </button>
      </div>
      <label className="flex items-center gap-1.5 text-xs text-gray-500">
        Size
        <div className="flex gap-0.5">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => onBrushSizeChange(s)}
              className={`w-6 h-6 rounded text-xs flex items-center justify-center cursor-pointer transition-colors ${
                brushSize === s
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </label>
    </div>
  );
}

export default function RetinaInput({ retina, onRetinaChange }) {
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(1);

  const clearRetina = () => onRetinaChange(new Array(NUM_PIXELS).fill(0));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Retina Input (20x20)</h2>
        <button
          onClick={clearRetina}
          className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      <BrushControls
        tool={tool}
        onToolChange={setTool}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
      />

      <DrawableGrid retina={retina} onRetinaChange={onRetinaChange} tool={tool} brushSize={brushSize} />
    </div>
  );
}
