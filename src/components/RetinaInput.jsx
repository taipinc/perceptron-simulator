import { useState } from 'react';
import DrawableGrid from './DrawableGrid';
import WebcamInput from './WebcamInput';
import PredefinedImages from './PredefinedImages';
import { NUM_PIXELS } from '../perceptron';

const TABS = ['Draw', 'Shapes', 'Webcam'];

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
  const [activeTab, setActiveTab] = useState(0);
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(1);

  const clearRetina = () => onRetinaChange(new Array(NUM_PIXELS).fill(0));

  const gridProps = { retina, onRetinaChange, tool, brushSize };

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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-200 rounded p-0.5">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 text-sm py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === i
                ? 'bg-white text-gray-900 shadow-sm font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Brush controls — visible in Draw and Shapes tabs */}
      {activeTab !== 2 && (
        <BrushControls
          tool={tool}
          onToolChange={setTool}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
        />
      )}

      {/* Tab content */}
      <div>
        {activeTab === 0 && <DrawableGrid {...gridProps} />}
        {activeTab === 1 && (
          <div className="flex flex-col gap-3">
            <PredefinedImages onSelect={onRetinaChange} />
            <DrawableGrid {...gridProps} />
          </div>
        )}
        {activeTab === 2 && (
          <div className="flex flex-col gap-3">
            <WebcamInput onRetinaChange={onRetinaChange} />
            <DrawableGrid {...gridProps} />
          </div>
        )}
      </div>
    </div>
  );
}
