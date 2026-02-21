import { useMemo, useRef, useEffect, useState } from 'react';
import { RETINA_SIZE, NUM_ASSOCIATION } from '../perceptron';

// Layout constants
const LAYER_GAP = 120;
const RETINA_VIZ_SIZE = 200;
const ASSOC_VIZ_W = 120;
const ASSOC_VIZ_H = 320;
const WEIGHT_VIZ_W = 80;
const WEIGHT_VIZ_H = 320;
const OUTPUT_VIZ_H = 200;
const OUTPUT_VIZ_W = 80;
const TOP_PAD = 60;

// How many connections to show (sampling for performance)
const MAX_RETINA_ASSOC_LINES = 80;
const MAX_ASSOC_OUTPUT_LINES = 40;

// Inactive color — darker so it's visible
const INACTIVE_COLOR = '#a0a0a0';
const INACTIVE_DOT = '#b0b0b0';

function weightToSvgColor(w) {
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

function RetinaLayer({ retina, x, y }) {
  const cellSize = RETINA_VIZ_SIZE / RETINA_SIZE;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={RETINA_VIZ_SIZE}
        height={RETINA_VIZ_SIZE}
        rx={8}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1.5}
      />
      {retina.map((val, i) => {
        const row = Math.floor(i / RETINA_SIZE);
        const col = i % RETINA_SIZE;
        return (
          <rect
            key={i}
            x={col * cellSize + 0.5}
            y={row * cellSize + 0.5}
            width={cellSize - 1}
            height={cellSize - 1}
            fill={val ? '#1a1a1a' : '#ffffff'}
            rx={1}
          />
        );
      })}
      <text
        x={RETINA_VIZ_SIZE / 2}
        y={-12}
        textAnchor="middle"
        className="text-xs font-semibold"
        fill="#6b7280"
      >
        Retina (20x20)
      </text>
    </g>
  );
}

function AssociationLayerViz({ activations, x, y }) {
  const cols = 8;
  const rows = Math.ceil(NUM_ASSOCIATION / cols);
  const dotSize = Math.min(
    (ASSOC_VIZ_W - 16) / cols,
    (ASSOC_VIZ_H - 16) / rows
  );
  const padX = (ASSOC_VIZ_W - cols * dotSize) / 2;
  const padY = (ASSOC_VIZ_H - rows * dotSize) / 2;

  const numActive = activations ? activations.reduce((s, v) => s + v, 0) : 0;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={ASSOC_VIZ_W}
        height={ASSOC_VIZ_H}
        rx={8}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1.5}
      />
      {Array.from({ length: NUM_ASSOCIATION }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const active = activations && activations[i] > 0;
        return (
          <circle
            key={i}
            cx={padX + col * dotSize + dotSize / 2}
            cy={padY + row * dotSize + dotSize / 2}
            r={dotSize * 0.3}
            fill={active ? '#3b82f6' : INACTIVE_DOT}
          />
        );
      })}
      <text
        x={ASSOC_VIZ_W / 2}
        y={-12}
        textAnchor="middle"
        className="text-xs font-semibold"
        fill="#6b7280"
      >
        Association (512)
      </text>
      <text
        x={ASSOC_VIZ_W / 2}
        y={ASSOC_VIZ_H + 16}
        textAnchor="middle"
        className="text-[10px]"
        fill="#6b7280"
      >
        {numActive} active
      </text>
    </g>
  );
}

function WeightLayerViz({ weights, labels, x, y }) {
  // Show weight grids for both output units stacked vertically
  const cols = 16;
  const rows = Math.ceil(NUM_ASSOCIATION / cols);
  const cellSize = Math.min(
    (WEIGHT_VIZ_W - 8) / cols,
    ((WEIGHT_VIZ_H - 40) / 2) / rows
  );
  const gridH = rows * cellSize;
  const totalH = gridH * 2 + 24;
  const startY = (WEIGHT_VIZ_H - totalH) / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={WEIGHT_VIZ_W}
        height={WEIGHT_VIZ_H}
        rx={8}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1.5}
      />
      {[0, 1].map((oIdx) => {
        const gy = startY + oIdx * (gridH + 24);
        const padX = (WEIGHT_VIZ_W - cols * cellSize) / 2;
        return (
          <g key={oIdx} transform={`translate(0, ${gy})`}>
            <text
              x={WEIGHT_VIZ_W / 2}
              y={-3}
              textAnchor="middle"
              className="text-[9px] font-medium"
              fill="#6b7280"
            >
              {labels[oIdx]}
            </text>
            {weights && Array.from({ length: NUM_ASSOCIATION }, (_, i) => {
              const row = Math.floor(i / cols);
              const col = i % cols;
              return (
                <rect
                  key={i}
                  x={padX + col * cellSize}
                  y={row * cellSize}
                  width={cellSize - 0.5}
                  height={cellSize - 0.5}
                  fill={weightToSvgColor(weights[oIdx][i])}
                  rx={0.5}
                />
              );
            })}
          </g>
        );
      })}
      <text
        x={WEIGHT_VIZ_W / 2}
        y={-12}
        textAnchor="middle"
        className="text-xs font-semibold"
        fill="#6b7280"
      >
        Weights
      </text>
    </g>
  );
}

function OutputLayerViz({ scores, labels, prediction, x, y }) {
  const unitH = 60;
  const unitW = OUTPUT_VIZ_W;
  const gap = 30;
  const totalH = unitH * 2 + gap;
  const startY = (OUTPUT_VIZ_H - totalH) / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={OUTPUT_VIZ_W}
        height={OUTPUT_VIZ_H}
        rx={8}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1.5}
      />
      {[0, 1].map((idx) => {
        const isWinner = prediction === idx;
        return (
          <g key={idx} transform={`translate(0, ${startY + idx * (unitH + gap)})`}>
            <rect
              x={8}
              y={0}
              width={unitW - 16}
              height={unitH}
              rx={6}
              fill={isWinner ? '#dbeafe' : '#ffffff'}
              stroke={isWinner ? '#3b82f6' : '#9ca3af'}
              strokeWidth={isWinner ? 2 : 1}
            />
            <text
              x={unitW / 2}
              y={22}
              textAnchor="middle"
              className="text-[10px] font-medium"
              fill="#374151"
            >
              {labels[idx]}
            </text>
            <text
              x={unitW / 2}
              y={40}
              textAnchor="middle"
              className="text-xs font-mono"
              fill={isWinner ? '#2563eb' : '#6b7280'}
            >
              {scores ? scores[idx].toFixed(2) : '—'}
            </text>
            {isWinner && (
              <text
                x={unitW / 2}
                y={54}
                textAnchor="middle"
                className="text-[8px] font-bold"
                fill="#2563eb"
              >
                PREDICTED
              </text>
            )}
          </g>
        );
      })}
      <text
        x={OUTPUT_VIZ_W / 2}
        y={-12}
        textAnchor="middle"
        className="text-xs font-semibold"
        fill="#6b7280"
      >
        Output
      </text>
    </g>
  );
}

function Connections({
  retina,
  associationUnits,
  activations,
  weights,
  retinaPos,
  assocPos,
  weightPos,
  outputPos,
}) {
  // Retina → Association
  const retinaToAssoc = useMemo(() => {
    const lines = [];
    const activeIndices = [];
    const inactiveIndices = [];
    for (let i = 0; i < NUM_ASSOCIATION; i++) {
      if (activations && activations[i] > 0) {
        activeIndices.push(i);
      } else {
        inactiveIndices.push(i);
      }
    }
    const sampled = [];
    const shuffledActive = activeIndices.sort(() => Math.random() - 0.5);
    sampled.push(...shuffledActive.slice(0, Math.min(MAX_RETINA_ASSOC_LINES * 0.7, shuffledActive.length)));
    const shuffledInactive = inactiveIndices.sort(() => Math.random() - 0.5);
    sampled.push(...shuffledInactive.slice(0, MAX_RETINA_ASSOC_LINES - sampled.length));

    const cols = 8;
    const dotSize = Math.min(
      (ASSOC_VIZ_W - 16) / cols,
      (ASSOC_VIZ_H - 16) / Math.ceil(NUM_ASSOCIATION / cols)
    );
    const padY = (ASSOC_VIZ_H - Math.ceil(NUM_ASSOCIATION / cols) * dotSize) / 2;
    const cellSize = RETINA_VIZ_SIZE / RETINA_SIZE;

    for (const aIdx of sampled) {
      const unit = associationUnits[aIdx];
      const pixelIdx = unit.connections[Math.floor(Math.random() * unit.connections.length)];
      const pixelRow = Math.floor(pixelIdx / RETINA_SIZE);
      const aRow = Math.floor(aIdx / cols);

      const x1 = retinaPos.x + RETINA_VIZ_SIZE;
      const y1 = retinaPos.y + pixelRow * cellSize + cellSize / 2;
      const x2 = assocPos.x;
      const y2 = assocPos.y + padY + aRow * dotSize + dotSize / 2;
      const active = activations && activations[aIdx] > 0 && retina[pixelIdx] > 0;

      lines.push({ x1, y1, x2, y2, active, key: `ra-${aIdx}` });
    }
    return lines;
  }, [retina, associationUnits, activations, retinaPos, assocPos]);

  // Association → Output (through weight layer)
  const assocToOutput = useMemo(() => {
    const lines = [];
    const cols = 8;
    const dotSize = Math.min(
      (ASSOC_VIZ_W - 16) / cols,
      (ASSOC_VIZ_H - 16) / Math.ceil(NUM_ASSOCIATION / cols)
    );
    const padY = (ASSOC_VIZ_H - Math.ceil(NUM_ASSOCIATION / cols) * dotSize) / 2;

    const unitH = 60;
    const gap = 30;
    const totalH = unitH * 2 + gap;
    const startY = (OUTPUT_VIZ_H - totalH) / 2;

    const indices = Array.from({ length: NUM_ASSOCIATION }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, MAX_ASSOC_OUTPUT_LINES);

    for (const aIdx of indices) {
      const aRow = Math.floor(aIdx / cols);
      // From assoc right edge to weight left edge
      const x1 = assocPos.x + ASSOC_VIZ_W;
      const y1 = assocPos.y + padY + aRow * dotSize + dotSize / 2;
      const xMid = weightPos.x + WEIGHT_VIZ_W / 2;
      const yMid = y1; // pass through at same height

      for (let oIdx = 0; oIdx < 2; oIdx++) {
        // From weight right edge to output left edge
        const x2 = outputPos.x;
        const y2 = outputPos.y + startY + oIdx * (unitH + gap) + unitH / 2;

        const w = weights ? weights[oIdx][aIdx] : 0;
        const active = activations && activations[aIdx] > 0;

        lines.push({
          x1, y1, x2, y2, xMid, yMid,
          active,
          weight: w,
          key: `ao-${aIdx}-${oIdx}`,
        });
      }
    }
    return lines;
  }, [activations, weights, assocPos, weightPos, outputPos]);

  return (
    <g>
      {/* Retina → Association */}
      {retinaToAssoc.map((line) => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.active ? '#3b82f6' : INACTIVE_COLOR}
          strokeWidth={line.active ? 1 : 0.4}
          opacity={line.active ? 0.6 : 0.25}
        />
      ))}
      {/* Association → Weight → Output */}
      {assocToOutput.map((line) => {
        const absW = Math.abs(line.weight);
        const color = line.weight > 0 ? '#22c55e' : line.weight < 0 ? '#ef4444' : INACTIVE_COLOR;
        const isActive = line.active;
        return (
          <g key={line.key}>
            {/* Assoc → Weight layer */}
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.xMid}
              y2={line.yMid}
              stroke={isActive ? color : INACTIVE_COLOR}
              strokeWidth={isActive ? Math.max(0.5, absW * 3) : 0.3}
              opacity={isActive ? Math.min(0.8, 0.2 + absW * 2) : 0.15}
            />
            {/* Weight layer → Output */}
            <line
              x1={line.xMid}
              y1={line.yMid}
              x2={line.x2}
              y2={line.y2}
              stroke={isActive ? color : INACTIVE_COLOR}
              strokeWidth={isActive ? Math.max(0.5, absW * 3) : 0.3}
              opacity={isActive ? Math.min(0.8, 0.2 + absW * 2) : 0.15}
            />
          </g>
        );
      })}
    </g>
  );
}

export default function NetworkViz({
  retina,
  associationUnits,
  activations,
  weights,
  scores,
  labels,
  prediction,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(900);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const positions = useMemo(() => {
    const totalContentW = RETINA_VIZ_SIZE + ASSOC_VIZ_W + WEIGHT_VIZ_W + OUTPUT_VIZ_W + LAYER_GAP * 3;
    const startX = Math.max(20, (containerWidth - totalContentW) / 2);

    const retinaX = startX;
    const retinaY = TOP_PAD + (ASSOC_VIZ_H - RETINA_VIZ_SIZE) / 2;

    const assocX = retinaX + RETINA_VIZ_SIZE + LAYER_GAP;
    const assocY = TOP_PAD;

    const weightX = assocX + ASSOC_VIZ_W + LAYER_GAP;
    const weightY = TOP_PAD;

    const outputX = weightX + WEIGHT_VIZ_W + LAYER_GAP;
    const outputY = TOP_PAD + (ASSOC_VIZ_H - OUTPUT_VIZ_H) / 2;

    return {
      retina: { x: retinaX, y: retinaY },
      assoc: { x: assocX, y: assocY },
      weight: { x: weightX, y: weightY },
      output: { x: outputX, y: outputY },
    };
  }, [containerWidth]);

  const svgH = TOP_PAD + ASSOC_VIZ_H + 40;

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width="100%"
        height={svgH}
        viewBox={`0 0 ${containerWidth} ${svgH}`}
        className="overflow-visible"
      >
        {/* Connection lines (behind layers) */}
        <Connections
          retina={retina}
          associationUnits={associationUnits}
          activations={activations}
          weights={weights}
          retinaPos={positions.retina}
          assocPos={positions.assoc}
          weightPos={positions.weight}
          outputPos={positions.output}
        />

        {/* Layers */}
        <RetinaLayer retina={retina} x={positions.retina.x} y={positions.retina.y} />
        <AssociationLayerViz activations={activations} x={positions.assoc.x} y={positions.assoc.y} />
        <WeightLayerViz weights={weights} labels={labels} x={positions.weight.x} y={positions.weight.y} />
        <OutputLayerViz
          scores={scores}
          labels={labels}
          prediction={prediction}
          x={positions.output.x}
          y={positions.output.y}
        />

        {/* Connection labels */}
        <text
          x={(positions.retina.x + RETINA_VIZ_SIZE + positions.assoc.x) / 2}
          y={TOP_PAD + ASSOC_VIZ_H + 24}
          textAnchor="middle"
          className="text-[10px]"
          fill="#6b7280"
        >
          Fixed random connections
        </text>
        <text
          x={(positions.assoc.x + ASSOC_VIZ_W + positions.output.x + OUTPUT_VIZ_W) / 2}
          y={TOP_PAD + ASSOC_VIZ_H + 24}
          textAnchor="middle"
          className="text-[10px]"
          fill="#6b7280"
        >
          Trainable weights
        </text>

        {/* Flow arrows */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#9ca3af" />
          </marker>
        </defs>
        <line
          x1={positions.retina.x + RETINA_VIZ_SIZE + 10}
          y1={TOP_PAD + ASSOC_VIZ_H + 10}
          x2={positions.assoc.x - 10}
          y2={TOP_PAD + ASSOC_VIZ_H + 10}
          stroke="#9ca3af"
          strokeWidth={1}
          markerEnd="url(#arrowhead)"
        />
        <line
          x1={positions.assoc.x + ASSOC_VIZ_W + 10}
          y1={TOP_PAD + ASSOC_VIZ_H + 10}
          x2={positions.output.x - 10}
          y2={TOP_PAD + ASSOC_VIZ_H + 10}
          stroke="#9ca3af"
          strokeWidth={1}
          markerEnd="url(#arrowhead)"
        />

        {/* Legend */}
        <g transform={`translate(${positions.output.x + OUTPUT_VIZ_W + 20}, ${positions.output.y})`}>
          <text y={0} className="text-[10px] font-medium" fill="#6b7280">Weight colors</text>
          <rect x={0} y={8} width={10} height={10} rx={2} fill="rgb(60, 200, 60)" />
          <text x={14} y={17} className="text-[9px]" fill="#6b7280">Positive</text>
          <rect x={0} y={24} width={10} height={10} rx={2} fill="rgb(200, 60, 60)" />
          <text x={14} y={33} className="text-[9px]" fill="#6b7280">Negative</text>
          <rect x={0} y={40} width={10} height={10} rx={2} fill="#b0b0b0" />
          <text x={14} y={49} className="text-[9px]" fill="#6b7280">Near zero</text>
        </g>
      </svg>
    </div>
  );
}
