import { useState, useMemo, useCallback } from 'react';
import {
  NUM_PIXELS,
  createAssociationLayer,
  computeAssociationActivations,
  createOutputWeights,
  createOutputBiases,
  computeOutputScores,
  learn,
} from './perceptron';
import RetinaInput from './components/RetinaInput';
import AssociationLayer from './components/AssociationLayer';
import OutputPanel from './components/OutputPanel';
import WeightViz from './components/WeightViz';
import ControlPanel from './components/ControlPanel';

function App() {
  // Association layer: fixed random connections, created once
  const [associationUnits] = useState(() => createAssociationLayer());

  // Retina state
  const [retina, setRetina] = useState(() => new Array(NUM_PIXELS).fill(0));

  // Output layer trainable parameters
  const [weights, setWeights] = useState(() => createOutputWeights());
  const [biases, setBiases] = useState(() => createOutputBiases());

  // Labels
  const [labels, setLabels] = useState(['Class A', 'Class B']);

  // Learning rate
  const [learningRate, setLearningRate] = useState(0.1);

  // Training step counter
  const [stepCount, setStepCount] = useState(0);

  // Computed values
  const hasInput = retina.some((v) => v > 0);

  const associationActivations = useMemo(
    () => computeAssociationActivations(retina, associationUnits),
    [retina, associationUnits]
  );

  const scores = useMemo(
    () => computeOutputScores(associationActivations, weights, biases),
    [associationActivations, weights, biases]
  );

  // Handlers
  const handleLearn = useCallback(
    (correctLabel) => {
      const result = learn(weights, biases, associationActivations, correctLabel, learningRate);
      setWeights(result.weights);
      setBiases(result.biases);
      setStepCount((c) => c + 1);
    },
    [weights, biases, associationActivations, learningRate]
  );

  const handleReset = useCallback(() => {
    setWeights(createOutputWeights());
    setBiases(createOutputBiases());
    setStepCount(0);
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Perceptron Mark I
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Interactive simulator — {stepCount} training step{stepCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-[1fr_auto] gap-6">
          {/* Left column: Retina + Association + Output */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <RetinaInput retina={retina} onRetinaChange={setRetina} />
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <AssociationLayer activations={associationActivations} />
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <OutputPanel
                scores={scores}
                labels={labels}
                onLabelsChange={setLabels}
              />
            </div>
          </div>

          {/* Right column: Controls + Weights */}
          <div className="flex flex-col gap-6 w-72">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <ControlPanel
                labels={labels}
                learningRate={learningRate}
                onLearningRateChange={setLearningRate}
                onLearn={handleLearn}
                onReset={handleReset}
                hasInput={hasInput}
              />
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <WeightViz weights={weights} labels={labels} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
